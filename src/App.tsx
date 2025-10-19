import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';

// routing
import router from 'routes';

// project imports
import NavigationScroll from 'layout/NavigationScroll';

import ThemeCustomization from 'themes';

// auth provider
import { JWTProvider as AuthProvider } from 'contexts/JWTContext';

// ==============================|| APP ||============================== //

export default function App() {
  return (
    <AuthProvider>
      <ThemeCustomization>
        <NavigationScroll>
          <>
            <RouterProvider router={router} />
            <Toaster 
              position="top-right"
              richColors
              closeButton
              duration={4000}
              expand={true}
              toastOptions={{
                style: {
                  fontSize: '18px',
                  fontWeight: '600',
                  padding: '18px 24px',
                  minHeight: '65px',
                  lineHeight: '1.5',
                  borderRadius: '12px',
                  maxWidth: '400px',
                  wordWrap: 'break-word'
                }
              }}
            />
          </>
        </NavigationScroll>
      </ThemeCustomization>
    </AuthProvider>
  );
}
