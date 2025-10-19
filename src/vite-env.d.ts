/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_BASE_NAME: string;
  readonly VITE_APP_VERSION: string;
  // más variables de entorno según necesites
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Declaraciones de módulos para archivos que no tienen tipos
declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}
