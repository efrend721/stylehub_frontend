import { useEffect, useMemo, useState, useCallback } from 'react';
import MainCard from '#/ui-component/cards/MainCard';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useAuth } from '#/contexts/AuthContext';
import notify from '#/utils/notify';
import { DataGrid, GridColDef, Toolbar, QuickFilter } from '@mui/x-data-grid';
import type { GridRowSelectionModel, GridRowId } from '@mui/x-data-grid';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

type Usuario = {
  usuario_acceso: string;
  nombre_usuario: string;
  apellido_usuario: string;
  telefono: string | null;
  correo_electronico: string;
  id_rol: number;
  id_establecimiento: string;
  estado: number; // 1 activo, 0 inactivo
  fecha_creacion: string;
  fecha_actualizacion: string;
  fecha_ultimo_acceso: string | null;
};

const API_BASE = import.meta.env.VITE_APP_API_URL || 'http://localhost:1234';
const EMPTY_SELECTION: GridRowSelectionModel = { type: 'include', ids: new Set<GridRowId>() };

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.success === 'boolean';
}

export default function AdminUsuariosPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  // DataGrid v8 selection model object with include/exclude and ids
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>(EMPTY_SELECTION);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const [editUser, setEditUser] = useState<Usuario | null>(null);
  const [saving, setSaving] = useState(false);
  // Uncontrolled selection (checkboxSelection) to keep it simple and avoid TS coupling for now

  const headers = useMemo(() => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/usuarios`, { headers });
      const raw: unknown = await res.json().catch(() => ({}));
      if (!res.ok || !isApiResponse<Usuario[]>(raw) || !raw.success) {
        const msg = isApiResponse<Usuario[]>(raw) && raw.message ? raw.message : `HTTP ${res.status}`;
        throw new Error(msg);
      }
      const list = Array.isArray(raw.data) ? raw.data : [];
      setRows(list);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo cargar usuarios';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    void fetchUsuarios();
  }, [fetchUsuarios]);

  const selectedIds = useMemo<GridRowId[]>(() => {
    const ids = selectionModel.ids as unknown;
    if (ids instanceof Set) return Array.from(ids) as GridRowId[];
    if (Array.isArray(ids)) return ids as GridRowId[];
    return [] as GridRowId[];
  }, [selectionModel]);

  const doBulkDelete = async () => {
    if (deleteIds.length === 0) return;
    setDeleting(true);
    try {
      // Intento 1: endpoint de eliminación masiva
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        const res = await fetch(`${API_BASE}/usuarios/bulk-delete`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ usuarios: deleteIds.map(String) }),
          signal: controller.signal
        });
        clearTimeout(timeout);
        const raw: unknown = await res.json().catch(() => ({}));
        if (!res.ok || !isApiResponse<{ deleted?: number; requested?: number }>(raw) || !raw.success) {
          const msg = isApiResponse<{ deleted?: number; requested?: number }>(raw) && raw.message ? raw.message : `HTTP ${res.status}`;
          throw new Error(msg);
        }
        const deleted = raw.data?.deleted ?? deleteIds.length;
        const requested = raw.data?.requested ?? deleteIds.length;
        if (deleted === requested) {
          notify.success((typeof raw.message === 'string' ? raw.message : undefined) || `${deleted} usuario(s) eliminados`);
        } else {
          notify.error(`Eliminados ${deleted}/${requested}. Revise permisos o estados.`);
        }
      } catch {
        // Fallback: eliminar uno por uno si el endpoint masivo falla (CORS/404/etc.)
        notify.info('No se pudo usar bulk-delete. Intentando eliminación individual…');
        const results = await Promise.all(
          deleteIds.map(async (id) => {
            try {
              const res = await fetch(`${API_BASE}/usuarios/${encodeURIComponent(String(id))}`, { method: 'DELETE', headers });
              const raw: unknown = await res.json().catch(() => ({}));
              const ok = res.ok && isApiResponse<unknown>(raw) && !!raw.success;
              return { ok, id };
            } catch {
              return { ok: false, id };
            }
          })
        );
        const okCount = results.filter((r) => r.ok).length;
        const failCount = results.length - okCount;
        if (okCount > 0) notify.success(`${okCount} usuario(s) eliminados`);
        if (failCount > 0) notify.error(`No se eliminaron ${failCount}`);
      }
      // refrescar y limpiar selección
  await fetchUsuarios();
  setSelectionModel(EMPTY_SELECTION);
      setDeleteIds([]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al eliminar selección';
      notify.error(msg);
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  const openConfirmFor = (ids: (string | number)[]) => {
    setDeleteIds(ids.map(String));
    setConfirmOpen(true);
  };

  const openEditFor = (user: Usuario) => {
    // Abrir diálogo de edición con una copia del usuario
    setEditUser({ ...user });
  };

  const saveEdit = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      const payload = {
        nombre_usuario: editUser.nombre_usuario,
        apellido_usuario: editUser.apellido_usuario,
        correo_electronico: editUser.correo_electronico,
        estado: editUser.estado
      } as Partial<Usuario>;
      const res = await fetch(`${API_BASE}/usuarios/${encodeURIComponent(editUser.usuario_acceso)}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });
      const raw: unknown = await res.json().catch(() => ({}));
      if (!res.ok || !isApiResponse<unknown>(raw) || !raw.success) {
        const msg = isApiResponse<unknown>(raw) && raw.message ? raw.message : `HTTP ${res.status}`;
        throw new Error(msg);
      }
  notify.success((typeof raw.message === 'string' ? raw.message : undefined) || 'Usuario actualizado');
      setEditUser(null);
      await fetchUsuarios();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo actualizar el usuario';
      notify.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const columns: GridColDef<Usuario>[] = useMemo(
    () => [
      {
        field: 'usuario_acceso',
        headerName: 'Usuario',
        width: 200,
        sortable: true,
        renderCell: (params) => <Typography variant="body2">{params.row.usuario_acceso}</Typography>
      },
      { field: 'nombre_usuario', headerName: 'Nombre', flex: 1, minWidth: 160 },
      { field: 'apellido_usuario', headerName: 'Apellido', flex: 1, minWidth: 160 },
      { field: 'correo_electronico', headerName: 'Correo', flex: 1.2, minWidth: 200 },
      { field: 'id_establecimiento', headerName: 'Establecimiento', width: 160 },
      {
        field: 'estado',
        headerName: 'Estado',
        width: 120,
        type: 'singleSelect',
        valueOptions: [
          { value: 1, label: 'Activo' },
          { value: 0, label: 'Inactivo' }
        ],
        renderCell: (params) => (
          <Chip label={params.value === 1 ? 'Activo' : 'Inactivo'} color={params.value === 1 ? 'success' : 'default'} size="small" />
        )
      },
      {
        field: 'acciones',
        headerName: 'Acciones',
        width: 120,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Modificar">
              <IconButton size="small" onClick={() => openEditFor(params.row)} aria-label="Modificar">
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar">
              <IconButton size="small" color="error" onClick={() => openConfirmFor([params.row.usuario_acceso])} aria-label="Eliminar">
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )
      }
    ],
    []
  );

  const CustomToolbar = useCallback(
    () => (
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, width: '100%' }}>
          <QuickFilter parser={(searchText) => searchText.split(/\s+/).filter(Boolean)} />
          <Box sx={{ flexGrow: 1 }} />
          {selectedIds.length > 1 && (
            <Button color="error" variant="contained" onClick={() => openConfirmFor(selectedIds)} disabled={deleting}>
              {deleting ? 'Eliminando…' : `Eliminar por Grupos (${selectedIds.length})`}
            </Button>
          )}
        </Box>
      </Toolbar>
    ),
    [selectedIds, deleting]
  );

  return (
    <MainCard
      title="Gestión de Usuarios"
      secondary={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={() => void fetchUsuarios()} disabled={loading}>
            Refrescar
          </Button>
        </Box>
      }
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ p: 2 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : rows.length === 0 ? (
        <Box sx={{ p: 2 }}>
          <Typography>No hay usuarios.</Typography>
        </Box>
      ) : (
        <Paper sx={{ width: '100%', height: 560 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(r) => r.usuario_acceso}
            checkboxSelection
            disableRowSelectionOnClick
            hideFooterSelectedRowCount
            showToolbar
            initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
            pageSizeOptions={[10, 25, 50]}
            slots={{ toolbar: CustomToolbar }}
            sx={{ border: 0 }}
            density="compact"
            rowSelectionModel={selectionModel}
            onRowSelectionModelChange={(m) => setSelectionModel(m)}
          />
        </Paper>
      )}
      <Dialog open={confirmOpen} onClose={() => (deleting ? null : setConfirmOpen(false))}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Seguro que deseas eliminar {deleteIds.length} usuario(s)? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={deleting}>
            Cancelar
          </Button>
          <Button color="error" variant="contained" onClick={() => void doBulkDelete()} disabled={deleting} autoFocus>
            {deleting ? 'Eliminando…' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de edición */}
      <Dialog open={!!editUser} onClose={() => (saving ? null : setEditUser(null))} maxWidth="sm" fullWidth>
        <DialogTitle>Modificar usuario</DialogTitle>
        <DialogContent>
          {editUser && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Nombre"
                value={editUser.nombre_usuario}
                onChange={(e) => setEditUser({ ...editUser, nombre_usuario: e.target.value })}
                fullWidth
              />
              <TextField
                label="Apellido"
                value={editUser.apellido_usuario}
                onChange={(e) => setEditUser({ ...editUser, apellido_usuario: e.target.value })}
                fullWidth
              />
              <TextField
                label="Correo"
                type="email"
                value={editUser.correo_electronico}
                onChange={(e) => setEditUser({ ...editUser, correo_electronico: e.target.value })}
                fullWidth
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={editUser.estado === 1}
                    onChange={(e) => setEditUser({ ...editUser, estado: e.target.checked ? 1 : 0 })}
                  />
                }
                label={editUser.estado === 1 ? 'Activo' : 'Inactivo'}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUser(null)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={() => void saveEdit()} variant="contained" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
