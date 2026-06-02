terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  # Local state file — fine for a single-developer assignment project
  # (For team use, switch to S3 backend as in infrastructure/terraform/main.tf)
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project   = var.project_name
      ManagedBy = "Terraform"
      Purpose   = "BTEC-Unit6-Assignment"
    }
  }
}
