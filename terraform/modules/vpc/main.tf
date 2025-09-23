# VPC Module
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "monay-${var.environment}-vpc"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "monay-${var.environment}-igw"
  }
}

# Public Subnets
resource "aws_subnet" "public" {
  count = length(var.availability_zones)

  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "monay-${var.environment}-public-${var.availability_zones[count.index]}"
    Type = "Public"
  }
}

# Private Subnets
resource "aws_subnet" "private" {
  count = length(var.availability_zones)

  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 10)
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name = "monay-${var.environment}-private-${var.availability_zones[count.index]}"
    Type = "Private"
  }
}

# Database Subnets
resource "aws_subnet" "database" {
  count = length(var.availability_zones)

  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 20)
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name = "monay-${var.environment}-database-${var.availability_zones[count.index]}"
    Type = "Database"
  }
}

# Cache Subnets
resource "aws_subnet" "cache" {
  count = length(var.availability_zones)

  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 30)
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name = "monay-${var.environment}-cache-${var.availability_zones[count.index]}"
    Type = "Cache"
  }
}

# NAT Gateways
resource "aws_eip" "nat" {
  count  = var.environment == "prod" ? length(var.availability_zones) : 1
  domain = "vpc"

  tags = {
    Name = "monay-${var.environment}-nat-eip-${count.index}"
  }
}

resource "aws_nat_gateway" "main" {
  count = var.environment == "prod" ? length(var.availability_zones) : 1

  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = {
    Name = "monay-${var.environment}-nat-${count.index}"
  }

  depends_on = [aws_internet_gateway.main]
}

# Route Tables
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "monay-${var.environment}-public-rt"
  }
}

resource "aws_route_table" "private" {
  count  = var.environment == "prod" ? length(var.availability_zones) : 1
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }

  tags = {
    Name = "monay-${var.environment}-private-rt-${count.index}"
  }
}

# Route Table Associations
resource "aws_route_table_association" "public" {
  count = length(var.availability_zones)

  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count = length(var.availability_zones)

  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[var.environment == "prod" ? count.index : 0].id
}

resource "aws_route_table_association" "database" {
  count = length(var.availability_zones)

  subnet_id      = aws_subnet.database[count.index].id
  route_table_id = aws_route_table.private[var.environment == "prod" ? count.index : 0].id
}

resource "aws_route_table_association" "cache" {
  count = length(var.availability_zones)

  subnet_id      = aws_subnet.cache[count.index].id
  route_table_id = aws_route_table.private[var.environment == "prod" ? count.index : 0].id
}

# Outputs
output "vpc_id" {
  value = aws_vpc.main.id
}

output "public_subnets" {
  value = aws_subnet.public[*].id
}

output "private_subnets" {
  value = aws_subnet.private[*].id
}

output "database_subnets" {
  value = aws_subnet.database[*].id
}

output "cache_subnets" {
  value = aws_subnet.cache[*].id
}