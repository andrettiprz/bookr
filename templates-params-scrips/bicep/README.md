# Infraestructura Bookr - Bicep

Este proyecto contiene la infraestructura como código (IaC) para desplegar la aplicación Bookr en Azure usando Bicep.

## Estructura del Proyecto

```
bicep/
├── main.bicep                    # Template principal que despliega todos los recursos
├── main.parameters.json          # Archivo de parámetros para el despliegue
├── deploy.sh                     # Script de despliegue para Linux/Mac
├── deploy.ps1                    # Script de despliegue para Windows PowerShell
└── modules/
    ├── storage.bicep             # Módulo: Storage Account (Blob Storage)
    ├── appServicePlan.bicep      # Módulo: App Service Plan
    ├── sqlServer.bicep           # Módulo: SQL Server y Database
    └── staticWebApp.bicep        # Módulo: Static Web App
```

## Recursos Desplegados

1. **Storage Account** (`bookrblobst`)
   - Tipo: StorageV2
   - SKU: Standard_LRS
   - Soft delete habilitado para blobs, containers y shares

2. **App Service Plan** (`bookr-app-service`)
   - Tipo: Linux
   - SKU: Free (F1)
   - 1 worker

3. **SQL Server y Database** (`bookr-sql-server` / `bookr-sql-db`)
   - Servidor SQL con base de datos
   - Tier: GeneralPurpose
   - SKU: GP_S_Gen5_2
   - Auto-pause habilitado

4. **Static Web App** (`bookr-static-web-app`)
   - Conectado a repositorio GitHub
   - Branch: main
   - Ubicación de app: ./frontend

## Prerrequisitos

1. **Azure CLI** instalado y configurado
   - Instalación: https://docs.microsoft.com/cli/azure/install-azure-cli
   - Verificar: `az --version`

2. **Autenticación en Azure**
   ```bash
   az login
   ```

3. **Permisos necesarios**
   - Permisos de Contributor o Owner en la suscripción de Azure

## Uso

### Opción 1: Script de Despliegue (Recomendado)

#### Linux/Mac (Bash)
```bash
cd bicep
./deploy.sh
```

#### Windows (PowerShell)
```powershell
cd bicep
.\deploy.ps1
```

#### Con parámetros personalizados

**Bash:**
```bash
export RESOURCE_GROUP="mi-resource-group"
export LOCATION="eastus"
./deploy.sh
```

**PowerShell:**
```powershell
.\deploy.ps1 -ResourceGroup "mi-resource-group" -Location "eastus"
```

### Opción 2: Despliegue Manual con Azure CLI

1. **Crear Resource Group** (si no existe):
   ```bash
   az group create --name bookr-rg --location westus2
   ```

2. **Editar parámetros** en `main.parameters.json`:
   - Especialmente `sqlAdministratorPassword` (debe ser una contraseña segura)

3. **Desplegar infraestructura**:
   ```bash
   az deployment group create \
     --resource-group bookr-rg \
     --template-file main.bicep \
     --parameters @main.parameters.json
   ```

## Configuración de Parámetros

Edita el archivo `main.parameters.json` para personalizar:

- `location`: Región de Azure (default: westus2)
- `storageAccountName`: Nombre de la cuenta de almacenamiento
- `sqlServerName`: Nombre del servidor SQL
- `sqlAdministratorLogin`: Usuario administrador de SQL
- `sqlAdministratorPassword`: **IMPORTANTE**: Debe ser una contraseña segura
- `staticWebAppRepositoryUrl`: URL del repositorio GitHub
- `staticWebAppBranch`: Rama del repositorio a desplegar

### Nota sobre Contraseñas

Por seguridad, el archivo `main.parameters.json` tiene `sqlAdministratorPassword` como `null`. 
El script de despliegue te pedirá ingresar la contraseña de forma segura durante la ejecución.

Si prefieres configurarla manualmente, edita `main.parameters.json` y reemplaza `null` con tu contraseña.

## Verificación del Despliegue

Después del despliegue, puedes verificar los recursos:

```bash
# Listar recursos en el Resource Group
az resource list --resource-group bookr-rg --output table

# Ver detalles del despliegue
az deployment group show \
  --resource-group bookr-rg \
  --name bookr-deployment-YYYYMMDD-HHMMSS \
  --query properties.outputs
```

## Eliminación de Recursos

Para eliminar toda la infraestructura:

```bash
az group delete --name bookr-rg --yes --no-wait
```

## Solución de Problemas

### Error: "Storage account name already exists"
- Los nombres de Storage Account deben ser únicos globalmente en Azure
- Cambia `storageAccountName` en `main.parameters.json`

### Error: "SQL Server name already exists"
- Los nombres de SQL Server deben ser únicos globalmente en Azure
- Cambia `sqlServerName` en `main.parameters.json`

### Error: "Static Web App name already exists"
- Los nombres de Static Web App deben ser únicos globalmente en Azure
- Cambia `staticWebAppName` en `main.parameters.json`

### Error de autenticación
```bash
az login
az account list --output table
az account set --subscription "TU-SUBSCRIPTION-ID"
```

## Notas Adicionales

- El despliegue puede tardar entre 5-15 minutos dependiendo de los recursos
- El SQL Server está configurado con `publicNetworkAccess: Disabled` por defecto
- La Static Web App requiere un token de GitHub si el repositorio es privado
- Todos los recursos usan el tier "Free" donde es posible para reducir costos

## Soporte

Para problemas o preguntas, revisa:
- [Documentación de Bicep](https://docs.microsoft.com/azure/azure-resource-manager/bicep/)
- [Documentación de Azure CLI](https://docs.microsoft.com/cli/azure/)

