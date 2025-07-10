#!/bin/bash

# Template Database Stop Script
# This script stops PostgreSQL Docker container

set -e

echo "🛑 Stopping PostgreSQL database..."

# Stop PostgreSQL container
docker-compose down

echo "✅ PostgreSQL stopped successfully"