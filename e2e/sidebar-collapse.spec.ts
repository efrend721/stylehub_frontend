import { test, expect } from '@playwright/test';

test('sidebar group menus expand/collapse', async ({ page }) => {
  // Ensure the drawer starts open (otherwise group labels/buttons may be hidden)
  await page.addInitScript(() => {
    const key = 'berry-config-vite-js';
    const value = {
      fontFamily: "'Roboto', sans-serif",
      borderRadius: 8,
      collapsibleGroupMenus: true,
      customGroupIcons: true,
      miniDrawer: false
    };
    localStorage.setItem(key, JSON.stringify(value));
  });

  // Mock auth so AuthGuard allows MainLayout rendering
  await page.route('**/auth/me*', async (route) => {
    const req = route.request();
    const origin = req.headers()['origin'] ?? 'http://localhost';
    const baseHeaders: Record<string, string> = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': req.headers()['access-control-request-headers'] ?? 'content-type, authorization'
    };

    if (req.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: baseHeaders, body: '' });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: baseHeaders,
      body: JSON.stringify({
        success: true,
        data: {
          id_usuario_uuid: '00000000-0000-0000-0000-000000000000',
          usuario_acceso: 'e2e',
          nombre_usuario: 'E2E',
          apellido_usuario: 'User',
          telefono: '',
          correo_electronico: 'e2e@example.com',
          id_rol: 1,
          id_establecimiento: '1',
          estado: 1,
          fecha_creacion: new Date().toISOString(),
          fecha_actualizacion: new Date().toISOString(),
          fecha_ultimo_acceso: new Date().toISOString()
        }
      })
    });
  });

  // Mock /menus/routes (flat allowlist) just in case something prefetches it
  await page.route(/\/menus\/routes(?:\?.*)?$/, async (route) => {
    const req = route.request();
    const origin = req.headers()['origin'] ?? 'http://localhost';
    const baseHeaders: Record<string, string> = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': req.headers()['access-control-request-headers'] ?? 'content-type, authorization'
    };

    if (req.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: baseHeaders, body: '' });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: baseHeaders,
      body: JSON.stringify({ success: true, data: [] })
    });
  });

  // Mock /menus so the sidebar is deterministic
  await page.route(/\/menus(?:\?.*)?$/, async (route) => {
    const req = route.request();
    const origin = req.headers()['origin'] ?? 'http://localhost';
    const baseHeaders: Record<string, string> = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': req.headers()['access-control-request-headers'] ?? 'content-type, authorization'
    };

    if (req.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: baseHeaders, body: '' });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: baseHeaders,
      body: JSON.stringify({
        success: true,
        data: [
          {
            id: 'dashboard',
            title: 'Dashboard',
            type: 'group',
            children: [
              {
                id: 'dashboard-default',
                title: 'Inicio',
                type: 'item',
                url: '/dashboard/default'
              }
            ]
          }
        ]
      })
    });
  });

  await page.goto('/dashboard/default');

  // Ensure auth check ran; if not authenticated the app redirects to /login and the drawer never renders.
  await page.waitForResponse((res) => res.url().includes('/auth/me') && res.status() === 200, { timeout: 10000 });
  await expect(page.locator('input[name="usuario_acceso"]')).toHaveCount(0);

  const drawerPaper = page.locator('.MuiDrawer-paper').first();
  await expect(drawerPaper).toBeVisible();

  const dashboardGroupButton = drawerPaper.getByRole('button', { name: 'Dashboard' }).first();
  await expect(dashboardGroupButton).toBeVisible();

  const dashboardChild = drawerPaper.getByText('Inicio', { exact: true });

  // Default should be collapsed (children unmounted)
  await expect(dashboardChild).toHaveCount(0);

  await dashboardGroupButton.click();
  await expect(dashboardChild).toHaveCount(1);

  await dashboardGroupButton.click();
  await expect(dashboardChild).toHaveCount(0);
});
