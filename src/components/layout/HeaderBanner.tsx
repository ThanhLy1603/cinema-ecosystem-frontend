import type { ReactElement } from 'react';
import backToSchoolBannerUrl from '@/assets/banners/back-to-school.png';

export function HeaderBanner(): ReactElement {
   return (
      <div className="w-full overflow-hidden bg-[#0a7bc4]">
         <img
            src={backToSchoolBannerUrl}
            alt="Back to School"
            className="block h-[56px] w-full object-cover object-center sm:h-[100px] lg:h-auto"
         />
      </div>
   );
}

export default HeaderBanner;
