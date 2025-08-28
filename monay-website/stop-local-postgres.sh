#!/bin/bash

echo "🛑 Stopping local Postgres database..."
echo ""

# Stop and remove containers
docker-compose down

echo ""
echo "✅ Postgres stopped and containers removed!"
echo "💾 Data is preserved in Docker volume"
echo ""
echo "🚀 To start again: ./start-local-postgres.sh"
echo "🗑️  To remove all data: docker-compose down -v"
