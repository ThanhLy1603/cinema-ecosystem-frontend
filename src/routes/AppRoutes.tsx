import { MessagesSquare, Tag, Ticket } from 'lucide-react';
import type { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ComingSoonPage from '@/components/common/ComingSoonPage';
import ForbiddenPage from '@/components/common/ForbiddenPage';
import AdminLayout from '@/components/layout/AdminLayout';
import AuthLayout from '@/components/layout/AuthLayout';
import MainLayout from '@/components/layout/MainLayout';
import AdminDashboardPage from '@/features/admin/pages/AdminDashboardPage';
import GuestRoute from '@/features/auth/guards/GuestRoute';
import ProtectedRoute from '@/features/auth/guards/ProtectedRoute';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
import LoginPage from '@/features/auth/pages/LoginPage';
import ProfilePage from '@/features/auth/pages/ProfilePage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage';
import VerifyEmailPage from '@/features/auth/pages/VerifyEmailPage';
import CinemaCreatePage from '@/features/cinema-management/pages/CinemaCreatePage';
import CinemaDetailPage from '@/features/cinema-management/pages/CinemaDetailPage';
import CinemaManagementPage from '@/features/cinema-management/pages/CinemaManagementPage';
import FacilityManagementPage from '@/features/cinema-management/pages/FacilityManagementPage';
import SeatMapEditorPage from '@/features/cinema-management/pages/SeatMapEditorPage';
import SeatSelectionPage from '@/features/booking/pages/SeatSelectionPage';
import MovieShowtimeSelectionPage from '@/features/booking/pages/MovieShowtimeSelectionPage';
import CinemaListPage from '@/features/cinemas/pages/CinemaListPage';
import CinemaPublicPage from '@/features/cinemas/pages/CinemaPublicPage';
import HomePage from '@/features/home/pages/HomePage';
import FnbMenuPage from '@/features/fnb/pages/FnbMenuPage';
import FnbManagementPage from '@/features/fnb-management/pages/FnbManagementPage';
import GenreManagementPage from '@/features/movie-management/pages/GenreManagementPage';
import MovieCreatePage from '@/features/movie-management/pages/MovieCreatePage';
import MovieEditPage from '@/features/movie-management/pages/MovieEditPage';
import MovieManagementPage from '@/features/movie-management/pages/MovieManagementPage';
import PersonManagementPage from '@/features/movie-management/pages/PersonManagementPage';
import MovieDetailPage from '@/features/movies/pages/MovieDetailPage';
import MovieListPage from '@/features/movies/pages/MovieListPage';
import PriceRuleManagementPage from '@/features/price-management/pages/PriceRuleManagementPage';
import ShowtimeManagementPage from '@/features/showtime-management/pages/ShowtimeManagementPage';
import CreateStaffPage from '@/features/user-management/pages/CreateStaffPage';
import UserDetailPage from '@/features/user-management/pages/UserDetailPage';
import UserManagementPage from '@/features/user-management/pages/UserManagementPage';

export function AppRoutes(): ReactElement {
   return (
      <Routes>
         <Route element={<GuestRoute />}>
            <Route element={<AuthLayout />}>
               <Route path="/login" element={<LoginPage />} />
               <Route path="/register" element={<RegisterPage />} />
            </Route>
         </Route>

         <Route element={<AuthLayout />}>
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
         </Route>

         <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/movies" element={<MovieListPage />} />
            <Route path="/movies/:movieSlug" element={<MovieDetailPage />} />
            <Route path="/movies/:movieSlug/booking" element={<MovieShowtimeSelectionPage />} />
            <Route path="/fnb" element={<FnbMenuPage />} />
            <Route path="/cinemas" element={<CinemaListPage />} />
            <Route path="/cinemas/:slug" element={<CinemaPublicPage />} />
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
               <Route path="/booking/showtimes/:showtimeId/seats" element={<SeatSelectionPage />} />
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

         <Route element={<ProtectedRoute roles={['ROLE_ADMIN', 'ROLE_MANAGER']} />}>
            <Route path="/admin" element={<AdminLayout />}>
               <Route index element={<AdminDashboardPage />} />
               <Route path="users" element={<UserManagementPage />} />
               <Route path="users/new" element={<CreateStaffPage />} />
               <Route path="users/:userId" element={<UserDetailPage />} />
               <Route path="cinemas" element={<CinemaManagementPage />} />
               <Route path="cinemas/new" element={<CinemaCreatePage />} />
               <Route path="cinemas/facilities" element={<FacilityManagementPage />} />
               <Route path="cinemas/:cinemaId" element={<CinemaDetailPage />} />
               <Route path="halls/:hallId/seat-map" element={<SeatMapEditorPage />} />
               <Route path="movies" element={<MovieManagementPage />} />
               <Route path="movies/genres" element={<GenreManagementPage />} />
               <Route path="movies/persons" element={<PersonManagementPage />} />
               <Route path="movies/new" element={<MovieCreatePage />} />
               <Route path="movies/:movieId" element={<MovieEditPage />} />
               <Route path="fnb" element={<FnbManagementPage />} />
               <Route path="showtimes" element={<ShowtimeManagementPage />} />
               <Route path="price-rules" element={<PriceRuleManagementPage />} />
               <Route
                  path="promotions"
                  element={
                     <ComingSoonPage
                        title="Quản lý khuyến mãi & F&B"
                        description="Chương trình khuyến mãi theo hạng thành viên và danh mục bắp nước sẽ được cập nhật tại đây."
                        icon={Tag}
                        backTo="/admin"
                        backLabel="Về trang quản trị"
                     />
                  }
               />
               <Route
                  path="community"
                  element={
                     <ComingSoonPage
                        title="Quản lý cộng đồng & blog"
                        description="Soạn bài viết điện ảnh và kiểm duyệt bình luận, đánh giá sẽ sớm có mặt."
                        icon={MessagesSquare}
                        backTo="/admin"
                        backLabel="Về trang quản trị"
                     />
                  }
               />
               <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>
         </Route>
      </Routes>
   );
}

export default AppRoutes;
