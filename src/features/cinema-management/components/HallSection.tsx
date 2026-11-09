import { History, Plus } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import Button from '@/components/ui/Button';
import type { Hall } from '@/types/cinema';
import DeletedHallList from './DeletedHallList';
import HallForm from './HallForm';
import HallRow from './HallRow';

interface HallSectionProps {
   cinemaId: number;
   halls: Hall[];
}

export function HallSection({ cinemaId, halls }: HallSectionProps): ReactElement {
   const [editingHallId, setEditingHallId] = useState<number | null>(null);
   const [isCreating, setIsCreating] = useState<boolean>(false);
   const [isShowingDeleted, setIsShowingDeleted] = useState<boolean>(false);

   function closeForms(): void {
      setEditingHallId(null);
      setIsCreating(false);
   }

   function startEditing(hallId: number): void {
      setIsCreating(false);
      setEditingHallId(hallId);
   }

   function startCreating(): void {
      setEditingHallId(null);
      setIsCreating(true);
   }

   return (
      <div className="space-y-4">
         {halls.length === 0 && !isCreating && (
            <p className="rounded-2xl bg-ink-50 px-4 py-6 text-center text-sm text-ink-500">
               Cụm rạp này chưa có phòng chiếu nào.
            </p>
         )}
         <ul className="space-y-3">
            {halls.map((hall) =>
               editingHallId === hall.id ? (
                  <li key={hall.id}>
                     <HallForm cinemaId={cinemaId} hall={hall} onDone={closeForms} onCancel={closeForms} />
                  </li>
               ) : (
                  <HallRow key={hall.id} hall={hall} onEdit={startEditing} />
               ),
            )}
         </ul>
         {isCreating ? (
            <HallForm cinemaId={cinemaId} onDone={closeForms} onCancel={closeForms} />
         ) : (
            <Button variant="secondary" icon={<Plus className="size-4" aria-hidden="true" />} onClick={startCreating}>
               Thêm phòng chiếu
            </Button>
         )}
         <div className="space-y-3 border-t border-ink-100 pt-4">
            <Button
               variant="ghost"
               icon={<History className="size-4" aria-hidden="true" />}
               onClick={() => setIsShowingDeleted(!isShowingDeleted)}
            >
               {isShowingDeleted ? 'Ẩn phòng đã xóa' : 'Xem phòng đã xóa'}
            </Button>
            {isShowingDeleted && <DeletedHallList cinemaId={cinemaId} />}
         </div>
      </div>
   );
}

export default HallSection;
