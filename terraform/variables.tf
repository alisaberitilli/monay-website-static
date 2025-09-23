variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# RDS Variables
variable "rds_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "rds_multi_az" {
  description = "Enable Multi-AZ for RDS"
  type        = bool
  default     = false
}

variable "rds_backup_retention" {
  description = "Backup retention period in days"
  type        = number
  default     = 7
}

# ElastiCache Variables
variable "elasticache_node_type" {
  description = "ElastiCache node type"
  type        = string
  default     = "cache.t3.micro"
}

variable "elasticache_num_nodes" {
  description = "Number of cache nodes"
  type        = number
  default     = 1
}

# Certificate Variables
variable "certificate_arn" {
  description = "ACM certificate ARN for ALB"
  type        = string
  default     = ""
}

variable "cloudfront_certificate_arn" {
  description = "ACM certificate ARN for CloudFront (must be in us-east-1)"
  type        = string
  default     = ""
}

# Domain Variables
variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = ""
}

# ECS Variables
variable "ecs_task_cpu" {
  description = "CPU units for ECS tasks"
  type        = map(string)
  default = {
    backend           = "512"
    admin            = "256"
    web              = "256"
    enterprise_wallet = "256"
  }
}

variable "ecs_task_memory" {
  description = "Memory for ECS tasks"
  type        = map(string)
  default = {
    backend           = "1024"
    admin            = "512"
    web              = "512"
    enterprise_wallet = "512"
  }
}

# Auto Scaling Variables
variable "ecs_min_capacity" {
  description = "Minimum number of ECS tasks"
  type        = number
  default     = 1
}

variable "ecs_max_capacity" {
  description = "Maximum number of ECS tasks"
  type        = number
  default     = 10
}

# Tags
variable "tags" {
  description = "Additional tags for resources"
  type        = map(string)
  default     = {}
}