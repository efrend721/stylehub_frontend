#!/bin/bash

###############################################################################
#
# Script de Despliegue - Vendora ERP
#
# Despliega el backend a 192.168.1.20 y el frontend a 192.168.1.30
#
###############################################################################

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
BACKEND_DIR="$HOME/stylehub_backend"
API_SERVER="vendora-api@192.168.1.20"
API_DIR="/opt/vendora-api"

WEB_DIR="$HOME/stylehub_frontend"  # Ajusta si es diferente
WEB_SERVER="web-proxy01@192.168.1.30"
WEB_DIR_DEST="/var/www/webapp"

###############################################################################
# Funciones
###############################################################################

print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

###############################################################################
# Despliegue del Backend (API)
###############################################################################

deploy_backend() {
    print_header "DESPLEGANDO BACKEND A 192.168.1.20"
    
    # Verificar que existe el directorio
    if [ ! -d "$BACKEND_DIR" ]; then
        print_error "No se encuentra el directorio: $BACKEND_DIR"
        return 1
    fi
    
    cd "$BACKEND_DIR"
    print_info "Directorio: $(pwd)"
    
    # Instalar dependencias
    print_info "Instalando dependencias..."
    pnpm install
    
    # Ejecutar tests (opcional, comentar si no tienes)
    # print_info "Ejecutando tests..."
    # pnpm test
    
    # Build del backend (si es necesario)
    if [ -f "package.json" ] && grep -q '"build"' package.json; then
        print_info "Compilando backend..."
        pnpm build
    fi
    
    # Crear archivo temporal con exclusiones
    cat > /tmp/rsync-exclude.txt << 'EOF'
node_modules/
.git/
.env.local
.env.development
*.log
dist/
build/
coverage/
.DS_Store
*.swp
*.swo
*~
EOF
    
    # Copiar archivos al servidor API
    print_info "Copiando archivos a $API_SERVER:$API_DIR..."
    rsync -avz --delete \
        --exclude-from=/tmp/rsync-exclude.txt \
        --progress \
        ./ $API_SERVER:$API_DIR/
    
    # Instalar dependencias en el servidor remoto
    print_info "Instalando dependencias en servidor API..."
    ssh $API_SERVER "cd $API_DIR && pnpm install --prod"
    
    # Reiniciar el servicio (ajusta el nombre del servicio si es diferente)
    print_info "Reiniciando servicio en API..."
    ssh $API_SERVER "sudo systemctl restart vendora-api || pm2 restart vendora-api || echo 'Reinicia manualmente el servicio'"
    
    print_success "Backend desplegado correctamente"
    rm /tmp/rsync-exclude.txt
}

###############################################################################
# Despliegue del Frontend (Web)
###############################################################################

deploy_frontend() {
    print_header "DESPLEGANDO FRONTEND A 192.168.1.30"
    
    # Verificar que existe el directorio
    if [ ! -d "$WEB_DIR" ]; then
        print_error "No se encuentra el directorio: $WEB_DIR"
        print_warning "Si tu proyecto frontend tiene otro nombre, edita WEB_DIR en el script"
        return 1
    fi
    
    cd "$WEB_DIR"
    print_info "Directorio: $(pwd)"
    
    # Instalar dependencias
    print_info "Instalando dependencias..."
    pnpm install
    
    # Build del frontend
    print_info "Compilando frontend (build de producción)..."
    pnpm build
    
    # Determinar el directorio de salida del build
    BUILD_DIR=""
    if [ -d "dist" ]; then
        BUILD_DIR="dist"
    elif [ -d "build" ]; then
        BUILD_DIR="build"
    elif [ -d ".next" ]; then
        BUILD_DIR=".next"
    elif [ -d "out" ]; then
        BUILD_DIR="out"
    else
        print_error "No se encuentra el directorio de build (dist, build, .next, out)"
        print_info "Contenido del directorio:"
        ls -la
        return 1
    fi
    
    print_info "Directorio de build: $BUILD_DIR"
    
    # Copiar build al servidor web
    print_info "Copiando archivos a $WEB_DIR_DEST..."
    
    # Si es el mismo servidor (localhost)
    if [ "$WEB_SERVER" = "web-proxy01@192.168.1.30" ] && [ "$(hostname)" = "web-proxy01" ]; then
        print_info "Desplegando localmente..."
        sudo rsync -avz --delete \
            --progress \
            $BUILD_DIR/ $WEB_DIR_DEST/
        sudo chown -R www-data:www-data $WEB_DIR_DEST
    else
        # Copiar a servidor remoto
        rsync -avz --delete \
            --progress \
            $BUILD_DIR/ $WEB_SERVER:$WEB_DIR_DEST/
        ssh $WEB_SERVER "sudo chown -R www-data:www-data $WEB_DIR_DEST"
    fi
    
    # Recargar nginx
    print_info "Recargando nginx..."
    if [ "$(hostname)" = "web-proxy01" ]; then
        sudo systemctl reload nginx
    else
        ssh $WEB_SERVER "sudo systemctl reload nginx"
    fi
    
    print_success "Frontend desplegado correctamente"
}

###############################################################################
# Verificar conectividad
###############################################################################

check_connectivity() {
    print_header "VERIFICANDO CONECTIVIDAD"
    
    # Verificar API server
    print_info "Verificando conexión a API (192.168.1.20)..."
    if ssh -o ConnectTimeout=5 $API_SERVER "echo 'Conectado'" 2>/dev/null; then
        print_success "Conexión a API exitosa"
    else
        print_error "No se puede conectar al servidor API"
        print_info "Verifica que puedas conectarte con: ssh $API_SERVER"
        return 1
    fi
    
    # Verificar que existe el directorio remoto
    if ssh $API_SERVER "[ -d $API_DIR ]"; then
        print_success "Directorio $API_DIR existe en servidor API"
    else
        print_warning "Directorio $API_DIR no existe. Creando..."
        ssh $API_SERVER "sudo mkdir -p $API_DIR && sudo chown vendora-api:vendora-api $API_DIR"
    fi
    
    print_success "Verificaciones completadas"
}

###############################################################################
# Menú principal
###############################################################################

show_menu() {
    echo ""
    print_header "DESPLIEGUE VENDORA ERP"
    echo ""
    echo "  1) Desplegar Backend (API → 192.168.1.20)"
    echo "  2) Desplegar Frontend (Web → 192.168.1.30)"
    echo "  3) Desplegar Todo (Backend + Frontend)"
    echo "  4) Verificar Conectividad"
    echo "  5) Salir"
    echo ""
    echo -n "Selecciona una opción: "
}

###############################################################################
# Script principal
###############################################################################

main() {
    # Cargar nvm si es necesario
    if [ -f "$HOME/.nvm/nvm.sh" ]; then
        . "$HOME/.nvm/nvm.sh"
    fi
    
    # Si se pasa argumento desde línea de comandos
    case "$1" in
        backend|api)
            check_connectivity && deploy_backend
            exit $?
            ;;
        frontend|web)
            deploy_frontend
            exit $?
            ;;
        all|full)
            check_connectivity && deploy_backend && deploy_frontend
            exit $?
            ;;
        check)
            check_connectivity
            exit $?
            ;;
    esac
    
    # Menú interactivo
    while true; do
        show_menu
        read -r option
        
        case $option in
            1)
                check_connectivity && deploy_backend
                ;;
            2)
                deploy_frontend
                ;;
            3)
                check_connectivity && deploy_backend && deploy_frontend
                ;;
            4)
                check_connectivity
                ;;
            5)
                print_info "Saliendo..."
                exit 0
                ;;
            *)
                print_error "Opción inválida"
                ;;
        esac
        
        echo ""
        read -p "Presiona Enter para continuar..."
    done
}

# Ejecutar script
main "$@"
