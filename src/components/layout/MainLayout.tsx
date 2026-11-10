import type { ReactElement } from 'react';
import { Outlet } from 'react-router-dom';
import AnnouncementBar from './AnnouncementBar';
import Footer from './Footer';
import Navbar from './Navbar';
import ScrollToTopButton from './ScrollToTopButton';

export function MainLayout(): ReactElement {
   return (
      <div className="flex min-h-screen flex-col bg-cream">
         <AnnouncementBar />
         <Navbar />
         <main className="flex-1">
            <Outlet />
         </main>
         <Footer />
         <ScrollToTopButton />
      </div>
   );
}

export default MainLayout;
