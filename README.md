# 💅 StyleHub - Gestión de Salones de Belleza y Spa

**StyleHub** es una aplicación web moderna para la gestión integral de salones de belleza y spa, desarrollada con las mejores prácticas de arquitectura y tecnologías de vanguardia.

## ✨ Características Principales

- 🎨 **Interfaz moderna** con Material-UI y Styled Components
- 👥 **Gestión de clientes** y sus historiales
- 📅 **Sistema de citas** inteligente
- ✂️ **Catálogo de servicios** (cortes, tratamientos, spa)
- 💰 **Control de ingresos** y métricas en tiempo real
- 📊 **Dashboard analítico** con estadísticas del negocio
- 🔐 **Sistema de autenticación** seguro
- 📱 **Diseño responsive** para todos los dispositivos

## 🏗️ Arquitectura

Este proyecto implementa **Clean Architecture** con los siguientes patrones:

- ✅ **Barrel Exports** - Imports organizados y limpios
- ✅ **Custom Hooks** - Lógica reutilizable y separada
- ✅ **Container Pattern** - Separación de lógica y presentación
- ✅ **Feature-based Structure** - Organización por dominios de negocio

## 🛠️ Tecnologías

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI)
- **Styling**: Styled Components + Emotion
- **Routing**: React Router DOM
- **State Management**: React Context + Custom Hooks
- **Icons**: Material-UI Icons
- **Package Manager**: pnpm

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Configuración de la aplicación
│   ├── config/            # Configuraciones (MUI theme, etc.)
│   ├── providers/         # Providers globales (Auth, Theme)
│   └── routes/            # Configuración de rutas
├── common/                # Código compartido
│   ├── components/        # Componentes reutilizables
│   ├── hooks/            # Custom hooks globales
│   ├── types/            # Tipos TypeScript globales
│   └── utils/            # Utilidades y helpers
└── features/             # Funcionalidades por dominio
    ├── auth/             # Autenticación
    │   ├── components/   # Componentes de auth
    │   ├── hooks/        # Hooks específicos
    │   ├── pages/        # Páginas de auth
    │   └── types/        # Tipos de auth
    └── dashboard/        # Panel principal
        ├── components/   # Componentes del dashboard
        ├── hooks/        # Hooks del dashboard
        └── pages/        # Páginas del dashboard
```

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+ 
- pnpm (recomendado) o npm

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/efrend721/stylehub_frontend.git
cd stylehub_frontend

# Instalar dependencias
pnpm install

# Ejecutar en modo desarrollo
pnpm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Comandos Disponibles

```bash
pnpm run dev          # Servidor de desarrollo
pnpm run build        # Build para producción
pnpm run preview      # Vista previa del build
pnpm run lint         # Linter
pnpm run type-check   # Verificación de tipos TypeScript
```

## 🎨 Características de UI/UX

- **Logo personalizado** con iconos de spa y tijeras
- **Tema consistente** con gradientes y sombras elegantes
- **AppBar con búsqueda** integrada
- **Sidebar persistente** con navegación intuitiva
- **Cards interactivas** con efectos hover
- **Formularios estilizados** con validación visual
- **Responsive design** para móviles y desktop

## 🔐 Autenticación

Sistema de autenticación con:
- Login/logout seguro
- Rutas protegidas
- Context API para estado global
- Persistencia de sesión

## 📊 Dashboard

Panel de control con métricas específicas para salones:
- **Clientes registrados**
- **Servicios disponibles**  
- **Ingresos diarios**
- **Citas programadas**

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📝 Licencia

Este proyecto está bajo la licencia MIT. Ver archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Efrén** - [@efrend721](https://github.com/efrend721)

---

⭐ ¡Dale una estrella al proyecto si te ha sido útil!
