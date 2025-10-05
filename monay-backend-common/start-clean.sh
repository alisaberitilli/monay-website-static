#!/bin/bash

# Monay Backend - Clean Startup Script
# Ensures ONLY ONE instance runs by killing all existing processes first

echo "🧹 Cleaning up ALL existing backend processes..."

# Kill all nodemon processes
pkill -9 -f "nodemon.*index.js" 2>/dev/null
# Kill all node processes running our backend
pkill -9 -f "node.*experimental-modules.*index.js" 2>/dev/null
# Kill anything on port 3001
lsof -ti :3001 | xargs kill -9 2>/dev/null

echo "⏳ Waiting 3 seconds for cleanup..."
sleep 3

# Verify port is clear
if lsof -ti :3001 > /dev/null 2>&1; then
    echo "❌ ERROR: Port 3001 is still occupied after cleanup!"
    echo "Processes on port 3001:"
    lsof -ti :3001 | xargs ps -fp
    exit 1
fi

echo "✅ Port 3001 is clear"
echo "🚀 Starting Monay Backend (single instance)..."
echo ""

# Start backend
cd "$(dirname "$0")"
PORT=3001 npm run dev
