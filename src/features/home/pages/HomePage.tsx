import {
   ArrowRight,
   Armchair,
   Clapperboard,
   Crown,
   Popcorn,
   QrCode,
   ShieldCheck,
   Sparkles,
   Ticket,
   type LucideIcon,
} from 'lucide-react'
import type { ReactElement } from 'react'
import LinkButton from '@/components/ui/LinkButton'
import { useAuthStore } from '@/stores/useAuthStore'
import type { User } from '@/types/auth'
import HeroIllustration from '../components/HeroIllustration'

interface FeatureItem {
   icon: LucideIcon
   title: string
   description: string
   accentClassName: string
}

interface StepItem {
   icon: LucideIcon
   title: string
   description: string
}

const FEATURE_ITEMS: FeatureItem[] = [
   {
      icon: Armchair,
      title: 'Chọn ghế realtime',
      description: 'Sơ đồ ghế cập nhật tức thì, ghế bạn chọn được giữ chỗ trong 10 phút.',
      accentClassName: 'from-brand-50 to-brand-100 text-brand-600',
   },
   {
      icon: ShieldCheck,
      title: 'Thanh toán an toàn',
      description: 'Thanh toán nhanh chóng qua VNPay và MoMo, giao dịch được xác thực chặt chẽ.',
      accentClassName: 'from-emerald-50 to-emerald-100 text-emerald-600',
   },
   {
      icon: QrCode,
      title: 'Vé QR điện tử',
      description: 'Nhận vé ngay trên điện thoại, chỉ cần quét mã tại cửa là vào phòng chiếu.',
      accentClassName: 'from-gold-50 to-gold-100 text-gold-600',
   },
   {
      icon: Crown,
      title: 'Tích điểm thành viên',
      description: 'Mỗi giao dịch đều được tích điểm, thăng hạng từ STAR lên GOLD và DIAMOND.',
      accentClassName: 'from-ink-50 to-ink-100 text-ink-700',
   },
]

const STEP_ITEMS: StepItem[] = [
   { icon: Clapperboard, title: 'Chọn phim & suất chiếu', description: 'Duyệt phim đang chiếu và chọn rạp, giờ chiếu phù hợp.' },
   { icon: Popcorn, title: 'Chọn ghế & combo', description: 'Chọn vị trí ngồi yêu thích và thêm combo bắp nước nếu muốn.' },
   { icon: Ticket, title: 'Thanh toán & nhận vé', description: 'Thanh toán trực tuyến và nhận vé QR ngay lập tức.' },
]

function getFirstName(user: User): string {
   const words: string[] = user.fullName.trim().split(/\s+/)
   return words[words.length - 1] ?? user.fullName
}

export function HomePage(): ReactElement {
   const user: User | null = useAuthStore((authState) => authState.user)

   return (
      <>
         <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-cream to-gold-50">
            <div className="pointer-events-none absolute -left-32 top-10 size-96 rounded-full bg-brand-200/40 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 bottom-0 size-96 rounded-full bg-gold-200/50 blur-3xl" />

            <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-24">
               <div className="animate-fade-up space-y-7">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-700 shadow-sm ring-1 ring-brand-100">
                     <Sparkles className="size-3.5 text-gold-500" aria-hidden="true" />
                     Trải nghiệm điện ảnh trọn vẹn
                  </span>

                  <h1 className="text-[1.9rem] font-extrabold leading-[1.15] tracking-tight text-ink-900 sm:text-5xl lg:text-[3.4rem]">
                     {user ? `Chào ${getFirstName(user)}, hôm nay` : 'Đặt vé xem phim'}
                     <br />
                     <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-gold-500 bg-clip-text text-transparent sm:whitespace-nowrap">
                        {user ? 'bạn muốn xem gì?' : 'nhanh gọn, chắc chỗ'}
                     </span>
                  </h1>

                  <p className="max-w-xl text-lg leading-relaxed text-ink-600">
                     Chọn phim, chọn ghế theo thời gian thực và nhận vé điện tử ngay trên điện thoại. Không xếp hàng,
                     không lo hết chỗ.
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                     {user ? (
                        <>
                           <LinkButton to="/movies" size="lg" icon={<Clapperboard className="size-5" />}>
                              Khám phá phim
                           </LinkButton>
                           <LinkButton to="/tickets" size="lg" variant="secondary" icon={<Ticket className="size-5" />}>
                              Vé của tôi
                           </LinkButton>
                        </>
                     ) : (
                        <>
                           <LinkButton to="/register" size="lg" icon={<ArrowRight className="size-5" />}>
                              Tạo tài khoản miễn phí
                           </LinkButton>
                           <LinkButton to="/login" size="lg" variant="secondary">
                              Đăng nhập
                           </LinkButton>
                        </>
                     )}
                  </div>

                  <dl className="flex flex-wrap gap-x-8 gap-y-3 pt-2 text-sm text-ink-600">
                     <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-brand-500" />
                        <dt className="sr-only">Ghế</dt>
                        <dd className="font-medium">Ghế cập nhật realtime</dd>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-gold-500" />
                        <dt className="sr-only">Thanh toán</dt>
                        <dd className="font-medium">VNPay & MoMo</dd>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-emerald-500" />
                        <dt className="sr-only">Vé</dt>
                        <dd className="font-medium">Vé QR điện tử</dd>
                     </div>
                  </dl>
               </div>

               <HeroIllustration />
            </div>
         </section>

         <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
               <p className="text-sm font-bold uppercase tracking-widest text-brand-600">Vì sao chọn chúng tôi</p>
               <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
                  Mọi thứ bạn cần cho một buổi xem phim
               </h2>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
               {FEATURE_ITEMS.map((featureItem) => (
                  <article
                     key={featureItem.title}
                     className="group rounded-3xl bg-white p-6 shadow-card ring-1 ring-ink-100 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft"
                  >
                     <span
                        className={`grid size-14 place-items-center rounded-2xl bg-gradient-to-br ${featureItem.accentClassName} transition-transform duration-300 group-hover:scale-110`}
                     >
                        <featureItem.icon className="size-7" aria-hidden="true" />
                     </span>
                     <h3 className="mt-5 text-lg font-bold text-ink-900">{featureItem.title}</h3>
                     <p className="mt-2 text-sm leading-relaxed text-ink-500">{featureItem.description}</p>
                  </article>
               ))}
            </div>
         </section>

         <section className="bg-gradient-to-b from-sand/70 to-cream">
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
               <div className="mx-auto max-w-2xl text-center">
                  <p className="text-sm font-bold uppercase tracking-widest text-brand-600">Cách hoạt động</p>
                  <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
                     Đặt vé chỉ với 3 bước
                  </h2>
               </div>

               <ol className="mt-14 grid gap-8 md:grid-cols-3">
                  {STEP_ITEMS.map((stepItem, stepIndex) => (
                     <li key={stepItem.title} className="relative text-center">
                        <div className="relative mx-auto grid size-20 place-items-center rounded-3xl bg-white shadow-soft ring-1 ring-brand-100">
                           <stepItem.icon className="size-9 text-brand-600" aria-hidden="true" />
                           <span className="absolute -right-2 -top-2 grid size-8 place-items-center rounded-full bg-gradient-to-br from-gold-300 to-gold-500 text-sm font-extrabold text-ink-900 ring-4 ring-cream">
                              {stepIndex + 1}
                           </span>
                        </div>
                        <h3 className="mt-6 text-lg font-bold text-ink-900">{stepItem.title}</h3>
                        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-ink-500">
                           {stepItem.description}
                        </p>
                     </li>
                  ))}
               </ol>
            </div>
         </section>

         {!user && (
            <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
               <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 via-brand-500 to-brand-400 px-8 py-14 text-center shadow-soft sm:px-16">
                  <div className="pointer-events-none absolute -left-10 -top-10 size-56 rounded-full bg-gold-300/30 blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-16 -right-10 size-64 rounded-full bg-white/20 blur-3xl" />
                  <div className="relative space-y-6">
                     <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                        Sẵn sàng cho suất chiếu tiếp theo?
                     </h2>
                     <p className="mx-auto max-w-xl text-white/90">
                        Tạo tài khoản miễn phí để đặt vé nhanh hơn, tích điểm và nhận ưu đãi dành riêng cho thành viên.
                     </p>
                     <div className="flex flex-wrap justify-center gap-3">
                        <LinkButton to="/register" size="lg" variant="gold">
                           Đăng ký ngay
                        </LinkButton>
                        <LinkButton
                           to="/login"
                           size="lg"
                           variant="ghost"
                           className="text-white hover:bg-white/15 hover:text-white"
                        >
                           Tôi đã có tài khoản
                        </LinkButton>
                     </div>
                  </div>
               </div>
            </section>
         )}
      </>
   )
}

export default HomePage
