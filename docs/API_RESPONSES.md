# Formato de Respuestas API (StyleHub Backend)

Este backend usa **respuestas JSON estandarizadas** para que el frontend pueda manejar errores y éxitos de forma consistente.

> Nota: En PBAC (endpoint authorization), los errores 401/403 tienen un formato distinto al de `422` (validación).

---

## 1) Respuestas exitosas (200/201)

### 1.1 Formato estándar (`successResponse`)

```json
{
  "success": true,
  "data": {},
  "message": "...",
  "total": 0,
  "timestamp": "2026-01-20T00:00:00.000Z"
}
```

Notas:

- `message` es opcional.
- `total` es `number | null` (solo es un número cuando `data` es un array).

### 1.2 Lista vacía (`emptyListResponse`)

```json
{
  "success": true,
  "data": [],
  "message": "No se encontraron usuarios",
  "total": 0,
  "timestamp": "2026-01-20T00:00:00.000Z"
}
```

### 1.3 Creación (201) (`createdResponse`)

```json
{
  "success": true,
  "data": { "insertId": 123 },
  "message": "Recurso creado exitosamente",
  "total": null,
  "timestamp": "2026-01-20T00:00:00.000Z"
}
```

---

## 2) Errores de autorización PBAC (401/403)

Cuando el middleware PBAC bloquea una petición, responde así:

```json
{
  "success": false,
  "error": "No autenticado",
  "message": "Se requiere autenticación",
  "timestamp": "2026-01-20T00:00:00.000Z"
}
```

Y para “no permitido”:

```json
{
  "success": false,
  "error": "No autorizado",
  "message": "No tienes permisos para este endpoint",
  "method": "GET",
  "path": "/usuarios",
  "endpointId": 10,
  "required": ["usuarios:admin"],
  "timestamp": "2026-01-20T00:00:00.000Z"
}
```

Notas:

- En estos casos **no viene `errors[]`**.
- La UI debe tratar `401` como “redirigir a login” y `403` como “pantalla no autorizado”.

---

## 3) Errores de validación (422)

### 3.1 Formato (`handleValidationError`)

```json
{
  "error": "Error de validación",
  "errors": [
    {
      "message": "La contraseña es incorrecta"
    }
  ]
}
```

### 3.2 Errores por campo (Zod)

`errors[]` puede incluir `path` y metadatos:

```json
{
  "error": "Error de validación",
  "errors": [
    {
      "origin": "string",
      "code": "invalid_format",
      "path": ["correo_electronico"],
      "message": "El correo electrónico debe tener un formato válido"
    }
  ]
}
```

### 3.3 Duplicados de BD (422)

Ejemplo típico:

```json
{
  "error": "Error de validación",
  "errors": [
    {
      "origin": "database",
      "code": "duplicate",
      "path": ["correo_electronico"],
      "message": "El correo electrónico ya está registrado"
    }
  ]
}
```

Regla frontend:

- Para formularios: usar `path[0]` como nombre de campo.
- Para toasts: concatenar `errors[].message`.

---

## 4) No encontrado (404)

```json
{
  "error": "No encontrado",
  "message": "Usuario no encontrado"
}
```

---

## 5) Errores de base de datos (500/503)

### 5.1 Error de consulta MySQL (500)

```json
{
  "error": "Error de base de datos",
  "message": "Ha ocurrido un error de base de datos inesperado.",
  "code": "ER_BAD_FIELD_ERROR",
  "context": "obtener usuarios"
}
```

### 5.2 DB no disponible / conectividad (503)

```json
{
  "error": "El servicio de base de datos no está disponible. Por favor, inténtelo de nuevo más tarde.",
  "code": "ECONNREFUSED",
  "message": "connect ECONNREFUSED 127.0.0.1:3306",
  "context": "obtener usuarios"
}
```

### 5.3 Error interno (500)

Si ocurre un error no-MySQL (por ejemplo un `TypeError`), se responde:

```json
{
  "error": "Error interno",
  "message": "<mensaje>",
  "context": "..."
}
```

---

## 6) Helper recomendado (Fetch)

```js
export async function request({ method = 'GET', url, data, headers = {} }) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    credentials: 'include',
    body: method !== 'GET' && data ? JSON.stringify(data) : undefined,
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await res.json() : null;

  if (res.ok) {
    return {
      ok: true,
      status: res.status,
      data: payload?.data ?? payload,
      message: payload?.message,
      raw: payload,
    };
  }

  // PBAC 401/403
  if (res.status === 401 || res.status === 403) {
    return {
      ok: false,
      status: res.status,
      error: payload?.message || payload?.error || 'No autorizado',
      raw: payload,
    };
  }

  // Validación 422
  if (res.status === 422) {
    const errs = Array.isArray(payload?.errors) ? payload.errors : [];
    const msg = errs.length ? errs.map(e => e.message).join('\n') : 'Error de validación';
    return { ok: false, status: 422, error: msg, errors: errs, raw: payload };
  }

  // Otros
  return {
    ok: false,
    status: res.status,
    error: payload?.message || payload?.error || 'Ha ocurrido un error inesperado',
    raw: payload,
  };
}
```
