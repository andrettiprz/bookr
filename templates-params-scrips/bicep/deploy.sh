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
RESOURCE_GROUP="${RESOURCE_GROUP:-bookr}"
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

# Crear Resource Group (siempre se crea desde cero)
echo -e "${YELLOW}Creando/Verificando Resource Group: ${RESOURCE_GROUP}...${NC}"

# Verificar si existe y eliminarlo si tiene recursos antiguos
if az group show --name "$RESOURCE_GROUP" &> /dev/null; then
    RESOURCE_COUNT=$(az resource list --resource-group "$RESOURCE_GROUP" --query "length(@)" -o tsv 2>/dev/null || echo "0")
    if [ "$RESOURCE_COUNT" -gt 0 ]; then
        echo -e "${YELLOW}El Resource Group existe y tiene recursos. Eliminando recursos antiguos...${NC}"
        az group delete --name "$RESOURCE_GROUP" --yes --no-wait 2>/dev/null || true
        echo -e "${YELLOW}Esperando a que se complete la eliminación...${NC}"
        sleep 10
        # Esperar hasta que el grupo esté disponible o no exista
        for i in {1..30}; do
            if ! az group show --name "$RESOURCE_GROUP" &> /dev/null; then
                break
            fi
            sleep 2
        done
    fi
fi

# Crear Resource Group (si no existe o fue eliminado)
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
        echo ""
        exit 1
    fi
    echo -e "${GREEN}✅ Resource Group creado exitosamente.${NC}"
else
    echo -e "${GREEN}✅ Resource Group listo.${NC}"
fi

# Obtener contraseña de SQL desde parámetros o solicitar
SQL_PASSWORD=""
if [ -f "$PARAMETERS_FILE" ]; then
    # Intentar obtener la contraseña del archivo de parámetros
    if command -v jq &> /dev/null; then
        SQL_PASSWORD=$(jq -r '.parameters.sqlAdministratorPassword.value // empty' "$PARAMETERS_FILE" 2>/dev/null)
    else
        SQL_PASSWORD=$(grep -o '"sqlAdministratorPassword".*"value".*"[^"]*"' "$PARAMETERS_FILE" 2>/dev/null | grep -o '"[^"]*"$' | tr -d '"' || echo "")
    fi
fi

# Si la contraseña está vacía o es null, solicitar
if [ -z "$SQL_PASSWORD" ] || [ "$SQL_PASSWORD" = "null" ]; then
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
else
    echo -e "${GREEN}✅ Contraseña de SQL obtenida del archivo de parámetros.${NC}"
fi

# Verificar que JWT Secret esté configurado
if [ -f "$PARAMETERS_FILE" ]; then
    if command -v jq &> /dev/null; then
        JWT_SECRET=$(jq -r '.parameters.jwtSecret.value // empty' "$PARAMETERS_FILE" 2>/dev/null)
    else
        JWT_SECRET=$(grep -o '"jwtSecret".*"value".*"[^"]*"' "$PARAMETERS_FILE" 2>/dev/null | grep -o '"[^"]*"$' | tr -d '"' || echo "")
    fi
    
    if [ -n "$JWT_SECRET" ] && [ "$JWT_SECRET" != "null" ]; then
        echo -e "${GREEN}✅ JWT Secret configurado.${NC}"
    else
        echo -e "${YELLOW}⚠️  JWT Secret no configurado, se generará automáticamente.${NC}"
    fi
fi

# Desplegar infraestructura
echo ""
echo -e "${GREEN}Iniciando despliegue de infraestructura...${NC}"
echo -e "${YELLOW}Esto puede tomar varios minutos...${NC}"
echo ""

DEPLOYMENT_NAME="bookr-deployment-$(date +%Y%m%d-%H%M%S)"

echo -e "${GREEN}Desplegando recursos:${NC}"
echo -e "  - Storage Account"
echo -e "  - SQL Server y Database"
echo -e "  - Azure Functions (API)"
echo -e "  - Static Web App"
echo ""

az deployment group create \
    --resource-group "$RESOURCE_GROUP" \
    --template-file "main.bicep" \
    --parameters "@${PARAMETERS_FILE}" \
    --name "$DEPLOYMENT_NAME"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}¡Despliegue completado exitosamente!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    
    # Mostrar outputs
    echo -e "${YELLOW}Obteniendo información de los recursos desplegados...${NC}"
    OUTPUTS=$(az deployment group show \
        --resource-group "$RESOURCE_GROUP" \
        --name "$DEPLOYMENT_NAME" \
        --query properties.outputs \
        -o json)
    
    echo "$OUTPUTS" | jq -r 'to_entries[] | "\(.key): \(.value.value)"' 2>/dev/null || echo "$OUTPUTS"
    
    # Inicializar base de datos automáticamente
    echo ""
    echo -e "${YELLOW}Inicializando esquema de base de datos...${NC}"
    SQL_SERVER=$(echo "$OUTPUTS" | jq -r '.sqlServerFqdn.value' 2>/dev/null | sed 's/.database.windows.net//')
    SQL_DB=$(echo "$OUTPUTS" | jq -r '.databaseName.value' 2>/dev/null)
    
    if [ -n "$SQL_SERVER" ] && [ -n "$SQL_DB" ] && [ -n "$SQL_PASSWORD" ]; then
        SQL_USER=$(jq -r '.parameters.sqlAdministratorLogin.value' "$PARAMETERS_FILE" 2>/dev/null || echo "bookradmin")
        
        # Esperar un momento para que SQL esté listo
        echo -e "${YELLOW}Esperando a que SQL Server esté listo...${NC}"
        sleep 15
        
        # Intentar inicializar BD usando Azure CLI
        INIT_SCRIPT="$SCRIPT_DIR/scripts/init-database-azure.sh"
        if [ -f "$INIT_SCRIPT" ]; then
            chmod +x "$INIT_SCRIPT"
            if "$INIT_SCRIPT" "$RESOURCE_GROUP" "$SQL_SERVER" "$SQL_DB" "$SQL_USER" "$SQL_PASSWORD"; then
                echo -e "${GREEN}✅ Base de datos inicializada exitosamente.${NC}"
            else
                echo -e "${YELLOW}⚠️  La inicialización de BD falló. Puedes ejecutarla manualmente después.${NC}"
            fi
        else
            # Intentar inicializar directamente con Azure CLI
            SCHEMA_FILE="$SCRIPT_DIR/../../backend/database/schema.sql"
            if [ -f "$SCHEMA_FILE" ]; then
                echo -e "${YELLOW}Ejecutando script SQL directamente...${NC}"
                az sql db execute \
                    --resource-group "$RESOURCE_GROUP" \
                    --server "$SQL_SERVER" \
                    --database "$SQL_DB" \
                    --file-path "$SCHEMA_FILE" \
                    --admin-user "$SQL_USER" \
                    --admin-password "$SQL_PASSWORD" 2>&1 && \
                    echo -e "${GREEN}✅ Base de datos inicializada exitosamente.${NC}" || \
                    echo -e "${YELLOW}⚠️  La inicialización de BD falló. Puedes ejecutarla manualmente después.${NC}"
            else
                echo -e "${YELLOW}⚠️  Archivo de esquema no encontrado. La BD necesita ser inicializada manualmente.${NC}"
            fi
        fi
    else
        echo -e "${YELLOW}⚠️  No se pudo obtener información de SQL. La BD necesita ser inicializada manualmente.${NC}"
    fi
    
    # Limpiar archivo temporal si existe
    if [ -n "$TEMP_PARAMS" ] && [ -f "$TEMP_PARAMS" ]; then
        rm "$TEMP_PARAMS"
    fi
    
    # Mostrar URLs importantes
    FUNCTION_URL=$(echo "$OUTPUTS" | jq -r '.functionAppUrl.value' 2>/dev/null || echo "N/A")
    STATIC_WEB_URL=$(echo "$OUTPUTS" | jq -r '.staticWebAppUrl.value' 2>/dev/null || echo "N/A")
    
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✅ DESPLIEGUE COMPLETO EXITOSO${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${YELLOW}Recursos desplegados:${NC}"
    echo -e "  ✅ Resource Group: ${RESOURCE_GROUP}"
    echo -e "  ✅ Storage Account"
    echo -e "  ✅ SQL Server y Database"
    echo -e "  ✅ Azure Functions (API)"
    echo -e "  ✅ Static Web App"
    echo ""
    if [ "$FUNCTION_URL" != "N/A" ]; then
        echo -e "${YELLOW}URLs importantes:${NC}"
        echo -e "  📡 API Backend: ${FUNCTION_URL}"
        if [ "$STATIC_WEB_URL" != "N/A" ]; then
            echo -e "  🌐 Frontend: https://${STATIC_WEB_URL}"
        fi
        echo ""
    fi
    
    # Desplegar código del backend automáticamente
    echo -e "${YELLOW}Desplegando código del backend...${NC}"
    BACKEND_DIR="$SCRIPT_DIR/../../backend"
    
    if [ -d "$BACKEND_DIR" ]; then
        cd "$BACKEND_DIR"
        
        # Instalar dependencias
        echo -e "${YELLOW}Instalando dependencias del backend...${NC}"
        npm install --silent 2>&1 | tail -5
        
        # Crear .funcignore si no existe
        if [ ! -f ".funcignore" ]; then
            echo "node_modules" > .funcignore
            echo ".git" >> .funcignore
            echo ".vscode" >> .funcignore
            echo "local.settings.json" >> .funcignore
            echo ".DS_Store" >> .funcignore
        fi
        
        # Verificar si func está instalado
        if ! command -v func &> /dev/null; then
            echo -e "${RED}❌ Azure Functions Core Tools no está instalado.${NC}"
            echo -e "${YELLOW}Instálalo con: brew install azure-functions-core-tools@4${NC}"
            echo -e "${YELLOW}Luego ejecuta manualmente:${NC}"
            echo -e "   ${GREEN}cd backend && func azure functionapp publish bookr-api --javascript${NC}"
        else
            echo -e "${YELLOW}Publicando código del backend a Azure...${NC}"
            
            # Reiniciar Function App primero
            az functionapp restart --name bookr-api --resource-group "$RESOURCE_GROUP" &> /dev/null
            sleep 5
            
            # Desplegar con retry
            MAX_RETRIES=3
            RETRY_COUNT=0
            DEPLOY_SUCCESS=false
            
            while [ $RETRY_COUNT -lt $MAX_RETRIES ] && [ "$DEPLOY_SUCCESS" = false ]; do
                if func azure functionapp publish bookr-api --javascript 2>&1 | tee /tmp/func-deploy.log; then
                    DEPLOY_SUCCESS=true
                    echo -e "${GREEN}✅ Backend desplegado exitosamente.${NC}"
                else
                    RETRY_COUNT=$((RETRY_COUNT + 1))
                    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
                        echo -e "${YELLOW}⚠️  Intento $RETRY_COUNT falló. Reintentando en 10 segundos...${NC}"
                        sleep 10
                    else
                        echo -e "${YELLOW}⚠️  No se pudo desplegar el backend automáticamente.${NC}"
                        echo -e "${YELLOW}Despliégalo manualmente con:${NC}"
                        echo -e "   ${GREEN}cd backend && func azure functionapp publish bookr-api --javascript${NC}"
                    fi
                fi
            done
        fi
        
        cd "$SCRIPT_DIR"
    else
        echo -e "${YELLOW}⚠️  Carpeta backend no encontrada.${NC}"
    fi
    
    echo ""
    echo -e "${YELLOW}Estado Final:${NC}"
    echo "✅ Infraestructura desplegada"
    echo "✅ Backend desplegado"
    echo "⏳ Frontend desplegándose vía GitHub Actions (2-5 minutos)"
    echo ""
    echo -e "${YELLOW}Verifica:${NC}"
    echo "1. GitHub Actions: https://github.com/$(git config remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/actions"
    echo "2. Cuando termine GitHub Actions, tu app estará en: https://${STATIC_WEB_URL}"
    echo ""
else
    echo ""
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}Error en el despliegue${NC}"
    echo -e "${RED}========================================${NC}"
    exit 1
fi

