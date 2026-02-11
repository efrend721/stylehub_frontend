# 🎭 **CRUD ROLES - DOCUMENTACIÓN COMPLETA**

## 📋 **Descripción General**

Sistema completo de gestión de roles para control de acceso y permisos en StyleHub. Permite crear, leer, actualizar y eliminar roles con validación robusta y manejo de errores centralizado.

## 🗃️ **Estructura de la Tabla**

```sql
CREATE TABLE roles (
    id_rol TINYINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(100),
    estado TINYINT DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_roles_estado (estado),
    INDEX idx_roles_nombre (nombre)
);
```

## 🛠️ **Campos de la Tabla**

| Campo                 | Tipo         | Descripción                           | Validaciones                      |
| --------------------- | ------------ | ------------------------------------- | --------------------------------- |
| `id_rol`              | TINYINT      | ID único del rol (AUTO_INCREMENT)     | Número positivo                   |
| `nombre`              | VARCHAR(50)  | Nombre del rol                        | Requerido, 2-50 caracteres, único |
| `descripcion`         | VARCHAR(100) | Descripción del rol                   | Opcional, máx. 100 caracteres     |
| `estado`              | TINYINT      | Estado del rol (1=Activo, 0=Inactivo) | 0 o 1, default 1                  |
| `fecha_creacion`      | TIMESTAMP    | Fecha de creación                     | Automático                        |
| `fecha_actualizacion` | TIMESTAMP    | Fecha de última actualización         | Automático                        |

## 🚀 **Endpoints Disponibles**

### **BASE URL:** `http://localhost:1234/roles`

### 📋 **1. Obtener Todos los Roles**

GET /roles

**Respuesta Exitosa:**

```json
{
  "success": true,
  "data": [
    {
      "id_rol": 1,
      "nombre": "Super Administrador",
      "descripcion": "Acceso completo al sistema",
      "estado": 1,
      "fecha_creacion": "2025-09-28T10:00:00.000Z",
      "fecha_actualizacion": "2025-09-28T10:00:00.000Z"
    }
  ],
  "message": "Roles obtenidos exitosamente",
  "count": 1
}
```

### ✅ **2. Obtener Roles Activos**

GET /roles/activos

**Descripción:** Retorna únicamente los roles con estado = 1

### 🔍 **3. Obtener Roles por Estado**

GET /roles/estado?estado=1

**Parámetros de consulta:**

- `estado`: 0 (inactivo) o 1 (activo)

### 🔎 **4. Buscar Roles por Nombre**

GET /roles/search?nombre=admin

**Parámetros de consulta:**

- `nombre`: Término de búsqueda (coincidencia parcial)

### 👤 **5. Obtener Rol por ID**

GET /roles/:id

**Parámetros de ruta:**

- `id`: ID numérico del rol

**Respuesta Exitosa:**

```json
{
  "success": true,
  "data": {
    "id_rol": 1,
    "nombre": "Super Administrador",
    "descripcion": "Acceso completo al sistema",
    "estado": 1,
    "fecha_creacion": "2025-09-28T10:00:00.000Z",
    "fecha_actualizacion": "2025-09-28T10:00:00.000Z"
  },
  "message": "Rol obtenido exitosamente"
}
```

### ➕ **6. Crear Nuevo Rol**

POST /roles

**Body (JSON):**

```json
{
  "nombre": "Supervisor",
  "descripcion": "Supervisor de área",
  "estado": 1
}
```

**Campos Requeridos:**

- `nombre`: String (2-50 caracteres)

**Campos Opcionales:**

- `descripcion`: String (máx. 100 caracteres)
- `estado`: Number (0 o 1, default: 1)

**Respuesta Exitosa:**

```json
{
  "success": true,
  "data": {
    "id_rol": 5,
    "nombre": "Supervisor",
    "descripcion": "Supervisor de área",
    "estado": 1,
    "fecha_creacion": "2025-09-28T10:30:00.000Z",
    "fecha_actualizacion": "2025-09-28T10:30:00.000Z"
  },
  "message": "Rol creado exitosamente"
}
```

### 🔄 **7. Actualizar Rol**

PUT /roles/:id

**Body (JSON) - Todos los campos son opcionales:**

```json
{
  "nombre": "Supervisor Actualizado",
  "descripcion": "Descripción actualizada",
  "estado": 0
}
```

> Nota (PBAC / pantalla "Editar rol"):
>
> - El backend usa PBAC: los **menús visibles** de un rol se derivan de sus **permisos** (`roles_permisos`) y de los mapeos `menus_items_permisos`.
> - La UI puede “asignar menús” como una forma de administrar permisos.

### 🧭 **7.1. Obtener árbol de menús asignados a un rol (PBAC)**

GET /roles/:id/menus

**Descripción:** Devuelve el árbol completo de menús marcando qué nodos están asignados (`asignado: true/false`).

### 💾 **7.2. Guardar asignación de menús a un rol (PBAC)**

PUT /roles/:id/menus

**Body (JSON):**

```json
{
  "menu_items": [101, 102, 205]
}
```

**Importante:** en PBAC esto **sincroniza permisos del rol**, no una tabla directa de “rol → menú”.

**PBAC (sin legacy):** `PUT /roles/:id` no acepta `menu_items`. Para asignación de menús/permisos usa únicamente `PUT /roles/:id/menus`.

### 🗑️ **8. Eliminar Rol (Soft Delete)**

DELETE /roles/:id

**Descripción:** Cambia el estado del rol a 0 (inactivo)

**Respuesta Exitosa:**

```json
{
  "success": true,
  "message": "Rol eliminado exitosamente",
  "data": {
    "id_rol": 5
  }
}
```

## ⚠️ **Manejo de Errores**

### **Error 400 - Bad Request**

```json
{
  "success": false,
  "message": "ID de rol inválido",
  "errors": [
    {
      "message": "El ID del rol debe ser un número entero positivo"
    }
  ]
}
```

### **Error 404 - Not Found**

```json
{
  "success": false,
  "message": "Rol no encontrado"
}
```

### **Error 409 - Conflict**

```json
{
  "success": false,
  "message": "Ya existe un rol con este nombre"
}
```

### **Error 500 - Internal Server Error**

```json
{
  "success": false,
  "message": "Error interno del servidor",
  "error": "Descripción técnica del error"
}
```

## 🔧 **Validaciones Implementadas**

### **Validaciones de Entrada**

- ✅ `id_rol`: Número entero positivo (en parámetros de ruta)
- ✅ `nombre`: String requerido, 2-50 caracteres, único
- ✅ `descripcion`: String opcional, máximo 100 caracteres
- ✅ `estado`: Número entero 0 o 1

### **Validaciones de Negocio**

- ✅ Verificación de nombres únicos al crear/actualizar
- ✅ Verificación de existencia del rol antes de actualizar/eliminar
- ✅ Soft delete para preservar integridad referencial

## 🏗️ **Arquitectura del Módulo**

### **Archivos del Sistema**

schemas/roles.js # Validación con Zod
models/mysql/rol.js # Acceso a datos MySQL
controllers/roles.js # Lógica de negocio
routes/roles.js # Definición de rutas
http-requests/roles.http # Pruebas HTTP

### **Métodos del Modelo**

- `getAll()` - Obtener todos los roles
- `getActivos()` - Obtener roles activos
- `getById({ id })` - Obtener por ID
- `getByEstado({ estado })` - Filtrar por estado
- `getByNombre({ nombre })` - Buscar por nombre exacto
- `searchByNombre({ nombre })` - Búsqueda parcial
- `create({ input })` - Crear nuevo rol
- `update({ id, input })` - Actualizar rol
- `delete({ id })` - Soft delete
- `deletePermanent({ id })` - Hard delete

## 🧪 **Casos de Prueba**

### **Pruebas Exitosas**

- ✅ Obtener todos los roles
- ✅ Obtener roles activos/inactivos
- ✅ Buscar roles por nombre
- ✅ Crear rol válido
- ✅ Actualizar rol existente
- ✅ Eliminar rol existente

### **Pruebas de Error**

- ❌ ID inválido (texto, negativo, cero)
- ❌ Nombre muy corto/largo
- ❌ Nombre duplicado
- ❌ Estado inválido
- ❌ Rol no encontrado
- ❌ Parámetros de búsqueda faltantes

## 🎯 **Características Destacadas**

### **✨ Funcionalidades Avanzadas**

- 🔍 **Búsqueda inteligente** por nombre (coincidencia parcial)
- 🎛️ **Filtrado por estado** activo/inactivo
- 🛡️ **Validación robusta** con mensajes en español
- 🔄 **Soft delete** para preservar integridad
- 📊 **Respuestas consistentes** con formato estandarizado

### **🔒 Seguridad y Validación**

- ✅ Validación de tipos de datos
- ✅ Sanitización de entradas
- ✅ Prevención de duplicados
- ✅ Manejo seguro de errores SQL
- ✅ Índices optimizados para rendimiento

### **🚀 Rendimiento**

- ⚡ Consultas optimizadas con índices
- 📈 Paginación implícita (límites de base de datos)
- 🎯 Consultas específicas para casos de uso comunes
- 💾 Conexión reutilizable a base de datos

## 📝 **Notas de Implementación**

### **Consideraciones Especiales**

1. **ID AUTO_INCREMENT**: El campo `id_rol` se genera automáticamente
2. **Nombres únicos**: Se valida unicidad a nivel de aplicación y base de datos
3. **Soft delete**: Los roles eliminados se marcan como inactivos (estado = 0)
4. **Integridad referencial**: Los roles pueden estar referenciados por usuarios

### **Dependencias**

- `mysql2/promise` - Conexión a base de datos
- `zod` - Validación de esquemas
- `express` - Framework web
- Utilidades personalizadas: `ApiResponse`, `Handler`

---

## 🎉 **¡Sistema Roles Completo y Funcional!**

El módulo de roles está completamente implementado siguiendo las mejores prácticas de desarrollo, con validación robusta, manejo de errores centralizado y documentación completa. ¡Listo para integración y uso en producción! 🚀
