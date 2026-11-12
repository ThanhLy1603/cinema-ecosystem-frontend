import type { ReactElement } from 'react';
import auditoriumImageUrl from '@/assets/about/auditorium.jpg';
import lobbyKiosksImageUrl from '@/assets/about/lobby-kiosks.jpg';
import lobbyShopImageUrl from '@/assets/about/lobby-shop.jpg';
import Reveal from '@/components/common/Reveal';
import SectionHeading from '@/components/common/SectionHeading';
import LinkButton from '@/components/ui/LinkButton';
import AboutCinemaList from '../components/AboutCinemaList';
import AboutFeatureList from '../components/AboutFeatureList';

export function AboutPage(): ReactElement {
   return (
      <article className="pb-16">
         <section aria-label="Giới thiệu CinemaSphere" className="relative -mt-16 overflow-hidden bg-ink-900">
            <img
               src={auditoriumImageUrl}
               alt="Phòng chiếu phim CinemaSphere"
               className="h-[380px] w-full object-cover object-center sm:h-[460px] lg:h-[540px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20" />
            <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-6 pb-10 sm:px-10 sm:pb-14">
               <p className="text-xs font-bold uppercase tracking-widest text-brand-300">Giới thiệu</p>
               <h1 className="mt-2 max-w-3xl text-4xl font-extrabold uppercase leading-tight text-white sm:text-5xl lg:text-6xl">
                  CinemaSphere
               </h1>
               <p className="mt-3 max-w-2xl text-base text-white/85 sm:text-lg">
                  Đặt vé xem phim trực tuyến nhanh chóng, chọn ghế theo thời gian thực và nhận vé điện tử ngay trên điện
                  thoại.
               </p>
            </div>
         </section>

         <div className="mx-auto max-w-6xl space-y-16 px-6 pt-14 sm:px-10 sm:pt-16">
            <section aria-labelledby="about-story-heading" className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
               <Reveal>
                  <div className="space-y-4">
                     <h2
                        id="about-story-heading"
                        className="text-2xl font-extrabold uppercase text-ink-900 sm:text-3xl"
                     >
                        Về CinemaSphere
                     </h2>
                     <p className="leading-relaxed text-ink-800">
                        CinemaSphere là hệ thống rạp chiếu phim kết hợp nền tảng đặt vé trực tuyến, mang đến trải nghiệm
                        xem phim trọn vẹn từ lúc chọn phim cho đến khi bước ra khỏi phòng chiếu.
                     </p>
                     <p className="leading-relaxed text-ink-800">
                        Chúng tôi chú trọng vào những điều khán giả cần nhất: lịch chiếu rõ ràng, chọn đúng chỗ ngồi
                        mình thích, thanh toán an toàn và vào rạp nhanh gọn bằng mã QR. Các phòng chiếu được trang bị
                        màn hình lớn, âm thanh sống động và hàng ghế rộng rãi để mỗi suất chiếu đều thoải mái.
                     </p>
                  </div>
               </Reveal>
               <Reveal delayMs={120}>
                  <img
                     src={lobbyKiosksImageUrl}
                     alt="Sảnh rạp CinemaSphere với các máy bán vé tự động"
                     loading="lazy"
                     className="aspect-[16/10] w-full rounded-2xl object-cover shadow-xl"
                  />
               </Reveal>
            </section>

            <section aria-labelledby="about-features-heading" className="space-y-8">
               <SectionHeading title="Vì sao chọn CinemaSphere" headingId="about-features-heading" />
               <AboutFeatureList />
            </section>

            <section aria-labelledby="about-space-heading" className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
               <Reveal className="lg:order-2">
                  <div className="space-y-4">
                     <h2
                        id="about-space-heading"
                        className="text-2xl font-extrabold uppercase text-ink-900 sm:text-3xl"
                     >
                        Không gian và dịch vụ
                     </h2>
                     <p className="leading-relaxed text-ink-800">
                        Sảnh rạp rộng rãi với máy bán vé tự động, quầy bắp nước và khu chụp ảnh cùng poster phim giúp
                        bạn và gia đình có thêm những khoảnh khắc đáng nhớ trước giờ chiếu.
                     </p>
                     <p className="leading-relaxed text-ink-800">
                        Đội ngũ nhân viên luôn sẵn sàng hỗ trợ từ việc đổi suất, nhận vé cho đến chọn combo phù hợp với
                        số người đi cùng.
                     </p>
                  </div>
               </Reveal>
               <Reveal delayMs={120} className="lg:order-1">
                  <img
                     src={lobbyShopImageUrl}
                     alt="Khu sảnh rạp CinemaSphere với quầy bắp nước và khu chụp ảnh poster"
                     loading="lazy"
                     className="aspect-[16/10] w-full rounded-2xl object-cover shadow-xl"
                  />
               </Reveal>
            </section>

            <section aria-labelledby="about-cinemas-heading" className="space-y-8">
               <SectionHeading title="Hệ thống rạp" headingId="about-cinemas-heading" />
               <AboutCinemaList />
            </section>

            <Reveal>
               <div className="flex flex-col items-center gap-4 rounded-2xl bg-gradient-to-r from-brand-100 via-brand-50 to-brand-100 px-6 py-10 text-center ring-1 ring-brand-200">
                  <h2 className="text-2xl font-extrabold uppercase text-brand-800 sm:text-3xl">
                     Sẵn sàng cho suất chiếu tiếp theo?
                  </h2>
                  <p className="max-w-xl text-sm text-ink-700">
                     Chọn phim, chọn ghế và nhận vé điện tử chỉ trong vài bước.
                  </p>
                  <LinkButton to="/movies" className="h-12 rounded-full px-8 text-sm font-bold uppercase">
                     Đặt vé ngay
                  </LinkButton>
               </div>
            </Reveal>
         </div>
      </article>
   );
}

export default AboutPage;
