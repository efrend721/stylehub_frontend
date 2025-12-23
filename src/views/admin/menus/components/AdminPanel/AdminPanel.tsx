import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MainCard from '#/ui-component/cards/MainCard';
import { renderIconPreview } from '#/views/admin/menus/utils';
import { type IdKeyOption } from '#/views/admin/menus/types';

export function AdminPanel(props: {
  creationType: '' | 'group' | 'item';
  setCreationType: (t: '' | 'group' | 'item') => void;
  isEditingGroup: boolean;
  isEditingItem: boolean;
  actionLoadingId: number | null;
  // group
  groupIdKey: string; setGroupIdKey: (v: string) => void;
  groupTitulo: string; setGroupTitulo: (v: string) => void;
  canCreateGroup: boolean;
  onCreateGroup: () => void;
  onSaveGroup: () => void;
  onCancel: () => void;
  // item
  idKeyOptions: IdKeyOption[];
  tituloById: Record<number, string>;
  parentId: number | '';
  setParentId: (v: number | '') => void;
  itemIdKey: string; setItemIdKey: (v: string) => void;
  itemTitulo: string; setItemTitulo: (v: string) => void;
  itemIcon: string; setItemIcon: (v: string) => void;
  ICON_OPTIONS: string[];
  itemUrl: string;
  canCreateItem: boolean;
  onCreateItem: () => void;
  onSaveItem: () => void;
  editingNodeIdKey?: string;
  editingNodeParentId?: number | null;
}) {
  const {
    creationType, setCreationType, isEditingGroup, isEditingItem, actionLoadingId,
    groupIdKey, setGroupIdKey, groupTitulo, setGroupTitulo, canCreateGroup, onCreateGroup, onSaveGroup, onCancel,
    idKeyOptions, tituloById, parentId, setParentId, itemIdKey, setItemIdKey, itemTitulo, setItemTitulo, itemIcon, setItemIcon, ICON_OPTIONS,
    itemUrl, canCreateItem, onCreateItem, onSaveItem, editingNodeIdKey, editingNodeParentId
  } = props;

  return (
    <Grid size={{ xs: 12, md: 7 }}>
      <MainCard title="Administración de menús" sx={{ height: '100%' }}>
        <Stack sx={{ height: '100%', p: 2, gap: 2 }}>
          <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Área para la Creación, Edición o Eliminación de Menús
            </Typography>
          </Stack>
          <Divider />
          <FormControl size="small" sx={{ minWidth: 240 }}>
            <InputLabel id="tipo-menu-label" shrink>Tipo de Menú</InputLabel>
            <Select
              labelId="tipo-menu-label"
              label="Tipo de Menú"
              value={creationType}
              displayEmpty
              onChange={(e) => setCreationType((String(e.target.value) as 'group' | 'item') || '')}
              renderValue={(v) => {
                const val = String(v ?? '');
                if (val === '') return <em>Escoge un tipo de menú</em>;
                return val === 'group' ? 'Group' : 'Item';
              }}
            >
              <MenuItem value="">
                <em>Escoge un tipo de menú</em>
              </MenuItem>
              <MenuItem value="group">Group</MenuItem>
              <MenuItem value="item">Item</MenuItem>
            </Select>
          </FormControl>

          {creationType === 'group' && (
            <Stack sx={{ gap: 2 }}>
              <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
                <TextField
                  label="id_key"
                  placeholder={isEditingGroup ? undefined : 'nuevo id_key'}
                  value={isEditingGroup ? (editingNodeIdKey ?? '') : groupIdKey}
                  onChange={(e) => {
                    const v = e.target.value.toLowerCase().replace(/\s+/g, '');
                    setGroupIdKey(v);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.code === 'Space') e.preventDefault();
                  }}
                  size="small"
                  disabled={isEditingGroup}
                />
                <TextField label="título" placeholder="Ingrese título" value={groupTitulo} onChange={(e) => setGroupTitulo(e.target.value)} size="small" />
              </Stack>
              <Stack direction="row" sx={{ gap: 1 }}>
                {!isEditingGroup && (
                  <Button variant="contained" disabled={!canCreateGroup} onClick={onCreateGroup}>Crear Grupo</Button>
                )}
                {!isEditingGroup && (
                  <Button variant="outlined" onClick={onCancel}>Cancelar</Button>
                )}
                {isEditingGroup && (
                  <>
                    <Button variant="outlined" disabled={actionLoadingId !== null} onClick={onSaveGroup}>Guardar cambios</Button>
                    <Button variant="outlined" onClick={onCancel}>Cancelar</Button>
                  </>
                )}
              </Stack>
            </Stack>
          )}

          {creationType === 'item' && (
            <Stack sx={{ gap: 2 }}>
              <Grid container spacing={1} alignItems="center">
                <Grid size={{ xs: 2, md: 2 }}>
                  <FormControl size="small" fullWidth>
                    <InputLabel id="grupo-item-label" shrink>Grupo</InputLabel>
                    <Select
                      labelId="grupo-item-label"
                      label="Grupo"
                      value={isEditingItem && typeof parentId !== 'number' ? (typeof editingNodeParentId === 'number' ? editingNodeParentId : '') : parentId}
                      displayEmpty={!isEditingItem || typeof parentId !== 'number'}
                      onChange={(e) => {
                        const raw = String(e.target.value);
                        setParentId(raw === '' ? '' : Number(raw));
                      }}
                      renderValue={(v) => {
                        const valStr = String(v ?? '');
                        const effectiveId = valStr === '' && isEditingItem && typeof editingNodeParentId === 'number' ? editingNodeParentId : Number(valStr);
                        if (!effectiveId) return <em>Seleccione un grupo</em>;
                        const opt = idKeyOptions.find((o) => o.id_menu_item === effectiveId);
                        return tituloById[effectiveId] ?? opt?.id_key ?? `#${effectiveId}`;
                      }}
                    >
                      <MenuItem value="">
                        <em>Seleccione un grupo</em>
                      </MenuItem>
                      {idKeyOptions.map((opt) => (
                        <MenuItem key={opt.id_menu_item} value={opt.id_menu_item}>
                          {tituloById[opt.id_menu_item] ?? opt.id_key}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 2, md: 2 }}>
                  <TextField
                    label="id_key"
                    placeholder={isEditingItem ? undefined : 'nuevo id_key'}
                    value={isEditingItem ? (editingNodeIdKey ?? '') : itemIdKey}
                    onChange={(e) => {
                      const v = e.target.value.toLowerCase().replace(/\s+/g, '');
                      setItemIdKey(v);
                    }}
                    onKeyDown={(e) => { if (e.key === ' ' || e.code === 'Space') e.preventDefault(); }}
                    size="small"
                    disabled={isEditingItem}
                    fullWidth
                  />
                </Grid>

                <Grid size={{ xs: 2, md: 2 }}>
                  <TextField label="título" placeholder="Ingrese título" value={itemTitulo} onChange={(e) => setItemTitulo(e.target.value)} size="small" fullWidth />
                </Grid>

                <Grid size={{ xs: 2, md: 2 }}>
                  <FormControl size="small" fullWidth>
                    <InputLabel id="icono-item-label" shrink>Icono</InputLabel>
                    <Select
                      labelId="icono-item-label"
                      label="Icono"
                      displayEmpty
                      value={itemIcon}
                      onChange={(e) => setItemIcon(String(e.target.value))}
                      renderValue={(value) => (
                        value ? (
                          <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                            {renderIconPreview(String(value))}
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
                            {renderIconPreview(opt)}
                            <span>{opt}</span>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 4, md: 4 }}>
                  <TextField
                    label="url"
                    placeholder="/ruta"
                    value={itemUrl}
                    size="small"
                    disabled
                    fullWidth
                  />
                </Grid>
              </Grid>
              <Stack direction="row" sx={{ gap: 1 }}>
                {isEditingItem ? (
                  <>
                    <Button disabled={actionLoadingId !== null} variant="contained" onClick={onSaveItem}>Guardar cambios</Button>
                    <Button variant="outlined" onClick={onCancel}>Cancelar</Button>
                  </>
                ) : (
                  <Button variant="contained" disabled={!canCreateItem} onClick={onCreateItem}>Crear Item</Button>
                )}
                {!isEditingItem && (
                  <Button variant="outlined" onClick={onCancel}>Cancelar</Button>
                )}
              </Stack>
            </Stack>
          )}
        </Stack>
      </MainCard>
    </Grid>
  );
}
