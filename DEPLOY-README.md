# Script de Despliegue - Vendora ERP

Script automatizado para desplegar cambios del backend y frontend de Vendora ERP.

## 📋 Configuración

### Servidores
- **API Backend:** 192.168.1.20 (usuario: vendora-api)
- **Web Frontend:** 192.168.1.30 (usuario: web-proxy01)

### Directorios
- **Backend Dev:** `~/stylehub_backend`
- **Backend Prod:** `/opt/vendora-api` (en 192.168.1.20)
- **Frontend Dev:** `~/stylehub_frontend`
- **Frontend Prod:** `/var/www/webapp` (en 192.168.1.30)

## 🚀 Uso

### Menú Interactivo
```bash
./deploy-vendora.sh
```

### Comandos Directos
```bash
# Desplegar solo backend
./deploy-vendora.sh backend

# Desplegar solo frontend
./deploy-vendora.sh frontend

# Desplegar todo
./deploy-vendora.sh all

# Verificar conectividad
./deploy-vendora.sh check
```

## 📝 Opciones del Menú

1. **Desplegar Backend** - Copia el backend a 192.168.1.20
2. **Desplegar Frontend** - Copia el build de la web a 192.168.1.30
3. **Desplegar Todo** - Backend + Frontend
4. **Verificar Conectividad** - Prueba conexión SSH
5. **Salir**

## ⚙️ Qué Hace el Script

### Backend (API)
1. Instala dependencias (`pnpm install`)
2. Compila el proyecto (`pnpm build`)
3. Copia archivos a 192.168.1.20 usando `rsync`
4. Instala dependencias en producción
5. Reinicia el servicio

### Frontend (Web)
1. Instala dependencias (`pnpm install`)
2. Compila para producción (`pnpm build`)
3. Copia el build a `/var/www/webapp`
4. Ajusta permisos
5. Recarga nginx

## 🔑 Requisitos Previos

### 1. Configurar SSH sin contraseña

Para el servidor API (192.168.1.20):
```bash
# Generar clave SSH si no tienes
ssh-keygen -t ed25519

# Copiar clave al servidor API
ssh-copy-id vendora-api@192.168.1.20
```

### 2. Verificar conexión
```bash
# Probar conexión
ssh vendora-api@192.168.1.20 "echo 'Conectado'"
```

### 3. Asegurar que pnpm está instalado
```bash
# Ya debería estar instalado, verificar:
pnpm -v
```

## 📁 Estructura de Directorios Esperada

### Backend
```
~/stylehub_backend/
├── package.json
├── src/
└── ...
```

### Frontend
```
~/stylehub_frontend/
├── package.json
├── src/
└── dist/ o build/  (después del build)
```

## 🛠️ Personalización

Si tus directorios son diferentes, edita las variables al inicio del script:

```bash
BACKEND_DIR="$HOME/stylehub_backend"  # Tu directorio backend
WEB_DIR="$HOME/stylehub_frontend"     # Tu directorio frontend
```

## 📋 Archivos Excluidos del Despliegue

El script automáticamente excluye:
- `node_modules/`
- `.git/`
- `.env.local`
- `*.log`
- `dist/`, `build/`
- Archivos temporales

## 🔧 Solución de Problemas

### Error: "No se puede conectar al servidor API"
```bash
# Verificar conectividad
ping 192.168.1.20
ssh vendora-api@192.168.1.20
```

### Error: "Directorio no encontrado"
```bash
# Asegúrate de que el directorio existe
ls ~/stylehub_backend
ls ~/stylehub_frontend
```

### Error: "pnpm: command not found"
```bash
# Cargar nvm y verificar pnpm
. ~/.nvm/nvm.sh
pnpm -v
```

## 📊 Log de Despliegues

Para mantener un registro de despliegues:
```bash
./deploy-vendora.sh all 2>&1 | tee -a ~/deploy.log
```

## 🚨 Importante

- **Siempre haz backup** antes de desplegar
- **Prueba en desarrollo** antes de producción
- El script usa `--delete` en rsync (elimina archivos que no están en origen)
- Revisa los logs después de cada despliegue

## 📞 Soporte

Para modificar el script o agregar funcionalidades:
```bash
nano ~/deploy-vendora.sh
```

## 🎯 Ejemplo de Flujo Completo

```bash
# 1. Desarrollar cambios
cd ~/stylehub_backend
# ... hacer cambios ...

# 2. Probar localmente
pnpm dev

# 3. Desplegar
cd ~
./deploy-vendora.sh backend

# 4. Verificar
curl http://192.168.1.20:3000/api/health
```

---

**Ubicación del script:** `/home/web-proxy01/deploy-vendora.sh`  
**Última actualización:** 11 de Enero de 2026
