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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
-- 수정(update) 기능은 스펙에 없으므로 update 정책은 만들지 않는다.

-- 3. updated_at 자동 갱신 트리거 (owned_items만 — wishlist는 수정 경로가 없음) --
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
