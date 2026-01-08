import { test, expect } from '@playwright/test';

test('sidebar group menus expand/collapse', async ({ page }) => {
  // Mock auth so AuthGuard allows MainLayout rendering
  await page.route('**/auth/me*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
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

  // Mock menus so the sidebar is deterministic
  await page.route('**/menus*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
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
          },
          {
            id: 'logistica',
            title: 'Logística',
            type: 'group',
            children: [
              {
                id: 'logistica-reportes',
                title: 'Reportes',
                type: 'item',
                url: '/logistica/reportes'
              }
            ]
          }
        ]
      })
    });
  });

  await page.goto('/dashboard/default');
  const sidebarNav = page.getByRole('navigation', { name: 'mailbox folders' });

  const dashboardGroupButton = sidebarNav.getByRole('button', { name: 'Dashboard' }).first();
  await expect(dashboardGroupButton).toBeVisible();

  const dashboardChild = sidebarNav.getByText('Inicio', { exact: true });

  // Default should be collapsed (children unmounted)
  await expect(dashboardChild).toHaveCount(0);

  await dashboardGroupButton.click();
  await expect(dashboardChild).toHaveCount(1);

  await dashboardGroupButton.click();
  await expect(dashboardChild).toHaveCount(0);
});
