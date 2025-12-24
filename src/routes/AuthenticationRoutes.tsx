import { lazy } from 'react';

// project imports
import MinimalLayout from '#/layout/MinimalLayout';
import Loadable from '#/ui-component/Loadable';
import GuestGuard from '#/utils/route-guard/GuestGuard';

// maintenance routing
const LoginPage = Loadable(lazy(() => import('#/views/login')));
const RegisterPage = Loadable(lazy(() => import('#/views/register')));

// ==============================|| AUTHENTICATION ROUTING ||============================== //

const AuthenticationRoutes = {
  path: '/',
  element: (
    <GuestGuard>
      <MinimalLayout />
    </GuestGuard>
  ),
  children: [
    {
      path: '/',
      element: <LoginPage />
    },
    {
      path: '/login',
      element: <LoginPage />
    },
    {
      path: '/register',
      element: <RegisterPage />
    }
  ]
};

export default AuthenticationRoutes;
