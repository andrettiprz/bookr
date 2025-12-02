# MEGA PROMPT - PLAN DE ASEGURAMIENTO DE CALIDAD v0.3
## PLATAFORMA DE AGENDAMIENTO UNIVERSAL EN LA NUBE (SaaS)

---

## 📋 INFORMACIÓN DEL PROYECTO

**Institución:** CENTRO DE ENSEÑANZA TÉCNICA Y SUPERIOR  
**Escuela:** Escuela de Ingeniería  
**Materia:** Aseguramiento de Calidad  
**Profesor:** Aaron Daniel Rivera Ponce  
**Estudiante:** Andretti Quiroz Pérez  
**Matrícula:** e012913  
**Proyecto:** PLATAFORMA DE AGENDAMIENTO UNIVERSAL EN LA NUBE (SaaS)  
**Nombre del Sistema:** Bookr - Sistema de Reservas Automático y Escalable  

---

## 🎯 OBJETIVO DE ESTA ACTIVIDAD

Desarrollar la versión 0.3 del Plan de Aseguramiento de Calidad (Plan QA) que incluya:
1. **Metas SMART priorizadas** (3-5 metas)
2. **Riesgos e implicaciones** de cada meta
3. **Estrategias QA específicas** por meta
4. **Matriz de Trazabilidad QA** completa (metas ↔ funciones ↔ escenarios ↔ evidencia)
5. **Responsables y herramientas** para cada escenario
6. **Reflexión final** (4-6 líneas)

---

## 🏗️ ARQUITECTURA TÉCNICA ACTUAL

### **Infraestructura desplegada en Azure**

#### **1. Frontend - Azure Static Web App**
- **Servicio:** Azure Static Web Apps
- **Nombre:** `bookr-static-web` 
- **URL:** https://delightful-river-00afab01e.3.azurestaticapps.net
- **Tecnología:** React 18 + Vite
- **Deployment:** GitHub Actions (CI/CD automático)
- **SKU:** Free Tier
- **Estado:** ✅ Desplegado y funcional

#### **2. Backend API - Azure Functions**
- **Servicio:** Azure Function App (Consumption Plan - Windows)
- **Nombre:** `bookr-api`
- **URL:** https://bookr-api.azurewebsites.net
- **Runtime:** Node.js 18
- **Funciones desplegadas:**
  - `/api/reservations` - CRUD de reservaciones (GET, POST, PUT, DELETE)
  - `/api/initdb` - Inicialización de base de datos
  - `/api/health` - Health check
- **SKU:** Consumption (serverless)
- **Estado:** ✅ Desplegado (modo fallback a local por issues de conectividad)

#### **3. Base de Datos - Azure SQL Database**
- **Servicio:** Azure SQL Database
- **Nombre Servidor:** `bookr-sql-server.database.windows.net`
- **Nombre BD:** `bookr-db`
- **Usuario Admin:** `bookradmin`
- **Tier:** Free Limit (hasta 32 GB)
- **Esquema:**
  - Tabla `Users` (GUID, nombre, email, fecha creación)
  - Tabla `Reservations` (GUID, título, descripción, fecha, hora, duración, ubicación, estado, color, imageUrl, userId)
  - Tabla `ReservationAttendees` (GUID, reservationId, nombre, email)
- **Firewall:** Configurado para Azure Services + IP específicas
- **Estado:** ✅ Desplegado y accesible

#### **4. Storage - Azure Blob Storage**
- **Servicio:** Azure Storage Account
- **Nombre:** `bookrblobst`
- **Tipo:** StorageV2 (general purpose v2)
- **Redundancia:** LRS (Locally Redundant Storage)
- **Uso previsto:** Almacenamiento de imágenes de reservaciones
- **SKU:** Standard
- **Estado:** ✅ Desplegado (no implementado en frontend aún)

#### **5. Infraestructura como Código (IaC)**
- **Herramienta:** Azure Bicep
- **Ubicación:** `templates-params-scrips/bicep/`
- **Módulos:**
  - `storage.bicep` - Storage Account
  - `sqlServer.bicep` - SQL Server + Database
  - `staticWebApp.bicep` - Static Web App
  - `functionApp.bicep` - Function App
  - `main.bicep` - Orquestador principal
- **Script de Deployment:** `deploy.sh` (Bash)
- **Características del deployment:**
  - ✅ Crea Resource Group automáticamente
  - ✅ Despliega toda la infraestructura con Bicep
  - ✅ Instala dependencias del backend (`npm install`)
  - ✅ Publica el código del backend (`func azure functionapp publish`)
  - ✅ Inicializa la base de datos con `schema.sql`
  - ✅ Configura GitHub Secrets automáticamente para CI/CD
  - ✅ Un solo comando: `./deploy.sh` → Todo desplegado

---

## 💻 FUNCIONALIDADES IMPLEMENTADAS

### **Frontend (React)**

#### **Características principales:**
1. **Gestión de Reservaciones (CRUD completo)**
   - ✅ Crear nueva reservación (título, descripción, fecha, hora, duración, ubicación, color, imagen)
   - ✅ Listar todas las reservaciones del usuario demo
   - ✅ Editar reservación existente
   - ✅ Eliminar reservación
   - ✅ Ver detalle de reservación

2. **Interfaz de Usuario**
   - ✅ Diseño minimalista premium (Swiss-inspired)
   - ✅ Tema claro/oscuro (Dark Mode)
   - ✅ Componentes reutilizables (Button, Card, Input, etc.)
   - ✅ Animaciones y transiciones suaves
   - ✅ Responsive design (mobile, tablet, desktop)
   - ✅ Sistema de notificaciones (Toast)
   - ✅ Loading states (Skeleton screens)

3. **Búsqueda y Filtros**
   - ✅ Búsqueda por título y descripción
   - ✅ Filtro por estado (Pendiente, Confirmada, Cancelada, Completada)
   - ✅ Filtro por fecha (Todas, Hoy, Esta semana, Este mes)
   - ✅ Ordenamiento (Fecha ↑↓, Título A-Z)

4. **Vistas y Visualización**
   - ✅ Vista de lista (detallada)
   - ✅ Vista de grid (tarjetas)
   - ✅ Dashboard con estadísticas
   - ✅ Gráficos de estado de reservaciones

5. **Exportación de Datos**
   - ✅ Exportar a CSV
   - ✅ Exportar a JSON
   - ✅ Exportar a iCalendar (.ics)

6. **Categorización**
   - ✅ Tags/categorías por reservación
   - ✅ Colores personalizados por categoría

#### **Páginas implementadas:**
- `/` - Dashboard (estadísticas y overview)
- `/reservations` - Lista/Grid de reservaciones
- `/reservations/new` - Formulario de nueva reservación
- `/reservations/:id/edit` - Formulario de edición

#### **Modo de Operación Actual:**
- **Modo Local:** Frontend usa `localStorage` del navegador para persistencia de datos
- **Razón:** Backend desplegado tiene issues de conectividad con SQL Database (timeout en conexiones)
- **Modo Azure:** Implementado pero desactivado temporalmente (`USE_LOCAL_MODE = true`)

### **Backend (Azure Functions - Node.js)**

#### **Funciones implementadas:**

1. **`/api/reservations` (GET, POST, PUT, DELETE)**
   - Maneja todo el CRUD de reservaciones
   - Conexión a Azure SQL Database
   - CORS configurado para Static Web App
   - User ID fijo para demo: `00000000-0000-0000-0000-000000000001`
   - Validación de datos de entrada
   - Manejo de errores y respuestas JSON

2. **`/api/initdb` (POST)**
   - Inicializa el esquema de la base de datos
   - Crea tablas si no existen
   - Inserta usuario demo inicial
   - Solo para setup inicial

3. **`/api/health` (GET)**
   - Health check básico del Function App
   - Retorna status 200 con mensaje de éxito

#### **Configuración:**
- `host.json` - CORS configurado para todos los orígenes
- `package.json` - Dependencias: `mssql`, `azure-storage`, `dotenv`
- Variables de entorno (App Settings):
  - `SQL_SERVER` - Servidor SQL
  - `SQL_DATABASE` - Nombre de la BD
  - `SQL_USER` - Usuario admin
  - `SQL_PASSWORD` - Contraseña
  - `STORAGE_CONNECTION_STRING` - Connection string de Blob Storage

### **Base de Datos (SQL Server)**

#### **Esquema actual:**

```sql
-- Tabla Users
CREATE TABLE [dbo].[Users] (
    [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [Name] NVARCHAR(100) NOT NULL,
    [Email] NVARCHAR(255) NOT NULL UNIQUE,
    [CreatedAt] DATETIME2 DEFAULT GETDATE()
);

-- Tabla Reservations
CREATE TABLE [dbo].[Reservations] (
    [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [UserId] UNIQUEIDENTIFIER NOT NULL,
    [Title] NVARCHAR(200) NOT NULL,
    [Description] NVARCHAR(MAX),
    [Date] DATE NOT NULL,
    [Time] TIME NOT NULL,
    [Duration] INT NOT NULL, -- en minutos
    [Location] NVARCHAR(255),
    [Status] NVARCHAR(50) DEFAULT 'Pendiente',
    [Color] NVARCHAR(7) DEFAULT '#3B82F6',
    [ImageUrl] NVARCHAR(500),
    [CreatedAt] DATETIME2 DEFAULT GETDATE(),
    [UpdatedAt] DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id]) ON DELETE CASCADE
);

-- Tabla ReservationAttendees
CREATE TABLE [dbo].[ReservationAttendees] (
    [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [ReservationId] UNIQUEIDENTIFIER NOT NULL,
    [Name] NVARCHAR(100) NOT NULL,
    [Email] NVARCHAR(255) NOT NULL,
    FOREIGN KEY ([ReservationId]) REFERENCES [dbo].[Reservations]([Id]) ON DELETE CASCADE
);

-- Índices para optimización
CREATE INDEX IX_Reservations_UserId ON [dbo].[Reservations]([UserId]);
CREATE INDEX IX_Reservations_Date ON [dbo].[Reservations]([Date]);
CREATE INDEX IX_ReservationAttendees_ReservationId ON [dbo].[ReservationAttendees]([ReservationId]);
```

---

## 🚨 PROBLEMAS TÉCNICOS IDENTIFICADOS (CONTEXTO IMPORTANTE)

### **1. Conectividad Backend ↔ SQL Database**
- **Issue:** Timeouts en conexiones desde Azure Functions a SQL Database
- **Error:** `Failed to connect to bookr-sql-server.database.windows.net:1433 in 15000ms`
- **Intentos de solución:**
  - ✅ Firewall configurado para Azure Services (`0.0.0.0 - 0.0.0.0`)
  - ✅ Public Network Access habilitado
  - ✅ Connection string validado
  - ✅ Function App puede resolver DNS del servidor SQL
  - ❌ Aún presenta timeouts intermitentes
- **Workaround actual:** Frontend en modo local (`localStorage`)

### **2. CI/CD - GitHub Actions**
- **Estado:** Funcional pero requiere configuración manual de secrets
- **Workflow:** `.github/workflows/azure-static-web-apps-*.yml`
- **Secret requerido:** `AZURE_STATIC_WEB_APPS_API_TOKEN_*`
- **Solución:** `deploy.sh` lo configura automáticamente con `gh CLI`

### **3. Autenticación/Autorización**
- **Estado:** Removida del sistema para simplificar demo
- **Razón:** Enfoque en funcionalidad de reservaciones
- **User ID Demo:** Hardcodeado en backend y frontend

---

## 📊 METAS SMART PROPUESTAS (v0.2 → v0.3)

### **Meta SMART 1: Disponibilidad del Sistema**
**Descripción:**  
Garantizar que la aplicación web (Frontend en Azure Static Web App) tenga una disponibilidad del 99% durante 30 días consecutivos, medida mediante monitoreo automatizado de uptime.

- **Specific:** Disponibilidad de la Static Web App
- **Measurable:** 99% de uptime (máximo 7.2 horas de downtime en 30 días)
- **Achievable:** Azure Static Web Apps tiene SLA de 99.95% en plan estándar
- **Relevant:** Crítico para usuarios que dependen del sistema de reservaciones
- **Time-bound:** 30 días consecutivos
- **Prioridad:** 🔴 ALTA
- **Riesgo:** Si cae la disponibilidad, los usuarios no pueden crear/consultar reservaciones

### **Meta SMART 2: Tiempo de Respuesta del Backend**
**Descripción:**  
Lograr que el 95% de las peticiones al backend API (Azure Functions) respondan en menos de 2 segundos bajo carga normal (10-50 usuarios concurrentes), medido con herramientas de testing de carga.

- **Specific:** Tiempo de respuesta de endpoints del backend
- **Measurable:** 95% de requests < 2 segundos (P95 latency)
- **Achievable:** Azure Functions Consumption Plan puede manejar esta carga
- **Relevant:** UX depende de respuestas rápidas
- **Time-bound:** Medido en ventana de 7 días
- **Prioridad:** 🔴 ALTA
- **Riesgo:** Cold starts en Functions pueden aumentar latencia inicial

### **Meta SMART 3: Integridad de Datos en Base de Datos**
**Descripción:**  
Asegurar que el 100% de las operaciones CRUD de reservaciones mantengan la integridad referencial y constraints de la base de datos, sin pérdida de datos, validado mediante pruebas unitarias y de integración.

- **Specific:** Integridad de datos en operaciones CRUD
- **Measurable:** 0 errores de constraint, 0 pérdida de datos
- **Achievable:** SQL Database con transacciones ACID
- **Relevant:** Datos de reservaciones son críticos para el negocio
- **Time-bound:** En cada deployment y durante 14 días de operación
- **Prioridad:** 🔴 ALTA
- **Riesgo:** Pérdida de datos = pérdida de confianza del usuario

### **Meta SMART 4: Despliegue Automatizado (IaC)**
**Descripción:**  
Lograr que el 100% de la infraestructura Azure se despliegue correctamente mediante el script `deploy.sh` (Bicep) en menos de 15 minutos, sin intervención manual, validado en 3 deployments consecutivos.

- **Specific:** Deployment automatizado con Bicep
- **Measurable:** 3/3 deployments exitosos, < 15 minutos cada uno
- **Achievable:** Script ya implementado y funcional
- **Relevant:** Requisito clave de la materia (IaC)
- **Time-bound:** 3 pruebas en 7 días
- **Prioridad:** 🟡 MEDIA
- **Riesgo:** Fallo en deployment = proyecto no reproducible

### **Meta SMART 5: Cobertura de Pruebas Funcionales**
**Descripción:**  
Alcanzar una cobertura del 80% de las funcionalidades críticas del sistema (CRUD de reservaciones, búsqueda, filtros, exportación) mediante pruebas manuales documentadas y automatizadas, en 10 días hábiles.

- **Specific:** Cobertura de pruebas de funcionalidades
- **Measurable:** 80% de features críticas probadas y documentadas
- **Achievable:** Funcionalidades ya implementadas
- **Relevant:** QA requiere validación sistemática
- **Time-bound:** 10 días hábiles
- **Prioridad:** 🟡 MEDIA
- **Riesgo:** Bugs sin detectar en producción

---

## ⚠️ RIESGOS E IMPLICACIONES DETALLADAS

### **Riesgo 1: Fallo de Conectividad Backend ↔ Database**
- **Probabilidad:** 🔴 ALTA (ya ocurriendo)
- **Impacto:** 🔴 CRÍTICO
- **Descripción:** Timeouts intermitentes en conexiones desde Azure Functions a SQL Database
- **Implicaciones:**
  - Frontend debe operar en modo local (localStorage)
  - Backend desplegado pero no funcional
  - No se valida integración completa Azure
  - Pérdida de datos centralizados
- **Estrategia de mitigación:**
  - Revisar configuración de red (VNET, Private Endpoints)
  - Aumentar timeout de conexión en `mssql` driver
  - Considerar Azure SQL Managed Instance
  - Implementar retry logic en backend

### **Riesgo 2: Cold Start en Azure Functions**
- **Probabilidad:** 🟡 MEDIA
- **Impacto:** 🟡 MEDIO
- **Descripción:** Primera petición después de inactividad tarda 3-5 segundos
- **Implicaciones:**
  - UX degradada en primera interacción
  - Timeouts en frontend si no se maneja correctamente
  - Percepción de lentitud del sistema
- **Estrategia de mitigación:**
  - Implementar warming strategy (ping periódico)
  - Considerar upgrade a Premium Plan (always-on)
  - Mostrar loading states en frontend
  - Cachear respuestas comunes

### **Riesgo 3: Límites del Free Tier**
- **Probabilidad:** 🟡 MEDIA
- **Impacto:** 🟡 MEDIO
- **Descripción:** Azure Free Tier tiene límites de:
  - SQL Database: 32 GB storage
  - Functions: 1M requests/mes, 400,000 GB-s compute
  - Static Web Apps: 100 GB bandwidth/mes
- **Implicaciones:**
  - Sistema puede dejar de funcionar si se exceden límites
  - Costos inesperados si se pasa a tier de pago
  - No adecuado para producción a escala
- **Estrategia de mitigación:**
  - Monitorear consumo con Azure Cost Management
  - Implementar throttling en backend
  - Documentar que es un prototipo/demo

### **Riesgo 4: Seguridad - Credenciales en Código**
- **Probabilidad:** 🔴 ALTA
- **Impacto:** 🔴 ALTO
- **Descripción:** Contraseñas hardcodeadas en `main.parameters.json` y scripts
- **Implicaciones:**
  - Credenciales expuestas en repositorio Git
  - Vulnerabilidad de seguridad crítica
  - No cumple mejores prácticas de seguridad
- **Estrategia de mitigación:**
  - Usar Azure Key Vault para secretos
  - Variables de entorno en CI/CD
  - .gitignore para archivos de parámetros
  - Rotar credenciales después de exposición

### **Riesgo 5: Falta de Validación de Datos**
- **Probabilidad:** 🟡 MEDIA
- **Impacto:** 🟡 MEDIO
- **Descripción:** Frontend y backend tienen validación mínima de inputs
- **Implicaciones:**
  - Posibles SQL Injection (aunque `mssql` parametriza)
  - Datos inconsistentes en BD
  - Errores 500 en backend con datos malformados
- **Estrategia de mitigación:**
  - Implementar validación con Joi o Yup en backend
  - Validación client-side en formularios
  - Sanitización de inputs
  - Rate limiting en API

### **Riesgo 6: Falta de Logging y Observabilidad**
- **Probabilidad:** 🟡 MEDIA
- **Impacto:** 🟡 MEDIO
- **Descripción:** Logging básico en Functions, sin APM o monitoring avanzado
- **Implicaciones:**
  - Difícil debuggear errores en producción
  - No hay métricas de performance detalladas
  - Imposible rastrear user journeys
- **Estrategia de mitigación:**
  - Habilitar Application Insights para Functions
  - Implementar structured logging
  - Dashboards en Azure Monitor
  - Alertas proactivas

---

## 🧪 ESTRATEGIAS DE ASEGURAMIENTO DE CALIDAD

### **Estrategia QA 1: Pruebas de Disponibilidad (Uptime Monitoring)**
- **Meta asociada:** Meta SMART 1
- **Tipo:** Monitoreo continuo
- **Herramientas:** 
  - Azure Application Insights (Availability Tests)
  - UptimeRobot (external monitoring)
  - GitHub Actions (scheduled health checks)
- **Frecuencia:** Cada 5 minutos
- **Criterio de éxito:** 99% uptime en 30 días
- **Responsable:** DevOps / QA

### **Estrategia QA 2: Pruebas de Carga y Rendimiento**
- **Meta asociada:** Meta SMART 2
- **Tipo:** Performance testing
- **Herramientas:**
  - `oha` (HTTP load testing tool)
  - Apache JMeter
  - Azure Load Testing
- **Escenarios:**
  - 10 usuarios concurrentes durante 5 minutos
  - 50 usuarios concurrentes durante 2 minutos
  - Spike test: 0→100 usuarios en 30 segundos
- **Métricas:**
  - P50, P95, P99 latency
  - Requests per second
  - Error rate
- **Criterio de éxito:** P95 < 2 segundos
- **Responsable:** QA / Dev

### **Estrategia QA 3: Pruebas de Integración (Backend ↔ Database)**
- **Meta asociada:** Meta SMART 3
- **Tipo:** Integration testing
- **Herramientas:**
  - Postman / Newman (API testing)
  - Jest (Node.js testing framework)
  - Azure SQL Query Editor
- **Escenarios:**
  - CRUD completo de reservaciones
  - Validación de constraints (foreign keys, unique, not null)
  - Transacciones con rollback
  - Consultas complejas (joins, agregaciones)
- **Criterio de éxito:** 0 errores de integridad
- **Responsable:** Dev / QA

### **Estrategia QA 4: Pruebas de Deployment (IaC)**
- **Meta asociada:** Meta SMART 4
- **Tipo:** Infrastructure testing
- **Herramientas:**
  - Azure CLI (`az deployment group validate`)
  - Bicep linter (`az bicep build`)
  - `bash -n deploy.sh` (syntax check)
- **Escenarios:**
  - Deployment desde cero (resource group vacío)
  - Re-deployment (actualizar recursos existentes)
  - Rollback (eliminar y re-crear)
  - Validación de parámetros
- **Criterio de éxito:** 3/3 deployments exitosos en < 15 min
- **Responsable:** DevOps / Dev

### **Estrategia QA 5: Pruebas Funcionales (End-to-End)**
- **Meta asociada:** Meta SMART 5
- **Tipo:** Functional / E2E testing
- **Herramientas:**
  - Playwright / Cypress (browser automation)
  - Manual testing con checklist
  - Postman (API testing)
- **Escenarios:**
  - User journey completo: crear → editar → eliminar reservación
  - Búsqueda y filtros
  - Exportación de datos (CSV, JSON, iCal)
  - Cambio de tema (light/dark)
  - Responsive design (mobile, tablet, desktop)
- **Criterio de éxito:** 80% de features críticas validadas
- **Responsable:** QA

### **Estrategia QA 6: Pruebas de Seguridad (Básicas)**
- **Meta asociada:** Riesgo 4
- **Tipo:** Security testing
- **Herramientas:**
  - OWASP ZAP (vulnerability scanning)
  - Azure Security Center
  - Manual code review
- **Escenarios:**
  - Validación de CORS
  - Exposición de credenciales en Git
  - SQL Injection attempts
  - XSS attempts en frontend
- **Criterio de éxito:** 0 vulnerabilidades críticas
- **Responsable:** Security Lead / QA

### **Estrategia QA 7: Revisiones de Código (Code Review)**
- **Meta asociada:** General
- **Tipo:** Static analysis
- **Herramientas:**
  - GitHub Pull Request reviews
  - ESLint (JavaScript linting)
  - SonarQube (code quality)
- **Criterio de éxito:** 100% de PRs revisados antes de merge
- **Responsable:** Dev Team

---

## 📋 MATRIZ DE TRAZABILIDAD QA (ESTRUCTURA)

### **Columnas requeridas:**

| # | Meta SMART | Función/Requisito | Escenario de Prueba | Tipo de Prueba | Prioridad | Riesgo Asociado | Estado | Evidencia Esperada | Responsable | Herramienta |
|---|------------|-------------------|---------------------|----------------|-----------|----------------|--------|-------------------|-------------|-------------|
| 1 | Meta 1: Disponibilidad | Frontend accesible 24/7 | Verificar uptime de Static Web App durante 30 días | Monitoreo | Alta | Riesgo 1 | No iniciada | Screenshot de dashboard con 99% uptime | QA | Application Insights |
| 2 | Meta 1: Disponibilidad | Backend API responde health check | Ping a `/api/health` cada 5 minutos durante 30 días | Monitoreo | Alta | Riesgo 2 | No iniciada | Log de requests exitosos (99%+) | DevOps | UptimeRobot |
| 3 | Meta 2: Rendimiento | GET /api/reservations con 10 usuarios | Carga de 10 usuarios concurrentes durante 5 minutos | Carga | Alta | Riesgo 2 | No iniciada | Report de `oha` con P95 < 2s | QA | oha |

### **Escenarios de Prueba Detallados por Meta:**

#### **Meta SMART 1: Disponibilidad del Sistema**

**Escenario 1.1: Monitoreo de Static Web App**
- **Función:** Frontend accesible desde cualquier ubicación
- **Pasos:**
  1. Configurar Application Insights Availability Test
  2. Endpoint: `https://delightful-river-00afab01e.3.azurestaticapps.net`
  3. Frecuencia: Cada 5 minutos
  4. Ubicaciones: 3 regiones (US West, Europe West, Asia East)
  5. Timeout: 30 segundos
  6. Criterio: HTTP 200 response
- **Tipo:** Monitoreo continuo
- **Prioridad:** 🔴 Alta
- **Estado:** No iniciada
- **Evidencia:** Dashboard de Application Insights con gráfica de 30 días
- **Responsable:** QA
- **Herramienta:** Azure Application Insights

**Escenario 1.2: Health Check del Backend**
- **Función:** Backend API responde correctamente
- **Pasos:**
  1. Configurar monitor externo (UptimeRobot)
  2. Endpoint: `https://bookr-api.azurewebsites.net/api/health`
  3. Frecuencia: Cada 5 minutos
  4. Criterio: HTTP 200 + cuerpo JSON `{"status":"ok"}`
  5. Alertas: Email si 3 fallos consecutivos
- **Tipo:** Monitoreo continuo
- **Prioridad:** 🔴 Alta
- **Estado:** No iniciada
- **Evidencia:** Reporte de uptime de 30 días (PDF/screenshot)
- **Responsable:** DevOps
- **Herramienta:** UptimeRobot

**Escenario 1.3: Prueba de Recuperación ante Fallo**
- **Función:** Sistema se recupera automáticamente de errores
- **Pasos:**
  1. Simular fallo: Detener Function App manualmente
  2. Esperar 5 minutos
  3. Reiniciar Function App
  4. Verificar que health check vuelve a responder
  5. Medir tiempo de recuperación
- **Tipo:** Resiliencia
- **Prioridad:** 🟡 Media
- **Estado:** No iniciada
- **Evidencia:** Log de Azure con timestamp de caída y recuperación
- **Responsable:** DevOps
- **Herramienta:** Azure Portal

#### **Meta SMART 2: Tiempo de Respuesta del Backend**

**Escenario 2.1: Prueba de Carga Baja (10 usuarios)**
- **Función:** GET /api/reservations bajo carga normal
- **Pasos:**
  1. Configurar `oha` con 10 workers concurrentes
  2. Comando: `oha -n 1000 -c 10 --latency-correction https://bookr-api.azurewebsites.net/api/reservations`
  3. Ejecutar durante 5 minutos
  4. Capturar P50, P95, P99 latency
  5. Verificar tasa de errores < 1%
- **Tipo:** Carga
- **Prioridad:** 🔴 Alta
- **Estado:** No iniciada
- **Evidencia:** Output de `oha` (JSON o texto) con métricas
- **Responsable:** QA
- **Herramienta:** oha

**Escenario 2.2: Prueba de Carga Media (50 usuarios)**
- **Función:** POST /api/reservations bajo carga media
- **Pasos:**
  1. Preparar payload JSON válido de reservación
  2. Configurar `oha` con 50 workers concurrentes
  3. Comando: `oha -n 500 -c 50 -m POST -d @reservation.json https://bookr-api.azurewebsites.net/api/reservations`
  4. Ejecutar durante 2 minutos
  5. Verificar P95 < 2 segundos
- **Tipo:** Carga
- **Prioridad:** 🔴 Alta
- **Estado:** No iniciada
- **Evidencia:** Report de `oha` + screenshot
- **Responsable:** QA
- **Herramienta:** oha

**Escenario 2.3: Prueba de Cold Start**
- **Función:** Primera petición después de inactividad
- **Pasos:**
  1. Dejar Function App sin actividad por 20 minutos
  2. Enviar GET a /api/health y medir latencia
  3. Enviar 10 requests más y medir latencia de cada uno
  4. Documentar latencia inicial vs. latencia warm
- **Tipo:** Performance
- **Prioridad:** 🟡 Media
- **Estado:** No iniciada
- **Evidencia:** Tabla con tiempos de respuesta (cold vs warm)
- **Responsable:** Dev
- **Herramienta:** Postman / curl + time

**Escenario 2.4: Prueba de Spike (Carga súbita)**
- **Función:** Sistema maneja picos de tráfico
- **Pasos:**
  1. Configurar JMeter con ramp-up: 0→100 usuarios en 30 segundos
  2. Mantener 100 usuarios durante 1 minuto
  3. Ramp-down: 100→0 usuarios en 30 segundos
  4. Monitorear Function App metrics en Azure
  5. Verificar que no haya errores 503 (Service Unavailable)
- **Tipo:** Stress
- **Prioridad:** 🟡 Media
- **Estado:** No iniciada
- **Evidencia:** Reporte de JMeter + Azure Metrics screenshot
- **Responsable:** QA
- **Herramienta:** Apache JMeter

#### **Meta SMART 3: Integridad de Datos en Base de Datos**

**Escenario 3.1: CRUD Completo de Reservaciones**
- **Función:** Operaciones CRUD mantienen integridad
- **Pasos:**
  1. CREATE: Insertar reservación con `POST /api/reservations`
  2. READ: Obtener reservación con `GET /api/reservations?id={id}`
  3. UPDATE: Modificar título con `PUT /api/reservations?id={id}`
  4. DELETE: Eliminar con `DELETE /api/reservations?id={id}`
  5. Verificar en SQL que el registro fue eliminado correctamente
- **Tipo:** Integración
- **Prioridad:** 🔴 Alta
- **Estado:** No iniciada
- **Evidencia:** Collection de Postman con 4 requests exitosos
- **Responsable:** Dev
- **Herramienta:** Postman

**Escenario 3.2: Validación de Foreign Key Constraint**
- **Función:** No se pueden crear reservaciones con UserId inválido
- **Pasos:**
  1. Intentar POST con UserId que no existe en tabla Users
  2. Verificar que backend retorna error 400 o 500
  3. Verificar en SQL que no se insertó registro
  4. Validar mensaje de error claro
- **Tipo:** Validación
- **Prioridad:** 🔴 Alta
- **Estado:** No iniciada
- **Evidencia:** Screenshot de error response + query SQL
- **Responsable:** Dev
- **Herramienta:** Postman + Azure SQL Query Editor

**Escenario 3.3: Validación de Campos Obligatorios**
- **Función:** Backend rechaza datos incompletos
- **Pasos:**
  1. POST sin campo `Title` (required)
  2. POST sin campo `Date` (required)
  3. POST sin campo `Time` (required)
  4. Verificar que backend retorna 400 Bad Request
  5. Verificar que mensaje indica qué campo falta
- **Tipo:** Validación
- **Prioridad:** 🟡 Media
- **Estado:** No iniciada
- **Evidencia:** Collection de Postman con 3 requests de error
- **Responsable:** QA
- **Herramienta:** Postman

**Escenario 3.4: Prueba de Transacciones (Rollback)**
- **Función:** Transacciones fallidas no dejan datos inconsistentes
- **Pasos:**
  1. Crear reservación con 3 attendees
  2. Simular fallo en medio de la transacción (desconectar SQL temporalmente)
  3. Verificar que ni reservación ni attendees se guardaron
  4. Repetir sin fallo y verificar que todos se guardaron
- **Tipo:** Integración
- **Prioridad:** 🟡 Media
- **Estado:** No iniciada
- **Evidencia:** Logs de backend + queries SQL antes/después
- **Responsable:** Dev
- **Herramienta:** Manual testing + SQL

**Escenario 3.5: Prueba de Cascade Delete**
- **Función:** Al eliminar reservación, se eliminan attendees
- **Pasos:**
  1. Crear reservación con 2 attendees
  2. Verificar en SQL que existen 2 registros en ReservationAttendees
  3. DELETE reservación con `DELETE /api/reservations?id={id}`
  4. Verificar que attendees también fueron eliminados (cascade)
- **Tipo:** Integración
- **Prioridad:** 🔴 Alta
- **Estado:** No iniciada
- **Evidencia:** Query SQL mostrando 0 attendees después de delete
- **Responsable:** Dev
- **Herramienta:** Postman + SQL

#### **Meta SMART 4: Despliegue Automatizado (IaC)**

**Escenario 4.1: Deployment desde Cero**
- **Función:** Script crea toda la infraestructura sin intervención
- **Pasos:**
  1. Eliminar Resource Group completo: `az group delete -n bookr2 --yes`
  2. Ejecutar: `cd templates-params-scrips/bicep && ./deploy.sh`
  3. Medir tiempo total de ejecución
  4. Verificar que todos los recursos se crearon correctamente
  5. Verificar que frontend está accesible
  6. Verificar que backend responde
  7. Verificar que SQL tiene esquema y datos demo
- **Tipo:** Infraestructura
- **Prioridad:** 🔴 Alta
- **Estado:** No iniciada
- **Evidencia:** Log completo del terminal + screenshot de Azure Portal
- **Responsable:** DevOps
- **Herramienta:** Azure CLI + Bicep

**Escenario 4.2: Re-deployment (Actualización)**
- **Función:** Script actualiza recursos existentes sin perder datos
- **Pasos:**
  1. Con infraestructura desplegada, modificar `main.bicep` (ej: cambiar SKU)
  2. Ejecutar: `./deploy.sh`
  3. Verificar que deployment es incremental (no borra recursos)
  4. Verificar que SQL mantiene datos existentes
  5. Medir tiempo de actualización
- **Tipo:** Infraestructura
- **Prioridad:** 🟡 Media
- **Estado:** No iniciada
- **Evidencia:** Diff de recursos antes/después + log
- **Responsable:** DevOps
- **Herramienta:** Azure CLI

**Escenario 4.3: Validación de Bicep (Linting)**
- **Función:** Templates Bicep son sintácticamente correctos
- **Pasos:**
  1. Ejecutar: `az bicep build --file main.bicep`
  2. Verificar que no hay errores de sintaxis
  3. Ejecutar: `az deployment group validate` (dry-run)
  4. Verificar que no hay errores de validación
- **Tipo:** Estático
- **Prioridad:** 🔴 Alta
- **Estado:** No iniciada
- **Evidencia:** Output de comandos sin errores
- **Responsable:** DevOps
- **Herramienta:** Azure CLI + Bicep

**Escenario 4.4: Deployment en Múltiples Cuentas**
- **Función:** Script funciona en diferentes suscripciones
- **Pasos:**
  1. Probar deployment en cuenta 1 (actual)
  2. Probar deployment en cuenta 2 (si disponible)
  3. Verificar que no hay dependencias hardcodeadas
  4. Documentar parámetros requeridos
- **Tipo:** Portabilidad
- **Prioridad:** 🟢 Baja
- **Estado:** No iniciada
- **Evidencia:** Logs de deployments en 2 cuentas
- **Responsable:** DevOps
- **Herramienta:** Azure CLI

**Escenario 4.5: Configuración Automática de GitHub Secrets**
- **Función:** Script configura CI/CD sin pasos manuales
- **Pasos:**
  1. Eliminar secret de GitHub manualmente
  2. Ejecutar: `./deploy.sh`
  3. Verificar que script detecta falta de secret
  4. Verificar que script configura secret automáticamente con `gh CLI`
  5. Verificar que GitHub Actions workflow se ejecuta correctamente
- **Tipo:** Automatización
- **Prioridad:** 🟡 Media
- **Estado:** No iniciada
- **Evidencia:** Log del script + screenshot de GitHub Actions
- **Responsable:** DevOps
- **Herramienta:** gh CLI + GitHub Actions

#### **Meta SMART 5: Cobertura de Pruebas Funcionales**

**Escenario 5.1: Crear Reservación (Happy Path)**
- **Función:** Usuario puede crear una reservación nueva
- **Pasos:**
  1. Navegar a `/reservations/new`
  2. Llenar formulario con datos válidos:
     - Título: "Reunión con cliente"
     - Descripción: "Revisión de proyecto"
     - Fecha: Mañana
     - Hora: 10:00
     - Duración: 60 minutos
     - Ubicación: "Sala de juntas"
  3. Click en "Crear Reservación"
  4. Verificar toast de éxito
  5. Verificar redirección a `/reservations`
  6. Verificar que reservación aparece en lista
- **Tipo:** Funcional
- **Prioridad:** 🔴 Alta
- **Estado:** No iniciada
- **Evidencia:** Video/GIF del flujo completo + screenshot
- **Responsable:** QA
- **Herramienta:** Manual / Playwright

**Escenario 5.2: Editar Reservación**
- **Función:** Usuario puede modificar una reservación existente
- **Pasos:**
  1. Crear reservación de prueba
  2. Click en botón "Editar"
  3. Modificar título: "Reunión URGENTE"
  4. Modificar color a rojo
  5. Guardar cambios
  6. Verificar que cambios se reflejan en lista
  7. Refrescar página y verificar persistencia
- **Tipo:** Funcional
- **Prioridad:** 🔴 Alta
- **Estado:** No iniciada
- **Evidencia:** Screenshots antes/después + video
- **Responsable:** QA
- **Herramienta:** Manual

**Escenario 5.3: Eliminar Reservación**
- **Función:** Usuario puede eliminar una reservación
- **Pasos:**
  1. Crear reservación de prueba
  2. Click en botón "Eliminar"
  3. Confirmar en modal de confirmación
  4. Verificar toast de éxito
  5. Verificar que reservación desaparece de lista
  6. Refrescar página y verificar que no reaparece
- **Tipo:** Funcional
- **Prioridad:** 🔴 Alta
- **Estado:** No iniciada
- **Evidencia:** Video del flujo completo
- **Responsable:** QA
- **Herramienta:** Manual

**Escenario 5.4: Búsqueda de Reservaciones**
- **Función:** Usuario puede buscar reservaciones por texto
- **Pasos:**
  1. Crear 5 reservaciones con títulos diferentes
  2. En `/reservations`, escribir "Reunión" en barra de búsqueda
  3. Verificar que solo aparecen reservaciones con "Reunión" en título/descripción
  4. Limpiar búsqueda y verificar que aparecen todas
  5. Buscar término que no existe y verificar mensaje "Sin resultados"
- **Tipo:** Funcional
- **Prioridad:** 🟡 Media
- **Estado:** No iniciada
- **Evidencia:** Screenshots de resultados filtrados
- **Responsable:** QA
- **Herramienta:** Manual

**Escenario 5.5: Filtro por Estado**
- **Función:** Usuario puede filtrar reservaciones por estado
- **Pasos:**
  1. Crear reservaciones con estados: Pendiente, Confirmada, Cancelada
  2. Seleccionar filtro "Confirmada"
  3. Verificar que solo aparecen reservaciones confirmadas
  4. Cambiar a "Todas"
  5. Verificar que aparecen todas las reservaciones
- **Tipo:** Funcional
- **Prioridad:** 🟡 Media
- **Estado:** No iniciada
- **Evidencia:** Screenshots de cada filtro aplicado
- **Responsable:** QA
- **Herramienta:** Manual

**Escenario 5.6: Exportar a CSV**
- **Función:** Usuario puede exportar reservaciones a CSV
- **Pasos:**
  1. Crear 3 reservaciones
  2. Click en menú de exportación
  3. Seleccionar "Exportar CSV"
  4. Verificar que se descarga archivo `reservations.csv`
  5. Abrir en Excel y verificar que datos son correctos
  6. Verificar que incluye todas las columnas
- **Tipo:** Funcional
- **Prioridad:** 🟡 Media
- **Estado:** No iniciada
- **Evidencia:** Archivo CSV descargado + screenshot de Excel
- **Responsable:** QA
- **Herramienta:** Manual

**Escenario 5.7: Dark Mode**
- **Función:** Usuario puede cambiar entre tema claro y oscuro
- **Pasos:**
  1. Abrir aplicación (por defecto tema claro)
  2. Click en toggle de tema
  3. Verificar que cambia a dark mode
  4. Verificar que todos los componentes se ven correctamente
  5. Refrescar página y verificar que persiste la preferencia
- **Tipo:** Funcional
- **Prioridad:** 🟢 Baja
- **Estado:** No iniciada
- **Evidencia:** Screenshots de light y dark mode
- **Responsable:** QA
- **Herramienta:** Manual

**Escenario 5.8: Responsive Design (Mobile)**
- **Función:** App es usable en dispositivos móviles
- **Pasos:**
  1. Abrir app en Chrome DevTools mobile emulation (iPhone 12)
  2. Verificar que header es responsive
  3. Crear reservación desde mobile
  4. Verificar que botones son clickables (tamaño adecuado)
  5. Verificar que no hay scroll horizontal
- **Tipo:** UI/UX
- **Prioridad:** 🟡 Media
- **Estado:** No iniciada
- **Evidencia:** Screenshots de mobile + video interactuando
- **Responsable:** QA
- **Herramienta:** Chrome DevTools

---

## 👥 ROLES Y RESPONSABLES

### **Equipo del Proyecto:**
- **Andretti Quiroz Pérez** (e012913)
  - **Rol principal:** Developer + DevOps + QA
  - **Responsabilidades:**
    - Desarrollo de frontend (React)
    - Desarrollo de backend (Azure Functions)
    - Diseño de base de datos (SQL)
    - Implementación de IaC (Bicep)
    - Deployment y CI/CD
    - Ejecución de pruebas
    - Documentación

### **Distribución de Escenarios de Prueba:**

| Responsable | Escenarios Asignados | Total |
|-------------|---------------------|-------|
| **QA** (Andretti) | 1.1, 1.2, 2.1, 2.2, 2.4, 3.3, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8 | 14 |
| **Dev** (Andretti) | 2.3, 3.1, 3.2, 3.4, 3.5 | 5 |
| **DevOps** (Andretti) | 1.3, 4.1, 4.2, 4.3, 4.4, 4.5 | 6 |
| **Total** | | **25 escenarios** |

---

## 🛠️ HERRAMIENTAS UTILIZADAS

### **Desarrollo:**
- **Frontend:** React 18, Vite 4, JavaScript ES6+
- **Backend:** Node.js 18, Azure Functions v4
- **Base de Datos:** Azure SQL Database (T-SQL)
- **Storage:** Azure Blob Storage
- **IaC:** Azure Bicep, Bash scripting

### **Testing:**
- **API Testing:** Postman, Newman (CLI)
- **Load Testing:** `oha`, Apache JMeter, Azure Load Testing
- **E2E Testing:** Playwright, Cypress (propuestos)
- **Unit Testing:** Jest (propuesto, no implementado)
- **Monitoring:** Azure Application Insights, UptimeRobot
- **Security:** OWASP ZAP (propuesto)

### **DevOps / CI/CD:**
- **Version Control:** Git, GitHub
- **CI/CD:** GitHub Actions
- **Deployment:** Azure CLI, Bicep CLI, Azure Functions Core Tools
- **Secrets Management:** GitHub Secrets, gh CLI

### **Productividad:**
- **IDE:** Visual Studio Code, Cursor
- **Terminal:** Zsh (macOS)
- **Package Manager:** npm
- **Documentation:** Markdown, Mermaid diagrams

---

## 📈 MÉTRICAS Y KPIs

### **Métricas de Infraestructura:**
- **Uptime:** % de tiempo que el sistema está disponible
- **MTTR (Mean Time To Recovery):** Tiempo promedio de recuperación ante fallo
- **Deployment Success Rate:** % de deployments exitosos
- **Deployment Time:** Tiempo promedio de deployment

### **Métricas de Performance:**
- **Response Time:** P50, P95, P99 latency de API endpoints
- **Throughput:** Requests per second (RPS)
- **Error Rate:** % de requests con errores 4xx/5xx
- **Cold Start Time:** Latencia de primera petición post-inactividad

### **Métricas de Calidad:**
- **Test Coverage:** % de funcionalidades cubiertas por pruebas
- **Defect Density:** # de bugs por feature
- **Test Pass Rate:** % de pruebas exitosas vs. totales
- **Code Quality Score:** (si se usa SonarQube)

### **Métricas de Negocio:**
- **Reservaciones Creadas:** Total de reservaciones en BD
- **User Engagement:** Tiempo promedio en app (si se implementa analytics)
- **Feature Adoption:** % de usuarios que usan cada feature

---

## ⚙️ CONFIGURACIÓN Y PREREQUISITOS

### **Para Ejecutar el Proyecto Localmente (Frontend):**
```bash
cd frontend
npm install
npm run dev
# Acceder a http://localhost:5173
```

### **Para Ejecutar el Proyecto Localmente (Backend):**
```bash
cd backend
npm install
func start
# Acceder a http://localhost:7071
```

### **Para Desplegar en Azure (Infraestructura Completa):**
```bash
cd templates-params-scrips/bicep
chmod +x deploy.sh
./deploy.sh
# Seguir las instrucciones en pantalla
# El script hará TODO automáticamente
```

### **Prerequisitos:**
- **Azure CLI:** `az --version` (≥ 2.50.0)
- **Azure Functions Core Tools:** `func --version` (≥ 4.0)
- **Node.js:** `node --version` (≥ 18.0)
- **npm:** `npm --version` (≥ 9.0)
- **GitHub CLI:** `gh --version` (≥ 2.0)
- **Cuenta Azure:** Con permisos de Owner/Contributor
- **Suscripción Azure:** Con Free Tier disponible

---

## 📝 FORMATO DEL DOCUMENTO FINAL (Plan QA v0.3)

### **Estructura del PDF:**

**1. Portada**
- Título: Plan de Aseguramiento de Calidad v0.3
- Subtítulo: PLATAFORMA DE AGENDAMIENTO UNIVERSAL EN LA NUBE (SaaS)
- Datos del estudiante, matrícula, profesor
- Fecha

**2. Resumen Ejecutivo (1 página)**
- Objetivo del plan QA
- Alcance del proyecto
- Principales hallazgos
- Estado general de calidad

**3. Metas SMART Priorizadas (2-3 páginas)**
- Tabla con las 5 metas SMART
- Columnas: Meta, Descripción, Prioridad, Medible, Tiempo
- Descripción detallada de cada meta

**4. Riesgos e Implicaciones (2 páginas)**
- Tabla de riesgos
- Columnas: Riesgo, Probabilidad, Impacto, Implicación, Mitigación
- Top 6 riesgos detallados

**5. Estrategias de Aseguramiento de Calidad (2 páginas)**
- Lista de 7 estrategias QA
- Para cada estrategia:
  - Meta asociada
  - Tipo de prueba
  - Herramientas
  - Frecuencia
  - Responsable

**6. Matriz de Trazabilidad QA (3-4 páginas)**
- Tabla con TODOS los escenarios de prueba (mínimo 25)
- Columnas: #, Meta SMART, Función/Requisito, Escenario, Tipo, Prioridad, Riesgo, Estado, Evidencia, Responsable, Herramienta
- Agrupado por Meta SMART

**7. Roles, Responsables y Herramientas (1 página)**
- Tabla de roles y responsabilidades
- Lista de herramientas utilizadas (con versiones)
- Distribución de escenarios por responsable

**8. Evidencia de Pruebas (Opcional, 5-10 páginas)**
- Screenshots de pruebas ejecutadas
- Logs de deployment
- Reportes de `oha`/JMeter
- Dashboards de Azure
- **Nota:** Solo incluir si ya ejecutaste las pruebas

**9. Reflexión Final (1 página)**
- 4-6 líneas respondiendo:
  - ¿Qué metas pueden validar antes de entrega final?
  - ¿Qué pruebas son más críticas y por qué?
  - ¿Qué riesgos siguen pendientes?
  - ¿Qué decisiones tomaron respecto a qué metas mantener/ajustar/posponer?

**10. Anexos**
- Código fuente relevante (opcional)
- Diagramas de arquitectura
- Referencias

---

## 🎨 CONSIDERACIONES DE DISEÑO DEL DOCUMENTO

### **Formato:**
- **Tipo de letra:** Arial o Calibri, 11pt (texto), 14-16pt (títulos)
- **Márgenes:** 2.5 cm en todos los lados
- **Interlineado:** 1.15 o 1.5
- **Colores:**
  - Títulos: Azul oscuro (#1E3A8A)
  - Prioridad Alta: Rojo (#DC2626)
  - Prioridad Media: Amarillo/Naranja (#F59E0B)
  - Prioridad Baja: Verde (#10B981)

### **Tablas:**
- Bordes claros y visibles
- Alternancia de colores en filas (gris claro/blanco)
- Headers en negrita con fondo de color
- Texto centrado en columnas cortas (Prioridad, Estado)
- Texto alineado a izquierda en columnas largas (Descripción, Escenario)

### **Imágenes:**
- Alta resolución (mínimo 1920x1080 para screenshots)
- Bordes/sombras para resaltar
- Leyendas descriptivas debajo de cada imagen
- Numeración secuencial (Figura 1, Figura 2, etc.)

---

## 🚀 INSTRUCCIONES PARA LA IA QUE GENERARÁ LOS DOCUMENTOS

### **Tarea Principal:**
Generar un documento PDF completo del **Plan de Aseguramiento de Calidad v0.3** basado en toda la información proporcionada en este mega prompt.

### **Entregables Específicos:**

#### **1. Documento PDF: "Plan_QA_v0.3_Bookr.pdf"**
- Seguir exactamente la estructura descrita en "FORMATO DEL DOCUMENTO FINAL"
- Incluir TODAS las secciones (1-10)
- Mínimo 15 páginas, máximo 25 páginas
- Formato profesional y académico

#### **2. Archivo Excel: "Matriz_Trazabilidad_QA_v0.3.xlsx"**
- Hoja 1: "Metas SMART" (las 5 metas con todas sus propiedades)
- Hoja 2: "Riesgos" (los 6 riesgos con probabilidad, impacto, mitigación)
- Hoja 3: "Estrategias QA" (las 7 estrategias con detalles)
- Hoja 4: "Matriz de Trazabilidad" (TODOS los 25+ escenarios)
- Hoja 5: "Herramientas" (lista de todas las herramientas usadas)
- Usar formato condicional para prioridades (colores)
- Incluir gráficos:
  - Pie chart de estados de pruebas (Completada, En progreso, Fallada, No iniciada)
  - Bar chart de escenarios por prioridad
  - Bar chart de escenarios por responsable

#### **3. Archivo CSV: "Matriz_QA_Simple.csv"**
- Versión simplificada de la Matriz de Trazabilidad
- Formato plano para importar a otras herramientas
- Columnas: ID, Meta, Escenario, Tipo, Prioridad, Estado, Responsable

#### **4. Archivo Markdown: "PLAN_QA_V03.md"**
- Versión markdown del documento completo
- Para visualización en GitHub
- Incluir badges (shields.io) con métricas:
  - ![Metas: 5](https://img.shields.io/badge/Metas-5-blue)
  - ![Escenarios: 25](https://img.shields.io/badge/Escenarios-25-green)
  - ![Cobertura: 80%](https://img.shields.io/badge/Cobertura-80%25-yellow)

### **Pautas de Contenido:**

1. **Usa información real del proyecto:**
   - URLs reales: `https://delightful-river-00afab01e.3.azurestaticapps.net`
   - Nombres de recursos: `bookr-api`, `bookr-sql-server`, etc.
   - Datos del estudiante: Andretti Quiroz Pérez, e012913

2. **Sé específico y técnico:**
   - No uses placeholders genéricos
   - Incluye comandos exactos (ej: `az deployment group create...`)
   - Menciona versiones específicas de herramientas

3. **Mantén coherencia:**
   - Los 25+ escenarios deben estar alineados con las 5 metas
   - Cada escenario debe tener un riesgo asociado
   - Prioridades deben ser consistentes

4. **Priorización:**
   - Metas 1, 2, 3: Alta prioridad (core del sistema)
   - Meta 4: Media prioridad (IaC ya funciona)
   - Meta 5: Media/Baja prioridad (pruebas funcionales)

5. **Estados de Pruebas:**
   - Dado que el proyecto está en desarrollo, la mayoría de escenarios estarán en "No iniciada"
   - Puedes poner algunos en "En progreso" si son críticos
   - NO pongas todos como "Completada" (no sería realista)
   - Distribución sugerida: 70% No iniciada, 20% En progreso, 10% Completada

6. **Reflexión Final (Ejemplo de respuesta esperada):**
   ```
   Antes de la entrega final, podemos validar las Metas 1 y 4 completamente,
   ya que la infraestructura está desplegada y es medible. Las pruebas de
   carga (Meta 2) y de integridad de datos (Meta 3) son las más críticas,
   pues identifican limitaciones del Free Tier y problemas de conectividad
   SQL que actualmente nos obligan a usar modo local. El riesgo de timeout
   backend-database sigue pendiente y puede requerir arquitectura alternativa
   (ej: usar Azure SQL Managed Instance o migrar a Cosmos DB). Decidimos
   mantener las 5 metas, pero ajustar expectativas: Meta 3 se validará en
   modo local, y Meta 2 se limitará a 50 usuarios concurrentes máximo debido
   a restricciones de Consumption Plan.
   ```

7. **Evidencia Esperada:**
   - Para escenarios "No iniciada": Describir qué evidencia se generará
   - Para escenarios "En progreso": Mencionar evidencia parcial
   - Para escenarios "Completada": Describir dónde está la evidencia (ej: "Ver Anexo A")

### **Instrucciones Técnicas para Generar el Excel:**

```python
# Pseudocódigo para generar el Excel

import pandas as pd
from openpyxl.styles import PatternFill

# Hoja 1: Metas SMART
metas_df = pd.DataFrame({
    'ID': ['M1', 'M2', 'M3', 'M4', 'M5'],
    'Meta': ['Disponibilidad del Sistema', 'Tiempo de Respuesta', ...],
    'Descripción': [...],
    'Prioridad': ['Alta', 'Alta', 'Alta', 'Media', 'Media'],
    'Medible': ['99% uptime en 30 días', 'P95 < 2s', ...],
    'Tiempo': ['30 días', '7 días', ...]
})

# Hoja 4: Matriz de Trazabilidad (ejemplo)
matriz_df = pd.DataFrame({
    'ID': ['1.1', '1.2', '1.3', '2.1', ...],
    'Meta SMART': ['Meta 1', 'Meta 1', 'Meta 1', 'Meta 2', ...],
    'Función/Requisito': ['Frontend accesible 24/7', ...],
    'Escenario de Prueba': ['Verificar uptime de Static Web App...', ...],
    'Tipo de Prueba': ['Monitoreo', 'Monitoreo', 'Resiliencia', 'Carga', ...],
    'Prioridad': ['Alta', 'Alta', 'Media', 'Alta', ...],
    'Riesgo Asociado': ['Riesgo 1', 'Riesgo 2', ...],
    'Estado': ['No iniciada', 'No iniciada', ...],
    'Evidencia Esperada': ['Dashboard con 99% uptime', ...],
    'Responsable': ['QA', 'DevOps', ...],
    'Herramienta': ['Application Insights', 'UptimeRobot', ...]
})

# Aplicar colores condicionales
def colorize_priority(val):
    if val == 'Alta': return 'FF6B6B'  # Rojo
    elif val == 'Media': return 'FFA500'  # Naranja
    else: return '4CAF50'  # Verde

# Guardar a Excel con formato
with pd.ExcelWriter('Matriz_Trazabilidad_QA_v0.3.xlsx', engine='openpyxl') as writer:
    metas_df.to_excel(writer, sheet_name='Metas SMART', index=False)
    matriz_df.to_excel(writer, sheet_name='Matriz de Trazabilidad', index=False)
    # ... más hojas ...
```

### **Validación Final:**
Antes de entregar los documentos, verificar:
- ✅ PDF tiene 15-25 páginas
- ✅ Excel tiene 5 hojas con datos completos
- ✅ Todas las metas tienen al menos 2 escenarios
- ✅ Total de escenarios ≥ 25
- ✅ Todos los campos de la matriz están llenos (no hay celdas vacías)
- ✅ Prioridades coloreadas correctamente
- ✅ Reflexión final tiene 4-6 líneas
- ✅ URLs y nombres de recursos son los reales del proyecto
- ✅ Lenguaje profesional y técnico (no coloquial)
- ✅ Sin errores ortográficos

---

## 📚 REFERENCIAS Y RECURSOS ADICIONALES

### **Documentación Técnica:**
- Azure Static Web Apps: https://learn.microsoft.com/en-us/azure/static-web-apps/
- Azure Functions: https://learn.microsoft.com/en-us/azure/azure-functions/
- Azure SQL Database: https://learn.microsoft.com/en-us/azure/azure-sql/
- Azure Bicep: https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/

### **Herramientas de Testing:**
- oha (HTTP load testing): https://github.com/hatoo/oha
- Apache JMeter: https://jmeter.apache.org/
- Postman: https://www.postman.com/
- Playwright: https://playwright.dev/

### **Template Base (Profesor):**
- https://docs.google.com/spreadsheets/d/1UpWhUx7WUsf6eBtNgypEPnYbYL5L5FuBknbQGBejymU/edit?usp=sharing

### **Repositorio del Proyecto:**
- GitHub: https://github.com/andrettiprz/bookr

---

## 🎯 RESUMEN EJECUTIVO PARA LA IA

**Input:** Este mega prompt con toda la info del proyecto Bookr

**Output esperado:**
1. PDF del Plan QA v0.3 (15-25 páginas)
2. Excel con Matriz de Trazabilidad (5 hojas, 25+ escenarios)
3. CSV simplificado de la matriz
4. Markdown del documento completo

**Puntos clave a recordar:**
- Proyecto: Sistema de reservaciones SaaS en Azure
- Tecnologías: React, Azure Functions, SQL Database, Bicep
- Metas: 5 SMART (3 alta prioridad, 2 media)
- Escenarios: Mínimo 25, distribuidos entre QA/Dev/DevOps
- Estados: Mayoría "No iniciada" (realismo)
- Problema actual: Backend tiene issues de conectividad con SQL
- Modo actual: Frontend en localStorage (modo local)
- IaC: Funcional y automatizado con `deploy.sh`

**Tono del documento:**
- Profesional y académico
- Técnico pero claro
- Honesto sobre limitaciones y riesgos
- Orientado a soluciones

**Audience:**
- Profesor de Aseguramiento de Calidad (primario)
- Evaluadores técnicos (secundario)
- Futuro empleador que revise portfolio (terciario)

---

## ✅ CHECKLIST FINAL PARA LA IA

Antes de entregar, confirmar:

**Documento PDF:**
- [ ] Portada con todos los datos
- [ ] 5 Metas SMART completas
- [ ] 6 Riesgos con probabilidad e impacto
- [ ] 7 Estrategias QA
- [ ] Matriz de Trazabilidad con 25+ escenarios
- [ ] Reflexión final (4-6 líneas)
- [ ] Formato profesional (colores, tablas, imágenes)
- [ ] Sin errores ortográficos
- [ ] 15-25 páginas

**Archivo Excel:**
- [ ] 5 hojas (Metas, Riesgos, Estrategias, Matriz, Herramientas)
- [ ] Colores condicionales en Prioridad
- [ ] Al menos 2 gráficos
- [ ] Sin celdas vacías
- [ ] Formato consistente

**Coherencia:**
- [ ] URLs reales del proyecto
- [ ] Nombres de recursos correctos
- [ ] Datos del estudiante correctos
- [ ] Escenarios alineados con metas
- [ ] Riesgos asociados a estrategias

---

**FIN DEL MEGA PROMPT**

---

## 💡 NOTA FINAL

Este mega prompt contiene TODA la información necesaria para generar un Plan de Aseguramiento de Calidad v0.3 completo y profesional. La IA receptora debe:

1. Leer cuidadosamente TODO el prompt
2. Extraer la información clave de cada sección
3. Generar los 4 entregables (PDF, Excel, CSV, MD)
4. Validar que cumplen todos los requisitos
5. Asegurar coherencia entre todos los documentos

Si la IA tiene dudas sobre algún aspecto técnico, debe inferir la respuesta más lógica basándose en el contexto del proyecto (SaaS de reservaciones en Azure).

**¡Mucha suerte con la generación de documentos!** 🚀

