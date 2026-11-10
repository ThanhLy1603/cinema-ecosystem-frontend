import { ShieldAlert } from 'lucide-react';
import type { ReactElement } from 'react';
import LinkButton from '@/components/ui/LinkButton';

export function ForbiddenPage(): ReactElement {
   return (
      <section className="mx-auto grid min-h-[60vh] max-w-2xl place-items-center px-4 py-20 text-center">
         <div className="space-y-6">
            <span className="mx-auto grid size-20 place-items-center rounded-3xl bg-danger-50 text-danger-600 shadow-card ring-1 ring-danger-100">
               <ShieldAlert className="size-10" aria-hidden="true" />
            </span>
            <div className="space-y-2">
               <p className="text-sm font-bold uppercase tracking-widest text-danger-600">Lỗi 403</p>
               <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">Bạn không có quyền truy cập</h1>
               <p className="mx-auto max-w-md text-ink-500">
                  Tài khoản của bạn chưa được cấp quyền để xem trang này. Nếu cần hỗ trợ, vui lòng liên hệ quản trị
                  viên.
               </p>
            </div>
            <LinkButton to="/">Về trang chủ</LinkButton>
         </div>
      </section>
   );
}

export default ForbiddenPage;
