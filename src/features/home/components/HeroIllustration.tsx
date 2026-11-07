import { CircleCheck, Clapperboard, Popcorn, QrCode, Star } from 'lucide-react'
import type { ReactElement } from 'react'

export function HeroIllustration(): ReactElement {
   return (
      <div className="relative mx-auto h-[440px] w-full max-w-[560px]" aria-hidden="true">
         <div className="absolute inset-4 rounded-[3rem] bg-gradient-to-br from-gold-200/70 via-brand-100/70 to-transparent blur-2xl" />

         <div className="absolute left-2 top-4 h-[370px] w-[258px] -rotate-6 animate-float overflow-hidden rounded-3xl bg-gradient-to-b from-brand-500 via-brand-600 to-brand-800 shadow-soft ring-4 ring-white sm:left-6">
            <div className="absolute -right-10 -top-10 size-44 rounded-full bg-gold-300/40 blur-2xl" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-brand-900/70 to-transparent" />
            <div className="relative flex h-full flex-col justify-between p-5">
               <div className="space-y-3">
                  <div className="flex items-center gap-1">
                     {Array.from({ length: 5 }, (_unused, starIndex) => (
                        <Star key={starIndex} className="size-4 fill-gold-300 text-gold-300" />
                     ))}
                  </div>
                  <span className="inline-block rounded-full bg-gold-300 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-ink-900">
                     Đang chiếu
                  </span>
                  <p className="text-2xl font-extrabold leading-tight text-white">
                     Mỗi tuần
                     <br />
                     một siêu phẩm
                  </p>
               </div>
               <Clapperboard className="mx-auto mb-6 size-24 text-white/25" strokeWidth={1.25} />
            </div>
         </div>

         <div className="absolute bottom-6 right-0 w-[262px] rotate-6 sm:right-2">
            <div className="relative rounded-2xl bg-white shadow-soft ring-1 ring-ink-100">
               <span className="absolute -left-3 top-[96px] size-6 rounded-full bg-cream ring-1 ring-ink-100" />
               <span className="absolute -right-3 top-[96px] size-6 rounded-full bg-cream ring-1 ring-ink-100" />
               <div className="space-y-3 p-5 pb-6">
                  <div className="flex items-center justify-between">
                     <span className="text-[11px] font-extrabold uppercase tracking-widest text-brand-600">
                        Vé điện tử
                     </span>
                     <span className="rounded-full bg-gold-100 px-2.5 py-0.5 text-[11px] font-bold text-gold-600">
                        ADMIT ONE
                     </span>
                  </div>
                  <p className="text-lg font-extrabold text-ink-900">Phòng chiếu 03</p>
                  <div className="flex gap-6 text-xs text-ink-500">
                     <div>
                        <p>Ghế</p>
                        <p className="text-base font-bold text-ink-900">A12</p>
                     </div>
                     <div>
                        <p>Suất</p>
                        <p className="text-base font-bold text-ink-900">19:30</p>
                     </div>
                  </div>
               </div>
               <div className="border-t-2 border-dashed border-ink-100" />
               <div className="flex items-center justify-between px-5 py-4">
                  <div className="space-y-1.5 text-xs text-ink-500">
                     <p className="font-semibold text-ink-700">Quét mã tại cửa</p>
                     <p>Vé hợp lệ 1 lần</p>
                  </div>
                  <QrCode className="size-14 text-ink-800" strokeWidth={1.5} />
               </div>
            </div>
         </div>

         <div className="absolute right-2 top-10 flex animate-float-slow items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-ink-800 shadow-card ring-1 ring-ink-100 sm:right-6">
            <CircleCheck className="size-5 text-emerald-500" />
            Ghế A12 đã giữ chỗ
         </div>

         <div className="absolute bottom-2 left-0 grid size-16 animate-float place-items-center rounded-2xl bg-gradient-to-br from-gold-300 to-gold-500 text-white shadow-soft ring-4 ring-white sm:left-4">
            <Popcorn className="size-8" />
         </div>
      </div>
   )
}

export default HeroIllustration
