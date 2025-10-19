# Error handling logic (sin cambiar estilos)

Este documento resume cómo integrar la lógica de manejo de errores de forma desacoplada, reutilizable y sin modificar la apariencia actual.

## Piezas reutilizables

- `src/utils/ErrorBoundary.tsx`
  - Componente lógico que captura errores de render y permite activar fallback con `errorFlag` (para errores async).
  - Se resetea cuando cambia `resetKey`.
  - No define UI ni estilos: el `fallback` lo decides tú (puede ser tu propio `<Alert />`).

- `src/utils/imperativePortal.tsx`
  - Helper para renderizar UI imperativamente en un contenedor DOM (ej. mostrar `<Alert />` en una zona concreta) sin re-renderizar el componente padre.

## Patrones de uso

### 1) Error UI global sin imponer estilos

```tsx
import ErrorBoundary from 'utils/ErrorBoundary';

function Page() {
  const data = useData();           // tus datos
  const hasAsyncError = !!error;    // bandera de error async

  return (
    <ErrorBoundary
      errorFlag={hasAsyncError}
      resetKey={data}
      fallback={<div id="page-alert-host" />}
    >
      {/* contenido normal */}
    </ErrorBoundary>
  );
}
```

- Renderiza un host vacío en `fallback` (o uno posicionado donde quieras).
- Tu controlador imperativo inyecta el `<Alert />` dentro de ese host cuando corresponda.

### 2) Alertas imperativas en un punto exacto

```tsx
import { createImperativePortal } from 'utils/imperativePortal';

function Form() {
  const hostRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<ReturnType<typeof createImperativePortal> | null>(null);

  const ensurePortal = () => {
    if (hostRef.current && !portalRef.current) {
      portalRef.current = createImperativePortal(hostRef.current);
    }
    return portalRef.current!;
  };

  const showError = (msg: string) => ensurePortal().render(<Alert severity="error">{msg}</Alert>);
  const showSuccess = (msg: string) => ensurePortal().render(<Alert severity="success">{msg}</Alert>);
  const clear = () => portalRef.current?.clear();

  return (
    <>
      {/* ...inputs y botones... */}
      <div ref={hostRef} /> {/* Aquí aparece la alerta sin re-renderizar el formulario */}
    </>
  );
}
```

### 3) Backend → mensaje visible

- Mantén en `AuthContext` el mapeo de errores:
  - 422 → `details` (string) directo.
  - 401/404/500/503 → `message`.
  - Red/parseo → mensaje claro.
- El componente que llama a `login/register` captura el error y usa `showError(error.message)` para dibujar la alerta en su host.

### 4) Recuperación automática

- Cambia `resetKey` (por ejemplo, `data` o un contador) para que `ErrorBoundary` limpie `hasError` y vuelva a renderizar children.
- Para formularios, limpia con `clear()` al escribir.

## Beneficios

- Lógica separada, sin imponer ningún estilo.
- Puedes mostrar alertas exactamente donde quieras, sin re-renderizar vistas completas.
- Compatible con tu patrón actual (Alerts MUI entre checkbox y botón en Login/Register).
