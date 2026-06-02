#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Manual deployment helper — wraps the CI/CD steps for local execution.
# Useful for demonstrating the deployment process during the assignment.
#
# Usage:
#   ./scripts/deploy.sh [dev|prod]
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

MODE="${1:-dev}"
COMPOSE_FILE="docker-compose.yml"

if [ "$MODE" = "prod" ]; then
  COMPOSE_FILE="docker-compose.prod.yml"
fi

echo "======================================================================"
echo " Wholesale Platform Deployment — mode: $MODE"
echo "======================================================================"

echo ""
echo "[1/4] Building Docker images..."
docker compose -f "$COMPOSE_FILE" build --no-cache

echo ""
echo "[2/4] Pulling latest base images..."
docker compose -f "$COMPOSE_FILE" pull --ignore-pull-failures || true

echo ""
echo "[3/4] Starting services..."
if [ "$MODE" = "prod" ]; then
  docker compose -f "$COMPOSE_FILE" up -d --scale frontend=2 --scale backend=2
else
  docker compose -f "$COMPOSE_FILE" up -d
fi

echo ""
echo "[4/4] Health checks..."
sleep 10

check_service() {
  local name="$1"
  local url="$2"
  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
  if [ "$status" = "200" ]; then
    echo "  ✓ $name — HTTP $status"
  else
    echo "  ✗ $name — HTTP $status (check logs: docker compose logs $name)"
  fi
}

check_service "Nginx LB"  "http://localhost/health"
check_service "Frontend"  "http://localhost/"
check_service "Backend"   "http://localhost/api/"

echo ""
echo "Services running:"
docker compose -f "$COMPOSE_FILE" ps

echo ""
echo "======================================================================"
echo " Platform is up at http://localhost"
echo " Logs: docker compose -f $COMPOSE_FILE logs -f"
echo " Stop: docker compose -f $COMPOSE_FILE down"
echo "======================================================================"
