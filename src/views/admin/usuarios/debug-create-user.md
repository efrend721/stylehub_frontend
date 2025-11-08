# Debug: Crear Usuario - Error 500

## Datos que se están enviando:
```json
{
  "usuario_acceso": "jperez002",
  "contrasena": "MiPassword123", 
  "nombre_usuario": "Mario",
  "apellido_usuario": "Lopez Castro",
  "telefono": "1234567890",
  "correo_electronico": "mario.lopez@stylehub.com",
  "id_rol": 2,
  "id_establecimiento": "EST001",
  "estado": 1
}
```

## Posibles causas del error 500:

1. **Campo duplicado**: `usuario_acceso` ya existe en la BD
2. **Formato de datos**: Algún campo no coincide con el esquema de la BD
3. **Restricciones de BD**: Violación de foreign keys o constraints
4. **Campos faltantes**: El backend espera campos adicionales
5. **Validación de backend**: Reglas de negocio que fallan

## Campos a verificar:

- `id_establecimiento`: ¿Existe "EST001" en la tabla establecimientos?
- `id_rol`: ¿Existe el rol con ID 2?
- `usuario_acceso`: ¿Ya existe "jperez002"?
- `correo_electronico`: ¿Ya existe "mario.lopez@stylehub.com"?

## Cambios realizados para debug:

1. ✅ Validación de datos en frontend
2. ✅ Logging detallado de request/response
3. ✅ Transformación de datos (trim, números)
4. ✅ Manejo de errores JSON mejorado
5. ✅ Teléfono como opcional (null si vacío)

## Próximos pasos:

1. Revisar logs de la consola del navegador
2. Verificar response del servidor (mensaje de error específico)
3. Comprobar si hay campos únicos en conflicto
4. Verificar foreign keys en BD