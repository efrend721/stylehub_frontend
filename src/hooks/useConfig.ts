import { use } from 'react';
import { ConfigContext } from '#/contexts/ConfigContext';
import type { ConfigContextValue } from '#/contexts/ConfigContext';

// ==============================|| CONFIG - HOOKS ||============================== //

export default function useConfig(): ConfigContextValue {
  const context = use(ConfigContext);

  if (!context) throw new Error('useConfig must be used inside ConfigProvider');

  return context;
}
