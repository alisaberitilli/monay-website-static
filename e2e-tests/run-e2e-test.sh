#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Monay E2E Test Runner${NC}"
echo "================================"

# Check if services are running
check_service() {
    local port=$1
    local name=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo -e "✅ ${name} running on port ${port}"
        return 0
    else
        echo -e "❌ ${name} NOT running on port ${port}"
        return 1
    fi
}

echo -e "\n${YELLOW}Checking services...${NC}"
services_ok=true

check_service 3001 "Backend API" || services_ok=false
check_service 3002 "Admin Portal" || services_ok=false
check_service 3003 "Consumer Wallet" || services_ok=false
check_service 3007 "Enterprise Wallet" || services_ok=false

if [ "$services_ok" = false ]; then
    echo -e "\n${RED}❌ Some services are not running!${NC}"
    echo -e "${YELLOW}Would you like to start them? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "Starting services..."
        # Start services in background
        cd ../monay-backend-common && npm run dev &
        cd ../monay-admin && npm run dev &
        cd ../monay-cross-platform/web && npm run dev &
        cd ../monay-caas/monay-enterprise-wallet && npm run dev &

        echo "Waiting for services to start (30 seconds)..."
        sleep 30
    else
        echo -e "${RED}Cannot run tests without all services. Exiting.${NC}"
        exit 1
    fi
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "\n${YELLOW}Installing dependencies...${NC}"
    npm install
fi

# Ask if user wants to setup test data
echo -e "\n${YELLOW}Do you want to setup/refresh test data? (y/n)${NC}"
read -r setup_response
if [[ "$setup_response" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Setting up test data...${NC}"
    npm run test:setup
fi

# Run the tests
echo -e "\n${GREEN}Running E2E tests...${NC}"
echo "================================"

# Choose test mode
echo -e "${YELLOW}Select test mode:${NC}"
echo "1) Headless (faster)"
echo "2) Headed (see browser)"
echo "3) Debug (step through)"
read -r mode

case $mode in
    1)
        npm test
        ;;
    2)
        npm run test:headed
        ;;
    3)
        npm run test:debug
        ;;
    *)
        npm run test:headed
        ;;
esac

# Check test results
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ All tests passed!${NC}"
    echo -e "${YELLOW}View detailed report? (y/n)${NC}"
    read -r report_response
    if [[ "$report_response" =~ ^[Yy]$ ]]; then
        npm run test:report
    fi
else
    echo -e "\n${RED}❌ Some tests failed!${NC}"
    echo -e "${YELLOW}Opening test report...${NC}"
    npm run test:report
fi

# Cleanup option
echo -e "\n${YELLOW}Run cleanup for old test data? (y/n)${NC}"
read -r cleanup_response
if [[ "$cleanup_response" =~ ^[Yy]$ ]]; then
    npm run test:cleanup
fi

echo -e "\n${GREEN}E2E Test Run Complete!${NC}"