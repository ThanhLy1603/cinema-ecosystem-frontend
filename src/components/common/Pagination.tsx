import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReactElement } from 'react';
import Button from '@/components/ui/Button';

interface PaginationProps {
   page: number;
   totalPages: number;
   totalElements: number;
   onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, totalElements, onPageChange }: PaginationProps): ReactElement {
   const lastPage: number = Math.max(totalPages - 1, 0);

   return (
      <nav aria-label="Phân trang" className="flex flex-wrap items-center justify-between gap-3 text-sm text-ink-600">
         <p>
            Trang <strong className="text-ink-900">{page + 1}</strong> / {Math.max(totalPages, 1)} ·{' '}
            {totalElements.toLocaleString('vi-VN')} kết quả
         </p>
         <div className="flex gap-2">
            <Button
               variant="secondary"
               size="sm"
               icon={<ChevronLeft className="size-4" aria-hidden="true" />}
               disabled={page <= 0}
               onClick={() => onPageChange(page - 1)}
            >
               Trước
            </Button>
            <Button
               variant="secondary"
               size="sm"
               disabled={page >= lastPage}
               onClick={() => onPageChange(page + 1)}
               icon={<ChevronRight className="size-4" aria-hidden="true" />}
            >
               Sau
            </Button>
         </div>
      </nav>
   );
}

export default Pagination;
