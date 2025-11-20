# Script de despliegue de infraestructura Bookr con Bicep (PowerShell)
# Este script despliega toda la infraestructura con un solo comando

param(
    [string]$ResourceGroup = "bookr-rg",
    [string]$Location = "westus2",
    [string]$SubscriptionId = "",
    [string]$ParametersFile = "main.parameters.json"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Green
Write-Host "Despliegue de Infraestructura Bookr" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Verificar que Azure CLI está instalado
if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Azure CLI no está instalado." -ForegroundColor Red
    Write-Host "Instala Azure CLI desde: https://docs.microsoft.com/cli/azure/install-azure-cli" -ForegroundColor Yellow
    exit 1
}

# Verificar que el usuario está logueado
Write-Host "Verificando autenticación en Azure..." -ForegroundColor Yellow
try {
    $null = az account show 2>$null
} catch {
    Write-Host "No estás autenticado. Iniciando login..." -ForegroundColor Yellow
    az login
}

# Obtener subscription ID si no está configurado
if ([string]::IsNullOrEmpty($SubscriptionId)) {
    $SubscriptionId = az account show --query id -o tsv
    Write-Host "Usando subscription: $SubscriptionId" -ForegroundColor Green
} else {
    Write-Host "Configurando subscription: $SubscriptionId" -ForegroundColor Yellow
    az account set --subscription $SubscriptionId
}

# Crear Resource Group si no existe
Write-Host "Verificando Resource Group: $ResourceGroup..." -ForegroundColor Yellow
$rgExists = az group exists --name $ResourceGroup | ConvertFrom-Json

if (-not $rgExists) {
    Write-Host "Creando Resource Group: $ResourceGroup en $Location..." -ForegroundColor Yellow
    az group create --name $ResourceGroup --location $Location
    Write-Host "Resource Group creado exitosamente." -ForegroundColor Green
} else {
    Write-Host "Resource Group ya existe." -ForegroundColor Green
}

# Leer archivo de parámetros
$parameters = Get-Content $ParametersFile | ConvertFrom-Json

# Solicitar contraseña de SQL si no está configurada
if ($null -eq $parameters.parameters.sqlAdministratorPassword.value -or 
    [string]::IsNullOrEmpty($parameters.parameters.sqlAdministratorPassword.value)) {
    Write-Host ""
    $securePassword = Read-Host "Ingresa la contraseña para el administrador de SQL Server" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $sqlPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    
    $parameters.parameters.sqlAdministratorPassword.value = $sqlPassword
    
    # Guardar en archivo temporal
    $tempParamsFile = [System.IO.Path]::GetTempFileName() + ".json"
    $parameters | ConvertTo-Json -Depth 10 | Set-Content $tempParamsFile
    $ParametersFile = $tempParamsFile
}

# Desplegar infraestructura
Write-Host ""
Write-Host "Iniciando despliegue de infraestructura..." -ForegroundColor Green
Write-Host "Esto puede tomar varios minutos..." -ForegroundColor Yellow
Write-Host ""

$deploymentName = "bookr-deployment-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

az deployment group create `
    --resource-group $ResourceGroup `
    --template-file "main.bicep" `
    --parameters "@$ParametersFile" `
    --name $deploymentName `
    --verbose

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "¡Despliegue completado exitosamente!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    
    # Mostrar outputs
    Write-Host "Obteniendo información de los recursos desplegados..." -ForegroundColor Yellow
    az deployment group show `
        --resource-group $ResourceGroup `
        --name $deploymentName `
        --query properties.outputs `
        --output table
    
    # Limpiar archivo temporal si existe
    if ($tempParamsFile -and (Test-Path $tempParamsFile)) {
        Remove-Item $tempParamsFile -Force
    }
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Error en el despliegue" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    exit 1
}

