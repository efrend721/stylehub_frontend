import { createRoot, Root } from 'react-dom/client';
import React from 'react';

/**
 * Crea un controlador para renderizar contenido imperativamente en un contenedor DOM.
 * No introduce estilos ni UI propios; sirve para inyectar tu Alert u otra UI en un host.
 */
export function createImperativePortal(host: HTMLElement) {
  let root: Root | null = null;

  const ensureRoot = () => {
    if (!root) root = createRoot(host);
    return root;
  };

  return {
    render(node: React.ReactNode) {
      ensureRoot().render(<>{node}</>);
    },
    clear() {
      if (root) {
        root.unmount();
        root = null;
      }
      host.innerHTML = '';
    }
  };
}

export type ImperativePortal = ReturnType<typeof createImperativePortal>;
