# ─────────────────────────────────────────────────────────────────────────────
# Security Groups — layer-4 firewall (FREE)
# Demonstrates A.P1: network architecture with firewall rules.
# ─────────────────────────────────────────────────────────────────────────────

# EC2 Security Group
resource "aws_security_group" "ec2" {
  name        = "${var.project_name}-sg-ec2"
  description = "Allow HTTP, HTTPS, and SSH to the application server"
  vpc_id      = aws_vpc.main.id

  # HTTP — Nginx load balancer
  ingress {
    description = "HTTP from internet"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS (optional — add ACM cert later)
  ingress {
    description = "HTTPS from internet"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # SSH — CI/CD pipeline uses this to deploy
  ingress {
    description = "SSH for deployment"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]   # Tighten to your office IP in production
  }

  egress {
    description = "All outbound (pull Docker images, SMTP, etc.)"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-sg-ec2" }
}

# RDS Security Group — accepts PostgreSQL ONLY from the EC2 SG
resource "aws_security_group" "rds" {
  name        = "${var.project_name}-sg-rds"
  description = "Allow PostgreSQL only from EC2 security group"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "PostgreSQL from application server"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-sg-rds" }
}
