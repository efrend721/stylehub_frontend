# Script SQL para limpiar datos incorrectos

## Problema encontrado:
- El campo `id_establecimiento` se guardó como la cadena "undefined" en lugar del valor real
- Esto ocurrió porque la interfaz del frontend esperaba `id` pero la API devuelve `id_establecimiento`

## SQL para limpiar el registro problemático:

```sql
-- Ver el registro problemático
SELECT * FROM usuarios WHERE id_establecimiento = 'undefined';

-- Opción 1: Eliminar el registro problemático
DELETE FROM usuarios WHERE id_establecimiento = 'undefined';

-- Opción 2: Corregir el registro (si se conoce el establecimiento correcto)
-- UPDATE usuarios 
-- SET id_establecimiento = 'EST001' 
-- WHERE id_establecimiento = 'undefined' AND usuario_acceso = 'pruebauno';

-- Verificar que ya no hay registros con 'undefined'
SELECT * FROM usuarios WHERE id_establecimiento = 'undefined';
```

## Cambios realizados en el código:

1. ✅ **Corregida interfaz EstablecimientoSelect**: `id` → `id_establecimiento`
2. ✅ **Corregido mapeo en MenuItem**: `est.id` → `est.id_establecimiento`  
3. ✅ **Agregado renderValue**: Muestra el nombre del establecimiento seleccionado
4. ✅ **Protección contra undefined**: `nuevoUsuario.id_establecimiento?.trim() || null`
5. ✅ **Logging mejorado**: Debug detallado de cambios en establecimientos

## Verificar funcionamiento:

1. Crear un nuevo usuario
2. Seleccionar establecimiento "Spa Belleza Total" (EST001)
3. Verificar en BD que se guarde "EST001" y no "undefined"