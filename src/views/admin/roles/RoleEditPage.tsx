import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  Stack,
  TextField,
  Typography,
  Switch,
  CircularProgress,
  Paper
} from '@mui/material';
import MainCard from '#/ui-component/cards/MainCard';
import { RolesService } from '../../../services/roles/rolesService';
import { MenusService } from '../../../services/menus/menusService';
import notify from '#/utils/notify';
import type { Rol } from './types';
import type { RoleMenuItem } from '#/types/menu';
import { getErrorMessage } from '#/utils/errorUtils';

// Componente recursivo para renderizar el árbol de menús
const MenuTreeItem = ({ 
  item, 
  onToggle, 
  level = 0 
}: { 
  item: RoleMenuItem; 
  onToggle: (id: number, checked: boolean) => void; 
  level?: number;
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onToggle(item.id_menu_item, e.target.checked);
  };

  return (
    <Box sx={{ ml: level * 3, mb: 1 }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={!!item.asignado}
            onChange={handleChange}
            color="primary"
          />
        }
        label={
          <Typography variant={item.type === 'group' ? 'subtitle1' : 'body2'} sx={{ fontWeight: item.type === 'group' ? 'bold' : 'normal' }}>
            {item.title}
          </Typography>
        }
      />
      {item.children && item.children.length > 0 && (
        <Box sx={{ mt: 1 }}>
          {item.children.map((child) => (
            <MenuTreeItem 
              key={child.id_menu_item} 
              item={child} 
              onToggle={onToggle} 
              level={level + 1} 
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

const RoleEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState<Rol | null>(null);
  const [menus, setMenus] = useState<RoleMenuItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // Fetch role details and menus in parallel
        const roleData: Rol = await RolesService.getById(Number(id));
        console.log('Role Data recibida:', roleData);
        
        const menusData: RoleMenuItem[] = await MenusService.getRoleMenus(Number(id));
        console.log('Menus Data recibida:', menusData);
        
        setRole(roleData);
        setMenus(menusData);
      } catch (error) {
        notify.error(getErrorMessage(error, 'Error al cargar datos del rol'));
        void navigate('/admin/roles');
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [id, navigate]);

  const handleRoleChange = (field: keyof Rol, value: string | number) => {
    if (!role) return;
    setRole({ ...role, [field]: value });
  };

  // Helper: Actualizar nodo y sus descendientes (propagación hacia abajo)
  const setNodeAndDescendants = (items: RoleMenuItem[], targetId: number, checked: boolean): RoleMenuItem[] => {
    return items.map(item => {
      if (item.id_menu_item === targetId) {
        const newItem = { ...item, asignado: checked };
        if (newItem.children) {
          newItem.children = setAllChildren(newItem.children, checked);
        }
        return newItem;
      }
      if (item.children) {
        return { ...item, children: setNodeAndDescendants(item.children, targetId, checked) };
      }
      return item;
    });
  };

  const setAllChildren = (items: RoleMenuItem[], checked: boolean): RoleMenuItem[] => {
    return items.map(item => {
      const newItem = { ...item, asignado: checked };
      if (newItem.children) {
        newItem.children = setAllChildren(newItem.children, checked);
      }
      return newItem;
    });
  };

  // Helper: Actualizar padres basado en hijos (propagación hacia arriba)
  const updateParentsBasedOnChildren = (items: RoleMenuItem[]): RoleMenuItem[] => {
    return items.map(item => {
      if (item.children && item.children.length > 0) {
        const updatedChildren = updateParentsBasedOnChildren(item.children);
        // Regla: El padre está activo si al menos un hijo está activo
        const shouldBeChecked = updatedChildren.some(child => child.asignado);
        return {
          ...item,
          children: updatedChildren,
          asignado: shouldBeChecked
        };
      }
      return item;
    });
  };

  const handleMenuToggle = (menuId: number, checked: boolean) => {
    setMenus(prevMenus => {
      // 1. Aplicar cambio al nodo y descendientes
      const step1 = setNodeAndDescendants(prevMenus, menuId, checked);
      // 2. Recalcular estado de los padres
      const step2 = updateParentsBasedOnChildren(step1);
      return step2;
    });
  };

  // Helper to extract IDs
  const getAllAssignedIds = (items: RoleMenuItem[]): number[] => {
    let ids: number[] = [];
    items.forEach(item => {
      if (item.asignado) {
        ids.push(item.id_menu_item);
      }
      if (item.children) {
        ids = [...ids, ...getAllAssignedIds(item.children)];
      }
    });
    return ids;
  };

  const handleSave = async () => {
    if (!role) return;
    
    try {
      setSaving(true);
      
      const assignedMenuIds = getAllAssignedIds(menus);
      
      // 1. Actualizar datos básicos del rol y menús
      await RolesService.update(role, assignedMenuIds);
      
      notify.success('Rol actualizado correctamente');
      void navigate('/admin/roles');
    } catch (error) {
      notify.error(getErrorMessage(error, 'Error al guardar cambios'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!role) return null;

  return (
    <MainCard title={`Editar Rol: ${role.nombre}`}>
      <Grid container spacing={3}>
        {/* Columna Izquierda: Datos del Rol */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>Datos Generales</Typography>
            <Stack spacing={3}>
              <TextField
                label="Nombre del Rol"
                value={role.nombre}
                onChange={(e) => handleRoleChange('nombre', e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Descripción"
                value={role.descripcion}
                onChange={(e) => handleRoleChange('descripcion', e.target.value)}
                fullWidth
                multiline
                rows={3}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={role.estado === 1}
                    onChange={(e) => handleRoleChange('estado', e.target.checked ? 1 : 0)}
                    color="primary"
                  />
                }
                label={role.estado === 1 ? 'Activo' : 'Inactivo'}
              />
            </Stack>
          </Paper>
        </Grid>

        {/* Columna Derecha: Permisos (Menús) */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>Permisos de Menú</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Seleccione los menús a los que este rol tendrá acceso.
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ maxHeight: '600px', overflowY: 'auto' }}>
              {menus.map((menu) => (
                <MenuTreeItem 
                  key={menu.id_menu_item} 
                  item={menu} 
                  onToggle={handleMenuToggle} 
                />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Botones de Acción */}
        <Grid size={12}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button 
              variant="outlined" 
              onClick={() => { void navigate('/admin/roles'); }}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button 
              variant="contained" 
              onClick={() => { void handleSave(); }}
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default RoleEditPage;
