import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainCard from 'ui-component/cards/MainCard';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useAuth } from 'contexts/AuthContext';
import notify from 'utils/notify';

type Usuario = {
  usuario_acceso: string;
  nombre_usuario: string;
  apellido_usuario: string;
  telefono: string | null;
  correo_electronico: string;
  id_rol: number;
  id_establecimiento: string;
  estado: number;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  fecha_ultimo_acceso?: string | null;
};

const API_BASE = import.meta.env.VITE_APP_API_URL || 'http://localhost:1234';

export default function AdminUsuarioDetalle() {
  const { usuario } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [data, setData] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [password, setPassword] = useState('');

  const headers = useMemo(() => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const load = async () => {
    if (!usuario) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/usuarios/${encodeURIComponent(usuario)}`, { headers });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success) throw new Error(json?.message || `HTTP ${res.status}`);
      setData(json.data as Usuario);
    } catch (e: any) {
      notify.error(e?.message || 'No se pudo cargar el usuario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario]);

  const onSave = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const payload: any = {
        nombre_usuario: data.nombre_usuario,
        apellido_usuario: data.apellido_usuario,
        telefono: data.telefono,
        correo_electronico: data.correo_electronico,
        id_rol: data.id_rol,
        id_establecimiento: data.id_establecimiento,
        estado: data.estado
      };
      if (password && password.trim()) payload.contrasena = password.trim();

      const res = await fetch(`${API_BASE}/usuarios/${encodeURIComponent(data.usuario_acceso)}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success) throw new Error(json?.message || `HTTP ${res.status}`);
      notify.success('Usuario actualizado');
      setPassword('');
    } catch (e: any) {
      notify.error(e?.message || 'No se pudo actualizar');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!data) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/usuarios/${encodeURIComponent(data.usuario_acceso)}`, {
        method: 'DELETE',
        headers
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success) throw new Error(json?.message || `HTTP ${res.status}`);
      notify.success('Usuario eliminado');
      navigate('/admin/usuarios');
    } catch (e: any) {
      notify.error(e?.message || 'No se pudo eliminar');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <MainCard title={`Usuario: ${usuario || ''}`} secondary={<Button onClick={() => navigate(-1)}>Volver</Button>}>
      {loading || !data ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={2} sx={{ maxWidth: 720 }}>
          <TextField label="Usuario" value={data.usuario_acceso} disabled fullWidth />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Nombre" value={data.nombre_usuario} onChange={(e) => setData({ ...data, nombre_usuario: e.target.value })} fullWidth />
            <TextField label="Apellido" value={data.apellido_usuario} onChange={(e) => setData({ ...data, apellido_usuario: e.target.value })} fullWidth />
          </Stack>
          <TextField label="Correo" type="email" value={data.correo_electronico} onChange={(e) => setData({ ...data, correo_electronico: e.target.value })} fullWidth />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Teléfono" value={data.telefono ?? ''} onChange={(e) => setData({ ...data, telefono: e.target.value })} fullWidth />
            <TextField label="Rol (id)" type="number" value={data.id_rol} onChange={(e) => setData({ ...data, id_rol: Number(e.target.value) || 0 })} fullWidth />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Establecimiento" value={data.id_establecimiento} onChange={(e) => setData({ ...data, id_establecimiento: e.target.value })} fullWidth />
            <FormControlLabel control={<Checkbox checked={data.estado === 1} onChange={(e) => setData({ ...data, estado: e.target.checked ? 1 : 0 })} />} label="Activo" />
          </Stack>
          <TextField label="Contraseña (opcional)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Dejar en blanco para no cambiar" fullWidth />

          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={onSave} disabled={saving} startIcon={saving ? <CircularProgress size={16} /> : null}>
              Guardar cambios
            </Button>
            <Button color="error" variant="outlined" onClick={onDelete} disabled={deleting} startIcon={deleting ? <CircularProgress size={16} /> : null}>
              Eliminar usuario
            </Button>
          </Stack>

          <Typography variant="caption" color="text.secondary">
            Creado: {data.fecha_creacion ? new Date(data.fecha_creacion).toLocaleString() : '-'} | Última actualización: {data.fecha_actualizacion ? new Date(data.fecha_actualizacion).toLocaleString() : '-'}
          </Typography>
        </Stack>
      )}
    </MainCard>
  );
}
