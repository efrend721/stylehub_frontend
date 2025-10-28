import { memo, useState } from 'react';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import NavItem from './NavItem';
import NavGroup from './NavGroup';
import useMenuItems from '#/hooks/useMenuItems';

import { useGetMenuMaster } from '#/api/menu';

// ==============================|| SIDEBAR MENU LIST ||============================== //

function MenuList() {
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  const [, setSelectedID] = useState('');

  const lastItem = null;
  const { items: sourceItems, loading: menuLoading, error: menuError, source } = useMenuItems();

  let lastItemIndex = sourceItems ? sourceItems.length - 1 : 0;
  let remItems = [] as any[];
  let lastItemId: any;

  if (lastItem && sourceItems && lastItem < sourceItems.length) {
    lastItemId = sourceItems[lastItem - 1].id;
    lastItemIndex = lastItem - 1;
    remItems = sourceItems.slice(lastItem - 1, sourceItems.length).map((item) => {
      if ('title' in item) {
        const remItem: any = {
          title: item.title,
          elements: item.children
        };
        if ('icon' in item) {
          remItem.icon = item.icon;
        }
        if ('url' in item && item.url) {
          remItem.url = item.url;
        }
        return remItem;
      }
      return null;
    }).filter(Boolean);
  }

  const navArray = Array.isArray(sourceItems) ? sourceItems : [];
  const navItems = navArray.slice(0, lastItemIndex + 1).map((item, index) => {
    switch (item.type) {
      case 'group': {
        // Proteger acceso a url
        if ('url' in item && item.url && item.id !== lastItemId) {
          return (
            <List key={item.id}>
              <NavItem item={item} level={1} isParents setSelectedID={() => setSelectedID('')} />
              {index !== 0 && <Divider sx={{ py: 0.5 }} />}
            </List>
          );
        }

        return (
          <NavGroup
            key={item.id}
            setSelectedID={setSelectedID}
            item={item}
            lastItem={lastItem}
            remItems={remItems}
            lastItemId={lastItemId}
          />
        );
      }
      default:
        return (
          <Typography key={item.id} variant="h6" align="center" sx={{ color: 'error.main' }}>
            Menu Items Error
          </Typography>
        );
    }
  });

  return <Box {...(drawerOpen && { sx: { mt: 1.5 } })}>{navItems}</Box>;
}

export default memo(MenuList);
