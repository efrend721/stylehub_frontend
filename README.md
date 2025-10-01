# StyleHub Frontend

Un proyecto React + TypeScript + Vite con Material-UI y arquitectura por capas.

## 🛠️ Tecnologías

- **React 19.1.1** + **TypeScript**
- **Material-UI 7.3.2** (componentes y iconos)
- **Vite 7.1.7** (bundler)
- **ESLint 9.36.0** (linting)
- **MUI MCP** (asistencia con documentación)

## 🏗️ Arquitectura del Proyecto

Utilizamos una **"Layered Architecture"** (Arquitectura por Capas) que sigue el patrón **"Folder-by-Type"**.

## 🎯 ¿Por qué esta estructura?

### ✅ Ventajas

**Solo 5 carpetas principales** - Muy simple

- **Fácil de navegar** - Todo está donde esperas
- **Escalable** - Crece con tu proyecto sin complicarse
- **React-friendly** - Sigue convenciones modernas

### 📂 Qué va en cada carpeta

#### **`components/`**

- `common/` → Header, Footer, Navbar, Button personalizado
- `pages/` → Home, ProductList, ProductDetail, Cart

#### **`hooks/`**

- `useProducts.ts` → Lógica para manejar productos
- `useCart.ts` → Lógica del carrito de compras
- `useAuth.ts` → Lógica de autenticación

#### **`services/`**

- `api.ts` → Configuración de fetch/axios
- `productService.ts` → Llamadas API de productos
- `userService.ts` → Llamadas API de usuarios

#### **`types/`**

- `Product.ts` → interface Product
- `User.ts` → interface User
- `Cart.ts` → interface Cart

#### **`utils/`**

- `formatPrice.ts` → Formatear precios
- `validation.ts` → Validaciones
- `constants.ts` → Constantes

## 🚀 Estructura Completa

src/
├── components/
│   ├── common/
│   │   ├── Header.tsx
│   │   ├── ProductCard.tsx
│   │   └── LoadingSpinner.tsx
│   └── pages/
│       ├── HomePage.tsx
│       ├── ProductsPage.tsx
│       └── CartPage.tsx
├── hooks/
│   ├── useProducts.ts
│   └── useCart.ts
├── services/
│   ├── api.ts
│   └── productService.ts
├── types/
│   ├── Product.ts
│   └── Cart.ts
└── utils/
    ├── formatPrice.ts
    └── constants.ts

## 💡 ¿Por qué no más carpetas?

- **`models/`** → Se reemplaza con `types/` (interfaces TypeScript)
- **`controllers/`** → Se reemplaza con `hooks/` (más React-native)
- **`views/`** → Se reemplaza con `components/` (estándar React)
- **`context/`** → Solo si necesitas estado global complejo

Esta estructura es:

- ✅ **Sencilla** (5 carpetas)
- ✅ **Clara** (nombres descriptivos)
- ✅ **Moderna** (convenciones React actuales)
- ✅ **Escalable** (fácil agregar más archivos)

## 🚀 Comandos Disponibles

```bash
# Desarrollo
pnpm dev          # Inicia servidor de desarrollo

# Construcción
pnpm build        # Construye para producción

# Linting
pnpm lint         # Verifica código con ESLint

# Vista previa
pnpm preview      # Previsualiza build de producción


## 📦 Dependencias Principales

- `@mui/material` - Componentes Material-UI
- `@mui/icons-material` - Iconos Material-UI
- `@emotion/react` + `@emotion/styled` - Motor de estilos
- `react` + `react-dom` - Biblioteca React
- `typescript` - Tipado estático

## 🎯 MCP (Model Context Protocol)

Este proyecto incluye **MUI MCP** para asistencia con documentación de Material-UI en VS Code/Copilot.

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
