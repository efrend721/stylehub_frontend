import { useState } from 'react';
import { Collapse, ListItemButton, ListItemText, Typography, ListItemIcon, Tooltip } from '@mui/material';
import useConfig from '#/hooks/useConfig';
import { useGetMenuMaster } from '#/api/menu';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';

// project imports
import NavItem from '../NavItem';
import NavCollapse from '../NavCollapse';

// types
import type { UIMenuItem } from '#/types/menu';

// ==============================|| SIDEBAR MENU LIST ACCORDION ||============================== //

interface NavAccordionProps {
  item: UIMenuItem;
  level: number;
  setSelectedID?: () => void;
}

export default function NavAccordion({ item, level, setSelectedID }: NavAccordionProps) {
  const [open, setOpen] = useState(item.isExpanded || false);
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  const {
    state: { miniDrawer }
  } = useConfig();
  const showIcon = miniDrawer || !drawerOpen;

  const handleClick = () => {
    setOpen(!open);
  };

  // Render children based on their type
  const renderChildren = () => {
    if (!item.children) return null;

    return item.children.map((child) => {
      switch (child.type) {
        case 'collapse':
          return <NavCollapse key={child.id} menu={child} level={level + 1} parentId={item.id} />;
        case 'item':
          return <NavItem key={child.id} item={child} level={level + 1} setSelectedID={setSelectedID} />;
        case 'group':
          // Nested groups become accordions too
          return <NavAccordion key={child.id} item={child} level={level + 1} setSelectedID={setSelectedID} />;
        default:
          return null;
      }
    });
  };

  return (
    <>
      <ListItemButton
        onClick={handleClick}
        disableRipple
        sx={{
          pl: level * 2,
          '&:hover': { backgroundColor: 'transparent' },
          '&.Mui-focusVisible': { backgroundColor: 'transparent' }
        }}
      >
        {showIcon && item.icon ? (
          // Mini mode: show only the icon with tooltip, hide text & chevron
          <Tooltip title={item.title || ''} placement="right" disableInteractive>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <item.icon stroke={1.5} size="1.3rem" />
            </ListItemIcon>
          </Tooltip>
        ) : (
          <>
            <ListItemText
              primary={item.title}
              secondary={
                item.caption ? (
                  <Typography
                    component="span"
                    sx={{
                      display: 'block',
                      fontSize: '0.6875rem',
                      fontWeight: 500,
                      color: 'text.secondary',
                      textTransform: 'capitalize',
                      lineHeight: 1.66
                    }}
                  >
                    {item.caption}
                  </Typography>
                ) : undefined
              }
              sx={{
                '& .MuiListItemText-primary': {
                  fontSize: '0.875rem',
                  fontWeight: 500
                }
              }}
            />
            {open ? (
              <IconChevronDown stroke={1.5} size="1rem" />
            ) : (
              <IconChevronRight stroke={1.5} size="1rem" />
            )}
          </>
        )}
      </ListItemButton>
      
      <Collapse 
        in={open} 
        timeout={235}
        unmountOnExit
      >
        {renderChildren()}
      </Collapse>
    </>
  );
}