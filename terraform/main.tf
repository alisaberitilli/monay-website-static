terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket         = "monay-terraform-state"
    key            = "infrastructure/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Environment = var.environment
      Project     = "Monay"
      ManagedBy   = "Terraform"
    }
  }
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

# VPC Module
module "vpc" {
  source = "./modules/vpc"
  
  environment         = var.environment
  vpc_cidr           = var.vpc_cidr
  availability_zones = data.aws_availability_zones.available.names
}

# RDS Module
module "rds" {
  source = "./modules/rds"
  
  environment        = var.environment
  vpc_id            = module.vpc.vpc_id
  database_subnets  = module.vpc.database_subnets
  instance_class    = var.rds_instance_class
  multi_az          = var.rds_multi_az
  backup_retention  = var.rds_backup_retention
}

# ElastiCache Module
module "elasticache" {
  source = "./modules/elasticache"
  
  environment       = var.environment
  vpc_id           = module.vpc.vpc_id
  cache_subnets    = module.vpc.cache_subnets
  node_type        = var.elasticache_node_type
  num_cache_nodes  = var.elasticache_num_nodes
}

# ECS Module
module "ecs" {
  source = "./modules/ecs"
  
  environment        = var.environment
  vpc_id            = module.vpc.vpc_id
  private_subnets   = module.vpc.private_subnets
  public_subnets    = module.vpc.public_subnets
  certificate_arn   = var.certificate_arn
}

# ECR Module
module "ecr" {
  source = "./modules/ecr"
  
  environment = var.environment
  
  repositories = [
    "monay-backend-common",
    "monay-website-static", 
    "monay-admin",
    "monay-web-app",
    "monay-enterprise-wallet"
  ]
}

# S3 Module
module "s3" {
  source = "./modules/s3"
  
  environment = var.environment
}

# CloudFront Module
module "cloudfront" {
  source = "./modules/cloudfront"
  
  environment     = var.environment
  s3_bucket_id    = module.s3.static_bucket_id
  s3_bucket_arn   = module.s3.static_bucket_arn
  certificate_arn = var.cloudfront_certificate_arn
  domain_name     = var.domain_name
}

# Secrets Manager Module
module "secrets" {
  source = "./modules/secrets"
  
  environment = var.environment
}

# IAM Module
module "iam" {
  source = "./modules/iam"
  
  environment = var.environment
}

# CloudWatch Module
module "cloudwatch" {
  source = "./modules/cloudwatch"
  
  environment     = var.environment
  ecs_cluster_name = module.ecs.cluster_name
}

# Outputs
output "vpc_id" {
  value = module.vpc.vpc_id
}

output "ecs_cluster_name" {
  value = module.ecs.cluster_name
}

output "alb_dns_name" {
  value = module.ecs.alb_dns_name
}

output "rds_endpoint" {
  value     = module.rds.endpoint
  sensitive = true
}

output "redis_endpoint" {
  value     = module.elasticache.endpoint
  sensitive = true
}

output "cloudfront_distribution_id" {
  value = module.cloudfront.distribution_id
}

output "ecr_repositories" {
  value = module.ecr.repository_urls
}