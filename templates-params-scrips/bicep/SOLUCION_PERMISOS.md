# Solución: Error de Permisos en Azure

## Problema
```
AuthorizationFailed: The client does not have authorization to perform action 
'Microsoft.Resources/subscriptions/resourcegroups/write'
```

## Causa
Tu cuenta no tiene permisos suficientes (Contributor u Owner) en la suscripción "Azure for Students".

## Soluciones

### Opción 1: Solicitar Permisos al Administrador (Recomendado)
1. Contacta al administrador de tu suscripción de Azure
2. Solicita el rol **"Contributor"** o **"Owner"** en la suscripción
3. Una vez otorgados los permisos, ejecuta:
   ```bash
   az account clear
   az login
   ```

### Opción 2: Usar una Suscripción Personal
Si tienes una suscripción personal de Azure con créditos gratuitos:

1. **Cambiar a tu suscripción personal:**
   ```bash
   az account list --output table
   az account set --subscription "TU-SUBSCRIPTION-ID"
   ```

2. **Verificar permisos:**
   ```bash
   az role assignment list --assignee $(az account show --query user.name -o tsv) --scope /subscriptions/TU-SUBSCRIPTION-ID --output table
   ```

### Opción 3: Usar un Resource Group Existente
Si ya existe un Resource Group donde tienes permisos:

```bash
export RESOURCE_GROUP="nombre-del-rg-existente"
cd templates-params-scrips/bicep
./deploy.sh
```

### Opción 4: Crear Suscripción Nueva (Si es posible)
1. Ve a [portal.azure.com](https://portal.azure.com)
2. Crea una nueva suscripción (si tienes créditos disponibles)
3. Cambia a esa suscripción:
   ```bash
   az account set --subscription "NUEVA-SUBSCRIPTION-ID"
   ```

## Verificar Permisos Actuales

```bash
# Ver tu usuario actual
az account show --query user.name -o tsv

# Ver tus roles en la suscripción
az role assignment list \
  --assignee $(az account show --query user.name -o tsv) \
  --scope /subscriptions/$(az account show --query id -o tsv) \
  --output table
```

## Nota sobre Suscripciones Educativas
Las suscripciones "Azure for Students" a veces tienen restricciones. Si es para un proyecto académico, tu profesor o administrador de TI debe otorgarte los permisos necesarios.

