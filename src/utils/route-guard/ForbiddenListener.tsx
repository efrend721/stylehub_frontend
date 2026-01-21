import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { setForbiddenHandler } from '#/services/apiClient/forbiddenEvents';
import { notify } from '#/utils/notify';

export default function ForbiddenListener() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setForbiddenHandler((reason) => {
      // Evitar loops si ya estamos en /403
      if (location.pathname === '/403') return;

      if (reason?.source === 'routes') {
        // Mantener el mensaje del backend cuando exista
        notify.warning(reason.message || 'No autorizado');
      }
      navigate('/403', { replace: true, state: { message: reason?.message, source: reason?.source } });
    });

    return () => {
      setForbiddenHandler(null);
    };
  }, [location.pathname, navigate]);

  return null;
}
