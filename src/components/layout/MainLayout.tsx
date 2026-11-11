import type { ReactElement } from 'react';
import { Outlet, useLocation, type Location } from 'react-router-dom';
import Footer from './Footer';
import Navbar from './Navbar';
import ScrollToTopButton from './ScrollToTopButton';

export function MainLayout(): ReactElement {
   const location: Location = useLocation();

   return (
      <div className="theme-shinkai flex min-h-screen flex-col bg-cream">
         <Navbar />
         <main key={location.pathname} className="flex-1 animate-fade-in">
            <Outlet />
         </main>
         <Footer />
         <ScrollToTopButton />
      </div>
   );
}

export default MainLayout;
