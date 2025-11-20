#!/bin/bash

# Script de despliegue de infraestructura Bookr con Bicep
# Este script despliega toda la infraestructura con un solo comando

set -e  # Salir si hay algún error

# Obtener el directorio del script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables configurables
RESOURCE_GROUP="${RESOURCE_GROUP:-bookr-rg}"
LOCATION="${LOCATION:-westus2}"
SUBSCRIPTION_ID="${SUBSCRIPTION_ID:-}"
PARAMETERS_FILE="${PARAMETERS_FILE:-main.parameters.json}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Despliegue de Infraestructura Bookr${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Verificar que Azure CLI está instalado
if ! command -v az &> /dev/null; then
    echo -e "${RED}Error: Azure CLI no está instalado.${NC}"
    echo "Instala Azure CLI desde: https://docs.microsoft.com/cli/azure/install-azure-cli"
    exit 1
fi

# Verificar que el usuario está logueado
echo -e "${YELLOW}Verificando autenticación en Azure...${NC}"
if ! az account show &> /dev/null; then
    echo -e "${YELLOW}No estás autenticado. Iniciando login...${NC}"
    az login
fi

# Obtener subscription ID si no está configurado
if [ -z "$SUBSCRIPTION_ID" ]; then
    SUBSCRIPTION_ID=$(az account show --query id -o tsv)
    echo -e "${GREEN}Usando subscription: ${SUBSCRIPTION_ID}${NC}"
else
    echo -e "${YELLOW}Configurando subscription: ${SUBSCRIPTION_ID}${NC}"
    az account set --subscription "$SUBSCRIPTION_ID"
fi

# Crear Resource Group si no existe
echo -e "${YELLOW}Verificando Resource Group: ${RESOURCE_GROUP}...${NC}"
if ! az group show --name "$RESOURCE_GROUP" &> /dev/null; then
    echo -e "${YELLOW}Creando Resource Group: ${RESOURCE_GROUP} en ${LOCATION}...${NC}"
    if ! az group create --name "$RESOURCE_GROUP" --location "$LOCATION" 2>&1; then
        echo ""
        echo -e "${RED}========================================${NC}"
        echo -e "${RED}Error: No tienes permisos para crear Resource Groups${NC}"
        echo -e "${RED}========================================${NC}"
        echo ""
        echo -e "${YELLOW}Posibles soluciones:${NC}"
        echo "1. Contacta al administrador de tu suscripción de Azure para obtener permisos de 'Contributor' o 'Owner'"
        echo "2. Verifica si tienes otra suscripción con permisos:"
        echo "   ${GREEN}az account list --output table${NC}"
        echo "3. Cambia a otra suscripción si tienes una:"
        echo "   ${GREEN}az account set --subscription 'TU-SUBSCRIPTION-ID'${NC}"
        echo "4. Si el Resource Group ya existe en otra suscripción, úsalo:"
        echo "   ${GREEN}export RESOURCE_GROUP='nombre-del-rg-existente'${NC}"
        echo ""
        exit 1
    fi
    echo -e "${GREEN}Resource Group creado exitosamente.${NC}"
else
    echo -e "${GREEN}Resource Group ya existe.${NC}"
fi

# Solicitar contraseña de SQL si no está en los parámetros
SQL_PASSWORD=""
if grep -q '"sqlAdministratorPassword": null' "$PARAMETERS_FILE" 2>/dev/null || ! grep -q '"sqlAdministratorPassword"' "$PARAMETERS_FILE" 2>/dev/null || grep -q '"sqlAdministratorPassword".*null' "$PARAMETERS_FILE" 2>/dev/null; then
    echo ""
    echo -e "${YELLOW}Ingresa la contraseña para el administrador de SQL Server:${NC}"
    echo -e "${YELLOW}(La contraseña debe tener al menos 8 caracteres, mayúsculas, minúsculas, números y caracteres especiales)${NC}"
    read -s SQL_PASSWORD
    echo ""
    
    if [ -z "$SQL_PASSWORD" ]; then
        echo -e "${RED}Error: La contraseña no puede estar vacía.${NC}"
        exit 1
    fi
    
    # Crear archivo temporal de parámetros con la contraseña
    TEMP_PARAMS=$(mktemp)
    if [ -f "$PARAMETERS_FILE" ]; then
        # Reemplazar null con la contraseña (requiere jq o sed)
        if command -v jq &> /dev/null; then
            jq ".parameters.sqlAdministratorPassword.value = \"$SQL_PASSWORD\"" "$PARAMETERS_FILE" > "$TEMP_PARAMS"
        else
            # Fallback a sed (menos robusto)
            sed "s/\"sqlAdministratorPassword\": null/\"sqlAdministratorPassword\": \"$SQL_PASSWORD\"/" "$PARAMETERS_FILE" > "$TEMP_PARAMS"
        fi
        PARAMETERS_FILE="$TEMP_PARAMS"
    fi
fi

# Desplegar infraestructura
echo ""
echo -e "${GREEN}Iniciando despliegue de infraestructura...${NC}"
echo -e "${YELLOW}Esto puede tomar varios minutos...${NC}"
echo ""

DEPLOYMENT_NAME="bookr-deployment-$(date +%Y%m%d-%H%M%S)"

az deployment group create \
    --resource-group "$RESOURCE_GROUP" \
    --template-file "main.bicep" \
    --parameters "@${PARAMETERS_FILE}" \
    --name "$DEPLOYMENT_NAME" \
    --verbose

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}¡Despliegue completado exitosamente!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    
    # Mostrar outputs
    echo -e "${YELLOW}Obteniendo información de los recursos desplegados...${NC}"
    az deployment group show \
        --resource-group "$RESOURCE_GROUP" \
        --name "$DEPLOYMENT_NAME" \
        --query properties.outputs \
        --output table
    
    # Limpiar archivo temporal si existe
    if [ -n "$TEMP_PARAMS" ] && [ -f "$TEMP_PARAMS" ]; then
        rm "$TEMP_PARAMS"
    fi
else
    echo ""
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}Error en el despliegue${NC}"
    echo -e "${RED}========================================${NC}"
    exit 1
fi

