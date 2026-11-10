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
      description: 'Ghế bạn chọn được giữ chỗ trong 10 phút.',
   },
   {
      icon: ShieldCheck,
      title: 'Thanh toán an toàn',
      description: 'Qua VNPay và MoMo, giao dịch được xác thực.',
   },
   {
      icon: QrCode,
      title: 'Vé QR điện tử',
      description: 'Quét mã tại cửa là vào phòng chiếu.',
   },
   {
      icon: Crown,
      title: 'Tích điểm thành viên',
      description: 'Thăng hạng STAR, GOLD, DIAMOND theo giao dịch.',
   },
];

export function BenefitStrip(): ReactElement {
   return (
      <section aria-label="Quyền lợi khi đặt vé" className="border-y border-ink-200 bg-white">
         <ul className="mx-auto grid max-w-7xl gap-x-6 gap-y-5 px-4 py-7 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
            {BENEFIT_ITEMS.map((benefitItem) => (
               <li key={benefitItem.title} className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                     <benefitItem.icon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                     <h3 className="text-sm font-semibold text-ink-900">{benefitItem.title}</h3>
                     <p className="mt-0.5 text-[13px] leading-relaxed text-ink-500">{benefitItem.description}</p>
                  </div>
               </li>
            ))}
         </ul>
      </section>
   );
}

export default BenefitStrip;
