# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `Yarn`

Install packages

### `Yarn start`

Runs the app in the development mode.\

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## UI y Estilos (Guía del Proyecto)

- Para cualquier cambio que afecte la UI o estilos, seguir la guía oficial de Berry: [codedthemes.gitbook.io/berry](https://codedthemes.gitbook.io/berry)
- Priorizar ThemeCustomization, overrides de MUI y componentes del template por encima de CSS global.
- Evitar añadir librerías de estilos adicionales o reglas globales que entren en conflicto con el tema.
- Si es necesario un ajuste específico, usar overrides de MUI o estilos locales de componente manteniendo la coherencia con la guía.

## Mobile-First UI (Tablets y Celulares)

Este proyecto está orientado a tablets y celulares. Todo trabajo nuevo debe seguir estas pautas, alineadas con Berry React y MUI:

- Lineamientos: ver [docs/mobile-first-guidelines.md](docs/mobile-first-guidelines.md)
- Checklist de verificación: ver [docs/mobile-first-checklist.md](docs/mobile-first-checklist.md)
- Plantilla de PR: ver [.github/pull_request_template.md](.github/pull_request_template.md)

Puntos clave:

- Navegación: en teléfonos usar Bottom Navigation y App Bar conciso; Drawer móvil `SwipeableDrawer`. En `md+`, Drawer mini/persistente.
- Disposición y puntos de quiebre: usar Grid/Stack y `useMediaQuery`; cambiar variantes de Drawer en `sm/md`.
- Targets táctiles: 48–56 px; evitar listas densas en móviles.
- Tipografía: tamaños responsivos; verificar legibilidad en pantallas pequeñas.
- Tabs: `variant="fullWidth"` en móviles; `scrollable` cuando haya muchas; mantener semántica ARIA.
- Formularios: campos apilados de ancho completo; `type`/`inputMode` correctos; acciones primarias abajo o FAB.
- Contenido: preferir listas/cards en móviles; tablas solo en `md+` con skeletons.
- Accesibilidad y rendimiento: CssBaseline, estados de foco, props iOS para `SwipeableDrawer`, `keepMounted` en Drawer.

## PBAC: Sidebar vs Router Guard vs Admin Menús

Regla de oro (deny-by-default):

- Sidebar: usar `GET /menus` (árbol ya filtrado por permisos efectivos; no incluye items con `nav_visible = 0` cuando aplica).
- Router guard (allowlist): usar `GET /menus/routes` (puede incluir rutas “ocultas” como `/admin/roles/editar/:id` aunque no se muestren en el sidebar).
- Admin UI de menús: usar `GET /menus/admin/tree` solo en pantallas de administración (nunca para el sidebar).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `yarn build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
