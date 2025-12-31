import Loadable from '#/ui-component/Loadable';
import { lazy } from 'react';

export default Loadable(lazy(() => import('./ProductosPage')));
