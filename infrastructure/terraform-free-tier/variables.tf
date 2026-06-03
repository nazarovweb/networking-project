variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"   # N. Virginia — your active region
}

variable "project_name" {
  description = "Used for resource naming"
  type        = string
  default     = "wholesale"
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  type    = string
  default = "10.0.1.0/24"   # ALB + EC2 tier
}

variable "private_subnet_cidr" {
  type    = string
  default = "10.0.2.0/24"   # RDS tier (no internet)
}

variable "az" {
  type    = string
  default = "us-east-1a"
}

# EC2
variable "ec2_instance_type" {
  type    = string
  default = "t3.small"   # 2GB RAM — handles Next.js build
}

variable "key_pair_name" {
  description = "Name of the EC2 Key Pair for SSH access"
  type        = string
}

# RDS
variable "db_name" {
  type    = string
  default = "ecommerce"
}

variable "db_username" {
  type      = string
  sensitive = true
}

variable "db_password" {
  type      = string
  sensitive = true
}

# App secrets (passed to docker-compose on the instance)
variable "jwt_secret" {
  type      = string
  sensitive = true
}

variable "api_secret" {
  type      = string
  sensitive = true
}

variable "smtp_host" {
  type    = string
  default = ""
}

variable "smtp_user" {
  type    = string
  default = ""
}

variable "smtp_pass" {
  type      = string
  default   = ""
  sensitive = true
}

variable "google_client_id" {
  type    = string
  default = ""
}

variable "google_client_secret" {
  type      = string
  default   = ""
  sensitive = true
}

variable "stripe_publishable_key" {
  type    = string
  default = ""
}

variable "github_username" {
  description = "GitHub username — repo will be cloned as github.com/<username>/networking-project"
  type        = string
}
