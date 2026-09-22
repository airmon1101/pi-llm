#!/usr/bin/env bash
set -e

INSTALL_DIR=${INSTALL_DIR:-/opt/pillm}
REPO_DIR=$(pwd)

echo "Updating PiLLM..."

# Stop services
systemctl stop pillm-frontend
systemctl stop pillm-backend
systemctl stop nginx

# Backup database
echo "Backing up database..."
BKP_DIR="$HOME/pillm-backups/update-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BKP_DIR"
cp "$INSTALL_DIR/data/pillm.db" "$BKP_DIR/" 2>/dev/null || echo "No database to backup yet."

# Update backend
echo "Updating backend dependencies..."
if [ -d "$REPO_DIR/backend" ]; then
    cp -r "$REPO_DIR/backend/"* "$INSTALL_DIR/backend/"
    cd "$INSTALL_DIR/backend"
    .venv/bin/pip install -r requirements.txt
fi

# Update frontend
echo "Updating frontend..."
if [ -d "$REPO_DIR/frontend" ]; then
    cp -r "$REPO_DIR/frontend/"* "$INSTALL_DIR/frontend/"
    cd "$INSTALL_DIR/frontend"
    npm install
    npm run build
fi

# Set permissions
chown -R pillm:pillm "$INSTALL_DIR"

# Restart services
echo "Restarting services..."
systemctl start pillm-backend
systemctl start pillm-frontend
systemctl start nginx

# Run health check
echo "Running health check..."
sleep 5
if curl -s http://127.0.0.1:8000/api/health > /dev/null; then
    echo "Update successful! PiLLM is running."
else
    echo "Update completed, but health check failed. Check logs."
fi
