import { useEffect, type ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { initializeSession } from '@/features/auth/services/sessionService';
import { QueryProvider } from '@/providers/QueryProvider';
import { AppRoutes } from '@/routes/AppRoutes';

function restoreSessionOnStartup(): void {
   void initializeSession();
}

export function App(): ReactElement {
   useEffect(restoreSessionOnStartup, []);

   return (
      <QueryProvider>
         <BrowserRouter>
            <AppRoutes />
         </BrowserRouter>
      </QueryProvider>
   );
}

export default App;
