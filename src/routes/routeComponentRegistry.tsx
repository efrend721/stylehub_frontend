import { lazy, type ReactElement } from 'react';
import Loadable from '#/ui-component/Loadable';

// dashboard
const DashboardDefault = Loadable(lazy(() => import('#/views/dashboard/Default')));

// utilities
const UtilsTypography = Loadable(lazy(() => import('#/views/utilities/Typography')));
const UtilsColor = Loadable(lazy(() => import('#/views/utilities/Color')));
const UtilsShadow = Loadable(lazy(() => import('#/views/utilities/Shadow')));

// admin
const AdminUsuarios = Loadable(lazy(() => import('#/views/admin/usuarios')));
const AdminRoles = Loadable(lazy(() => import('#/views/admin/roles')));
const AdminRolesEdit = Loadable(lazy(() => import('#/views/admin/roles/RoleEditPage')));
const AdminMenus = Loadable(lazy(() => import('#/views/admin/menus')));
const AdminConfiguracion = Loadable(lazy(() => import('#/views/admin/configuracion')));

// sys config
const SysConfigEstablecimientos = Loadable(lazy(() => import('#/views/sysConfig/establecimientos')));

// auditoría y reportes
const AuditLogs = Loadable(lazy(() => import('#/views/audit/logs')));
const Reportes = Loadable(lazy(() => import('#/views/reportes')));

// gestión de productos
const TipoProducto = Loadable(lazy(() => import('#/views/gestionProductos/tipoProducto')));
const CategoriaProducto = Loadable(lazy(() => import('#/views/gestionProductos/categoriaProducto')));

// catálogo
const Proveedores = Loadable(lazy(() => import('#/views/catalogo/proveedores')));
const Productos = Loadable(lazy(() => import('#/views/catalogo/productos')));

export function getRouteElementByKey(componentKey: string): ReactElement | null {
  switch (componentKey) {
    // dashboard
    case 'dashboard-default':
      return <DashboardDefault />;

    // utilities
    case 'util-typography':
      return <UtilsTypography />;
    case 'util-color':
      return <UtilsColor />;
    case 'util-shadow':
      return <UtilsShadow />;

    // admin
    case 'usuarios':
      return <AdminUsuarios />;
    case 'roles':
      return <AdminRoles />;
    case 'roles-editar':
      return <AdminRolesEdit />;
    case 'menus':
      return <AdminMenus />;
    case 'configuracion-general':
      return <AdminConfiguracion />;

    // sysConfig
    case 'establecimiento':
      return <SysConfigEstablecimientos />;

    // auditoría/reportes
    case 'logs-sistema':
      return <AuditLogs />;
    case 'reportes':
      return <Reportes />;
    case 'reporte':
    case 'reportextra':
    case 'reportedinamico':
      return <Reportes />;

    // productos
    case 'tipoproducto':
      return <TipoProducto />;
    case 'categoria':
      return <CategoriaProducto />;
    case 'proveedor':
      return <Proveedores />;
    case 'productos':
      return <Productos />;

    default:
      return null;
  }
}
