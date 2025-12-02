import { lazy } from 'react';

// project imports
import MainLayout from '#/layout/MainLayout';
import Loadable from '#/ui-component/Loadable';
import AuthGuard from '#/utils/route-guard/AuthGuard';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('#/views/dashboard/Default')));

// utilities routing
const UtilsTypography = Loadable(lazy(() => import('#/views/utilities/Typography')));
const UtilsColor = Loadable(lazy(() => import('#/views/utilities/Color')));
const UtilsShadow = Loadable(lazy(() => import('#/views/utilities/Shadow')));

// sample page routing
const SamplePage = Loadable(lazy(() => import('#/views/sample-page')));

// admin routing (new)
const AdminUsuarios = Loadable(lazy(() => import('#/views/admin/usuarios')));
const AdminRoles = Loadable(lazy(() => import('#/views/admin/roles')));
const AdminRolesEdit = Loadable(lazy(() => import('#/views/admin/roles/RoleEditPage')));
const AdminMenus = Loadable(lazy(() => import('#/views/admin/menus')));
const AdminRutasProtegidas = Loadable(lazy(() => import('#/views/admin/rutas-protegidas')));
const AdminConfiguracion = Loadable(lazy(() => import('#/views/admin/configuracion')));

// auditoría y reportes (new)
const AuditLogs = Loadable(lazy(() => import('#/views/audit/logs')));
const Reportes = Loadable(lazy(() => import('#/views/reportes')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: (
    <AuthGuard>
      <MainLayout />
    </AuthGuard>
  ),
  children: [
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    {
      path: 'typography',
      element: <UtilsTypography />
    },
    {
      path: 'color',
      element: <UtilsColor />
    },
    {
      path: 'shadow',
      element: <UtilsShadow />
    },
    {
      path: '/sample-page',
      element: <SamplePage />
    },
    // admin
    {
      path: 'admin',
      children: [
  { path: 'usuarios', element: <AdminUsuarios /> },
        { path: 'roles', element: <AdminRoles /> },
        { path: 'roles/editar/:id', element: <AdminRolesEdit /> },
        { path: 'menus', element: <AdminMenus /> },
        { path: 'rutas-protegidas', element: <AdminRutasProtegidas /> },
        { path: 'configuracion', element: <AdminConfiguracion /> }
      ]
    },
    // auditoría
    {
      path: 'audit',
      children: [
        { path: 'logs', element: <AuditLogs /> }
      ]
    },
    // reportes
    {
      path: 'reportes',
      element: <Reportes />
    }
  ]
};

export default MainRoutes;
