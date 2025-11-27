# Script de limpieza - Elimina todos los recursos de Bookr (PowerShell)
# Este script elimina el Resource Group completo y todos sus recursos

$ErrorActionPreference = "Stop"

# Variables configurables
$RESOURCE_GROUP = if ($env:RESOURCE_GROUP) { $env:RESOURCE_GROUP } else { "bookr" }

Write-Host "========================================" -ForegroundColor Red
Write-Host "LIMPIEZA DE RECURSOS BOOKR" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

# Verificar que Azure CLI está instalado
try {
    az --version | Out-Null
} catch {
    Write-Host "Error: Azure CLI no está instalado." -ForegroundColor Red
    exit 1
}

# Verificar que el usuario está logueado
Write-Host "Verificando autenticación en Azure..." -ForegroundColor Yellow
try {
    az account show | Out-Null
} catch {
    Write-Host "No estás autenticado. Iniciando login..." -ForegroundColor Yellow
    az login
}

# Verificar si el Resource Group existe
Write-Host "Verificando Resource Group: $RESOURCE_GROUP..." -ForegroundColor Yellow
try {
    az group show --name $RESOURCE_GROUP | Out-Null
} catch {
    Write-Host "El Resource Group '$RESOURCE_GROUP' no existe. No hay nada que limpiar." -ForegroundColor Green
    exit 0
}

# Mostrar recursos que se van a eliminar
Write-Host ""
Write-Host "Recursos en el Resource Group '$RESOURCE_GROUP':" -ForegroundColor Yellow
az resource list --resource-group $RESOURCE_GROUP --output table

Write-Host ""
Write-Host "⚠️  ADVERTENCIA: Esto eliminará TODOS los recursos en el Resource Group '$RESOURCE_GROUP'" -ForegroundColor Red
Write-Host "Esto incluye:" -ForegroundColor Red
Write-Host "  - Storage Account"
Write-Host "  - SQL Server y Database"
Write-Host "  - Function App"
Write-Host "  - Static Web App"
Write-Host "  - Todos los demás recursos"
Write-Host ""
$CONFIRM = Read-Host "¿Estás seguro de que quieres continuar? (escribe 'yes' para confirmar)"

if ($CONFIRM -ne "yes") {
    Write-Host "Operación cancelada." -ForegroundColor Yellow
    exit 0
}

# Eliminar Resource Group completo
Write-Host ""
Write-Host "Eliminando Resource Group '$RESOURCE_GROUP' y todos sus recursos..." -ForegroundColor Yellow
Write-Host "Esto puede tomar varios minutos..." -ForegroundColor Yellow
Write-Host ""

az group delete `
    --name $RESOURCE_GROUP `
    --yes `
    --no-wait

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ Eliminación iniciada exitosamente" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Nota: La eliminación está en progreso en segundo plano." -ForegroundColor Yellow
    Write-Host "Puedes verificar el estado con:" -ForegroundColor Yellow
    Write-Host "az group show --name $RESOURCE_GROUP" -ForegroundColor Green
    Write-Host ""
    Write-Host "O espera a que termine completamente antes de volver a desplegar." -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Error al eliminar recursos" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    exit 1
}

