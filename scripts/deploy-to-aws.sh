#!/bin/bash

# Deploy Monay Platform to AWS
# Usage: ./deploy-to-aws.sh [environment] [component]
# Examples:
#   ./deploy-to-aws.sh dev all
#   ./deploy-to-aws.sh prod backend
#   ./deploy-to-aws.sh staging frontend

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-dev}
COMPONENT=${2:-all}
AWS_REGION=${AWS_REGION:-us-east-1}
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    echo -e "${RED}Error: Invalid environment. Use dev, staging, or prod${NC}"
    exit 1
fi

# Validate component
if [[ ! "$COMPONENT" =~ ^(all|backend|website|admin|web|enterprise-wallet|infrastructure)$ ]]; then
    echo -e "${RED}Error: Invalid component. Use all, backend, website, admin, web, enterprise-wallet, or infrastructure${NC}"
    exit 1
fi

echo -e "${GREEN}Deploying Monay Platform to AWS${NC}"
echo "Environment: $ENVIRONMENT"
echo "Component: $COMPONENT"
echo "AWS Region: $AWS_REGION"
echo "AWS Account: $AWS_ACCOUNT_ID"

# Function to check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}AWS CLI not found. Please install it first.${NC}"
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Docker not found. Please install it first.${NC}"
        exit 1
    fi
    
    # Check Terraform
    if [[ "$COMPONENT" == "infrastructure" || "$COMPONENT" == "all" ]]; then
        if ! command -v terraform &> /dev/null; then
            echo -e "${RED}Terraform not found. Please install it first.${NC}"
            exit 1
        fi
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        echo -e "${RED}AWS credentials not configured. Run 'aws configure'${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}Prerequisites check passed${NC}"
}

# Function to deploy infrastructure
deploy_infrastructure() {
    echo -e "${YELLOW}Deploying infrastructure with Terraform...${NC}"
    
    cd terraform
    
    # Initialize Terraform
    terraform init
    
    # Plan deployment
    terraform plan -var-file=environments/${ENVIRONMENT}.tfvars -out=tfplan
    
    # Apply if user confirms
    read -p "Do you want to apply these changes? (yes/no): " confirm
    if [[ "$confirm" == "yes" ]]; then
        terraform apply tfplan
        echo -e "${GREEN}Infrastructure deployed successfully${NC}"
    else
        echo -e "${YELLOW}Infrastructure deployment cancelled${NC}"
    fi
    
    cd ..
}

# Function to login to ECR
login_ecr() {
    echo -e "${YELLOW}Logging in to ECR...${NC}"
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY
}

# Function to build and push Docker image
build_and_push() {
    local app_name=$1
    local app_path=$2
    local port=$3
    
    echo -e "${YELLOW}Building and pushing $app_name...${NC}"
    
    cd "$app_path"
    
    # Build Docker image
    docker build -t "$app_name:latest" .
    
    # Tag for ECR
    docker tag "$app_name:latest" "$ECR_REGISTRY/$app_name:latest"
    docker tag "$app_name:latest" "$ECR_REGISTRY/$app_name:$ENVIRONMENT-$(date +%Y%m%d%H%M%S)"
    
    # Create ECR repository if it doesn't exist
    aws ecr describe-repositories --repository-names "$app_name" --region $AWS_REGION 2>/dev/null || \
        aws ecr create-repository --repository-name "$app_name" --region $AWS_REGION
    
    # Push to ECR
    docker push "$ECR_REGISTRY/$app_name:latest"
    docker push "$ECR_REGISTRY/$app_name:$ENVIRONMENT-$(date +%Y%m%d%H%M%S)"
    
    echo -e "${GREEN}$app_name pushed to ECR${NC}"
    
    cd - > /dev/null
}

# Function to update ECS service
update_ecs_service() {
    local service_name=$1
    local cluster_name="monay-${ENVIRONMENT}"
    
    echo -e "${YELLOW}Updating ECS service $service_name...${NC}"
    
    aws ecs update-service \
        --cluster "$cluster_name" \
        --service "$service_name" \
        --force-new-deployment \
        --region $AWS_REGION
    
    echo -e "${GREEN}ECS service $service_name updated${NC}"
}

# Function to deploy backend
deploy_backend() {
    echo -e "${YELLOW}Deploying backend...${NC}"
    build_and_push "monay-backend-common" "./monay-backend-common" 3001
    update_ecs_service "monay-backend"
}

# Function to deploy website
deploy_website() {
    echo -e "${YELLOW}Deploying static website...${NC}"
    
    cd monay-website-static
    
    # Build the static site
    npm ci
    npm run build
    
    # Get S3 bucket name
    S3_BUCKET="monay-${ENVIRONMENT}-static-website"
    
    # Create bucket if it doesn't exist
    aws s3api head-bucket --bucket "$S3_BUCKET" 2>/dev/null || \
        aws s3 mb "s3://$S3_BUCKET" --region $AWS_REGION
    
    # Configure bucket for static website hosting
    aws s3 website "s3://$S3_BUCKET" --index-document index.html --error-document 404.html
    
    # Upload files
    aws s3 sync ./out "s3://$S3_BUCKET" --delete --cache-control "public, max-age=31536000"
    
    # Invalidate CloudFront if distribution exists
    DISTRIBUTION_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?Comment=='monay-${ENVIRONMENT}'].Id" --output text)
    if [[ ! -z "$DISTRIBUTION_ID" ]]; then
        aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*"
        echo -e "${GREEN}CloudFront cache invalidated${NC}"
    fi
    
    cd ..
    echo -e "${GREEN}Static website deployed${NC}"
}

# Function to deploy admin
deploy_admin() {
    echo -e "${YELLOW}Deploying admin dashboard...${NC}"
    build_and_push "monay-admin" "./monay-admin" 3002
    update_ecs_service "monay-admin"
}

# Function to deploy web app
deploy_web() {
    echo -e "${YELLOW}Deploying web application...${NC}"
    build_and_push "monay-web-app" "./monay-cross-platform/web" 3003
    update_ecs_service "monay-web"
}

# Function to deploy enterprise wallet
deploy_enterprise_wallet() {
    echo -e "${YELLOW}Deploying enterprise wallet...${NC}"
    build_and_push "monay-enterprise-wallet" "./monay-caas/monay-enterprise-wallet" 3007
    update_ecs_service "monay-enterprise-wallet"
}

# Function to run database migrations
run_migrations() {
    echo -e "${YELLOW}Running database migrations...${NC}"
    
    # Get database endpoint
    DB_ENDPOINT=$(aws rds describe-db-instances \
        --db-instance-identifier "monay-${ENVIRONMENT}" \
        --query 'DBInstances[0].Endpoint.Address' \
        --output text)
    
    # Run migrations via ECS task
    aws ecs run-task \
        --cluster "monay-${ENVIRONMENT}" \
        --task-definition "monay-migrations-${ENVIRONMENT}" \
        --network-configuration "awsvpcConfiguration={subnets=[$(aws ec2 describe-subnets --filters "Name=tag:Environment,Values=${ENVIRONMENT}" --query 'Subnets[?MapPublicIpOnLaunch==`false`].SubnetId' --output text | tr '\t' ',')],securityGroups=[$(aws ec2 describe-security-groups --filters "Name=tag:Name,Values=monay-${ENVIRONMENT}-ecs-tasks" --query 'SecurityGroups[0].GroupId' --output text)]}" \
        --launch-type FARGATE
    
    echo -e "${GREEN}Database migrations completed${NC}"
}

# Main deployment flow
main() {
    check_prerequisites
    
    # Load environment variables
    if [[ -f ".env.${ENVIRONMENT}" ]]; then
        export $(cat ".env.${ENVIRONMENT}" | grep -v '^#' | xargs)
    fi
    
    # Deploy based on component
    case "$COMPONENT" in
        infrastructure)
            deploy_infrastructure
            ;;
        backend)
            login_ecr
            deploy_backend
            run_migrations
            ;;
        website)
            deploy_website
            ;;
        admin)
            login_ecr
            deploy_admin
            ;;
        web)
            login_ecr
            deploy_web
            ;;
        enterprise-wallet)
            login_ecr
            deploy_enterprise_wallet
            ;;
        all)
            deploy_infrastructure
            login_ecr
            deploy_backend
            run_migrations
            deploy_website
            deploy_admin
            deploy_web
            deploy_enterprise_wallet
            ;;
        *)
            echo -e "${RED}Invalid component: $COMPONENT${NC}"
            exit 1
            ;;
    esac
    
    echo -e "${GREEN}Deployment completed successfully!${NC}"
    echo -e "${YELLOW}Access your applications at:${NC}"
    
    if [[ "$ENVIRONMENT" == "prod" ]]; then
        echo "  Backend API: https://api.monay.com"
        echo "  Website: https://monay.com"
        echo "  Admin: https://admin.monay.com"
        echo "  Web App: https://app.monay.com"
        echo "  Enterprise: https://enterprise.monay.com"
    else
        echo "  Backend API: https://api-${ENVIRONMENT}.monay.com"
        echo "  Website: https://${ENVIRONMENT}.monay.com"
        echo "  Admin: https://admin-${ENVIRONMENT}.monay.com"
        echo "  Web App: https://app-${ENVIRONMENT}.monay.com"
        echo "  Enterprise: https://enterprise-${ENVIRONMENT}.monay.com"
    fi
}

# Run main function
main