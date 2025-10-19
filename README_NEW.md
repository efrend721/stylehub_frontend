# Berry - React Material Admin Dashboard Template with TypeScript & Vite

Berry es un Dashboard React creativo construido con componentes de MUI y está diseñado para proporcionar una buena experiencia de usuario. Es un Template de Dashboard React completamente renovado con diseño responsivo fácil e intuitivo que funciona en pantallas retina y cualquier otro dispositivo.

## 🚀 Características Actualizadas

- **Totalmente actualizado a TypeScript** para mejor desarrollo y mantenibilidad
- **Vite 7.x** - Herramienta de build ultra-rápida
- **pnpm** como gestor de paquetes para mejor rendimiento
- **React v19.2** - La versión más reciente
- **Material-UI v7** (MUI v7) - Última versión estable
- **TypeScript configurado** con paths aliases
- Totalmente responsivo, compatible con todos los navegadores modernos
- Hooks API
- Code-Splitting
- CSS-in-JS

## 🛠️ Stack Tecnológico Actualizado

- **Frontend**: React 19.2 con TypeScript
- **UI Library**: Material-UI v7 (MUI v7)
- **Build Tool**: Vite 7.x
- **Package Manager**: pnpm
- **Routing**: React Router v7
- **Styling**: SCSS + MUI Styled Components
- **Icons**: @mui/icons-material + @tabler/icons-react

## 📋 Requisitos Previos

- Node.js 18.x o superior
- pnpm (recomendado) o npm/yarn

## 🚀 Inicio Rápido

### Instalación

```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd new-berry-project

# Instalar dependencias con pnpm
pnpm install

# Iniciar servidor de desarrollo
pnpm dev

# Construir para producción
pnpm build

# Previsualizar build de producción
pnpm preview
```

### Scripts Disponibles

```bash
# Desarrollo
pnpm dev          # Inicia el servidor de desarrollo
pnpm start        # Alias para dev

# Construcción
pnpm build        # Construye para producción
pnpm preview      # Previsualiza el build

# Calidad de código
pnpm lint         # Ejecuta ESLint
pnpm lint:fix     # Corrige automáticamente errores de ESLint
pnpm prettier     # Formatea el código
pnpm type-check   # Verifica tipos de TypeScript
```

## 📁 Estructura del Proyecto

src/
├── assets/          # Recursos estáticos (imágenes, estilos)
├── contexts/        # Contextos de React
├── hooks/           # Hooks personalizados
├── layout/          # Componentes de layout
├── menu-items/      # Configuración de menús
├── routes/          # Configuración de rutas
├── themes/          # Configuración de temas MUI
├── ui-component/    # Componentes reutilizables
├── utils/           # Utilidades
├── views/           # Páginas/vistas
├── App.tsx          # Componente principal
├── index.tsx        # Punto de entrada
└── vite-env.d.ts    # Tipos de Vite

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```bash
VITE_APP_BASE_NAME=/free
VITE_APP_VERSION=5.0.0
```

### TypeScript

El proyecto está configurado con TypeScript en modo permisivo para facilitar la migración. Puedes ir habilitando checks más estrictos gradualmente editando `tsconfig.json`.

### Path Aliases

Los aliases están configurados en `tsconfig.json`:

```typescript
// Puedes importar así:
import { ConfigProvider } from 'contexts/ConfigContext';
import MainCard from 'ui-component/cards/MainCard';
```

## 🔧 Personalización

### Temas

Los temas se configuran en `src/themes/`. Puedes personalizar colores, tipografía y componentes.

### Rutas

Las rutas se definen en `src/routes/` y los elementos de menú en `src/menu-items/`.

## 🚀 Despliegue

```bash
# Construir para producción
pnpm build

# Los archivos se generan en /dist
```

## 📝 Migración de JavaScript a TypeScript

Este proyecto fue migrado de JavaScript a TypeScript con:

- ✅ Conversión de todos los archivos .js/.jsx a .ts/.tsx
- ✅ Configuración de TypeScript con paths aliases
- ✅ Actualización a Vite 7.x
- ✅ Migración a pnpm
- ✅ Actualización de todas las dependencias
- ⚠️ Tipos pendientes por añadir gradualmente

## 🐛 Solución de Problemas

### Errores de Tipos

Si encuentras errores de TypeScript, puedes:

1. Añadir `// @ts-ignore` temporalmente
2. Crear tipos personalizados en archivos `.d.ts`
3. Ajustar la configuración de TypeScript en `tsconfig.json`

### Problemas de Build

```bash
# Limpiar cache de pnpm
pnpm store prune

# Reinstalar dependencias
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## 📄 Licencia

Licensed under [MIT](LICENSE)

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor, abre un issue antes de hacer cambios importantes.

---

**Nota**: Este es un proyecto migrado y modernizado. Se recomienda ir mejorando gradualmente los tipos de TypeScript para aprovechar al máximo sus beneficios.
