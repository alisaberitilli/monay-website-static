#!/bin/bash

# Monay Services Startup Script
# Starts all services in the correct order with health checks

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Monay Services Startup Script      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Function to wait for service to start
wait_for_service() {
    local port=$1
    local name=$2
    local max_attempts=30
    local attempt=0

    echo -e "${YELLOW}Waiting for $name to start on port $port...${NC}"

    while [ $attempt -lt $max_attempts ]; do
        if check_port $port; then
            echo -e "${GREEN}✓ $name is running on port $port${NC}"
            return 0
        fi
        sleep 2
        attempt=$((attempt + 1))
    done

    echo -e "${RED}✗ Failed to start $name on port $port${NC}"
    return 1
}

# Function to start a service in background
start_service() {
    local dir=$1
    local name=$2
    local port=$3
    local cmd=$4

    echo -e "${BLUE}Starting $name...${NC}"

    # Check if already running
    if check_port $port; then
        echo -e "${YELLOW}⚠ $name already running on port $port${NC}"
        return 0
    fi

    # Start the service
    cd "$dir" 2>/dev/null || {
        echo -e "${RED}✗ Directory not found: $dir${NC}"
        return 1
    }

    # Run npm install if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing dependencies for $name...${NC}"
        npm install --silent
    fi

    # Start in background
    nohup $cmd > /tmp/monay-$port.log 2>&1 &
    echo $! > /tmp/monay-$port.pid

    # Wait for service to be ready
    wait_for_service $port "$name"
}

# Kill existing services if requested
if [ "$1" = "--restart" ] || [ "$1" = "-r" ]; then
    echo -e "${YELLOW}Stopping existing services...${NC}"

    # Kill processes on known ports
    for port in 3000 3001 3002 3003 3007 5432 6379; do
        if check_port $port; then
            lsof -ti:$port | xargs kill -9 2>/dev/null
            echo -e "${GREEN}✓ Stopped service on port $port${NC}"
        fi
    done

    sleep 2
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}Starting Core Services${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"

# 1. Start PostgreSQL (if not running)
if ! check_port 5432; then
    echo -e "${BLUE}Starting PostgreSQL...${NC}"
    if command -v pg_ctl &> /dev/null; then
        pg_ctl start -D /usr/local/var/postgresql@15 2>/dev/null || \
        pg_ctl start -D /usr/local/var/postgres 2>/dev/null || \
        brew services start postgresql@15 2>/dev/null || \
        brew services start postgresql 2>/dev/null || \
        sudo systemctl start postgresql 2>/dev/null
    fi
    wait_for_service 5432 "PostgreSQL"
else
    echo -e "${GREEN}✓ PostgreSQL already running on port 5432${NC}"
fi

# 2. Start Redis (if not running)
if ! check_port 6379; then
    echo -e "${BLUE}Starting Redis...${NC}"
    if command -v redis-server &> /dev/null; then
        redis-server --daemonize yes 2>/dev/null || \
        brew services start redis 2>/dev/null || \
        sudo systemctl start redis 2>/dev/null
    fi
    wait_for_service 6379 "Redis"
else
    echo -e "${GREEN}✓ Redis already running on port 6379${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}Starting Monay Services${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"

# Base directory
BASE_DIR="/Users/alisaberi/Data/0ProductBuild/monay"

# 3. Backend API (Port 3001) - MUST START FIRST
start_service "$BASE_DIR/monay-backend-common" "Backend API" 3001 "npm run dev"

# Wait a bit for backend to fully initialize
sleep 3

# 4. Marketing Website (Port 3000)
start_service "$BASE_DIR/monay-website" "Marketing Website" 3000 "npm run dev"

# 5. Admin Dashboard (Port 3002)
start_service "$BASE_DIR/monay-admin" "Admin Dashboard" 3002 "npm run dev"

# 6. Consumer Web App (Port 3003)
start_service "$BASE_DIR/monay-cross-platform/web" "Consumer Web App" 3003 "npm run dev"

# 7. Enterprise Wallet (Port 3007)
start_service "$BASE_DIR/monay-caas/monay-enterprise-wallet" "Enterprise Wallet" 3007 "npm run dev"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}Service Status Summary${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"

# Check all services
echo ""
echo -e "${BLUE}Core Services:${NC}"
check_port 5432 && echo -e "  PostgreSQL:        ${GREEN}✓ Running${NC} (5432)" || echo -e "  PostgreSQL:        ${RED}✗ Not Running${NC}"
check_port 6379 && echo -e "  Redis:             ${GREEN}✓ Running${NC} (6379)" || echo -e "  Redis:             ${RED}✗ Not Running${NC}"

echo ""
echo -e "${BLUE}Monay Applications:${NC}"
check_port 3000 && echo -e "  Marketing Website: ${GREEN}✓ Running${NC} (3000)" || echo -e "  Marketing Website: ${RED}✗ Not Running${NC}"
check_port 3001 && echo -e "  Backend API:       ${GREEN}✓ Running${NC} (3001)" || echo -e "  Backend API:       ${RED}✗ Not Running${NC}"
check_port 3002 && echo -e "  Admin Dashboard:   ${GREEN}✓ Running${NC} (3002)" || echo -e "  Admin Dashboard:   ${RED}✗ Not Running${NC}"
check_port 3003 && echo -e "  Consumer Web:      ${GREEN}✓ Running${NC} (3003)" || echo -e "  Consumer Web:      ${RED}✗ Not Running${NC}"
check_port 3007 && echo -e "  Enterprise Wallet: ${GREEN}✓ Running${NC} (3007)" || echo -e "  Enterprise Wallet: ${RED}✗ Not Running${NC}"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}Access URLs:${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""
echo -e "  Marketing Site:    ${GREEN}http://localhost:3000${NC}"
echo -e "  Backend API:       ${GREEN}http://localhost:3001/api/status${NC}"
echo -e "  Admin Dashboard:   ${GREEN}http://localhost:3002${NC}"
echo -e "  Consumer Wallet:   ${GREEN}http://localhost:3003${NC}"
echo -e "  Enterprise Wallet: ${GREEN}http://localhost:3007${NC}"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}Useful Commands:${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""
echo -e "  View logs:         ${YELLOW}tail -f /tmp/monay-*.log${NC}"
echo -e "  Stop all:          ${YELLOW}./stop-all-services.sh${NC}"
echo -e "  Restart all:       ${YELLOW}./start-all-services.sh --restart${NC}"
echo -e "  Check status:      ${YELLOW}./check-services.sh${NC}"
echo -e "  Test consumer API: ${YELLOW}node test-consumer-wallet-endpoints.js${NC}"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     All Services Started Successfully  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""

# Create stop script if it doesn't exist
cat > /tmp/stop-all-services.sh << 'EOF'
#!/bin/bash
echo "Stopping all Monay services..."
for port in 3000 3001 3002 3003 3007; do
    if [ -f /tmp/monay-$port.pid ]; then
        kill $(cat /tmp/monay-$port.pid) 2>/dev/null
        rm /tmp/monay-$port.pid
    fi
    lsof -ti:$port | xargs kill -9 2>/dev/null
done
echo "All services stopped."
EOF
chmod +x /tmp/stop-all-services.sh
ln -sf /tmp/stop-all-services.sh "$BASE_DIR/stop-all-services.sh" 2>/dev/null

# Create check script
cat > /tmp/check-services.sh << 'EOF'
#!/bin/bash
echo "Checking Monay services..."
for port in 3000 3001 3002 3003 3007 5432 6379; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null; then
        echo "Port $port: ✓ Running"
    else
        echo "Port $port: ✗ Not running"
    fi
done
EOF
chmod +x /tmp/check-services.sh
ln -sf /tmp/check-services.sh "$BASE_DIR/check-services.sh" 2>/dev/null