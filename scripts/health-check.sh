#!/usr/bin/env bash
# Continuous health monitor — polls all service endpoints every 5 seconds.
# Shows response time and HTTP status for each tier.

set -euo pipefail

BASE="${1:-http://localhost}"

while true; do
  clear
  echo "======================================================================"
  echo " Wholesale Platform — Health Monitor  ($(date))"
  echo " Base URL: $BASE"
  echo "======================================================================"
  printf "%-30s %-8s %-12s\n" "Endpoint" "Status" "Response ms"
  echo "----------------------------------------------------------------------"

  check() {
    local label="$1"
    local url="$2"
    local start end elapsed status
    start=$(date +%s%N)
    status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null || echo "ERR")
    end=$(date +%s%N)
    elapsed=$(( (end - start) / 1000000 ))
    printf "%-30s %-8s %s ms\n" "$label" "$status" "$elapsed"
  }

  check "Load Balancer /health"   "$BASE/health"
  check "Frontend /"              "$BASE/"
  check "Backend /api/"           "$BASE/api/"

  echo ""
  echo "Container resource usage:"
  docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" 2>/dev/null || true

  sleep 5
done
