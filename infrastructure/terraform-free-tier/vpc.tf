# ─────────────────────────────────────────────────────────────────────────────
# VPC — Virtual Private Cloud (FREE)
# Isolates the wholesale platform in its own private network space.
# All resources below are free — no NAT Gateway, no ALB needed.
# ─────────────────────────────────────────────────────────────────────────────

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr          # 10.0.0.0/16 → 65 536 private IPs
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = { Name = "${var.project_name}-vpc" }
}

# ─── Internet Gateway (FREE) ──────────────────────────────────────────────────
# Single entry/exit point for all public internet traffic.
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "${var.project_name}-igw" }
}

# ─── Public Subnet (FREE) ────────────────────────────────────────────────────
# EC2 instance lives here. Has a public IP → accessible from the internet.
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidr   # 10.0.1.0/24
  availability_zone       = var.az
  map_public_ip_on_launch = true

  tags = { Name = "${var.project_name}-subnet-public" }
}

# ─── Private Subnet (FREE) ───────────────────────────────────────────────────
# RDS lives here. No internet route → database cannot be reached from outside.
# EC2 in the public subnet can still reach it via private VPC routing.
resource "aws_subnet" "private" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidr   # 10.0.2.0/24
  availability_zone = var.az

  tags = { Name = "${var.project_name}-subnet-private" }
}

# Required by RDS — needs a subnet group with at least one subnet.
# We add a dummy second subnet in a different AZ (RDS multi-AZ requirement).
resource "aws_subnet" "private_b" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.3.0/24"
  availability_zone = "us-east-1b"

  tags = { Name = "${var.project_name}-subnet-private-b" }
}

# ─── Route Tables (FREE) ─────────────────────────────────────────────────────

# Public route table: 0.0.0.0/0 → Internet Gateway
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = { Name = "${var.project_name}-rt-public" }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# Private route table: local only (no internet route = no NAT Gateway needed)
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "${var.project_name}-rt-private" }
}

resource "aws_route_table_association" "private" {
  subnet_id      = aws_subnet.private.id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private_b" {
  subnet_id      = aws_subnet.private_b.id
  route_table_id = aws_route_table.private.id
}
