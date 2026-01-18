# Plan de Alineamiento: PBAC (Permisos/Scopes) en StyleHub Backend

Fecha: 2026-01-14

## 1) Objetivo

Hacer que **los permisos (scopes)** sean la fuente de verdad para:

- Qué puede ejecutar un usuario en el **backend** (autorización real).
- Qué ve un usuario en el **frontend** (menús como “vista” de permisos, no como seguridad).

Resultado esperado:

- Aunque el frontend no muestre un menú, el usuario no podrá acceder a esa funcionalidad si intenta entrar por URL o llamar la API.
- El backend responde **401** (no autenticado) o **403** (autenticado pero sin permiso) de forma consistente.

## 2) Principios (reglas del proyecto)

1. **El frontend no autoriza**: solo muestra/oculta. La seguridad siempre la aplica el backend.
2. **Deny by default**: toda ruta sensible exige autenticación + permisos.
3. **Menús no son seguridad**: los menús deben derivarse de permisos, no al revés.
4. **Permisos atómicos**: cada acción del dominio tiene un permiso claro y estable.
5. **Campos sensibles = frontera de autorización**: si un campo (ej. precio) requiere control especial, se modela con permisos y/o endpoints específicos, no solo con “update genérico”.

## 3) Qué tablas de Roles/Permisos ya existen en el proyecto

En el código/backend actual ya se usan:

- `roles` (ver modelo `RolModel`)
- `permisos` (ver modelo `PermisoModel`)
- `categorias_permisos` (ver modelo `CategoriaPermisoModel`)
- `usuarios.id_rol` (rol asignado al usuario; se usa en autenticación)

En scripts de BD (definidos en `scripts/mysql_query_stylehub_db.sql`) ya está planteado el esquema PBAC:

- `roles_permisos` (tabla intermedia rol → permiso)
- `rutas_protegidas` (catálogo de rutas)
- `rutas_permisos` (tabla intermedia ruta → permiso)

Y el sistema de menús (actualmente por rol) usa:

- `menus_items`
- `menus_items_children`
- `roles_menu_items` (rol → menú)

Diagnóstico importante:

- Hoy el backend **no está usando** `roles_permisos`/`rutas_permisos` para autorizar endpoints.
- El menú por rol funciona para UI, pero **no impide** que un usuario consuma endpoints si la ruta backend no está protegida.

## 3.1) Identidad de usuario (PK) y multirol

Decisión del proyecto:

- La PK real del usuario es `usuarios.id_usuario_uuid`.
- Se permite **multirol por usuario** (relación N:M usuario ↔ rol).

Implicación:

- `usuarios.id_rol` puede mantenerse por compatibilidad temporal, pero la autorización PBAC debe leer roles desde una tabla intermedia (ver sección **9**).

## 4) Convención de scopes (permisos)

Vamos a adoptar permisos tipo **`recurso:accion`**, por ejemplo:

- `productos:read`
- `productos:create`
- `productos:update`
- `productos:delete`

Cuando haya **control por campo** (atributos sensibles), se usan scopes más específicos:

- `productos:price:update`
- `productos:cost:update`
- `productos:stock:update`

Reglas:

- `recurso` en plural y en minúscula (productos, usuarios, roles, permisos, proveedores…)
- `accion` en minúscula (read/create/update/delete)
- Un endpoint puede requerir 1+ scopes.
- Preferir scopes específicos para atributos sensibles en lugar de “mega-permisos”.

Compatibilidad con permisos actuales:

- Si hoy existen permisos con `codigo` en formato MAYÚSCULAS (ej. `GESTIONAR_SISTEMA`), se define una estrategia:
  - Opción A (recomendada): mantenerlos como “legacy” y crear nuevos permisos con formato `recurso:accion`.
  - Opción B: migrar gradualmente códigos legacy a scopes (requiere actualización controlada).

## 4.1) Política estándar de naming (scopes, endpoints y campos)

Objetivo: que el panel admin, la BD, el backend y el frontend hablen el mismo idioma.

### 4.1.1 Naming de permisos (scope en `permisos.codigo`)

Formato base:

- `recurso:accion`

Reglas:

- `recurso`: plural, minúsculas, ASCII (sin tildes), separado por guiones si aplica.
  - Ej: `productos`, `proveedores`, `categorias-producto`, `usuarios`.
- `accion`: minúsculas.
  - CRUD estándar: `read`, `create`, `update`, `delete`.
- Acciones específicas (cuando hay control fino): `price:update`, `cost:update`, `stock:update`, etc.
  - Ej: `productos:price:update`.

Prohibido:

- Mezclar MAYÚSCULAS con minúsculas en scopes nuevos.
- Usar espacios.

### 4.1.2 Naming de endpoints (catálogo en BD)

Cada endpoint se identifica por:

- `method`: `GET|POST|PUT|PATCH|DELETE`
- `path_pattern`: ruta con placeholders estilo Express.

Reglas:

- `path_pattern` siempre en minúsculas y con guiones cuando aplique.
  - Ej: `/categorias-producto`.
- Placeholders siempre con `:` y en `snake_case` solo si es necesario.
  - Preferido: `:id` para IDs numéricos.
  - Para UUID: `:id_usuario_uuid`.
- Sub-recursos para campos sensibles:
  - Ej: `/productos/:id/precio`, `/productos/:id/costo`.

Convención recomendada para descripción:

- `descripcion`: frase corta tipo “Actualizar precio de producto”.

### 4.1.3 Naming de campos sensibles (catálogo `recursos_campos`)

Principio:

- El valor de `recursos_campos.campo` debe mapear 1:1 a un “nombre canónico” que el backend reconoce.

Regla recomendada (canónica):

- Usar el nombre de columna real en BD (snake_case) como canónico.
  - Ej: `precio_venta`, `costo`, `stock`.

Si el frontend usa camelCase:

- El backend debe definir un mapeo explícito (documentado) de payload → canónico.
  - Ej: payload `precioVenta` → canónico `precio_venta`.

Esto evita ambigüedad y hace que el panel admin pueda administrar permisos por campo de forma confiable.

### 4.1.4 Naming de tablas/columnas nuevas (complemento)

Reglas:

- Tablas: `snake_case` plural (ej. `usuarios_roles`, `api_endpoints_permisos`).
- Columnas: `snake_case`.
- FKs: repetir el nombre de la PK referenciada cuando sea posible.
  - Ej: `id_usuario_uuid`, `id_permiso`, `id_endpoint`.

## 5) Modelo de autorización (qué valida el backend)

### 5.1 Autenticación

- `authMiddleware` valida token y carga `req.user` (incluye `id_rol`).
- Toda ruta sensible debe exigir autenticación.

### 5.2 Autorización por permisos (PBAC)

Para cada request autenticada:

- Calcular permisos efectivos del usuario (por su rol, y futuro: por permisos directos si aplica).
- Verificar que el usuario tenga el scope requerido por ese endpoint.

Fuente de permisos efectivos:

- Inicialmente: **por rol** (tabla `roles_permisos`).

### 5.2.1 Permisos efectivos (multirol + permisos por usuario)

Definición (modelo estricto):

- Un usuario puede tener **N roles**.
- Cada rol otorga un conjunto de permisos.
- Además, el usuario puede tener permisos directos (allow) y también **denegaciones directas (deny)**.

El cálculo de permisos efectivos se define como conjuntos:

$$
P_\text{roles} = \bigcup_{rol \in Roles(usuario)} Permisos(rol)
$$

$$
P_\text{allow} = PermisosDirectosAllow(usuario)
$$

$$
P_\text{deny} = PermisosDirectosDeny(usuario)
$$

$$
P_\text{efectivos} = (P_\text{roles} \cup P_\text{allow}) \setminus P_\text{deny}
$$

Regla de precedencia:

- **Deny gana sobre allow**. Si un permiso está en deny, queda bloqueado aunque venga por rol.

Ejemplo rápido:

- Roles del usuario: {Usuario, Supervisor}
- Permisos por roles: {`productos:read`, `productos:price:update`}
- Allow directo: {`productos:create`}
- Deny directo: {`productos:price:update`}

Entonces:

- `productos:read` ✅ (viene por rol)
- `productos:create` ✅ (viene por allow directo)
- `productos:price:update` ❌ (deny lo elimina aunque venga por rol)

Opciones técnicas para obtener permisos:

- Opción 1: Cargar permisos en el JWT al login (rápido; cuidado con cambios de permisos hasta expirar token).
- Opción 2 (recomendada): Consultar permisos por rol en BD y **cachear** por `id_rol` (balance seguridad/rendimiento).

Códigos de respuesta:

- 401: no hay token / token inválido.
- 403: hay token pero faltan permisos.

### 5.2.2 PDP/PEP/PAP/PIP (NIST SP 800-162) aplicado al backend actual

Fuente ABAC (documentación del repo):

- `docs/nist.sp.800-162-201401.pdf` (alias: `docs/abac-nist-sp800-162.pdf`)

Objetivo:

- Adoptar una terminología estándar (NIST) para que el diseño PBAC sea consistente y auditable, **sin cambiar** el estilo de codificación ni el esquema MVC actual.

Definiciones (mapeadas a StyleHub):

- **PEP (Policy Enforcement Point)**: donde se hace el *enforcement* (permitir/bloquear) de la request.
  - En este proyecto vive en **Express middleware** (p.ej. `middlewares/*`) y en los guards por ruta.
  - Responsabilidad: devolver 401/403 de forma consistente y “deny by default”.

- **PDP (Policy Decision Point)**: donde se decide si el usuario tiene permiso.
  - En este proyecto será una función/módulo que calcula permisos efectivos y evalúa requisitos (scope) por endpoint.
  - Debe ser puro/estable: dada una request (usuario + endpoint + contexto) produce `allow|deny` y la razón.

- **PAP (Policy Administration Point)**: donde se administran políticas.
  - En este proyecto es el **panel admin** (y endpoints CRUD) que gestionan `permisos`, `roles_permisos`, `usuarios_permisos`, `api_endpoints_permisos`, etc.

- **PIP (Policy Information Point)**: de dónde salen los atributos/datos para decidir.
  - En este proyecto incluye:
    - Atributos del usuario (`usuarios`, `usuarios_roles`, `usuarios_permisos`).
    - Atributos del dominio para condiciones (ej. `id_establecimiento`), cuando aplique.
    - Contexto del request (método, path, etc.).

Regla operativa (alineada a Fail Fast):

- Si un endpoint es “sensible” y no tiene política declarada (mapping endpoint→permiso), se considera **misconfiguración** y debe fallar de forma visible (no permitir silenciosamente).

### 5.3 Autorización por campo (field-level)

Objetivo: permitir casos como:

- Rol **Usuario**: puede `productos:read` pero NO puede cambiar `precio`.
- Rol **Supervisor**: puede `productos:read` y SÍ puede `productos:price:update`.

Hay dos formas válidas (se pueden combinar). La recomendación es empezar por la (A).

#### (A) Endpoints separados por intención (recomendado)

Se crean endpoints “sub-recurso” para campos o grupos sensibles, por ejemplo:

- `PATCH /productos/:id/precio` → requiere `productos:price:update`
- `PATCH /productos/:id/costo` → requiere `productos:cost:update`

Ventajas:

- La autorización es simple: 1 endpoint = 1 scope.
- No hay ambigüedad: si tocas precio, pasas por el endpoint de precio.
- Mantiene el modelo “todo en BD” más limpio (mapping endpoint→permiso).

Regla de diseño:

- El endpoint general `PUT/PATCH /productos/:id` NO debería permitir modificar `precio/costo` si existen endpoints específicos; esos campos se consideran “protegidos”.

#### (B) Permisos por campo dentro de un endpoint general (avanzado)

Si se mantiene un endpoint general que acepta múltiples campos (incluyendo sensibles), el backend debe:

- Detectar qué campos vienen en el payload.
- Exigir permisos adicionales por cada campo sensible presente.

Para que esto sea 100% declarativo desde la BD, se recomienda agregar tablas para reglas por campo.

Modelo sugerido (mínimo):

- `recursos_campos` (catálogo): `id_campo`, `recurso` (ej. `productos`), `campo` (ej. `precio`), `descripcion`, `estado`.
- `campos_permisos` (mapping): `id_campo`, `id_permiso`, `estado`.

Interpretación:

- Si el request intenta cambiar un campo X, el usuario debe tener alguno de los permisos asociados a ese campo (además del permiso general si aplica).

Nota:

- (B) es más flexible, pero requiere un estándar claro sobre “nombres de campo” (ej. `precio` vs `precio_venta`) y cómo se mapean a payloads.

## 6) Cómo alinear MENÚS con PERMISOS

Meta: los menús deben ser una “vista” del set de permisos.

Opciones:

1. Mantener `roles_menu_items` solo como UI y además proteger endpoints por permisos.

   - Pro: mínimo cambio.
   - Contra: hay que mantener dos sistemas consistentes manualmente.

2. Pasar menús a depender de permisos (recomendado):
   - Cada `menu_item` requiere 0..N permisos.
   - El endpoint `/menus` devuelve solo items cuyo requisito esté cubierto por los permisos del usuario.

Para lo anterior, recomendamos modelar:

- `menus_items_permisos(id_menu_item, id_permiso)` (many-to-many)
  - Alternativa simple: un campo `required_permiso_codigo` en `menus_items` (solo 1 permiso por item).

Regla:

- Si un usuario NO tiene el permiso, NO ve el menú.
- Aunque el usuario adivine la URL, el backend debe bloquear por permiso.

## 6.1) Regla de UI vs Seguridad (resumen práctico)

- La UI (menú) debe ser una **vista** de permisos efectivos.
- La API (endpoints) debe ser la **frontera real**: si no hay permiso, responde 403.
- Si hay inconsistencia, se considera bug: la fuente de verdad siempre es PBAC.

## 7) Plan de implementación (paso a paso)

### Fase 0 — Inventario y decisión

- Listar endpoints por recurso (productos, proveedores, usuarios, etc.) y acciones.
- Definir el catálogo de permisos `recurso:accion` por recurso.
- Elegir estrategia de compatibilidad (legacy vs migración).
- Identificar campos “sensibles” por recurso (ej. productos: precio, costo).
- Decidir estrategia por recurso: (A) endpoints específicos o (B) reglas por campo.

### Fase 1 — Datos (BD)

- Confirmar/crear permisos en `permisos` (con `codigo` = scope).
- Asignar permisos a roles en `roles_permisos`.
- (Opcional) Definir el catálogo de rutas en `rutas_protegidas` y su mapping en `rutas_permisos` para auditoría.
- (Opcional) Si se requiere autorización por campo (B): crear `recursos_campos` y `campos_permisos`.
- Para multirol y excepciones por usuario: crear tablas `usuarios_roles` y permisos directos allow/deny (ver sección **9**).

### Fase 2 — Enforcement backend (autorización real)

- Definir una forma estándar de declarar permisos requeridos por endpoint.
- Aplicar autorización a todos los routers sensibles:
  - `/productos`: exigir `productos:read` (GET), `productos:create` (POST), etc.
  - Repetir para cada módulo.
- Para campos sensibles: implementar endpoints específicos (A) o reglas por campo (B).

### Fase 3 — Menús alineados

- Migrar menús para que dependan de permisos (no solo de rol).
- Alinear el frontend para usar `/menus` y/o `/auth/me` como fuente de permisos.

### Fase 4 — Checklist de calidad

- Para cada endpoint: probar 401/403/200.
- Agregar requests de ejemplo en `http-requests/` para validar accesos por rol.
- Documentar el “permiso requerido” por recurso.

## 8) Checklist para nuevas funcionalidades (regla de oro)

Cada vez que se agregue una nueva feature o endpoint:

1. Definir permisos atómicos (`recurso:accion`).
2. Insertar permisos en `permisos`.
3. Asignar a roles en `roles_permisos`.
4. Proteger endpoint en backend con esos permisos.
5. (Si aplica) Asociar menú al permiso.
6. Probar que un usuario sin permiso recibe 403.
7. Si hay campos sensibles: crear permiso por campo y endpoint específico o regla por campo.

---

## Apéndice A — Ejemplo de mapeo (conceptual)

Recurso: Productos

- GET `/productos` → requiere `productos:read`
- POST `/productos` → requiere `productos:create`
- PUT `/productos/:id` → requiere `productos:update`
- PATCH `/productos/:id/precio` → requiere `productos:price:update`
- DELETE `/productos/:id` → requiere `productos:delete`

(El detalle final debe ajustarse a las rutas reales del proyecto.)

---

## Apéndice B — Lista canónica inicial (BD) para `productos`

Fuente: `DESCRIBE productos` (tabla real en MySQL).

Regla: el nombre canónico del campo es exactamente el nombre de columna (snake_case).

| Campo (canónico) | Tipo MySQL | ¿Sensible? | Permiso recomendado para modificar | Endpoint recomendado (si se separa por intención) |
| --- | --- | ---: | --- | --- |
| `id_producto` | `int unsigned` | 0 | (no editable) | (no aplica) |
| `id_establecimiento` | `varchar(20)` | 1 | `productos:establecimiento:update` (si se permite) | `PATCH /productos/:id/establecimiento` |
| `id_tipo` | `tinyint unsigned` | 0 | `productos:classification:update` | `PATCH /productos/:id/tipo` |
| `id_categoria` | `char(2)` | 0 | `productos:classification:update` | `PATCH /productos/:id/categoria` |
| `id_proveedor` | `int unsigned` | 0 | `productos:provider:update` | `PATCH /productos/:id/proveedor` |
| `nombre_producto` | `varchar(120)` | 0 | `productos:update` | `PATCH /productos/:id/nombre` (opcional) |
| `descripcion` | `varchar(255)` | 0 | `productos:update` | `PATCH /productos/:id/descripcion` (opcional) |
| `fraccion` | `int` | 1 | `productos:fraccion:update` | `PATCH /productos/:id/fraccion` |
| `costo` | `decimal(10,2)` | 1 | `productos:cost:update` | `PATCH /productos/:id/costo` |
| `costo_fraccion` | `decimal(10,2)` | 1 | `productos:cost:update` | `PATCH /productos/:id/costo-fraccion` |
| `precio` | `decimal(10,2)` | 1 | `productos:price:update` | `PATCH /productos/:id/precio` |
| `precio_fraccion` | `decimal(10,2)` | 1 | `productos:price:update` | `PATCH /productos/:id/precio-fraccion` |

Notas de diseño:

- Se marca como sensible todo lo que afecta dinero (`costo*`, `precio*`) y la lógica de unidad (`fraccion`).
- `id_establecimiento` se marca sensible porque puede implicar mover un producto entre establecimientos (si en tu negocio eso no se permite, el permiso puede omitirse y el campo se considera “no editable”).
- Los permisos “no estándar” (`productos:provider:update`, `productos:classification:update`, etc.) son opcionales; si quieres simplificar, puedes empezar con solo `productos:update` y reservar la granularidad para campos sensibles (precio/costo/fracción).

---

## Apéndice C — Set mínimo de scopes para `productos`

Objetivo: arrancar con un set pequeño pero suficiente para:

- Controlar CRUD base.
- Bloquear cambios de dinero y unidad/fracción con permisos específicos.

### Scopes mínimos (para insertar en `permisos.codigo`)

| Scope | Intención | Endpoints típicos que debería gobernar |
| --- | --- | --- |
| `productos:read` | Ver/listar productos | `GET /productos`, `GET /productos/:id` |
| `productos:create` | Crear productos | `POST /productos` |
| `productos:update` | Editar atributos “generales” del producto | `PUT/PATCH /productos/:id` (sin tocar campos sensibles) |
| `productos:delete` | Eliminar productos | `DELETE /productos/:id` |
| `productos:price:update` | Cambiar `precio` y `precio_fraccion` | `PATCH /productos/:id/precio`, `PATCH /productos/:id/precio-fraccion` |
| `productos:cost:update` | Cambiar `costo` y `costo_fraccion` | `PATCH /productos/:id/costo`, `PATCH /productos/:id/costo-fraccion` |
| `productos:fraccion:update` | Cambiar `fraccion` | `PATCH /productos/:id/fraccion` |

Regla de consistencia:

- Si existen endpoints separados para precio/costo/fracción, el endpoint general `PUT/PATCH /productos/:id` debe **rechazar** cambios a `precio*`, `costo*`, `fraccion` salvo que el usuario tenga los permisos específicos.

Roles ejemplo (orientativo):

- Rol **Usuario**: `productos:read`
- Rol **Supervisor**: `productos:read` + `productos:price:update` (si puede ajustar precios)
- Rol **Admin** (o encargado): `productos:read` + `productos:create` + `productos:update` (+ los específicos si aplica)

---

## 9) Database changes (complemento de esquema) para PBAC estricto

Objetivo: que **todo** quede definido en base de datos para poder administrarlo desde un panel.

### 9.1 Multirol por usuario

Crear:

- `usuarios_roles`

Columnas recomendadas:

- `id_usuario_uuid` (FK → `usuarios.id_usuario_uuid`)
- `id_rol` (FK → `roles.id_rol`)
- `estado` (TINYINT, 1 activo)
- `fecha_creacion`, `fecha_actualizacion`

Claves e índices:

- PK compuesta `(id_usuario_uuid, id_rol)` o `UNIQUE(id_usuario_uuid, id_rol)`
- Índice por `id_rol` para listar usuarios por rol

Compatibilidad:

- Mantener `usuarios.id_rol` temporalmente solo como “rol primario” si el frontend lo usa; el enforcement PBAC debe leer roles desde `usuarios_roles`.

### 9.2 Permisos directos por usuario (allow/deny)

Crear una sola tabla con “efecto” (recomendado para panel):

- `usuarios_permisos`

Columnas recomendadas:

- `id_usuario_uuid` (FK)
- `id_permiso` (FK → `permisos.id_permiso`)
- `efecto` ENUM('allow','deny')
- `estado` (TINYINT)
- `fecha_creacion`, `fecha_actualizacion`
- (opcional) `asignado_por_id_usuario_uuid` (FK a usuarios) para auditoría

Claves e índices:

- UNIQUE `(id_usuario_uuid, id_permiso)` (un permiso por usuario con un solo efecto vigente)
- Índice `(id_permiso)` para ver quién tiene un permiso

Regla operativa:

- Calcular permisos efectivos con: `(roles ∪ allow) − deny` (ver sección 5.2.1)

### 9.3 Catálogo de endpoints protegidos (método + patrón)

Problema a resolver:

- `rutas_protegidas.ruta` no distingue `GET` vs `POST`, ni expresa bien patrones como `/productos/:id/precio`.

Opción A (recomendada): crear tablas nuevas explícitas para endpoints

- `api_endpoints`: `id_endpoint`, `method`, `path_pattern`, `descripcion`, `estado`, timestamps
- `api_endpoints_permisos`: `id_endpoint`, `id_permiso`, `estado`, timestamps

Opción B (si prefieres no crear nuevas): evolucionar las existentes

- Agregar columnas `method` y `path_pattern` a `rutas_protegidas` (o redefinir `ruta` como `path_pattern`)
- Actualizar `rutas_permisos` para que apunte a esa definición

Regla:

- Cada endpoint que expone CRUD o campos sensibles debe tener su requisito de permisos en BD.

### 9.4 Permisos por campo (catálogo y mapping)

Crear:

- `recursos_campos`: `id_campo`, `recurso`, `campo`, `descripcion`, `estado`, timestamps
- `campos_permisos`: `id_campo`, `id_permiso`, `estado`, timestamps

Uso:

- Permite que el panel muestre claramente: “Para modificar `productos.precio_venta` se requiere `productos:price:update`”.
- Se alinea con endpoints separados (ej. `PATCH /productos/:id/precio`).

### 9.5 Menús derivados de permisos (opcional pero recomendado)

Crear:

- `menus_items_permisos`: `id_menu_item`, `id_permiso`, `estado`, timestamps

Regla:

- Un usuario ve un menú si sus **permisos efectivos** cubren los permisos requeridos por ese `menu_item`.

### 9.6 Auditoría de autorizaciones (muy recomendado)

Crear:

- `authz_audit_log`

Campos típicos:

- `id_log`, `id_usuario_uuid`, `method`, `path`, `endpoint_match`, `decision` (allow/deny), `fecha`
- (opcional) `permisos_requeridos` (texto/JSON) e IP/User-Agent

Finalidad:

- Permite explicar “por qué” un usuario fue bloqueado o permitido desde el panel.

### 9.7 Especificación de tablas nuevas (campos y tipos sugeridos)

Nota:

- Confirmado por `DESCRIBE usuarios`: `usuarios.id_usuario_uuid` es `BINARY(16)` (PK, NOT NULL, `DEFAULT_GENERATED`).
- En queries, el backend puede exponerlo como texto usando `HEX(id_usuario_uuid)` y recibirlo de vuelta con `UNHEX(?)`.

#### `usuarios_roles`

- `id_usuario_uuid` BINARY(16) NOT NULL (FK → `usuarios.id_usuario_uuid`)
- `id_rol` TINYINT UNSIGNED NOT NULL (FK → `roles.id_rol`)
- `estado` TINYINT NOT NULL DEFAULT 1
- `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
- `asignado_por_id_usuario_uuid` BINARY(16) NULL (FK → `usuarios.id_usuario_uuid`) (opcional)

Claves:

- PRIMARY KEY (`id_usuario_uuid`, `id_rol`)

#### `usuarios_permisos`

- `id_usuario_uuid` BINARY(16) NOT NULL (FK → `usuarios.id_usuario_uuid`)
- `id_permiso` INT UNSIGNED NOT NULL (FK → `permisos.id_permiso`)
- `efecto` ENUM('allow','deny') NOT NULL
- `estado` TINYINT NOT NULL DEFAULT 1
- `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
- `asignado_por_id_usuario_uuid` BINARY(16) NULL (FK → `usuarios.id_usuario_uuid`) (opcional)

Claves:

- PRIMARY KEY (`id_usuario_uuid`, `id_permiso`)

#### `api_endpoints`

- `id_endpoint` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `method` ENUM('GET','POST','PUT','PATCH','DELETE') NOT NULL
- `path_pattern` VARCHAR(255) NOT NULL
- `descripcion` VARCHAR(255) NULL
- `estado` TINYINT NOT NULL DEFAULT 1
- `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

Claves:

- UNIQUE (`method`, `path_pattern`)

#### `api_endpoints_permisos`

- `id_endpoint` INT UNSIGNED NOT NULL (FK → `api_endpoints.id_endpoint`)
- `id_permiso` INT UNSIGNED NOT NULL (FK → `permisos.id_permiso`)
- `estado` TINYINT NOT NULL DEFAULT 1
- `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

Claves:

- PRIMARY KEY (`id_endpoint`, `id_permiso`)

#### `recursos_campos`

- `id_campo` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `recurso` VARCHAR(64) NOT NULL (ej. `productos`)
- `campo` VARCHAR(64) NOT NULL (ej. `precio`, `costo`, `fraccion`)
- `tipo_dato` VARCHAR(32) NULL (opcional, ej. `decimal(10,2)`)
- `es_sensible` TINYINT NOT NULL DEFAULT 0
- `descripcion` VARCHAR(255) NULL
- `estado` TINYINT NOT NULL DEFAULT 1
- `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

Claves:

- UNIQUE (`recurso`, `campo`)

#### `campos_permisos`

- `id_campo` INT UNSIGNED NOT NULL (FK → `recursos_campos.id_campo`)
- `id_permiso` INT UNSIGNED NOT NULL (FK → `permisos.id_permiso`)
- `estado` TINYINT NOT NULL DEFAULT 1
- `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

Claves:

- PRIMARY KEY (`id_campo`, `id_permiso`)

#### `menus_items_permisos` (opcional)

- `id_menu_item` INT UNSIGNED NOT NULL (FK → `menus_items.id_menu_item`)
- `id_permiso` INT UNSIGNED NOT NULL (FK → `permisos.id_permiso`)
- `estado` TINYINT NOT NULL DEFAULT 1
- `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

Claves:

- PRIMARY KEY (`id_menu_item`, `id_permiso`)

#### `authz_audit_log` (opcional pero recomendado)

- `id_log` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `id_usuario_uuid` BINARY(16) NULL (FK → `usuarios.id_usuario_uuid`) (NULL si request no autenticada)
- `method` VARCHAR(10) NOT NULL
- `path` VARCHAR(255) NOT NULL
- `id_endpoint` INT UNSIGNED NULL (FK → `api_endpoints.id_endpoint`)
- `decision` ENUM('allow','deny') NOT NULL
- `permisos_requeridos` JSON NULL (o TEXT si prefieres compatibilidad)
- `ip` VARCHAR(45) NULL
- `user_agent` VARCHAR(255) NULL
- `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
