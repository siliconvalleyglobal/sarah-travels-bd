#!/bin/bash
# Deploy Sarah Travels BD to a fresh Ubuntu VPS (DigitalOcean / Linode)
# Run ON THE SERVER as root:
#   curl -fsSL https://raw.githubusercontent.com/siliconvalleyglobal/sarah-travels-bd/main/scripts/deploy-digitalocean.sh | bash
# Or after cloning:
#   ./scripts/deploy-digitalocean.sh

set -euo pipefail

APP_DIR="${APP_DIR:-/opt/sarah-travels-bd}"
REPO_URL="${REPO_URL:-https://github.com/siliconvalleyglobal/sarah-travels-bd.git}"
DOMAIN="${DOMAIN:-149.248.12.204}"
SITE_URL="${SITE_URL:-http://${DOMAIN}}"
API_PUBLIC_URL="${API_PUBLIC_URL:-${SITE_URL}/api/v1}"

echo "==> Installing Docker (if needed)..."
if ! command -v docker &>/dev/null; then
  apt-get update -y
  apt-get install -y ca-certificates curl git nginx
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
fi

if ! docker compose version &>/dev/null; then
  apt-get install -y docker-compose-plugin 2>/dev/null || true
fi

echo "==> Cloning/updating app at ${APP_DIR}..."
mkdir -p "$(dirname "$APP_DIR")"
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR" && git pull origin main
else
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

echo "==> Writing production env..."
if [ ! -f .env.production ]; then
  POSTGRES_PASSWORD="$(openssl rand -hex 16)"
  JWT_SECRET="$(openssl rand -hex 32)"
  cat > .env.production <<EOF
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
JWT_SECRET=${JWT_SECRET}
WEB_URL=${SITE_URL}
NEXT_PUBLIC_SITE_URL=${SITE_URL}
NEXT_PUBLIC_API_URL=${API_PUBLIC_URL}
RUN_SEED=true
EOF
  echo "Created .env.production (save these credentials!)"
  cat .env.production
else
  echo "Using existing .env.production"
fi

echo "==> Building and starting containers (this takes 5–10 min)..."
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

echo "==> Configuring nginx..."
sed "s/SERVER_NAME/${DOMAIN}/g" deploy/nginx/sarahtravels.conf > /etc/nginx/sites-available/sarahtravels
ln -sf /etc/nginx/sites-available/sarahtravels /etc/nginx/sites-enabled/sarahtravels
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo ""
echo "============================================"
echo "  Deploy complete!"
echo "  Site:  ${SITE_URL}"
echo "  API:   ${API_PUBLIC_URL}/health"
echo "  Admin: ${SITE_URL}/admin"
echo "  Login: admin@travel.com / password123"
echo "============================================"
echo ""
echo "After DNS points here, run SSL:"
echo "  apt install -y certbot python3-certbot-nginx"
echo "  certbot --nginx -d yourdomain.com -d www.yourdomain.com"
