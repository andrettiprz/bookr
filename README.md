# 📚 Bookr - Sistema de Agendamiento Premium

> Aplicación web moderna para gestión de reservas y citas, con diseño minimalista ultra premium.

## 🚀 Estado del Proyecto

**Modo Actual:** 🔵 **AZURE** (Listo para desplegar a la nube)

### ✅ Completado

- ✅ Frontend React con Vite
- ✅ Sistema de autenticación local
- ✅ CRUD completo de reservas
- ✅ Diseño minimalista premium
- ✅ Tema oscuro/claro
- ✅ Exportación (CSV, iCal, JSON)
- ✅ Búsqueda y filtros avanzados
- ✅ Estadísticas con gráficos
- ✅ Sistema de categorías
- ✅ Vista lista/cuadrícula
- ✅ Notificaciones Toast
- ✅ Skeleton loaders
- ✅ Responsive design

### ✅ Listo para Deploy

- ✅ Backend Azure Functions configurado
- ✅ Infraestructura Bicep lista
- ✅ Frontend en modo Azure
- ✅ Build compilado exitosamente

## 📁 Estructura del Proyecto

```
bookr/
├── frontend/              # React + Vite
│   ├── src/
│   │   ├── components/   # Componentes reutilizables
│   │   ├── context/      # Context API (Auth, Reservations, Theme, Toast)
│   │   ├── pages/        # Páginas de la app
│   │   ├── services/     # API service (con modo local)
│   │   └── utils/        # Utilidades (export)
│   └── package.json
├── backend/              # Azure Functions API
│   ├── src/
│   │   ├── functions/   # Endpoints (auth, reservations)
│   │   ├── auth.js      # Lógica de autenticación
│   │   ├── database.js  # Conexión SQL
│   │   └── storage.js   # Azure Blob Storage
│   └── package.json
└── templates-params-scrips/
    └── bicep/           # Infrastructure as Code
        ├── modules/     # Módulos Bicep
        ├── deploy.sh    # Script de deployment
        └── cleanup.sh   # Script de limpieza
```

## 🛠️ Instalación y Uso

### Frontend (Modo Local)

```bash
cd frontend
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

**Modo Local Activado:** 
- Los datos se guardan en localStorage
- No requiere backend desplegado
- Perfecto para desarrollo y demo

### Para cambiar a Modo Backend:

Editar `frontend/src/services/api.js`:
```javascript
const USE_LOCAL_MODE = false; // Cambiar a false
```

## 🎨 Diseño

### Paleta de Colores

- **Accent:** `#5B7FFF` (Azul premium)
- **Success:** `#06D6A0` (Verde menta)
- **Warning:** `#FFB347` (Naranja cálido)
- **Error:** `#FF6B6B` (Rojo coral)

### Características de Diseño

- ✨ Swiss Minimalism inspirado en Apple
- ✨ Tipografía: SF Pro Display
- ✨ Espaciado basado en Golden Ratio
- ✨ Sombras ultra sutiles (0.02-0.10)
- ✨ Animaciones suaves con spring easing
- ✨ Glassmorphism refinado

## 🚀 Deployment (Azure)

### Desplegar Infraestructura:

```bash
cd templates-params-scrips/bicep
./deploy.sh
```

Esto desplegará:
- Azure Static Web App (frontend)
- Azure Functions (backend API)
- Azure SQL Database
- Azure Blob Storage

### Configurar Variables de Entorno:

Crear `frontend/.env`:
```env
VITE_API_URL=https://tu-function-app.azurewebsites.net/api
```

## 📊 Funcionalidades

### Autenticación
- Registro de usuarios
- Inicio de sesión
- Persistencia de sesión
- Avatar personalizado

### Reservas
- Crear, editar, eliminar reservas
- Filtrar por estado (todas, próximas, confirmadas, pendientes)
- Búsqueda en tiempo real
- Categorías (trabajo, personal, salud, educación, entretenimiento)
- Vista lista/cuadrícula

### Estadísticas
- Gráfico de barras (reservas por mes)
- Gráfico donut (distribución por estado)
- Métricas en tiempo real

### Exportación
- Exportar a CSV (Excel)
- Exportar a iCal (Google Calendar, Outlook)
- Exportar a JSON

### UX
- Tema oscuro/claro
- Notificaciones toast elegantes
- Skeleton loaders
- Animaciones suaves
- Responsive design

## 🧹 Limpieza Realizada

### Archivos Eliminados:
- ❌ `templates-params-scrips/bookr-app-service/` (ARM templates antiguos)
- ❌ `templates-params-scrips/bookr-sql-db-server/` (ARM templates antiguos)
- ❌ `templates-params-scrips/bookr-webstaticapp/` (ARM templates antiguos)
- ❌ `templates-params-scrips/bookrblobst/` (ARM templates antiguos)
- ❌ `frontend/dist/` (archivos compilados)
- ❌ `frontend/README.md` (redundante)
- ❌ `frontend/src/assets/react.svg` (no usado)
- ❌ `frontend/src/index.css` (redundante)
- ❌ `DEPLOYMENT_GUIDE.md` (redundante)

## 📝 Notas

- **Modo Local:** Perfecto para desarrollo sin necesidad de Azure
- **Contraseña SQL:** `Bookr@2024!SQL` (cambiar en producción)
- **JWT Secret:** Configurado en `main.parameters.json`
- **Resource Group:** `bookr`

## 🔐 Seguridad

⚠️ **IMPORTANTE:** Este proyecto usa localStorage para modo local. En producción:
- Usar backend con Azure Functions
- Hashear contraseñas con bcrypt
- Usar tokens JWT seguros
- Configurar HTTPS
- Validar inputs del lado del servidor

## 📄 Licencia

Proyecto académico - IAC (Infrastructure as Code)

