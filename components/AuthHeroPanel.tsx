import Image from 'next/image'
import { CheckIcon } from '@/components/icons'

type Mode = 'signin' | 'signup'

const PERKS = ['이미 가진 것부터 한눈에', '위시리스트로 충동구매 방지', '유통기한·개봉일 관리']

const COPY: Record<Mode, { headline: React.ReactNode; sub: string }> = {
  signin: {
    headline: (
      <>
        물욕은 인정,
        <br />
        관리는 앱으로.
      </>
    ),
    sub: '이미 가진 걸 까먹고 또 사는 걸 막아주는, 아주 사적인 재고 관리 도구.',
  },
  signup: {
    headline: (
      <>
        나만 보는
        <br />
        사적인 재고 공간.
      </>
    ),
    sub: '가진 걸 등록해두고, 또 사는 실수를 막아요. 30초면 시작할 수 있어요.',
  },
}

export default function AuthHeroPanel({ mode }: { mode: Mode }) {
  const { headline, sub } = COPY[mode]

  return (
    <div
      className="relative flex flex-1 basis-[380px] flex-col justify-between gap-9 overflow-hidden p-8 text-white md:p-12"
      style={{ background: 'linear-gradient(155deg,#00a090 0%,#00776b 100%)' }}
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-[260px] w-[260px] rounded-full bg-white/[0.06]" />
      <div className="pointer-events-none absolute -bottom-28 -left-16 h-[220px] w-[220px] rounded-full bg-white/5" />

      <div className="relative flex items-center gap-3">
        <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-white shadow-lg">
          <Image src="/logo.png" alt="" width={38} height={38} className="object-contain" />
        </span>
        <span className="text-xl font-extrabold tracking-tight">이미 있어</span>
      </div>

      <div className="relative">
        <div className="text-[28px] font-extrabold leading-tight tracking-tight md:text-[34px]">{headline}</div>
        <p className="mt-4 max-w-[340px] text-sm leading-relaxed text-white/80 md:text-base">{sub}</p>
      </div>

      <div className="relative flex flex-col gap-3">
        {PERKS.map((perk) => (
          <div key={perk} className="flex items-center gap-2.5 text-sm font-medium text-white/90">
            <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg bg-white/[0.16]">
              <CheckIcon className="h-[15px] w-[15px] text-white" />
            </span>
            {perk}
          </div>
        ))}
      </div>
    </div>
  )
}
