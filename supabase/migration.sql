-- 이미 있어: owned_items + wishlist_items 스키마, RLS, RPC 함수
-- Supabase 대시보드 > SQL Editor 에서 그대로 실행하세요.

-- 1. owned_items ------------------------------------------------------------
create table if not exists public.owned_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  category text,                       -- nullable at DB level; required in the create form/action
  quantity integer not null default 1 check (quantity >= 1),
  purchased_at date not null default current_date,
  expiry_date date,
  memo text,
  status text not null default '미개봉' check (status in ('미개봉', '사용중', '다 씀')),
  used_up_at date,                     -- '다 씀' 상태로 바뀐 날짜. 그 외 상태에서는 항상 null.
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 이미 배포된 프로젝트에 이 파일을 재실행할 때 used_up_at 컬럼만 추가로 반영되도록 idempotent하게 처리.
alter table public.owned_items add column if not exists used_up_at date;

create index if not exists owned_items_expiry_date_idx on public.owned_items (expiry_date);
create index if not exists owned_items_user_search_idx on public.owned_items (user_id, name, category);

alter table public.owned_items enable row level security;

drop policy if exists "owned_items_select_own" on public.owned_items;
create policy "owned_items_select_own" on public.owned_items
  for select using (auth.uid() = user_id);

drop policy if exists "owned_items_insert_own" on public.owned_items;
create policy "owned_items_insert_own" on public.owned_items
  for insert with check (auth.uid() = user_id);

drop policy if exists "owned_items_update_own" on public.owned_items;
create policy "owned_items_update_own" on public.owned_items
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "owned_items_delete_own" on public.owned_items;
create policy "owned_items_delete_own" on public.owned_items
  for delete using (auth.uid() = user_id);

-- 2. wishlist_items -----------------------------------------------------------
create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  category text,
  memo text,
  link text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 이미 배포된 프로젝트에 이 파일을 재실행할 때 link 컬럼만 추가로 반영되도록 idempotent하게 처리.
alter table public.wishlist_items add column if not exists link text;

create index if not exists wishlist_items_user_search_idx on public.wishlist_items (user_id, name, category);

alter table public.wishlist_items enable row level security;

drop policy if exists "wishlist_items_select_own" on public.wishlist_items;
create policy "wishlist_items_select_own" on public.wishlist_items
  for select using (auth.uid() = user_id);

drop policy if exists "wishlist_items_insert_own" on public.wishlist_items;
create policy "wishlist_items_insert_own" on public.wishlist_items
  for insert with check (auth.uid() = user_id);

drop policy if exists "wishlist_items_delete_own" on public.wishlist_items;
create policy "wishlist_items_delete_own" on public.wishlist_items
  for delete using (auth.uid() = user_id);

-- 위시 수정(이름/카테고리/메모/링크) 화면이 실제로 update 문을 실행하는 데 필요할 뿐 아니라,
-- mark_wishlist_purchased가 동시 재요청 방어를 위해 select ... for update로 행을 잠글 때도
-- 필요하다 (Postgres RLS는 FOR UPDATE 시 SELECT 정책과 함께 UPDATE 정책도 만족해야 행을
-- 반환하므로, 이 정책이 없으면 잠금 조회가 0건을 반환해 "이미 처리된 항목"으로 오판된다).
drop policy if exists "wishlist_items_update_own" on public.wishlist_items;
create policy "wishlist_items_update_own" on public.wishlist_items
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 3. updated_at 자동 갱신 트리거 --
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists owned_items_set_updated_at on public.owned_items;
create trigger owned_items_set_updated_at
  before update on public.owned_items
  for each row execute function public.set_updated_at();

drop trigger if exists wishlist_items_set_updated_at on public.wishlist_items;
create trigger wishlist_items_set_updated_at
  before update on public.wishlist_items
  for each row execute function public.set_updated_at();

-- 4. mark_wishlist_purchased: 원자적 delete+insert RPC ------------------------
create or replace function public.mark_wishlist_purchased(p_wishlist_item_id uuid)
returns public.owned_items
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_source public.wishlist_items;
  v_new_item public.owned_items;
begin
  -- 소유권+존재 확인. FOR UPDATE로 행을 잠가 동시 재요청도 방어한다.
  select * into v_source
  from public.wishlist_items
  where id = p_wishlist_item_id
    and user_id = auth.uid()
  for update;

  if not found then
    raise exception 'wishlist item not found or already purchased'
      using errcode = 'P0002';
  end if;

  delete from public.wishlist_items
  where id = p_wishlist_item_id
    and user_id = auth.uid();

  insert into public.owned_items (user_id, name, category, quantity, purchased_at, memo, status)
  values (auth.uid(), v_source.name, v_source.category, 1, current_date, v_source.memo, '미개봉')
  returning * into v_new_item;

  return v_new_item;
end;
$$;

grant execute on function public.mark_wishlist_purchased(uuid) to authenticated;

-- 5. 목록 조회 RPC (검색어를 바인딩 파라미터로 처리해 PostgREST 필터 문자열 조립을 피함) --
create or replace function public.list_owned_items(p_search text default null)
returns setof public.owned_items
language sql security invoker stable set search_path = public
as $$
  select * from public.owned_items
  where user_id = auth.uid()
    and (p_search is null or p_search = ''
         or name ilike '%' || p_search || '%'
         or category ilike '%' || p_search || '%')
  order by expiry_date nulls last;
$$;

create or replace function public.list_wishlist_items(p_search text default null)
returns setof public.wishlist_items
language sql security invoker stable set search_path = public
as $$
  select * from public.wishlist_items
  where user_id = auth.uid()
    and (p_search is null or p_search = ''
         or name ilike '%' || p_search || '%'
         or category ilike '%' || p_search || '%')
  order by created_at desc;
$$;

grant execute on function public.list_owned_items(text) to authenticated;
grant execute on function public.list_wishlist_items(text) to authenticated;

-- 6. 카테고리 칩 선택 UI용: 호출자가 이미 사용한 카테고리 목록(중복 제거, 정렬) ------
create or replace function public.list_owned_categories()
returns setof text
language sql security invoker stable set search_path = public
as $$
  select distinct category from public.owned_items
  where user_id = auth.uid() and category is not null
  order by category;
$$;

create or replace function public.list_wishlist_categories()
returns setof text
language sql security invoker stable set search_path = public
as $$
  select distinct category from public.wishlist_items
  where user_id = auth.uid() and category is not null
  order by category;
$$;

grant execute on function public.list_owned_categories() to authenticated;
grant execute on function public.list_wishlist_categories() to authenticated;
