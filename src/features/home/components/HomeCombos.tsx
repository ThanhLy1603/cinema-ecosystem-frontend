import { ArrowRight } from 'lucide-react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import FnbComboCard from '@/components/common/FnbComboCard';
import Reveal from '@/components/common/Reveal';
import SectionBanner from '@/components/common/SectionBanner';
import { useFnbBestSellers, type FnbBestSellerIds } from '@/lib/fnb/useFnbBestSellers';
import type { FnbCombo } from '@/types/fnb/fnb';

interface HomeCombosProps {
   fnbCombos: FnbCombo[];
}

const MAX_HOME_COMBOS: number = 3;

export function HomeCombos({ fnbCombos }: HomeCombosProps): ReactElement | null {
   const bestSellerIds: FnbBestSellerIds = useFnbBestSellers();
   const visibleFnbCombos: FnbCombo[] = fnbCombos.slice(0, MAX_HOME_COMBOS);

   if (visibleFnbCombos.length === 0) {
      return null;
   }

   return (
      <section
         id="combo-section"
         aria-labelledby="home-combos-heading"
         className="px-4 py-10 sm:px-6 sm:py-12 lg:px-12"
      >
         <div className="mx-auto max-w-6xl">
            <SectionBanner title="Combo ưu đãi" headingId="home-combos-heading" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
               {visibleFnbCombos.map((fnbCombo, comboIndex) => (
                  <Reveal key={fnbCombo.id} delayMs={comboIndex * 90} className="h-full">
                     <FnbComboCard fnbCombo={fnbCombo} isBestSeller={bestSellerIds.comboIds.has(fnbCombo.id)} />
                  </Reveal>
               ))}
            </div>
            <div className="mt-8 flex justify-center">
               <Link
                  to="/fnb"
                  className="inline-flex items-center gap-1.5 rounded-full border border-brand-600 bg-white px-8 py-2 text-xs font-bold uppercase tracking-wide text-brand-700 shadow-sm transition-colors hover:bg-brand-600 hover:text-white"
               >
                  Xem toàn bộ thực đơn
                  <ArrowRight className="size-4" aria-hidden="true" />
               </Link>
            </div>
         </div>
      </section>
   );
}

export default HomeCombos;
