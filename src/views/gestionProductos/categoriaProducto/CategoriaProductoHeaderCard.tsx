import MainCard from '#/ui-component/cards/MainCard';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export type CategoriaProductoHeaderCardProps = {
  downSm: boolean;
  onAdd: () => void;
};

export default function CategoriaProductoHeaderCard({ downSm, onAdd }: CategoriaProductoHeaderCardProps) {
  const headerSX: Record<string, unknown> = {
    '& .MuiCardHeader-content': { width: '100%', overflow: 'visible' }
  };
  if (downSm) {
    Object.assign(headerSX, {
      py: 1,
      '& .MuiCardHeader-title': {
        width: '100%',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    });
  }

  return (
    <MainCard
      content={false}
      title={
        downSm ? (
          <Stack spacing={1} sx={{ width: '100%', alignItems: 'stretch' }}>
            <Typography variant="h5" sx={{ textAlign: 'center' }} noWrap>
              Gestión de Categorías de Producto
            </Typography>
            <Button
              fullWidth
              variant="contained"
              onClick={(e) => {
                (e.currentTarget as HTMLElement).blur();
                onAdd();
              }}
              sx={{ py: 0.75 }}
            >
              Agregar Categoría
            </Button>
          </Stack>
        ) : (
          'Gestión de Categorías de Producto'
        )
      }
      secondary={
        downSm ? undefined : (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              variant="contained"
              onClick={(e) => {
                (e.currentTarget as HTMLElement).blur();
                onAdd();
              }}
            >
              Agregar Categoría
            </Button>
          </Box>
        )
      }
      headerSX={headerSX}
    >
      {null}
    </MainCard>
  );
}
