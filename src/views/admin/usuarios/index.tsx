import { useEffect, useMemo, useState, useCallback } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import notify from 'utils/notify';
import { DataGrid, GridColDef, GridToolbarQuickFilter, GridToolbarContainer } from '@mui/x-data-grid';
import type { GridRowSelectionModel } from '@mui/x-data-grid';

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

export default function AdminUsuariosPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  // Keep selection model flexible to support both array and object shapes across MUI versions
  const [selectionModel, setSelectionModel] = useState<any>({ type: 'include', ids: new Set() });
  const [confirmOpen, setConfirmOpen] = useState(false);
  // Uncontrolled selection (checkboxSelection) to keep it simple and avoid TS coupling for now

  const headers = useMemo(() => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const fetchUsuarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/usuarios`, { headers });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.message || `HTTP ${res.status}`);
      setRows(Array.isArray(json.data) ? (json.data as Usuario[]) : []);
    } catch (e: any) {
      setError(e?.message || 'No se pudo cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const selectedIds = useMemo(() => {
    if (Array.isArray(selectionModel)) return selectionModel as (string | number)[];
    if (selectionModel && typeof selectionModel === 'object' && 'ids' in selectionModel) {
      const ids = (selectionModel as any).ids;
      if (ids instanceof Set) return Array.from(ids);
      if (Array.isArray(ids)) return ids;
    }
    return [] as (string | number)[];
  }, [selectionModel]);

  const doBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setDeleting(true);
    try {
      // Intento 1: endpoint de eliminación masiva
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        const res = await fetch(`${API_BASE}/usuarios/bulk-delete`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ usuarios: selectedIds.map(String) }),
          signal: controller.signal
        });
        clearTimeout(timeout);
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json?.success) throw new Error(json?.message || `HTTP ${res.status}`);
        const deleted = json?.data?.deleted ?? selectedIds.length;
        const requested = json?.data?.requested ?? selectedIds.length;
        if (deleted === requested) {
          notify.success(json?.message || `${deleted} usuario(s) eliminados`);
        } else {
          notify.error(`Eliminados ${deleted}/${requested}. Revise permisos o estados.`);
        }
      } catch (bulkErr: any) {
        // Fallback: eliminar uno por uno si el endpoint masivo falla (CORS/404/etc.)
        notify.info('No se pudo usar bulk-delete. Intentando eliminación individual…');
        const results = await Promise.all(
          selectedIds.map(async (id) => {
            try {
              const res = await fetch(`${API_BASE}/usuarios/${encodeURIComponent(String(id))}`, { method: 'DELETE', headers });
              const json = await res.json().catch(() => ({}));
              return { ok: res.ok && json?.success, id };
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
  setSelectionModel([]);
    } catch (e: any) {
      notify.error(e?.message || 'Error al eliminar selección');
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  const columns: GridColDef<Usuario>[] = useMemo(
    () => [
      {
        field: 'usuario_acceso',
        headerName: 'Usuario',
        width: 200,
        sortable: true,
        renderCell: (params) => (
          <Button component={RouterLink} to={`/admin/usuarios/${encodeURIComponent(params.row.usuario_acceso)}`} size="small">
            {params.row.usuario_acceso}
          </Button>
        )
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
      }
    ],
    []
  );

  const CustomToolbar = useCallback(() => (
    <GridToolbarContainer sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
      <GridToolbarQuickFilter quickFilterParser={(input) => input.split(/\s+/).filter(Boolean)} />
      <Box sx={{ flexGrow: 1 }} />
      <Button color="error" variant="contained" onClick={() => setConfirmOpen(true)} disabled={selectedIds.length === 0 || deleting}>
        {deleting ? 'Eliminando…' : `Eliminar (${selectedIds.length})`}
      </Button>
    </GridToolbarContainer>
  ), [selectedIds.length, deleting]);

  return (
    <MainCard
      title="Gestión de Usuarios"
      secondary={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={fetchUsuarios} disabled={loading}>Refrescar</Button>
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
            ¿Seguro que deseas eliminar {selectedIds.length} usuario(s) seleccionados? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={deleting}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={doBulkDelete} disabled={deleting} autoFocus>
            {deleting ? 'Eliminando…' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
