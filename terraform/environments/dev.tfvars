environment = "dev"
aws_region  = "us-east-1"
vpc_cidr    = "10.0.0.0/16"

# RDS Configuration
rds_instance_class    = "db.t3.medium"
rds_multi_az         = false
rds_backup_retention = 7

# ElastiCache Configuration
elasticache_node_type = "cache.t3.micro"
elasticache_num_nodes = 1

# ECS Task Configuration
ecs_task_cpu = {
  backend           = "512"
  admin            = "256"
  web              = "256"
  enterprise_wallet = "256"
}

ecs_task_memory = {
  backend           = "1024"
  admin            = "512"
  web              = "512"
  enterprise_wallet = "512"
}

# Auto Scaling
ecs_min_capacity = 1
ecs_max_capacity = 3

# Domain Configuration (update with your domain)
domain_name = "dev.monay.com"

# Tags
tags = {
  Environment = "Development"
  CostCenter  = "Engineering"
}