# Guía de Integración para el Frontend (Fetch API)

> **📢 IMPORTANTE**: Guía rápida para el equipo de frontend sobre cómo consumir las respuestas de la API de StyleHub usando Fetch (sin axios).

---

## 🎯 Regla de Oro

### ⚠️ Para Errores de Validación (Status 422)

**Usar el arreglo `errors` del JSON.**

- Para formularios: mapear por `path[0]` y mostrar `message` por campo.
- Para toasts generales: concatenar los `message` de cada error.

```javascript
// ✅ Obtener mensajes (toast)
const mensajes = Array.isArray(data.errors)
  ? data.errors.map((e) => e.message).join("\n")
  : "Error de validación";

// ✅ Formularios (React Hook Form)
if (Array.isArray(data.errors)) {
  data.errors.forEach((e) => {
    const field = e.path?.[0];
    if (field) setError(field, { message: e.message });
  });
}
```

---

## 📊 Resumen Rápido por Status Code

| Status                     | Campo del Mensaje | Uso            |
| -------------------------- | ----------------- | -------------- |
| **401** (No autenticado)   | `message`         | `data.message` |
| **403** (No autorizado)    | `message`         | `data.message` |
| **422** (Validación)       | `errors[]`        | `data.errors`  |
| **404** (No encontrado)    | `message`         | `data.message` |
| **500** (DB / Interno)     | `message`         | `data.message` |
| **503** (DB no disponible) | `error`           | `data.error`   |

> Nota PBAC: cuando el backend bloquea por permisos (PEP), las respuestas 401/403 vienen con este formato:
>
> ```json
> {
>   "success": false,
>   "error": "No autorizado",
>   "message": "No tienes permisos para este endpoint",
>   "timestamp": "..."
> }
> ```

---

## 🔥 Casos de Uso Comunes

### 1. Login - Credenciales Incorrectas

```javascript
const res = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include", // httpOnly cookies
  body: JSON.stringify({
    usuario_acceso: "jperez001",
    contrasena: "wrong_password",
  }),
});
if (!res.ok) {
  const data = await res.json();
  const mensaje = Array.isArray(data.errors)
    ? data.errors.map((e) => e.message).join("\n")
    : data.message || data.error || "Error de validación";
  toast.error(mensaje);
}
```

### 2. Login - Usuario No Existe

```javascript
const res = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({
    usuario_acceso: "usuario_inexistente",
    contrasena: "cualquier_cosa",
  }),
});
if (!res.ok) {
  const data = await res.json();
  const mensaje = Array.isArray(data.errors)
    ? data.errors.map((e) => e.message).join("\n")
    : data.message || data.error || "Error de validación";
  toast.error(mensaje);
}
```

### 3. Login - Cuenta Desactivada

```javascript
const res = await fetch("/api/auth/login", {
  method: "POST",
  credentials: "include",
});
if (!res.ok) {
  const data = await res.json();
  const mensaje = Array.isArray(data.errors)
    ? data.errors.map((e) => e.message).join("\n")
    : data.message || data.error || "Error de validación";
  toast.error(mensaje);
}
```

### 4. Token Expirado

```javascript
const res = await fetch("/api/usuarios", { credentials: "include" });
if (!res.ok) {
  const data = await res.json();
  const mensaje = Array.isArray(data.errors)
    ? data.errors.map((e) => e.message).join("\n")
    : data.message || data.error || "Sesión expirada";
  toast.error(mensaje);
  navigate("/login");
}
```

### 5. Crear Recurso Duplicado

```javascript
const res = await fetch("/api/roles", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ nombre: "Administrador", descripcion: "Test" }),
});
if (!res.ok) {
  const data = await res.json();
  // Duplicados de BD llegan como 422 con errors[0].path y errors[0].message
  const errs = Array.isArray(data.errors) ? data.errors : [];
  const first = errs[0];
  const field = first?.path?.[0] || "nombre";
  const msg = first?.message || data.message || data.error || "Valor duplicado";
  setError(field, { message: msg });
}
```

### 6. Recurso No Encontrado

```javascript
const res = await fetch("/api/usuarios/id_inexistente", {
  credentials: "include",
});
if (!res.ok) {
  const data = await res.json();
  toast.error(data.message);
}
```

---

## 💡 Función Helper Recomendada

### Implementación Básica (Fetch)

```javascript
/**
 * Realiza una petición con Fetch y retorna estructura estándar
 * @param {{ method: string, url: string, data?: any, headers?: Record<string,string> }} cfg
 */
export const request = async (cfg) => {
  const { method = "GET", url, data, headers = {} } = cfg;
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    credentials: "include", // httpOnly cookies
    body: method !== "GET" && data ? JSON.stringify(data) : undefined,
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await res.json() : null;

  if (!res.ok) {
    const status = res.status;
    let errorMsg = "Ha ocurrido un error inesperado";
    if (payload) {
      if (status === 422) {
        const errs = Array.isArray(payload.errors) ? payload.errors : [];
        errorMsg = errs.length
          ? errs.map((e) => e.message).join("\n")
          : "Error de validación";
      } else if (status === 404) {
        errorMsg = payload.message || "Recurso no encontrado";
      } else if (status === 500) {
        errorMsg = payload.message || "Error interno del servidor";
      } else if (status === 503) {
        errorMsg = payload.error || "Servicio no disponible";
      }
    }
    return { success: false, error: errorMsg, status, data: payload };
  }

  return {
    success: true,
    data: payload?.data ?? payload,
    message: payload?.message ?? undefined,
  };
};
```

### Uso del Helper

```javascript
const result = await request({
  method: "POST",
  url: "/api/auth/login",
  data: credentials,
});
if (!result.success) {
  toast.error(result.error);
}
```

---

## 🎨 Hook de React Completo

```javascript
import { useState } from "react";

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const call = async (cfg) => {
    setLoading(true);
    setError(null);
    try {
      const { method = "GET", url, data, headers = {} } = cfg;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...headers },
        credentials: "include",
        body: method !== "GET" && data ? JSON.stringify(data) : undefined,
      });
      const isJson = (res.headers.get("content-type") || "").includes(
        "application/json",
      );
      const payload = isJson ? await res.json() : null;
      if (!res.ok) {
        const status = res.status;
        let msg = "Ha ocurrido un error inesperado";
        if (payload) {
          if (status === 422) {
            const errs = Array.isArray(payload.errors) ? payload.errors : [];
            // Toast general
            msg = errs.length
              ? errs.map((e) => e.message).join("\n")
              : "Error de validación";
            // Form field mapping
            errs.forEach((e) => {
              const field = e.path?.[0];
              if (field) setError(field, { message: e.message });
            });
          } else if (status === 404) {
            msg = payload.message || "Recurso no encontrado";
          } else if (status === 500) {
            msg = payload.message || "Error interno del servidor";
          } else if (status === 503) {
            msg = payload.error || "Servicio no disponible";
          }
        }
        setError(msg);
        return { success: false, error: msg, status, data: payload };
      }
      return {
        success: true,
        data: payload?.data ?? payload,
        message: payload?.message,
      };
    } finally {
      setLoading(false);
    }
  };

  return { request: call, loading, error };
};
```

### Uso del Hook

```javascript
function LoginForm() {
  const { request, loading, error } = useApi();
  const [formError, setFormError] = useState("");

  const handleLogin = async (credentials) => {
    const result = await request({
      method: "POST",
      url: "/api/auth/login",
      data: credentials,
    });

    if (result.success) {
      // Login exitoso
      navigate("/dashboard");
    } else {
      // Mostrar error - ya viene normalizado por el helper
      setFormError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleLogin)}>
      {formError && <Alert variant="error">{formError}</Alert>}
      {/* Campos del formulario */}
    </form>
  );
}
```

---

## 🧪 Testing - Archivo de Ejemplos

Consulta el archivo **`http-requests/ejemplos_respuestas_error.http`** para:

- ✅ Ver ejemplos reales de cada tipo de error
- ✅ Entender el formato exacto de las respuestas
- ✅ Copiar/pegar requests para probar en tu entorno

---

## 📚 Recursos Adicionales

### Documentación Completa

- **[API_RESPONSES.md](./API_RESPONSES.md)** - Guía completa de formatos de respuesta
  - Incluye todos los ejemplos posibles
  - Código de React hooks
  - Manejo con Axios y Fetch

### Endpoints Disponibles

- **Autenticación**: `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- **Usuarios (self)**: `GET /usuarios/me/roles` (roles activos del usuario autenticado)
- **Usuarios (admin)**: `GET|POST|PUT|DELETE /usuarios`
- **Usuarios (admin / multirol)**:
  - `GET /usuarios/:usuario_acceso/roles`
  - `PUT /usuarios/:usuario_acceso/roles` (reemplaza lista completa)
  - `POST /usuarios/:usuario_acceso/roles` (agrega roles)
  - `DELETE /usuarios/:usuario_acceso/roles/:id_rol` (desactiva rol)
- **Usuarios (rol 2)**: `GET /usuarios/mi-establecimiento`, `GET /usuarios/mi-establecimiento/:id`, `POST /usuarios/mi-establecimiento`, `PUT /usuarios/mi-establecimiento/:id`, `DELETE /usuarios/mi-establecimiento/:id`, `POST /usuarios/mi-establecimiento/bulk-delete`
- **Roles**: `GET|POST|PUT|DELETE /roles`
  - Select (admin): `GET /roles/select` (todos los roles activos)
  - Select (rol 2): `GET /roles/select-operativos` (excluye roles 1 y 2)
- **Permisos**: `GET|POST|PUT|DELETE /permisos`
- **Establecimientos**: `GET|POST|PATCH|DELETE /establecimientos`
  - Select simple: `GET /establecimientos/select` → `[{ id_establecimiento, nombre }]`
  - Options estandarizadas: `GET /establecimientos/options` → `[{ value, label }]`
  - Tipos: `GET /establecimientos/tipos`

  Ejemplo de carga para dropdown:

  ```javascript
  const res = await fetch("/api/establecimientos/options", {
    credentials: "include",
  });
  const { data } = await res.json();
  // data: [{ value: 'EST001', label: 'Spa Belleza Total' }]
  setOptions(data);
  ```

- **Usuarios (admin)**: `GET|POST|PUT|DELETE /usuarios`, `GET /usuarios/search?est=EST001&q=ana&sort=nombre&order=asc`

---

## 🧭 PBAC (Menús + Rutas Dinámicas)

El backend ahora controla la navegación y las rutas permitidas por usuario (server-driven UI).

### 1) Sidebar / navegación (árbol)

- Endpoint: `GET /menus`
- Uso: construir el menú lateral (árbol)
- Nota: este endpoint **excluye** items con `nav_visible = 0` (si la columna existe).

### 2) Router / guards (lista plana de rutas)

- Endpoint: `GET /menus/routes`
- Uso: definir las rutas permitidas en el router (React Router, etc.)
- Nota: este endpoint **incluye** items con `nav_visible = 0` (rutas “ocultas” pero accesibles si tienes permiso).

### Manejo de 401/403

- Si `status === 401`: sesión expirada o no autenticado → redirigir a login.
- Si `status === 403`: autenticado pero sin permisos → mostrar pantalla “No autorizado”.

> Importante: ocultar botones/rutas en UI NO reemplaza la autorización del backend.

### Ejemplos de respuestas (shape real)

Todas estas respuestas siguen el formato estándar:

```json
{
  "success": true,
  "data": "...",
  "message": "...",
  "total": 0,
  "timestamp": "2026-01-18T00:00:00.000Z"
}
```

#### `GET /menus` (sidebar tree)

```json
{
  "success": true,
  "message": "Menú obtenido exitosamente",
  "data": [
    {
      "id": "admin",
      "title": "Administración",
      "type": "group",
      "icon": "settings",
      "children": [
        {
          "id": "usuarios",
          "title": "Usuarios",
          "type": "item",
          "url": "/usuarios",
          "breadcrumbs": true,
          "external": false,
          "target_blank": false
        }
      ]
    }
  ],
  "total": 1,
  "timestamp": "2026-01-18T00:00:00.000Z"
}
```

Notas:

- En PBAC “deny-by-default UI”, grupos vacíos se podan (no aparecen).
- Items con `nav_visible = 0` no salen en `/menus` (para sidebar).

#### `GET /menus/routes` (router allowlist)

```json
{
  "success": true,
  "message": "Rutas obtenidas exitosamente",
  "data": [
    {
      "id": "usuarios",
      "title": "Usuarios",
      "type": "item",
      "url": "/usuarios",
      "breadcrumbs": true,
      "external": false,
      "target_blank": false,
      "nav_visible": true
    },
    {
      "id": "usuario-detalle",
      "title": "Detalle usuario",
      "type": "item",
      "url": "/usuarios/:usuario_acceso",
      "breadcrumbs": false,
      "external": false,
      "target_blank": false,
      "nav_visible": false
    }
  ],
  "total": 2,
  "timestamp": "2026-01-18T00:00:00.000Z"
}
```

Notas:

- `/menus/routes` incluye items con `nav_visible = 0` para permitir rutas “ocultas”.
- El frontend debe usar esta lista como allowlist para guards del router.

#### `GET /usuarios/me/roles` (multirol self)

```json
{
  "success": true,
  "data": [
    { "id_rol": 1, "nombre": "ADMIN", "estado": 1 },
    { "id_rol": 2, "nombre": "ADMIN_EST", "estado": 1 }
  ],
  "total": 2,
  "timestamp": "2026-01-18T00:00:00.000Z"
}
```

Notas:

- Si no hay roles activos, la API devuelve `success: true` con `data: []`.
- Para permisos en UI, usar `user.roles` del login o refrescar aquí (fuente de verdad).

### Implementación recomendada (React Router v6)

Objetivo:

- `GET /menus` → sidebar (solo `nav_visible = 1`)
- `GET /menus/routes` → allowlist del router (incluye `nav_visible = 0`)

Ejemplo de hook para allowlist (`useAllowedRoutes.ts`):

```ts
import { useEffect, useMemo, useState } from "react";
import { matchPath } from "react-router-dom";

type AllowedRoute = {
  id: string;
  url: string;
  nav_visible?: boolean;
};

export function useAllowedRoutes() {
  const [routes, setRoutes] = useState<AllowedRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/menus/routes", {
          credentials: "include",
        });
        if (res.status === 401) throw new Error("401");
        if (res.status === 403) throw new Error("403");
        if (!res.ok) throw new Error(String(res.status));

        const json = await res.json();
        const data = Array.isArray(json?.data) ? json.data : [];
        if (mounted) setRoutes(data);
      } catch (e: any) {
        if (!mounted) return;
        if (e?.message === "401") setError("SESSION_EXPIRED");
        else if (e?.message === "403") setError("FORBIDDEN");
        else setError("UNKNOWN");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const allowedPatterns = useMemo(
    () =>
      routes
        .map((r) => r.url)
        .filter((u): u is string => typeof u === "string" && u.length > 0),
    [routes],
  );

  const isAllowed = (pathname: string) => {
    return allowedPatterns.some((pattern) => {
      // Soporta patrones con params, p.ej. /admin/roles/editar/:id
      return !!matchPath({ path: pattern, end: true }, pathname);
    });
  };

  return {
    loading,
    error,
    routes,
    allowedPatterns,
    isAllowed,
  };
}
```

Ejemplo de guard simple:

```tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAllowedRoutes } from "./hooks/useAllowedRoutes";

export function ProtectedRoutes() {
  const location = useLocation();
  const { loading, error, isAllowed } = useAllowedRoutes();

  if (loading) return null; // o spinner
  if (error === "SESSION_EXPIRED") return <Navigate to="/login" replace />;
  if (error === "FORBIDDEN") return <Navigate to="/no-autorizado" replace />;

  return isAllowed(location.pathname) ? (
    <Outlet />
  ) : (
    <Navigate to="/no-autorizado" replace />
  );
}
```

Notas:

- El guard debe basarse en `/menus/routes` (no en el sidebar).
- Las rutas con `nav_visible: false` deben existir en el router, solo que no se renderizan en el menú.

---

## 🧭 Menús: Cómo usar los endpoints de administración

### Crear un Grupo

- Endpoint: `POST /menus/admin/groups`
- Body mínimo:

```json
{
  "id_key": "reports",
  "titulo": "Reportes",
  "tipo": "group"
}
```

- Comportamiento:
  - `orden` se asigna automáticamente al siguiente disponible entre los grupos (`MAX(orden)+1`).
  - `icono`, `caption`, `estado` son opcionales.
  - No enviar `url` (solo aplica a `item`).

### Crear un Item dentro de un Grupo

- Endpoint: `POST /menus/admin/items`
- Body mínimo:

```json
{
  "id_key": "reports-daily",
  "titulo": "Reportes diarios",
  "tipo": "item",
  "url": "/reportes/diarios",
  "id_menu_item": 12
}
```

- Comportamiento:
  - `parent_id` es obligatorio y corresponde al `id_menu_item` del grupo padre.
  - El item se inserta al final del grupo: `orden` en `menus_items_children` se calcula como `MAX(orden)+1` para ese `parent_id`.
  - En `menus_items`, los `item` usan `orden = 0` (el orden real se maneja en la relación padre-hijo).

### Crear/Eliminar Relaciones Padre→Hijo (Edges)

- Crear: `POST /menus/admin/edges`

```json
{
  "parent_id": 12,
  "child_id": 15
}
```

- El backend asigna el `orden` automáticamente al final para ese `parent_id`.

- Eliminar: `DELETE /menus/admin/edges`

```json
{
  "parent_id": 12,
  "child_id": 15
}
```

### Árbol y Select

- `GET /menus/admin/tree`: Árbol completo para administración (restringido por token). Raíces ordenadas por `menus_items.orden` y niños por `menus_items_children.orden`.
- `GET /menus/select`: Lista simple solo de grupos activos para mostrarse en `select`: `[ { id_menu_item, id_key } ]`.

Nota: el backend acepta `parent_id` como alias de `id_menu_item` en la creación de items.

### Errores y Validaciones

- Duplicados de `orden` en grupos: el backend devuelve 422 si intentas actualizar un grupo a un `orden` ya usado por otro grupo.
- Duplicados de `orden` por padre en `menus_items_children`: el backend evita duplicados al generar el próximo orden; si en algún flujo se envía manualmente, responde 422.
- Usa `errors` en 422 para mostrar mensajes por campo (`path`) y para toasts (concatenando `message`).

---

## 🧑‍💻 Notas para el Frontend

- Para crear `item`, siempre proveer `parent_id` del grupo.
- No envíes `orden` en creación: el backend lo calcula y garantiza consistencia.
- Si luego se necesita reordenar elementos dentro de un grupo (mover arriba/abajo o insertar en posición), solicitar al backend endpoints de reordenamiento; no se soporta reordenamiento manual en creación.

### Usuarios: visibilidad por rol

> Importante (PBAC + multirol): ya no asumas “un solo rol”.
>
> - En login el backend devuelve `user.roles` (array) además de `user.id_rol` (compatibilidad).
> - Si quieres refrescar desde backend (fuente de verdad), usa `GET /usuarios/me/roles`.

- Si el usuario tiene rol admin (1): usar los endpoints bajo `/usuarios` (listar, crear, actualizar, eliminar) — acceso global.
- Si el usuario tiene rol 2 (administrador de establecimiento): usar los endpoints bajo `/usuarios/mi-establecimiento` para gestionar usuarios exclusivamente de su propio `id_establecimiento`:
  - Listar: `GET /usuarios/mi-establecimiento`
  - Obtener por `usuario_acceso`: `GET /usuarios/mi-establecimiento/:id`
  - Crear: `POST /usuarios/mi-establecimiento` (el backend fuerza `id_establecimiento` al del usuario autenticado)
  - Actualizar: `PUT /usuarios/mi-establecimiento/:id`
  - Eliminar: `DELETE /usuarios/mi-establecimiento/:id`
  - Eliminación masiva: `POST /usuarios/mi-establecimiento/bulk-delete`

#### Ejemplos rápidos (Fetch)

```javascript
// Listar mis usuarios (rol 2)
await fetch("/api/usuarios/mi-establecimiento", { credentials: "include" });

// Crear usuario dentro de mi establecimiento (id_establecimiento se ignora si se envía)
await fetch("/api/usuarios/mi-establecimiento", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({
    usuario_acceso: "empleado001",
    contrasena: "ClaveSegura123",
    nombre_usuario: "Ana",
    apellido_usuario: "Ramirez",
    correo_electronico: "ana@empresa.com",
    id_rol: 3,
    estado: 1,
  }),
});

// Actualizar usuario de mi establecimiento
await fetch("/api/usuarios/mi-establecimiento/empleado001", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ telefono: "3216549871" }),
});

// Eliminar usuario de mi establecimiento
await fetch("/api/usuarios/mi-establecimiento/empleado001", {
  method: "DELETE",
  credentials: "include",
});

// Eliminación masiva en mi establecimiento
await fetch("/api/usuarios/mi-establecimiento/bulk-delete", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ usuarios: ["empleado002", "empleado003"] }),
});

// Llenar select de roles según rol del usuario
const hasRole = (roleId) =>
  Array.isArray(user.roles) && user.roles.includes(roleId);
const rolesEndpoint = hasRole(2)
  ? "/api/roles/select-operativos"
  : "/api/roles/select";
const rolesRes = await fetch(rolesEndpoint, { credentials: "include" });
const rolesData = await rolesRes.json();
const rolesOptions = rolesData.data; // [{ id_rol, nombre }]

// (Opcional) refrescar roles activos desde backend
const myRolesRes = await fetch("/api/usuarios/me/roles", {
  credentials: "include",
});
if (myRolesRes.ok) {
  const myRolesData = await myRolesRes.json();
  // myRolesData.data: [{ id_rol, nombre, estado, ... }]
}
```

Notas:

- El backend valida y fuerza `id_establecimiento` al del usuario autenticado en create/update.
- Si intentas acceder/editar un usuario de otro establecimiento, se retorna `404`.
- El listado `GET /usuarios/mi-establecimiento` excluye roles de jerarquía (1 y 2), excluye al usuario autenticado, y retorna campos mínimos (`usuario_acceso`, `nombre_usuario`, `apellido_usuario`, `correo_electronico`, `id_rol`, `estado`).
- Al crear/actualizar desde rol 2, el backend rechaza `id_rol` 1 y 2 (422), utiliza `GET /roles/select-operativos` para poblar el select.

---

## 🏢 Establecimientos: Registro y Edición del Usuario

### Registro público (`POST /auth/register`)

- No enviar `id_establecimiento`, `id_rol` ni `estado` en el payload.
- El backend ahora genera un `id_establecimiento` secuencial con formato `EST` + número, crea un registro mínimo en la tabla `establecimientos` y devuelve ese ID en la respuesta.
- Respuesta (201): `{ data: { insertId, usuario_acceso, id_establecimiento } }`.

### Obtener el ID del establecimiento

- Tras `register`, usar `data.id_establecimiento` de la respuesta.
- Alternativamente, tras `login`, leer `data.user.id_establecimiento` (incluye también `data.user.id_tipo`) o usar `GET /auth/me` (retorna `id_establecimiento` e `id_tipo`).

### Editar establecimiento (`PATCH /establecimientos/:id`)

- Enviar solo los campos que se deseen modificar; todos son opcionales.
- Los campos son mayormente anulables: puedes enviar `null` para limpiar el valor (ej. borrar `mensaje2`, `resolucion`).
- Validación de fechas: solo se verifica que `fecha_ini ≤ fecha_fin` si ambos campos están presentes y no son `null`.

#### Ejemplo de actualización completa

```javascript
await fetch(`/establecimientos/${id}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    nombre: "Mi Primer Establecimiento",
    direccion: "Av. Principal 123",
    telefono: "6041112222",
    celular: "3001112222",
    id_tipo: 1,
    nit: "900123456-7",
    resolucion: "RES-2025-0001",
    desde: "A001",
    hasta: "A500",
    fecha_ini: "2025-01-01",
    fecha_fin: "2025-12-31",
    mensaje1: "Gracias por su compra",
    mensaje2: "Servicio al cliente 24/7",
    mensaje3: "Promociones vigentes",
    mensaje4: "Visítenos nuevamente",
    estado: 1,
  }),
});
```

#### Ejemplo de limpieza de campos (establecer a `null`)

```javascript
await fetch(`/establecimientos/${id}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    mensaje2: null,
    mensaje3: null,
    resolucion: null,
    desde: null,
    hasta: null,
    fecha_ini: null,
    fecha_fin: null,
    nit: null,
    id_tipo: null,
  }),
});
```

### Manejo de respuestas

- Éxito: el backend retorna `{ success: true, data: { id_establecimiento } }`.
- Errores 422: leer `errors[]` y mostrar `errors[].message` (duplicados/validaciones/etc.).
- 404: establecimiento no encontrado (`message`).

### Flujo sugerido en UI

1. Registrar usuario → obtener `id_establecimiento`.
2. Redirigir a la pantalla de edición del establecimiento.
3. Prefill con `GET /establecimientos/:id` y luego `PATCH` para completar datos.

### Select de tipos de establecimiento

- Endpoint: `GET /establecimientos/tipos`
- Respuesta: lista ordenada de `{ id_tipo, descripcion }`
- Uso: poblar el `<select>` de tipo de establecimiento en el formulario de edición.

---

## ✅ Checklist de Integración

- [ ] Configurar Fetch con `credentials: 'include'` para httpOnly cookies
- [ ] Usar helper `request()` o `useApi()` para formato estándar
- [ ] **Para errores 422**: Leer `data.errors[]` del JSON
- [ ] Para errores 404: Leer `data.message` del JSON
- [ ] Manejar sesión expirada (422 con `errors[].message` = "Tu sesión ha expirado...")
- [ ] Manejar cuenta desactivada (422 con `errors[].message` = "Tu cuenta está desactivada...")
- [ ] Probar login con credenciales incorrectas
- [ ] Probar recursos duplicados
- [ ] Probar recursos no encontrados

---

## 🆘 Errores Comunes

### ❌ Error: "Los datos proporcionados no son válidos" (genérico)

**Problema**: Estás leyendo `message` en lugar de `errors[].message` (status 422).

```javascript
// ❌ Incorrecto
const msg = data.message; // "Los datos proporcionados no son válidos"

// ✅ Correcto
const msg = Array.isArray(data.errors) ? data.errors[0]?.message : null; // "La contraseña es incorrecta"
```

### ❌ Error: No puedo leer el mensaje de error

**Solución**: Usa el helper `request()` que retorna `error` y `status` ya normalizados.

```javascript
const result = await request({
  method: "POST",
  url: "/api/auth/login",
  data: credentials,
});
if (!result.success) toast.error(result.error);
```

---

## 📞 Soporte

Si encuentras un caso de error que no está documentado:

1. Revisa `ejemplos_respuestas_error.http`
2. Consulta `API_RESPONSES.md`
3. Contacta al equipo de backend

---

**Última actualización**: Noviembre 2025
