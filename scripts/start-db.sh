#!/bin/bash

# Template Database Startup Script
# This script starts PostgreSQL using Docker Compose

set -e

echo "🐘 Starting PostgreSQL database..."

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start PostgreSQL container
docker-compose up -d postgres

echo "⏳ Waiting for PostgreSQL to be ready..."

# Wait for PostgreSQL to be healthy
timeout=60
elapsed=0
while [ $elapsed -lt $timeout ]; do
    if docker-compose exec -T postgres pg_isready -U user -d template_dev >/dev/null 2>&1; then
        echo "✅ PostgreSQL is ready!"
        echo "📊 Connection details:"
        echo "   Host: localhost"
        echo "   Port: 5432"
        echo "   Database: template_dev"
        echo "   Username: user"
        echo "   Password: password"
        exit 0
    fi
    sleep 2
    elapsed=$((elapsed + 2))
    echo "   Still waiting... (${elapsed}s/${timeout}s)"
done

echo "❌ Timeout waiting for PostgreSQL to start"
echo "📋 Container logs:"
docker-compose logs postgres
exit 1