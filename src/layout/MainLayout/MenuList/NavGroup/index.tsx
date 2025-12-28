import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { matchPath, useLocation } from 'react-router-dom';

// material-ui
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';

// project imports
import NavCollapse from '../NavCollapse';
import NavItem from '../NavItem';
import NavAccordion from './NavAccordion';

import { useGetMenuMaster } from '#/api/menu';
import useConfig from '#/hooks/useConfig';
import type { UIMenuItem } from '#/types/menu';

// ==============================|| SIDEBAR MENU LIST GROUP ||============================== //

interface NavGroupProps {
  item: UIMenuItem;
  lastItem?: number;
  remItems?: Array<{ elements: UIMenuItem[] }>;
  lastItemId?: string;
  setSelectedID?: (id: string) => void;
}

export default function NavGroup({ item, lastItem, remItems, lastItemId, setSelectedID }: NavGroupProps) {
  const { pathname } = useLocation();

  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  const {
    state: { collapsibleGroupMenus }
  } = useConfig();
  const collapsible = collapsibleGroupMenus ?? true;

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [currentItem, setCurrentItem] = useState<UIMenuItem>(item);

  const openMini = Boolean(anchorEl);

  useEffect(() => {
    if (lastItem) {
      if (item.id === lastItemId) {
        const localItem = { ...item };
        if (remItems && Array.isArray(remItems)) {
          const elements = remItems.map((ele) => ele.elements);
          localItem.children = elements.flat(1);
        }
        setCurrentItem(localItem);
      } else {
        setCurrentItem(item);
      }
    } else {
      setCurrentItem(item);
    }
  }, [item, lastItem, remItems, lastItemId]);

  const checkOpenForParent = (child: UIMenuItem[], id: string) => {
    child.forEach((ele) => {
      if (ele.children?.length) {
        checkOpenForParent(ele.children, currentItem.id);
      }
      if (ele?.url && !!matchPath({ path: ele?.link ? ele.link : ele.url, end: true }, pathname)) {
        setSelectedID?.(id);
      }
    });
  };

  const checkSelectedOnload = (data: UIMenuItem) => {
    const childrens = data.children ? data.children : [];
    childrens.forEach((itemCheck) => {
      if (itemCheck?.children?.length) {
        checkOpenForParent(itemCheck.children, currentItem.id);
      }
      if (itemCheck?.url && !!matchPath({ path: itemCheck?.link ? itemCheck.link : itemCheck.url, end: true }, pathname)) {
        setSelectedID?.(currentItem.id);
      }
    });

    if (data?.url && !!matchPath({ path: data?.link ? data.link : data.url, end: true }, pathname)) {
      setSelectedID?.(currentItem.id);
    }
  };

  // keep selected-menu on page load and use for horizontal menu close on change routes
  useEffect(() => {
    checkSelectedOnload(currentItem);
    if (openMini) setAnchorEl(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, currentItem]);

  // menu list collapse & items
  const items = currentItem.children?.map((menu: UIMenuItem) => {
    switch (menu.type) {
      case 'collapse':
        return <NavCollapse key={menu.id} menu={menu} level={1} parentId={currentItem.id} />;
      case 'item':
        return <NavItem key={menu.id} item={menu} level={1} setSelectedID={undefined} />;
      case 'group':
        // If it's a group with children, render as accordion
        if (menu.children && menu.children.length > 0) {
          return <NavAccordion key={menu.id} item={menu} level={1} setSelectedID={undefined} />;
        }
        // If it's a group without children, treat as regular item
        return <NavItem key={menu.id} item={menu} level={1} setSelectedID={undefined} />;
      default:
        return (
          <Typography key={menu.id} variant="h6" align="center" sx={{ color: 'error.main' }}>
            Menu Items Error
          </Typography>
        );
    }
  });

  // If the item itself is a collapse type, render it directly using NavCollapse
  if (item.type === 'collapse') {
    return <NavCollapse key={item.id} menu={item} level={0} parentId={undefined} />;
  }

  // For top-level groups, optionally render as accordion when flag is enabled
  if (collapsible) {
    return (
      <>
        <NavAccordion item={currentItem} level={0} setSelectedID={() => setSelectedID?.(currentItem.id)} />
        {drawerOpen && <Divider sx={{ mt: 0.25, mb: 1.25 }} />}
      </>
    );
  }

  return (
    <>
      <List
        disablePadding={!drawerOpen}
        subheader={
          currentItem.title &&
          drawerOpen && (
            <Typography
              variant="caption"
              gutterBottom
              sx={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'text.heading',
                padding: 0.75,
                textTransform: 'capitalize',
                marginTop: 1.25
              }}
            >
              {currentItem.title}
              {currentItem.caption && (
                <Typography
                  gutterBottom
                  sx={{
                    display: 'block',
                    fontSize: '0.6875rem',
                    fontWeight: 500,
                    color: 'text.secondary',
                    textTransform: 'capitalize',
                    lineHeight: 1.66
                  }}
                >
                  {currentItem.caption}
                </Typography>
              )}
            </Typography>
          )
        }
      >
        {items}
      </List>

      {/* group divider */}
      {drawerOpen && <Divider sx={{ mt: 0.25, mb: 1.25 }} />}
    </>
  );
}

NavGroup.propTypes = {
  item: PropTypes.any,
  lastItem: PropTypes.number,
  remItems: PropTypes.array,
  lastItemId: PropTypes.string,
  selectedID: PropTypes.oneOfType([PropTypes.any, PropTypes.string]),
  setSelectedID: PropTypes.oneOfType([PropTypes.any, PropTypes.func])
};
