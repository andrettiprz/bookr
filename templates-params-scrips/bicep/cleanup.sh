#!/bin/bash

# Script de limpieza - Elimina todos los recursos de Bookr
# Este script elimina el Resource Group completo y todos sus recursos

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables configurables
RESOURCE_GROUP="${RESOURCE_GROUP:-bookr}"

echo -e "${RED}========================================${NC}"
echo -e "${RED}LIMPIEZA DE RECURSOS BOOKR${NC}"
echo -e "${RED}========================================${NC}"
echo ""

# Verificar que Azure CLI está instalado
if ! command -v az &> /dev/null; then
    echo -e "${RED}Error: Azure CLI no está instalado.${NC}"
    exit 1
fi

# Verificar que el usuario está logueado
echo -e "${YELLOW}Verificando autenticación en Azure...${NC}"
if ! az account show &> /dev/null; then
    echo -e "${YELLOW}No estás autenticado. Iniciando login...${NC}"
    az login
fi

# Verificar si el Resource Group existe
echo -e "${YELLOW}Verificando Resource Group: ${RESOURCE_GROUP}...${NC}"
if ! az group show --name "$RESOURCE_GROUP" &> /dev/null; then
    echo -e "${GREEN}El Resource Group '${RESOURCE_GROUP}' no existe. No hay nada que limpiar.${NC}"
    exit 0
fi

# Mostrar recursos que se van a eliminar
echo ""
echo -e "${YELLOW}Recursos en el Resource Group '${RESOURCE_GROUP}':${NC}"
az resource list --resource-group "$RESOURCE_GROUP" --output table

echo ""
echo -e "${RED}⚠️  ADVERTENCIA: Esto eliminará TODOS los recursos en el Resource Group '${RESOURCE_GROUP}'${NC}"
echo -e "${RED}Esto incluye:${NC}"
echo "  - Storage Account"
echo "  - SQL Server y Database"
echo "  - Function App"
echo "  - Static Web App"
echo "  - Todos los demás recursos"
echo ""
read -p "¿Estás seguro de que quieres continuar? (escribe 'yes' para confirmar): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${YELLOW}Operación cancelada.${NC}"
    exit 0
fi

# Eliminar Resource Group completo
echo ""
echo -e "${YELLOW}Eliminando Resource Group '${RESOURCE_GROUP}' y todos sus recursos...${NC}"
echo -e "${YELLOW}Esto puede tomar varios minutos...${NC}"
echo ""

az group delete \
    --name "$RESOURCE_GROUP" \
    --yes \
    --no-wait

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✅ Eliminación iniciada exitosamente${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${YELLOW}Nota: La eliminación está en progreso en segundo plano.${NC}"
    echo -e "${YELLOW}Puedes verificar el estado con:${NC}"
    echo -e "${GREEN}az group show --name ${RESOURCE_GROUP}${NC}"
    echo ""
    echo -e "${YELLOW}O espera a que termine completamente antes de volver a desplegar.${NC}"
else
    echo ""
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}Error al eliminar recursos${NC}"
    echo -e "${RED}========================================${NC}"
    exit 1
fi

