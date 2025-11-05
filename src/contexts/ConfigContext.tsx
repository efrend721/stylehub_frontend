import PropTypes from 'prop-types';
import { createContext, useMemo } from 'react';

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

  const memoizedValue = useMemo<ConfigContextValue>(
    () => ({ state, setState, setField, resetState }),
    [state, setField, setState, resetState]
  );

  return <ConfigContext.Provider value={memoizedValue}>{children}</ConfigContext.Provider>;
}

ConfigProvider.propTypes = { children: PropTypes.node };
