import { Armchair, Popcorn, QrCode, Sparkles, type LucideIcon } from 'lucide-react';
import type { ReactElement } from 'react';
import Reveal from '@/components/common/Reveal';

interface AboutFeature {
   icon: LucideIcon;
   title: string;
   description: string;
}

const ABOUT_FEATURES: AboutFeature[] = [
   {
      icon: Armchair,
      title: 'Chọn ghế thời gian thực',
      description:
         'Sơ đồ ghế cập nhật trực tiếp. Ghế bạn chọn được giữ trong 10 phút để hoàn tất thanh toán, không lo bị người khác đặt trùng.',
   },
   {
      icon: QrCode,
      title: 'Vé điện tử mã QR',
      description:
         'Thanh toán xong, vé điện tử gửi ngay vào email và trong mục "Vé của tôi". Chỉ cần đưa mã QR tại rạp, không cần in vé.',
   },
   {
      icon: Popcorn,
      title: 'Bắp nước đặt cùng vé',
      description: 'Chọn combo bắp nước ngay khi đặt vé và nhận tại quầy mà không phải xếp hàng lại.',
   },
   {
      icon: Sparkles,
      title: 'Tích điểm thành viên',
      description: 'Mỗi đơn đặt vé thành công được cộng điểm bằng 5% giá trị đơn, dùng cho những lần xem phim sau.',
   },
];

export function AboutFeatureList(): ReactElement {
   return (
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
         {ABOUT_FEATURES.map((aboutFeature, featureIndex) => {
            const FeatureIcon: LucideIcon = aboutFeature.icon;
            return (
               <li key={aboutFeature.title}>
                  <Reveal delayMs={featureIndex * 80} className="h-full">
                     <article className="h-full space-y-3 rounded-2xl bg-white p-5 shadow-md ring-1 ring-ink-100">
                        <span className="grid size-12 place-items-center rounded-xl bg-brand-100 text-brand-700">
                           <FeatureIcon className="size-6" aria-hidden="true" />
                        </span>
                        <h3 className="text-base font-extrabold text-ink-900">{aboutFeature.title}</h3>
                        <p className="text-sm leading-relaxed text-ink-700">{aboutFeature.description}</p>
                     </article>
                  </Reveal>
               </li>
            );
         })}
      </ul>
   );
}

export default AboutFeatureList;
