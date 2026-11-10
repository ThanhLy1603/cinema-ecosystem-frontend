import { Armchair, Crown, QrCode, ShieldCheck, type LucideIcon } from 'lucide-react';
import type { ReactElement } from 'react';

interface BenefitItem {
   icon: LucideIcon;
   title: string;
   description: string;
}

const BENEFIT_ITEMS: BenefitItem[] = [
   {
      icon: Armchair,
      title: 'Chọn ghế realtime',
      description: 'Sơ đồ ghế cập nhật tức thì, ghế bạn chọn được giữ chỗ trong 10 phút.',
   },
   {
      icon: ShieldCheck,
      title: 'Thanh toán an toàn',
      description: 'Thanh toán nhanh chóng qua VNPay và MoMo, giao dịch được xác thực chặt chẽ.',
   },
   {
      icon: QrCode,
      title: 'Vé QR điện tử',
      description: 'Nhận vé ngay trên điện thoại, quét mã tại cửa là vào phòng chiếu.',
   },
   {
      icon: Crown,
      title: 'Tích điểm thành viên',
      description: 'Mỗi giao dịch đều được tích điểm, thăng hạng từ STAR lên GOLD và DIAMOND.',
   },
];

export function BenefitStrip(): ReactElement {
   return (
      <section className="mx-auto w-full max-w-7xl space-y-10 px-4 py-16 sm:px-6 lg:px-8">
         <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-brand-600">Vì sao chọn CinemaSphere</p>
            <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
               Mọi thứ bạn cần cho một buổi xem phim
            </h2>
         </div>
         <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFIT_ITEMS.map((benefitItem) => (
               <article
                  key={benefitItem.title}
                  className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-ink-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft"
               >
                  <span className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                     <benefitItem.icon className="size-7" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-ink-900">{benefitItem.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{benefitItem.description}</p>
               </article>
            ))}
         </div>
      </section>
   );
}

export default BenefitStrip;
