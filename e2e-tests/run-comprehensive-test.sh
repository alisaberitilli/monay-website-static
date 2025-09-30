#!/bin/bash

# Comprehensive E2E Test Runner
# Runs the full multi-industry payment flow test with all payment methods

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=========================================="
echo "   Monay Comprehensive E2E Test Runner   "
echo "=========================================="
echo ""

# Function to check if a service is running
check_service() {
    local port=$1
    local name=$2

    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}✅ $name (Port $port): Running${NC}"
        return 0
    else
        echo -e "${RED}❌ $name (Port $port): Not running${NC}"
        return 1
    fi
}

# Function to create test results directory
setup_directories() {
    echo -e "${BLUE}📁 Setting up test directories...${NC}"
    mkdir -p screenshots/comprehensive-test
    mkdir -p test-results
    echo -e "${GREEN}✅ Directories created${NC}\n"
}

# Check all required services
echo -e "${BLUE}🔍 Checking services...${NC}\n"

SERVICES_OK=true

check_service 3001 "Backend API" || SERVICES_OK=false
check_service 3002 "Admin Portal" || SERVICES_OK=false
check_service 3003 "Consumer Wallet" || SERVICES_OK=false
check_service 3007 "Enterprise Wallet" || SERVICES_OK=false

echo ""

if [ "$SERVICES_OK" = false ]; then
    echo -e "${YELLOW}⚠️  Some services are not running!${NC}"
    echo ""
    echo "Please start the missing services:"
    echo ""

    if ! lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "  # Backend API"
        echo "  cd /Users/alisaberi/Data/0ProductBuild/monay/monay-backend-common"
        echo "  npm run dev"
        echo ""
    fi

    if ! lsof -Pi :3002 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "  # Admin Portal"
        echo "  cd /Users/alisaberi/Data/0ProductBuild/monay/monay-admin"
        echo "  npm run dev"
        echo ""
    fi

    if ! lsof -Pi :3003 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "  # Consumer Wallet"
        echo "  cd /Users/alisaberi/Data/0ProductBuild/monay/monay-cross-platform/web"
        echo "  npm run dev"
        echo ""
    fi

    if ! lsof -Pi :3007 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "  # Enterprise Wallet"
        echo "  cd /Users/alisaberi/Data/0ProductBuild/monay/monay-caas/monay-enterprise-wallet"
        echo "  npm run dev"
        echo ""
    fi

    echo -e "${YELLOW}Continue anyway? (y/n):${NC}"
    read -r response

    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Test aborted${NC}"
        exit 1
    fi
fi

# Setup directories
setup_directories

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}\n"
fi

# Check if Playwright browsers are installed
if [ ! -d "$HOME/.cache/ms-playwright" ]; then
    echo -e "${BLUE}🌐 Installing Playwright browsers...${NC}"
    npx playwright install chromium
    echo -e "${GREEN}✅ Browsers installed${NC}\n"
fi

# Select test mode
echo -e "${BLUE}📋 Select test mode:${NC}"
echo "  1) Headed (see browser)"
echo "  2) Headless (background)"
echo "  3) Debug (step-by-step)"
echo ""
echo -n "Enter choice (1-3): "
read -r mode

case $mode in
    1)
        TEST_COMMAND="npm run test:comprehensive"
        MODE_NAME="Headed"
        ;;
    2)
        TEST_COMMAND="npm run test:comprehensive:headless"
        MODE_NAME="Headless"
        ;;
    3)
        TEST_COMMAND="npm run test:comprehensive:debug"
        MODE_NAME="Debug"
        ;;
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo "=========================================="
echo -e "${GREEN}🚀 Starting Comprehensive E2E Test${NC}"
echo -e "${BLUE}Mode: $MODE_NAME${NC}"
echo "=========================================="
echo ""

# Show test details
echo -e "${YELLOW}Test Coverage:${NC}"
echo "  ✓ 5 Industries: Healthcare, Technology, Retail, Manufacturing, Real Estate"
echo "  ✓ 3 Payment Methods: Card, ACH, SWIFT"
echo "  ✓ 2 Payment Providers: Tempo, Circle"
echo "  ✓ Complete user journey from organization creation to payment"
echo ""

echo -e "${YELLOW}Test Credentials:${NC}"
echo "  Admin Portal: admin@monay.com / Admin@Monay2025! / MPIN: 123456"
echo "  (Other credentials will be generated and displayed after test)"
echo ""

echo -e "${BLUE}⏱️  Estimated Duration: 10-15 minutes${NC}"
echo ""

# Run the test
echo -e "${GREEN}▶️  Executing test...${NC}"
echo ""

# Create timestamp for this test run
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Run the test and capture output
if $TEST_COMMAND 2>&1 | tee test-results/test-run-$TIMESTAMP.log; then
    echo ""
    echo "=========================================="
    echo -e "${GREEN}✅ TEST COMPLETED SUCCESSFULLY${NC}"
    echo "=========================================="
    echo ""

    echo -e "${BLUE}📊 Results:${NC}"
    echo "  • Log file: test-results/test-run-$TIMESTAMP.log"
    echo "  • Screenshots: screenshots/comprehensive-test/"
    echo "  • Test data: test-results/test-run-*.json"
    echo ""

    # Show generated credentials
    echo -e "${YELLOW}📝 Generated Test Credentials:${NC}"
    echo "(Check the log file above for complete list of all generated users)"
    echo ""

    # Generate HTML report if available
    if [ -f "playwright-report/index.html" ]; then
        echo -e "${BLUE}📈 View HTML Report:${NC}"
        echo "  npm run test:report"
        echo ""
    fi

    exit 0
else
    echo ""
    echo "=========================================="
    echo -e "${RED}❌ TEST FAILED${NC}"
    echo "=========================================="
    echo ""

    echo -e "${YELLOW}📋 Troubleshooting:${NC}"
    echo "  1. Check that all services are running"
    echo "  2. Review the log file: test-results/test-run-$TIMESTAMP.log"
    echo "  3. Check screenshots in: screenshots/comprehensive-test/"
    echo "  4. Try running in debug mode: ./run-comprehensive-test.sh (option 3)"
    echo ""

    exit 1
fi