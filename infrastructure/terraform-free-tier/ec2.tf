# ─────────────────────────────────────────────────────────────────────────────
# EC2 t2.micro — FREE TIER (750 h/month for 12 months)
# Runs the full stack: Nginx LB + Next.js frontend + Express backend
# PostgreSQL lives in RDS (also free tier), not in Docker.
# ─────────────────────────────────────────────────────────────────────────────

# Ubuntu 22.04 LTS AMI — latest, looked up dynamically
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]   # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_instance" "app" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.ec2_instance_type   # t2.micro (free)
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.ec2.id]
  key_name               = var.key_pair_name

  # Root volume — 30 GB is the free tier limit
  root_block_device {
    volume_type           = "gp2"
    volume_size           = 30
    delete_on_termination = true
  }

  # Bootstrap script — installs Docker and starts the app
  user_data = templatefile("${path.module}/user_data.sh", {
    db_host                = aws_db_instance.main.address
    db_user                = var.db_username
    db_pass                = var.db_password
    db_name                = var.db_name
    jwt_secret             = var.jwt_secret
    api_secret             = var.api_secret
    smtp_host              = var.smtp_host
    smtp_user              = var.smtp_user
    smtp_pass              = var.smtp_pass
    google_client_id       = var.google_client_id
    google_client_secret   = var.google_client_secret
    stripe_publishable_key = var.stripe_publishable_key
    public_ip              = aws_eip.app.public_ip
    github_username        = var.github_username
  })

  tags = { Name = "${var.project_name}-app-server" }

  # Wait for RDS to be ready before launching
  depends_on = [aws_db_instance.main]
}

# Elastic IP — static public IP so DNS/CI-CD config doesn't change on restart
resource "aws_eip" "app" {
  domain = "vpc"
  tags   = { Name = "${var.project_name}-eip" }
}

resource "aws_eip_association" "app" {
  instance_id   = aws_instance.app.id
  allocation_id = aws_eip.app.id
}
