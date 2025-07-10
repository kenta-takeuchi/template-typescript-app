#!/bin/bash

# Template Database Reset Script
# This script resets the database by removing containers and volumes

set -e

echo "🔄 Resetting PostgreSQL database..."

# Stop and remove containers, networks, and volumes
docker-compose down -v

echo "✅ Database reset completed. Run 'pnpm db:start' to start fresh."