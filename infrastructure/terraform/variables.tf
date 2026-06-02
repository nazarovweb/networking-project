variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "eu-west-1"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "wholesale-platform"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
}

# VPC Configuration
variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets (one per AZ)"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets (one per AZ)"
  type        = list(string)
  default     = ["10.0.11.0/24", "10.0.12.0/24"]
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["eu-west-1a", "eu-west-1b"]
}

# ECS / Application
variable "frontend_image" {
  description = "Docker image for the Next.js frontend"
  type        = string
  default     = "wholesale-frontend:latest"
}

variable "backend_image" {
  description = "Docker image for the Express backend"
  type        = string
  default     = "wholesale-backend:latest"
}

variable "frontend_cpu" {
  description = "CPU units for frontend task (1024 = 1 vCPU)"
  type        = number
  default     = 512
}

variable "frontend_memory" {
  description = "Memory in MiB for frontend task"
  type        = number
  default     = 1024
}

variable "backend_cpu" {
  description = "CPU units for backend task"
  type        = number
  default     = 512
}

variable "backend_memory" {
  description = "Memory in MiB for backend task"
  type        = number
  default     = 1024
}

# Auto Scaling
variable "min_capacity" {
  description = "Minimum number of ECS tasks"
  type        = number
  default     = 2
}

variable "max_capacity" {
  description = "Maximum number of ECS tasks"
  type        = number
  default     = 10
}

variable "scale_up_cpu_threshold" {
  description = "CPU % threshold to trigger scale-out"
  type        = number
  default     = 70
}

variable "scale_down_cpu_threshold" {
  description = "CPU % threshold to trigger scale-in"
  type        = number
  default     = 30
}

# RDS
variable "db_instance_class" {
  description = "RDS instance type"
  type        = string
  default     = "db.t3.micro"
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "ecommerce"
}

variable "db_username" {
  description = "PostgreSQL master username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "PostgreSQL master password"
  type        = string
  sensitive   = true
}

# DNS
variable "domain_name" {
  description = "Root domain name (must be registered in Route 53)"
  type        = string
  default     = "wholesale-platform.com"
}

variable "certificate_arn" {
  description = "ACM certificate ARN for HTTPS"
  type        = string
  default     = ""
}
