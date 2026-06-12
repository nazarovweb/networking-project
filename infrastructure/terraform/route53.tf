# ─────────────────────────────────────────────────────────────────────────────
# Route 53 DNS — maps the company domain to the ALB.
# Demonstrates A.P2: how DNS underpins cloud network communication.
# ─────────────────────────────────────────────────────────────────────────────

resource "aws_route53_zone" "main" {
  name = var.domain_name
  tags = { Name = "${var.project_name}-zone" }
}

# Apex domain → ALB (ALIAS record, no TTL cost)
resource "aws_route53_record" "apex" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}

# www → ALB
resource "aws_route53_record" "www" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "www.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}

# api subdomain → ALB (resolves /api/* via listener rule)
resource "aws_route53_record" "api" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "api.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}

# Health check — Route 53 monitors the ALB endpoint
resource "aws_route53_health_check" "main" {
  fqdn              = var.domain_name
  port              = 443
  type              = "HTTPS"
  resource_path     = "/"
  failure_threshold = 3
  request_interval  = 30

  tags = { Name = "${var.project_name}-health-check" }
}
