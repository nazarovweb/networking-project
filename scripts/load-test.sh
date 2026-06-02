#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Load Test Script
# Demonstrates C.M3 / D.M4: testing scalability and performance under load.
#
# Uses 'hey' (https://github.com/rakyll/hey) — install with:
#   go install github.com/rakyll/hey@latest
#
# Usage:
#   ./scripts/load-test.sh [TARGET_URL] [CONCURRENT_USERS] [TOTAL_REQUESTS]
#
# Example:
#   ./scripts/load-test.sh http://localhost 100 5000
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

TARGET="${1:-http://localhost}"
CONCURRENT="${2:-50}"
TOTAL="${3:-2000}"

if ! command -v hey &>/dev/null; then
  echo "Error: 'hey' is not installed. Run: go install github.com/rakyll/hey@latest"
  exit 1
fi

echo "======================================================================"
echo " Load Test — Wholesale Cloud Platform"
echo " Target   : $TARGET"
echo " Workers  : $CONCURRENT concurrent users"
echo " Requests : $TOTAL total requests"
echo "======================================================================"

echo ""
echo "--- Phase 1: Frontend (homepage) ---"
hey -n "$TOTAL" -c "$CONCURRENT" -m GET "$TARGET/"

echo ""
echo "--- Phase 2: Backend API (health endpoint) ---"
hey -n "$TOTAL" -c "$CONCURRENT" -m GET "$TARGET/api/"

echo ""
echo "--- Phase 3: Ramp-up simulation (products listing) ---"
hey -n "$TOTAL" -c "$CONCURRENT" -m GET "$TARGET/api/products" \
    -H "Content-Type: application/json"

echo ""
echo "======================================================================"
echo " Test complete. Check auto-scaling events:"
echo "   docker stats (local)"
echo "   kubectl get hpa -n wholesale (k8s)"
echo "   aws ecs describe-services ... (AWS ECS)"
echo "======================================================================"
