#!/bin/bash

# Script de inicialización de base de datos usando Azure CLI
# Más simple y no requiere sqlcmd local

set -e

RESOURCE_GROUP="${1:-bookr}"
SQL_SERVER="${2:-bookr-sql-server}"
SQL_DATABASE="${3:-bookr-sql-db}"
SQL_USER="${4:-bookradmin}"
SQL_PASSWORD="${5:-}"

if [ -z "$SQL_PASSWORD" ]; then
    echo "Error: SQL password is required"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCHEMA_FILE="$SCRIPT_DIR/../../backend/database/schema.sql"

if [ ! -f "$SCHEMA_FILE" ]; then
    echo "Error: Schema file not found at $SCHEMA_FILE"
    exit 1
fi

echo "Initializing database schema using Azure CLI..."

# Read schema file and execute via Azure CLI
az sql db execute \
    --resource-group "$RESOURCE_GROUP" \
    --server "$SQL_SERVER" \
    --database "$SQL_DATABASE" \
    --file-path "$SCHEMA_FILE" \
    --admin-user "$SQL_USER" \
    --admin-password "$SQL_PASSWORD" 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Database schema initialized successfully!"
else
    echo "⚠️  Note: Database initialization may have failed. You can run it manually later."
fi

