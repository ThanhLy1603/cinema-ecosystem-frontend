import { Building2, Clapperboard, MessagesSquare, Tag, Ticket } from 'lucide-react';
import type { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ComingSoonPage from '@/components/common/ComingSoonPage';
import ForbiddenPage from '@/components/common/ForbiddenPage';
import AuthLayout from '@/components/layout/AuthLayout';
import MainLayout from '@/components/layout/MainLayout';
import GuestRoute from '@/features/auth/guards/GuestRoute';
import ProtectedRoute from '@/features/auth/guards/ProtectedRoute';
import LoginPage from '@/features/auth/pages/LoginPage';
import ProfilePage from '@/features/auth/pages/ProfilePage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import HomePage from '@/features/home/pages/HomePage';

export function AppRoutes(): ReactElement {
   return (
      <Routes>
         <Route element={<GuestRoute />}>
            <Route element={<AuthLayout />}>
               <Route path="/login" element={<LoginPage />} />
               <Route path="/register" element={<RegisterPage />} />
            </Route>
         </Route>

         <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route
               path="/movies"
               element={
                  <ComingSoonPage
                     title="Phim đang chiếu"
                     description="Danh sách phim, lịch chiếu và đặt vé sẽ sớm có mặt tại đây."
                     icon={Clapperboard}
                  />
               }
            />
            <Route
               path="/cinemas"
               element={
                  <ComingSoonPage
                     title="Hệ thống rạp chiếu"
                     description="Thông tin các cụm rạp, phòng chiếu và tiện ích đang được hoàn thiện."
                     icon={Building2}
                  />
               }
            />
            <Route
               path="/promotions"
               element={
                  <ComingSoonPage
                     title="Khuyến mãi"
                     description="Ưu đãi giảm giá và chương trình tích điểm thành viên sắp được cập nhật."
                     icon={Tag}
                  />
               }
            />
            <Route
               path="/community"
               element={
                  <ComingSoonPage
                     title="Cộng đồng & Blog"
                     description="Nơi chia sẻ đánh giá phim và bài viết điện ảnh đang được xây dựng."
                     icon={MessagesSquare}
                  />
               }
            />
            <Route element={<ProtectedRoute />}>
               <Route path="/profile" element={<ProfilePage />} />
               <Route
                  path="/tickets"
                  element={
                     <ComingSoonPage
                        title="Vé của tôi"
                        description="Lịch sử đặt vé và mã QR vé điện tử của bạn sẽ hiển thị ở đây."
                        icon={Ticket}
                     />
                  }
               />
            </Route>
            <Route path="/forbidden" element={<ForbiddenPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
         </Route>
      </Routes>
   );
}

export default AppRoutes;
