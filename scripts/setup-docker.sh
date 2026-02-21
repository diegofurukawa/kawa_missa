#!/bin/bash

# Setup script for Kawa Missa Docker deployment
# This script creates the required Docker network and validates configuration

set -e

echo "🚀 Iniciando setup do Kawa Missa..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Por favor, instale Docker primeiro."
    exit 1
fi

# Create Docker network if it doesn't exist
NETWORK_NAME="${DOCKER_NETWORK_NAME:-kawatech-network}"

if docker network inspect "$NETWORK_NAME" &> /dev/null; then
    echo "✅ Network Docker '$NETWORK_NAME' já existe"
else
    echo "📦 Criando network Docker '$NETWORK_NAME'..."
    docker network create "$NETWORK_NAME"
    echo "✅ Network criada com sucesso"
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Arquivo .env não encontrado"
    echo "📋 Criando .env a partir de .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Arquivo .env criado. Por favor, configure as variáveis de ambiente."
    else
        echo "❌ Arquivo .env.example não encontrado"
        exit 1
    fi
fi

# Validate required environment variables
echo "🔍 Validando variáveis de ambiente..."

REQUIRED_VARS=(
    "DB_HOST"
    "DB_PORT"
    "DB_USER"
    "DB_PASSWORD"
    "DB_NAME"
    "AUTH_SECRET"
    "NEXTAUTH_SECRET"
    "JWT_SECRET"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^$var=" .env || grep "^$var=$" .env &> /dev/null; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo "⚠️  Variáveis de ambiente não configuradas:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Por favor, configure estas variáveis em seu arquivo .env"
    exit 1
fi

echo "✅ Todas as variáveis de ambiente estão configuradas"

# Generate secrets if not present
if grep -q "^AUTH_SECRET=$" .env; then
    echo "🔐 Gerando AUTH_SECRET..."
    SECRET=$(openssl rand -base64 32)
    sed -i "s/^AUTH_SECRET=$/AUTH_SECRET=$SECRET/" .env
fi

if grep -q "^NEXTAUTH_SECRET=$" .env; then
    echo "🔐 Gerando NEXTAUTH_SECRET..."
    SECRET=$(openssl rand -base64 32)
    sed -i "s/^NEXTAUTH_SECRET=$/NEXTAUTH_SECRET=$SECRET/" .env
fi

if grep -q "^JWT_SECRET=$" .env; then
    echo "🔐 Gerando JWT_SECRET..."
    SECRET=$(openssl rand -base64 32)
    sed -i "s/^JWT_SECRET=$/JWT_SECRET=$SECRET/" .env
fi

echo ""
echo "✅ Setup concluído com sucesso!"
echo ""
echo "📝 Próximos passos:"
echo "   1. Revise as variáveis de ambiente em .env"
echo "   2. Execute: docker-compose up -d"
echo "   3. Acesse: http://localhost:3115"
echo ""
