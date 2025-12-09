import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
// import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { IconDashboard, IconTypography, IconPalette, IconShadow, IconHelp, IconUsers, IconShield, IconLayoutSidebar, IconSettings, IconActivity, IconReport } from '@tabler/icons-react';
// import Divider from '@mui/material/Divider';
import MainCard from '#/ui-component/cards/MainCard';
import { AdminMenusService } from '#/services/menus/adminMenusService';
import { useAuth } from '#/contexts/AuthContext';
import notify from '#/utils/notify';

export default function AdminMenusPage() {
  const { token } = useAuth();

  const [groupTitulo, setGroupTitulo] = useState('Gestión');
  const [groupIdKey, setGroupIdKey] = useState('gestion');
  const [itemTitulo, setItemTitulo] = useState('Dashboard');
  const [itemIdKey, setItemIdKey] = useState('dashboard');
  const [itemUrl, setItemUrl] = useState('/dashboard');
  const [itemIcon, setItemIcon] = useState<string>('');
  const [parentId, setParentId] = useState<number | ''>('');

  const ICON_OPTIONS: string[] = [
    '',
    'IconDashboard',
    'IconTypography',
    'IconPalette',
    'IconShadow',
    'IconHelp',
    'IconUsers',
    'IconShield',
    'IconLayoutSidebar',
    'IconSettings',
    'IconActivity',
    'IconReport'
  ];

  function renderIcon(name: string) {
    const common = { size: 18 } as const;
    switch (name) {
      case 'IconDashboard': return <IconDashboard {...common} />;
      case 'IconTypography': return <IconTypography {...common} />;
      case 'IconPalette': return <IconPalette {...common} />;
      case 'IconShadow': return <IconShadow {...common} />;
      case 'IconHelp': return <IconHelp {...common} />;
      case 'IconUsers': return <IconUsers {...common} />;
      case 'IconShield': return <IconShield {...common} />;
      case 'IconLayoutSidebar': return <IconLayoutSidebar {...common} />;
      case 'IconSettings': return <IconSettings {...common} />;
      case 'IconActivity': return <IconActivity {...common} />;
      case 'IconReport': return <IconReport {...common} />;
      default: return null;
    }
  }

  const handleCreateGroup = async () => {
    try {
      const node = await AdminMenusService.createGroup({ id_key: groupIdKey, titulo: groupTitulo, tipo: 'group' }, token);
      notify.success(`Grupo creado: ${node.titulo}`);
    } catch {
      notify.error('Error creando grupo');
    }
  };

  const handleCreateItem = async () => {
    try {
      const node = await AdminMenusService.createItem({
        id_key: itemIdKey,
        titulo: itemTitulo,
        tipo: 'item',
        url: itemUrl,
        icono: itemIcon || undefined,
        parent_id: parentId === '' ? undefined : Number(parentId)
      }, token);
      notify.success(`Item creado: ${node.titulo}`);
    } catch {
      notify.error('Error creando item');
    }
  };

  return (
    <Grid container spacing={2} alignItems="stretch">
      <Grid size={{ xs: 12, md: 6 }}>
        <MainCard title="Crear Grupo" sx={{ height: '100%' }}>
          <Stack sx={{ gap: 2 }}>
            <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
              <TextField label="id_key" value={groupIdKey} onChange={(e) => setGroupIdKey(e.target.value)} size="small" />
              <TextField label="título" value={groupTitulo} onChange={(e) => setGroupTitulo(e.target.value)} size="small" />
            </Stack>
            <Stack direction="row" sx={{ gap: 1 }}>
              <Button variant="contained" onClick={() => { void handleCreateGroup(); }}>Crear Grupo</Button>
            </Stack>
          </Stack>
        </MainCard>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <MainCard title="Crear Item" sx={{ height: '100%' }}>
          <Stack sx={{ gap: 2 }}>
            <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
              <TextField label="id_key" value={itemIdKey} onChange={(e) => setItemIdKey(e.target.value)} size="small" />
              <TextField label="título" value={itemTitulo} onChange={(e) => setItemTitulo(e.target.value)} size="small" />
              <TextField label="url" value={itemUrl} onChange={(e) => setItemUrl(e.target.value)} size="small" />
              <Select
                displayEmpty
                value={itemIcon}
                onChange={(e) => setItemIcon(String(e.target.value))}
                size="small"
                sx={{ minWidth: 220 }}
                renderValue={(value) => (
                  value ? (
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                      {renderIcon(String(value))}
                      <span>{String(value)}</span>
                    </Stack>
                  ) : (
                    <em>Sin icono</em>
                  )
                )}
              >
                <MenuItem value="">
                  <em>Sin icono</em>
                </MenuItem>
                {ICON_OPTIONS.filter((v) => v !== '').map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                      {renderIcon(opt)}
                      <span>{opt}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
              <TextField label="parent_id (opcional)" value={parentId} onChange={(e) => setParentId(e.target.value === '' ? '' : Number(e.target.value))} size="small" />
            </Stack>
            <Stack direction="row" sx={{ gap: 1 }}>
              <Button variant="contained" onClick={() => { void handleCreateItem(); }}>Crear Item</Button>
            </Stack>
          </Stack>
        </MainCard>
      </Grid>
    </Grid>
  );
}
