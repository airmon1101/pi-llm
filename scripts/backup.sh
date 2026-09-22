#!/usr/bin/env bash
set -e

INSTALL_DIR=${INSTALL_DIR:-/opt/pillm}
BACKUP_ROOT="$HOME/pillm-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BKP_DIR="$BACKUP_ROOT/backup-$TIMESTAMP"

echo "Starting PiLLM Backup..."

mkdir -p "$BKP_DIR"

# Backup DB
if [ -f "$INSTALL_DIR/data/pillm.db" ]; then
    cp "$INSTALL_DIR/data/pillm.db" "$BKP_DIR/"
fi

# Backup .env
if [ -f "$INSTALL_DIR/backend/.env" ]; then
    cp "$INSTALL_DIR/backend/.env" "$BKP_DIR/"
fi

# Backup Nginx config
if [ -f "/etc/nginx/sites-available/pillm.conf" ]; then
    cp "/etc/nginx/sites-available/pillm.conf" "$BKP_DIR/"
fi

# Backup Systemd
cp /etc/systemd/system/pillm-backend.service "$BKP_DIR/" 2>/dev/null || true
cp /etc/systemd/system/pillm-frontend.service "$BKP_DIR/" 2>/dev/null || true

# Archive
cd "$BACKUP_ROOT"
tar -czf "backup-$TIMESTAMP.tar.gz" "backup-$TIMESTAMP"
rm -rf "backup-$TIMESTAMP"

echo "Backup complete: $BACKUP_ROOT/backup-$TIMESTAMP.tar.gz"
ls -lh "$BACKUP_ROOT/backup-$TIMESTAMP.tar.gz"

echo -e "\nRecent backups:"
ls -lh "$BACKUP_ROOT"/*.tar.gz | tail -n 5

echo -e "\nTo restore:"
echo "tar -xzf $BACKUP_ROOT/backup-$TIMESTAMP.tar.gz -C /tmp/"
echo "cp /tmp/backup-$TIMESTAMP/pillm.db $INSTALL_DIR/data/"
echo "chown pillm:pillm $INSTALL_DIR/data/pillm.db"

echo -e "\nWARNING: MicroSD cards have limited write cycles. For long-term reliability, consider an external SSD."
