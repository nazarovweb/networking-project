#!/bin/bash
# EC2 bootstrap script — runs once on first launch.
# Installs Docker, clones the repo, and starts the app.

set -euo pipefail
exec > /var/log/user-data.log 2>&1

echo "[1/6] System update..."
apt-get update -y
apt-get upgrade -y

echo "[2/6] Installing Docker..."
apt-get install -y ca-certificates curl gnupg git
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
   https://download.docker.com/linux/ubuntu \
   $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

systemctl enable docker
systemctl start docker
usermod -aG docker ubuntu

echo "[3/6] Installing helper tools..."
apt-get install -y curl jq awscli postgresql-client

echo "[4/6] Cloning repository..."
cd /home/ubuntu
git clone https://github.com/${github_username}/networking-project.git app
chown -R ubuntu:ubuntu app

echo "[5/6] Writing .env file..."
cat > /home/ubuntu/app/.env <<'ENVEOF'
# These values are injected by Terraform via templatefile()
DB_HOST=${db_host}
DB_PORT=5432
DB_USER=${db_user}
DB_PASS=${db_pass}
DB_NAME=${db_name}
JWT_ENCRYPTION_KEY=${jwt_secret}
API_SECRET=${api_secret}
SMTP_HOST=${smtp_host}
SMTP_USER=${smtp_user}
SMTP_PASS=${smtp_pass}
SMTP_SENDERNAME=Wholesale Platform
SMTP_SUPPORT=support@wholesale-platform.com
GOOGLE_CLIENT_ID=${google_client_id}
GOOGLE_CLIENT_SECRET=${google_client_secret}
STRIPE_PUBLISHABLE_KEY=${stripe_publishable_key}
FRONTEND_SERVER_ORIGIN=http://${public_ip}
NEXT_PUBLIC_DOMAIN=${public_ip}
BACKEND_URL=http://nginx/api
ENVEOF

chown ubuntu:ubuntu /home/ubuntu/app/.env

echo "[6/6] Starting application..."
cd /home/ubuntu/app
sudo -u ubuntu docker compose up -d --build

echo "[+] Waiting for DB container to be healthy..."
sleep 15

echo "[+] Restoring database schema..."
# ecommerce.sql is pg_dump custom format — restore via pg_restore against RDS
export PGPASSWORD="${db_pass}"
pg_restore \
  --host="${db_host}" \
  --port=5432 \
  --username="${db_user}" \
  --dbname="${db_name}" \
  --no-owner \
  --no-privileges \
  /home/ubuntu/app/ecommerce.sql || echo "DB restore may have partially applied (safe to ignore on re-runs)"

echo "Bootstrap complete — app starting at http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
