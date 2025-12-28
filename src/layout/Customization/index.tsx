import PropTypes from 'prop-types';
import { useState } from 'react';

// material-ui
import { useColorScheme, useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Fab from '@mui/material/Fab';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import FontFamily from './FontFamily';
import BorderRadius from './BorderRadius';

import { DEFAULT_THEME_MODE } from '#/config';
import MainCard from '#/ui-component/cards/MainCard';
import AnimateButton from '#/ui-component/extended/AnimateButton';
import SimpleBar from '#/ui-component/third-party/SimpleBar';
import useConfig from '#/hooks/useConfig';

// assets
import { IconSettings, IconPlus } from '@tabler/icons-react';

function CustomTabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function Customization() {
  const theme = useTheme();
  const { resetState, state, setField } = useConfig();
  const isCollapsibleOn = state.collapsibleGroupMenus ?? true;
  const isCustomIconsOn = state.customGroupIcons ?? true;
  const { setMode } = useColorScheme();

  // drawer on/off
  const [open, setOpen] = useState(false);
  const handleToggle = () => {
    setOpen(!open);
  };

  const handleReset = () => {
    setMode(DEFAULT_THEME_MODE);
    resetState();
  };

  const toggleCollapsibleGroups = (checked: boolean) => {
    setField('collapsibleGroupMenus', checked);
  };

  return (
    <>
      {/* toggle button */}
      <Tooltip title="Live Customize">
        <Fab
          component="div"
          onClick={handleToggle}
          size="medium"
          variant="circular"
          color="secondary"
          sx={{
            borderRadius: 0,
            borderTopLeftRadius: '50%',
            borderBottomLeftRadius: '50%',
            borderTopRightRadius: '50%',
            borderBottomRightRadius: '4px',
            top: '25%',
            position: 'fixed',
            right: 10,
            zIndex: 1200,
            boxShadow: theme.vars.customShadows.secondary
          }}
        >
          <AnimateButton type="rotate">
            <IconButton color="inherit" size="large" disableRipple aria-label="live customize">
              <IconSettings />
            </IconButton>
          </AnimateButton>
        </Fab>
      </Tooltip>
      <Drawer anchor="right" onClose={handleToggle} open={open} slotProps={{ paper: { sx: { width: 375 } } }}>
        {open && (
          <SimpleBar sx={{}}>
            <MainCard content={false} border={false}>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', p: 2.5, gap: 1.5 }}>
                <Typography variant="h5">Theme Customization</Typography>
                <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25 }}>
                  <Button variant="outlined" color="error" size="small" onClick={handleReset}>
                    Reset
                  </Button>
                  <IconButton sx={{ p: 0, color: 'grey.600' }} onClick={handleToggle}>
                    <IconPlus size={24} style={{ transform: 'rotate(45deg)' }} />
                  </IconButton>
                </Stack>
              </Stack>
              <Divider />
              <Grid container spacing={2}>
                <Grid size={12}>
                  {/* font family */}
                  <FontFamily />
                  <Divider />
                </Grid>
                <Grid size={12}>
                  {/* border radius */}
                  <BorderRadius />
                  <Divider />
                </Grid>
                <Grid size={12}>
                  {/* collapsible group menus toggle */}
                  <Box sx={{ p: 2 }}>
                    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1">Collapsible Group Menus</Typography>
                      <Button
                        variant={isCollapsibleOn ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => toggleCollapsibleGroups(!isCollapsibleOn)}
                      >
                        {isCollapsibleOn ? 'On' : 'Off'}
                      </Button>
                    </Stack>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                      Toggle accordion behavior for top-level Group menus.
                    </Typography>
                  </Box>
                  <Divider />
                </Grid>
                <Grid size={12}>
                  {/* distinct group icons toggle */}
                  <Box sx={{ p: 2 }}>
                    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1">Distinct Group Icons</Typography>
                      <Button
                        variant={isCustomIconsOn ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => setField('customGroupIcons', !isCustomIconsOn)}
                      >
                        {isCustomIconsOn ? 'On' : 'Off'}
                      </Button>
                    </Stack>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                      Use consistent Tabler/Berry icons per group title when backend icon is missing.
                    </Typography>
                  </Box>
                  <Divider />
                </Grid>
              </Grid>
            </MainCard>
          </SimpleBar>
        )}
      </Drawer>
    </>
  );
}

CustomTabPanel.propTypes = { children: PropTypes.node, value: PropTypes.number, index: PropTypes.number, other: PropTypes.any };
