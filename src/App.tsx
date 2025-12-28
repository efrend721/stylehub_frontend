import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';

// routing
import router from '#/routes';

// project imports
import NavigationScroll from '#/layout/NavigationScroll';

import ThemeCustomization from '#/themes';

// auth provider
import { JWTProvider as AuthProvider } from '#/contexts/JWTContext';
import useConfig from '#/hooks/useConfig';
import { useEffect } from 'react';

// ==============================|| APP ||============================== //

export default function App() {
  function DevHotkeys() {
    const { state, setField } = useConfig();

    useEffect(() => {
      if (import.meta.env.MODE === 'production') return;

      const handler = (e: KeyboardEvent) => {
        if (e.shiftKey && e.key.toLowerCase() === 'g') {
          const current = state.collapsibleGroupMenus ?? true;
          setField('collapsibleGroupMenus', !current);
          try {
            console.info('[dev] toggled collapsibleGroupMenus:', !current);
          } catch {}
        }
      };

      window.addEventListener('keydown', handler);
      // Expose manual toggle for automation
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__toggleCollapsibleGroupMenus = (value?: boolean) => {
        const current = state.collapsibleGroupMenus ?? true;
        const next = typeof value === 'boolean' ? value : !current;
        setField('collapsibleGroupMenus', next);
        try {
          console.info('[dev] toggled collapsibleGroupMenus (manual):', next);
        } catch {}
      };

      return () => {
        window.removeEventListener('keydown', handler);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (window as any).__toggleCollapsibleGroupMenus;
      };
    }, [setField, state.collapsibleGroupMenus]);

    return null;
  }

  return (
    <AuthProvider>
      <ThemeCustomization>
        <NavigationScroll>
          <>
            {import.meta.env.MODE !== 'production' && <DevHotkeys />}
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
