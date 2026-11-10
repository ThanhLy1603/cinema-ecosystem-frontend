import { Clapperboard, Ticket } from 'lucide-react';
import type { ReactElement } from 'react';
import LinkButton from '@/components/ui/LinkButton';
import { useAuthStore } from '@/stores/useAuthStore';
import type { User } from '@/types/auth/auth';

function getFirstName(user: User): string {
   const words: string[] = user.fullName.trim().split(/\s+/);
   return words[words.length - 1] ?? user.fullName;
}

export function HeroFallback(): ReactElement {
   const user: User | null = useAuthStore((authState) => authState.user);

   return (
      <section className="bg-ink-900">
         <div className="mx-auto flex min-h-[340px] max-w-7xl flex-col justify-center gap-5 px-4 py-14 sm:px-6 lg:px-8">
            <h1 className="max-w-3xl text-balance text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
               {user ? `Chào ${getFirstName(user)}, hôm nay bạn muốn xem gì?` : 'Đặt vé xem phim nhanh gọn, chắc chỗ'}
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-white/80">
               Chọn phim, chọn ghế theo thời gian thực và nhận vé điện tử ngay trên điện thoại.
            </p>
            <div className="flex flex-wrap gap-3">
               <LinkButton to="/movies" size="lg" icon={<Clapperboard className="size-5" aria-hidden="true" />}>
                  Khám phá phim
               </LinkButton>
               <LinkButton
                  to={user ? '/tickets' : '/register'}
                  size="lg"
                  variant="light"
                  icon={<Ticket className="size-5" aria-hidden="true" />}
               >
                  {user ? 'Vé của tôi' : 'Tạo tài khoản'}
               </LinkButton>
            </div>
         </div>
      </section>
   );
}

export default HeroFallback;
