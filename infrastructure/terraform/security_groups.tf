# ─────────────────────────────────────────────────────────────────────────────
# Security Groups — layer-4 firewall rules attached to each resource tier.
# Principle of least privilege: allow only the minimum required traffic.
# ─────────────────────────────────────────────────────────────────────────────

# ALB Security Group — accepts HTTP/HTTPS from the internet
resource "aws_security_group" "alb" {
  name        = "${var.project_name}-sg-alb"
  description = "Allow inbound HTTP and HTTPS from the public internet"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTPS from internet"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP from internet (redirected to HTTPS by ALB listener)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-sg-alb" }
}

# Frontend Security Group — accepts traffic only from the ALB
resource "aws_security_group" "frontend" {
  name        = "${var.project_name}-sg-frontend"
  description = "Allow inbound traffic from ALB to Next.js frontend (port 3000)"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Next.js from ALB only"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-sg-frontend" }
}

# Backend Security Group — accepts traffic only from the frontend tasks
resource "aws_security_group" "backend" {
  name        = "${var.project_name}-sg-backend"
  description = "Allow inbound traffic from frontend SG to Express backend (port 3500)"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Express API from frontend"
    from_port       = 3500
    to_port         = 3500
    protocol        = "tcp"
    security_groups = [aws_security_group.frontend.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-sg-backend" }
}

# RDS Security Group — accepts traffic only from backend tasks
resource "aws_security_group" "rds" {
  name        = "${var.project_name}-sg-rds"
  description = "Allow PostgreSQL (5432) only from backend security group"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "PostgreSQL from backend"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.backend.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-sg-rds" }
}
