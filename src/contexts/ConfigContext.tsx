import PropTypes from 'prop-types';
import { createContext, useEffect, useMemo } from 'react';

// project imports
import config from '#/config';
import { useLocalStorage } from '#/hooks/useLocalStorage';

// Types
export type ConfigState = (typeof config) & {
  // Additional runtime flags stored alongside base config
  miniDrawer?: boolean;
};

export type ConfigContextValue = {
  state: ConfigState;
  setState: (s: ConfigState) => void;
  setField: (key: string, value: unknown) => void;
  resetState: () => void;
};

// ==============================|| CONFIG CONTEXT ||============================== //

export const ConfigContext = createContext<ConfigContextValue | undefined>(undefined);

// ==============================|| CONFIG PROVIDER ||============================== //

export function ConfigProvider({ children }) {
  // Note: useLocalStorage is untyped; narrow to our ConfigState at the boundary
  const { state, setState, setField, resetState } = useLocalStorage('berry-config-vite-js', config) as unknown as {
    state: ConfigState;
    setState: (s: ConfigState) => void;
    setField: (k: string, v: unknown) => void;
    resetState: () => void;
  };

  // One-time migration: some UI changes/dev toggles may have persisted this flag as false.
  // We restore it to true once, and then never override user choice again.
  useEffect(() => {
    try {
      const MIGRATION_KEY = 'berry-config-migration:collapsibleGroupMenus:2026-01-07';
      if (localStorage.getItem(MIGRATION_KEY) === '1') return;

      if (state?.collapsibleGroupMenus === false) {
        setField('collapsibleGroupMenus', true);
      }

      localStorage.setItem(MIGRATION_KEY, '1');
    } catch {
      // ignore storage errors (private mode, quota, etc)
    }
  }, [setField, state?.collapsibleGroupMenus]);

  const memoizedValue = useMemo<ConfigContextValue>(
    () => ({ state, setState, setField, resetState }),
    [state, setField, setState, resetState]
  );

  return <ConfigContext.Provider value={memoizedValue}>{children}</ConfigContext.Provider>;
}

ConfigProvider.propTypes = { children: PropTypes.node };
