import { ArrowRight, Clapperboard, Ticket } from 'lucide-react';
import type { ReactElement } from 'react';
import LinkButton from '@/components/ui/LinkButton';
import { useAuthStore } from '@/stores/useAuthStore';
import type { User } from '@/types/auth';

function getFirstName(user: User): string {
   const words: string[] = user.fullName.trim().split(/\s+/);
   return words[words.length - 1] ?? user.fullName;
}

export function HeroFallback(): ReactElement {
   const user: User | null = useAuthStore((authState) => authState.user);

   return (
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500">
         <div className="pointer-events-none absolute -right-24 -top-24 -z-10 size-96 rounded-full bg-accent-300/30 blur-3xl" />
         <div className="pointer-events-none absolute -bottom-32 left-0 -z-10 size-96 rounded-full bg-white/10 blur-3xl" />
         <div className="mx-auto flex min-h-[420px] max-w-7xl flex-col justify-center gap-7 px-4 pb-24 pt-14 sm:px-6 lg:px-8">
            <h1 className="max-w-3xl text-balance text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
               {user ? `Chào ${getFirstName(user)}, hôm nay bạn muốn xem gì?` : 'Đặt vé xem phim nhanh gọn, chắc chỗ'}
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-white/85">
               Chọn phim, chọn ghế theo thời gian thực và nhận vé điện tử ngay trên điện thoại. Không xếp hàng, không lo
               hết chỗ.
            </p>
            <div className="flex flex-wrap gap-3">
               {user ? (
                  <>
                     <LinkButton to="/movies" size="lg" icon={<Clapperboard className="size-5" />}>
                        Khám phá phim
                     </LinkButton>
                     <LinkButton to="/tickets" size="lg" variant="light" icon={<Ticket className="size-5" />}>
                        Vé của tôi
                     </LinkButton>
                  </>
               ) : (
                  <>
                     <LinkButton to="/register" size="lg" icon={<ArrowRight className="size-5" />}>
                        Tạo tài khoản miễn phí
                     </LinkButton>
                     <LinkButton to="/login" size="lg" variant="light">
                        Đăng nhập
                     </LinkButton>
                  </>
               )}
            </div>
         </div>
      </section>
   );
}

export default HeroFallback;
