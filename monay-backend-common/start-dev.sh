#!/bin/bash

# Monay Backend - Safe Dev Server Starter
# Ensures only one instance runs at a time

PORT=3001
PROJECT_DIR="/Users/alisaberi/Data/0ProductBuild/monay/monay-backend-common"

echo "🔍 Checking for existing processes on port $PORT..."

# Kill any existing processes on the port
if lsof -ti :$PORT > /dev/null 2>&1; then
    echo "⚠️  Found existing process(es) on port $PORT"
    echo "🔪 Killing existing processes..."
    lsof -ti :$PORT | xargs kill -9 2>/dev/null
    sleep 2
    echo "✅ Processes killed"
else
    echo "✅ Port $PORT is available"
fi

# Check again to confirm port is free
if lsof -ti :$PORT > /dev/null 2>&1; then
    echo "❌ ERROR: Port $PORT is still occupied after cleanup"
    exit 1
fi

echo "🚀 Starting Monay Backend on port $PORT..."
cd "$PROJECT_DIR" && PORT=$PORT npm run dev
