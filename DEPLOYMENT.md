# 🚀 Guía de Despliegue Completo - Bookr

## Despliegue Automático con un Solo Comando

### Prerrequisitos
- Azure CLI instalado y configurado
- Azure Functions Core Tools instalado
- Cuenta de Azure con permisos de Contributor

### Pasos para Despliegue Completo

1. **Clonar el repositorio**
```bash
git clone https://github.com/andrettiprz/bookr.git
cd bookr
```

2. **Ejecutar el script de despliegue**
```bash
cd templates-params-scrips/bicep
./deploy.sh
```

Este comando desplegará automáticamente:
- ✅ Resource Group
- ✅ Storage Account (Blob Storage)
- ✅ SQL Server + SQL Database
- ✅ Azure Function App (API Backend)
- ✅ Static Web App (Frontend)
- ✅ Configuración de CORS
- ✅ Inicialización de Base de Datos

### ⏳ Tiempo de Despliegue
El despliegue completo toma aproximadamente **5-10 minutos**.

### 🔍 Verificación Post-Despliegue

Después del despliegue, espera **2-3 minutos** adicionales para que:
1. GitHub Actions compile y despliegue el frontend
2. El Function App esté completamente sincronizado
3. La base de datos esté inicializada

### 📝 URLs Importantes

Después del despliegue, recibirás:
- **Frontend**: `https://[nombre-estatico].azurestaticapps.net`
- **API Backend**: `https://bookr-api.azurewebsites.net/api`

### ❗ Si la Inicialización de BD Falla

En caso de que la inicialización automática de la base de datos falle, ejecuta:

```bash
curl -X POST https://bookr-api.azurewebsites.net/api/initdb
```

O manualmente en Azure Portal:
1. Ve a Azure Portal → SQL Database → `bookr-sql-db`
2. Click en "Query editor (preview)"
3. Login: `bookradmin` / `Bookr@2024!SQL`
4. Ejecuta el SQL de `backend/database/schema.sql`

### 🧹 Limpieza de Recursos

Para eliminar todos los recursos desplegados:

```bash
cd templates-params-scrips/bicep
./cleanup.sh
```

## 🎯 Características Desplegadas

- **Frontend React** con diseño minimalista premium
- **Backend Azure Functions** con Node.js
- **Base de Datos SQL** con esquema completo
- **Blob Storage** para archivos
- **Autenticación JWT**
- **Sistema de Reservaciones Completo**

## 📞 Soporte

Si encuentras algún problema durante el despliegue, verifica:
1. Que tu cuenta de Azure tenga permisos suficientes
2. Que todas las herramientas estén instaladas
3. Los logs en la terminal para errores específicos

