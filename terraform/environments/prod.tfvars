environment = "prod"
aws_region  = "us-east-1"
vpc_cidr    = "10.0.0.0/16"

# RDS Configuration
rds_instance_class    = "db.r5.xlarge"
rds_multi_az         = true
rds_backup_retention = 30

# ElastiCache Configuration
elasticache_node_type = "cache.r5.large"
elasticache_num_nodes = 3

# ECS Task Configuration
ecs_task_cpu = {
  backend           = "2048"
  admin            = "1024"
  web              = "1024"
  enterprise_wallet = "1024"
}

ecs_task_memory = {
  backend           = "4096"
  admin            = "2048"
  web              = "2048"
  enterprise_wallet = "2048"
}

# Auto Scaling
ecs_min_capacity = 3
ecs_max_capacity = 20

# Domain Configuration (update with your domain)
domain_name = "monay.com"

# Tags
tags = {
  Environment = "Production"
  CostCenter  = "Operations"
  Compliance  = "PCI-DSS"
}