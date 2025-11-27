#!/bin/bash

# Script de inicialización de base de datos
# Ejecuta el schema SQL en la base de datos

set -e

RESOURCE_GROUP="${1:-bookr}"
SQL_SERVER="${2:-bookr-sql-server}"
SQL_DATABASE="${3:-bookr-sql-db}"
SQL_USER="${4:-bookradmin}"
SQL_PASSWORD="${5:-}"

if [ -z "$SQL_PASSWORD" ]; then
    echo "Error: SQL password is required"
    echo "Usage: $0 <resource-group> <sql-server> <sql-database> <sql-user> <sql-password>"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCHEMA_FILE="$SCRIPT_DIR/../backend/database/schema.sql"

if [ ! -f "$SCHEMA_FILE" ]; then
    echo "Error: Schema file not found at $SCHEMA_FILE"
    exit 1
fi

echo "Initializing database schema..."

# Install sqlcmd if not available
if ! command -v sqlcmd &> /dev/null; then
    echo "sqlcmd not found. Installing..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew tap microsoft/mssql-release https://github.com/Microsoft/homebrew-mssql-release
        brew update
        HOMEBREW_NO_ENV_FILTERING=1 ACCEPT_EULA=Y brew install mssql-tools18
    else
        echo "Please install sqlcmd manually for your OS"
        exit 1
    fi
fi

# Execute schema
sqlcmd -S "${SQL_SERVER}.database.windows.net" \
    -d "$SQL_DATABASE" \
    -U "$SQL_USER" \
    -P "$SQL_PASSWORD" \
    -i "$SCHEMA_FILE" \
    -l 30

echo "Database schema initialized successfully!"

