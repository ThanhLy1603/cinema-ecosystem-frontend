import type { ReactElement } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { MovieList } from '@/features/movies/MovieList'

export function AppRoutes(): ReactElement {
   return (
      <Routes>
         <Route element={<MainLayout />}>
            <Route path="/" element={<MovieList />} />
            <Route
               path="/cinemas"
               element={
                  <div className="py-12 text-center text-slate-400">
                     <h2 className="text-xl font-bold text-white mb-2">Cụm Rạp Chiếu Phim</h2>
                     <p className="text-sm">Danh sách cụm rạp, phòng chiếu IMAX & VIP đang được đồng bộ...</p>
                  </div>
               }
            />
            <Route
               path="/community"
               element={
                  <div className="py-12 text-center text-slate-400">
                     <h2 className="text-xl font-bold text-white mb-2">Diễn Đàn Điện Ảnh & Đánh Giá</h2>
                     <p className="text-sm">Trình soạn thảo TipTap và hệ thống bình luận nhiều cấp sẵn sàng.</p>
                  </div>
               }
            />
            <Route
               path="/promotions"
               element={
                  <div className="py-12 text-center text-slate-400">
                     <h2 className="text-xl font-bold text-white mb-2">Chương Trình Khuyến Mãi</h2>
                     <p className="text-sm">Ưu đãi giảm giá và chính sách tích điểm thành viên.</p>
                  </div>
               }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
         </Route>
      </Routes>
   )
}

export default AppRoutes
