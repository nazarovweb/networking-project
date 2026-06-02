output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets (ALB, NAT Gateways)"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "IDs of the private subnets (ECS tasks, RDS)"
  value       = aws_subnet.private[*].id
}

output "alb_dns_name" {
  description = "ALB DNS name (use for Route53 alias or direct testing)"
  value       = aws_lb.main.dns_name
}

output "ecr_frontend_url" {
  description = "ECR repository URL for the frontend image"
  value       = aws_ecr_repository.frontend.repository_url
}

output "ecr_backend_url" {
  description = "ECR repository URL for the backend image"
  value       = aws_ecr_repository.backend.repository_url
}

output "rds_endpoint" {
  description = "RDS primary endpoint (used by backend tasks)"
  value       = aws_db_instance.main.address
  sensitive   = true
}

output "rds_replica_endpoint" {
  description = "RDS read replica endpoint"
  value       = aws_db_instance.read_replica.address
  sensitive   = true
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "nat_gateway_ips" {
  description = "Elastic IPs assigned to NAT Gateways (whitelist these in external APIs)"
  value       = aws_eip.nat[*].public_ip
}

output "app_url" {
  description = "Application URL"
  value       = "https://${var.domain_name}"
}
