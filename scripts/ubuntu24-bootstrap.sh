#!/bin/bash
# Sarah Travels BD — Ubuntu 24.04 LTS full stack bootstrap
# Run as root on a fresh Ubuntu 24.04 server after OS install/reinstall.
# Usage: bash ubuntu24-bootstrap.sh

set -euo pipefail

APP_DIR=/root/sarah-travels-bd
DOMAIN="${DOMAIN:-149.248.12.204}"
SITE_URL="${SITE_URL:-http://${DOMAIN}}"
API_URL="${API_URL:-${SITE_URL}/api/v1}"

echo "============================================"
echo "  Ubuntu 24.04 LTS — Full Stack Bootstrap"
echo "  $(date)"
echo "============================================"

export DEBIAN_FRONTEND=noninteractive

# ── 1. System update ───────────────────────────────────────────────────────
echo ">>> Updating Ubuntu 24.04..."
apt-get update -y
apt-get upgrade -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold"
apt-get install -y \
  ca-certificates curl git gnupg nginx ufw fail2ban \
  unattended-upgrades htop logrotate openssl

# ── 2. Docker CE (official repo, not snap) ─────────────────────────────────
echo ">>> Installing Docker CE..."
if ! command -v docker &>/dev/null || snap list docker &>/dev/null 2>&1; then
  snap remove docker 2>/dev/null || true
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable docker
  systemctl start docker
fi

# ── 3. Node.js 22 LTS (host tooling) ───────────────────────────────────────
echo ">>> Installing Node.js 22 LTS..."
if ! node -v 2>/dev/null | grep -q '^v22'; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
  corepack enable
  corepack prepare pnpm@11.5.2 --activate
fi

# ── 4. Security ────────────────────────────────────────────────────────────
cat > /etc/apt/apt.conf.d/20auto-upgrades <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF

ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

systemctl enable fail2ban
systemctl restart fail2ban

# ── 5. Extract app ─────────────────────────────────────────────────────────
echo ">>> Deploying application..."
mkdir -p "$APP_DIR"

if [ -f /tmp/.env.production.bak ]; then
  cp /tmp/.env.production.bak "$APP_DIR/.env.production"
elif [ ! -f "$APP_DIR/.env.production" ]; then
  POSTGRES_PASSWORD=$(openssl rand -hex 16)
  JWT_SECRET=$(openssl rand -hex 32)
  cat > "$APP_DIR/.env.production" <<EOF
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
JWT_SECRET=${JWT_SECRET}
WEB_URL=${SITE_URL}
NEXT_PUBLIC_SITE_URL=${SITE_URL}
NEXT_PUBLIC_API_URL=${API_URL}
RUN_SEED=true
EOF
fi

tar xzf /tmp/sarah-travels-deploy.tgz -C "$APP_DIR" 2>/dev/null || true

# Restore DB dump if migrating from old server
if [ -f /tmp/postgres-backup.sql ]; then
  echo ">>> Will restore database after Postgres starts..."
  RESTORE_DB=true
else
  RESTORE_DB=false
fi

# ── 6. Build & start Docker stack (Postgres 18, Node 22, NestJS, Next.js) ─
export DOCKER_BUILDKIT=1
cd "$APP_DIR"
docker compose -f docker-compose.prod.yml --env-file .env.production --project-directory "$APP_DIR" down 2>/dev/null || true
docker compose -f docker-compose.prod.yml --env-file .env.production --project-directory "$APP_DIR" up -d --build

if [ "$RESTORE_DB" = true ]; then
  echo ">>> Restoring database from backup..."
  sleep 10
  docker compose -f docker-compose.prod.yml --env-file .env.production --project-directory "$APP_DIR" exec -T postgres \
    psql -U travel -d travel < /tmp/postgres-backup.sql 2>/dev/null || \
  docker exec -i sarah-travels-bd-postgres-1 psql -U travel -d travel < /tmp/postgres-backup.sql || true
fi

# ── 7. Nginx ───────────────────────────────────────────────────────────────
sed "s/SERVER_NAME/${DOMAIN}/g" "$APP_DIR/deploy/nginx/sarahtravels.conf" > /etc/nginx/sites-available/sarahtravels
ln -sf /etc/nginx/sites-available/sarahtravels /etc/nginx/sites-enabled/sarahtravels
rm -f /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/svgcrm 2>/dev/null || true
nginx -t && systemctl reload nginx

# ── 8. Auto-start on boot ──────────────────────────────────────────────────
cat > /etc/systemd/system/sarah-travels.service <<SVCEOF
[Unit]
Description=Sarah Travels BD Docker Stack
Requires=docker.service
After=docker.service network-online.target
Wants=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/docker compose -f $APP_DIR/docker-compose.prod.yml --env-file $APP_DIR/.env.production --project-directory $APP_DIR up -d
ExecStop=/usr/bin/docker compose -f $APP_DIR/docker-compose.prod.yml --env-file $APP_DIR/.env.production --project-directory $APP_DIR down
TimeoutStartSec=300

[Install]
WantedBy=multi-user.target
SVCEOF

systemctl daemon-reload
systemctl enable sarah-travels.service

# ── 9. Verify ──────────────────────────────────────────────────────────────
sleep 15
echo ""
echo "============================================"
echo "  STACK VERSIONS"
echo "  Ubuntu:    $(lsb_release -ds)"
echo "  Kernel:    $(uname -r)"
echo "  Docker:    $(docker --version)"
echo "  Node:      $(node -v) + pnpm $(pnpm -v 2>/dev/null || echo n/a)"
echo "  Postgres:  18 (Docker)"
echo "  API:       NestJS 11 / Node 22 (Docker)"
echo "  Web:       Next.js 16 / Node 22 (Docker)"
echo "  Nginx:     $(nginx -v 2>&1)"
echo "============================================"
curl -sf http://127.0.0.1:3000 >/dev/null && echo "Web:  OK" || echo "Web:  FAIL"
curl -sf http://127.0.0.1:4000/api/v1/health && echo "API:  OK" || echo "API:  FAIL"
echo "Site: ${SITE_URL}"
echo "BOOTSTRAP_DONE"
