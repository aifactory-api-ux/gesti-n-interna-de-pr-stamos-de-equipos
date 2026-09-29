#!/bin/bash
set -e

echo "=========================================="
echo "  Préstamo de Equipos Apiux - Startup"
echo "=========================================="

if [ ! -f .env ]; then
    cp .env.example .env
    echo "✓ .env created from .env.example"
    echo ""
    echo "⚠️  Please edit .env and configure your Azure AD credentials:"
    echo "   - AZURE_AD_CLIENT_ID"
    echo "   - AZURE_AD_CLIENT_SECRET"
    echo "   - AZURE_AD_TENANT_ID"
    echo ""
fi

if ! command -v docker &> /dev/null; then
    echo "✗ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "✗ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

DOCKER_COMPOSE_CMD="docker-compose"
if ! docker-compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
fi

echo ""
echo "Building and starting services..."
echo ""

COMPOSE_DOCKERFILE=Dockerfile $DOCKER_COMPOSE_CMD up -d --build

echo ""
echo "=========================================="
echo "  Services are starting..."
echo ""
  echo "  Frontend:  http://localhost:25173"
  echo "  Backend:   http://localhost:23000"
  echo "  API Docs:  http://localhost:23000/api/docs"
echo "=========================================="
echo ""
echo "Waiting for services to be healthy..."

sleep 5

$DOCKER_COMPOSE_CMD -f docker-compose.yml ps

echo ""
echo "✓ Startup complete!"
echo "  Run '$DOCKER_COMPOSE_CMD logs -f' to view logs"
echo "  Run '$DOCKER_COMPOSE_CMD down' to stop services"
