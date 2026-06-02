# ─────────────────────────────────────────────────────────────────────────────
# RDS PostgreSQL — FREE TIER (db.t3.micro, 750 h/month, 20 GB storage)
# Placed in private subnet — no internet access, only EC2 can reach it.
# ─────────────────────────────────────────────────────────────────────────────

resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = [aws_subnet.private.id, aws_subnet.private_b.id]

  tags = { Name = "${var.project_name}-db-subnet-group" }
}

resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-postgres"

  engine         = "postgres"
  engine_version = "16.4"
  instance_class = "db.t3.micro"   # Free tier eligible

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false   # Private — only EC2 SG can connect

  # Free tier storage limits
  allocated_storage     = 20
  max_allocated_storage = 20
  storage_type          = "gp2"
  storage_encrypted     = false   # Encryption requires paid storage tier

  # Free tier: no Multi-AZ, no Performance Insights
  multi_az                     = false
  performance_insights_enabled = false

  # Free tier: backup disabled (retention > 0 requires paid plan)
  backup_retention_period = 0
  maintenance_window      = "Mon:04:00-Mon:05:00"

  skip_final_snapshot = true   # OK for dev/assignment; change to false for production

  tags = { Name = "${var.project_name}-postgres" }
}
