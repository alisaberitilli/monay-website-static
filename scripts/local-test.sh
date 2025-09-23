#!/bin/bash

# Local Testing Script for Monay Platform
# Usage: ./local-test.sh [command]
# Commands: start, stop, restart, logs, test

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

COMMAND=${1:-start}

# Function to check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Docker not found. Please install Docker Desktop.${NC}"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}docker-compose not found. Please install Docker Desktop.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}Prerequisites check passed${NC}"
}

# Function to start services
start_services() {
    echo -e "${YELLOW}Starting Monay services locally...${NC}"
    
    # Create .env file if it doesn't exist
    if [[ ! -f .env ]]; then
        cp .env.example .env
        echo -e "${YELLOW}Created .env file from .env.example${NC}"
        echo -e "${YELLOW}Please update .env with your configuration${NC}"
    fi
    
    # Start services with docker-compose
    docker-compose up -d
    
    echo -e "${GREEN}Services started successfully!${NC}"
    echo -e "${YELLOW}Access your applications at:${NC}"
    echo "  Backend API: http://localhost:3001"
    echo "  Website: http://localhost:3000"
    echo "  Admin: http://localhost:3002"
    echo "  Web App: http://localhost:3003"
    echo "  Enterprise: http://localhost:3007"
    echo "  PostgreSQL: localhost:5432"
    echo "  Redis: localhost:6379"
}

# Function to stop services
stop_services() {
    echo -e "${YELLOW}Stopping Monay services...${NC}"
    docker-compose down
    echo -e "${GREEN}Services stopped${NC}"
}

# Function to restart services
restart_services() {
    stop_services
    start_services
}

# Function to show logs
show_logs() {
    SERVICE=${2:-}
    if [[ -z "$SERVICE" ]]; then
        docker-compose logs -f --tail=100
    else
        docker-compose logs -f --tail=100 "$SERVICE"
    fi
}

# Function to run tests
run_tests() {
    echo -e "${YELLOW}Running tests...${NC}"
    
    # Backend tests
    echo -e "${YELLOW}Testing backend API...${NC}"
    docker-compose exec backend npm test
    
    # Frontend tests
    echo -e "${YELLOW}Testing admin dashboard...${NC}"
    docker-compose exec admin npm test
    
    echo -e "${GREEN}All tests passed!${NC}"
}

# Function to check service health
check_health() {
    echo -e "${YELLOW}Checking service health...${NC}"
    
    # Check backend
    if curl -f http://localhost:3001/health &> /dev/null; then
        echo -e "${GREEN}✓ Backend API is healthy${NC}"
    else
        echo -e "${RED}✗ Backend API is not responding${NC}"
    fi
    
    # Check database
    if docker-compose exec postgres pg_isready &> /dev/null; then
        echo -e "${GREEN}✓ PostgreSQL is healthy${NC}"
    else
        echo -e "${RED}✗ PostgreSQL is not responding${NC}"
    fi
    
    # Check Redis
    if docker-compose exec redis redis-cli ping &> /dev/null; then
        echo -e "${GREEN}✓ Redis is healthy${NC}"
    else
        echo -e "${RED}✗ Redis is not responding${NC}"
    fi
}

# Function to reset database
reset_database() {
    echo -e "${YELLOW}Resetting database...${NC}"
    
    read -p "This will delete all data. Are you sure? (yes/no): " confirm
    if [[ "$confirm" == "yes" ]]; then
        docker-compose exec backend npm run migration:reset
        docker-compose exec backend npm run migration:run
        docker-compose exec backend npm run seed
        echo -e "${GREEN}Database reset complete${NC}"
    else
        echo -e "${YELLOW}Database reset cancelled${NC}"
    fi
}

# Main function
main() {
    check_prerequisites
    
    case "$COMMAND" in
        start)
            start_services
            ;;
        stop)
            stop_services
            ;;
        restart)
            restart_services
            ;;
        logs)
            show_logs $@
            ;;
        test)
            run_tests
            ;;
        health)
            check_health
            ;;
        reset-db)
            reset_database
            ;;
        *)
            echo -e "${RED}Unknown command: $COMMAND${NC}"
            echo "Usage: $0 [start|stop|restart|logs|test|health|reset-db]"
            exit 1
            ;;
    esac
}

main $@