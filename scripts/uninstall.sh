#!/usr/bin/env bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

INSTALL_DIR=${INSTALL_DIR:-/opt/pillm}

echo -e "${RED}"
echo "=========================================================="
echo "               PiLLM Uninstaller"
echo "=========================================================="
echo -e "${NC}"

if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: Please run this uninstaller as root or using sudo.${NC}"
    exit 1
fi

read -p "Are you sure you want to uninstall PiLLM? (y/N): " -r CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

echo -e "\n1. Stopping services..."
systemctl stop pillm-frontend 2>/dev/null || true
systemctl stop pillm-backend 2>/dev/null || true
systemctl disable pillm-frontend 2>/dev/null || true
systemctl disable pillm-backend 2>/dev/null || true

echo "2. Removing systemd service definitions..."
rm -f /etc/systemd/system/pillm-frontend.service
rm -f /etc/systemd/system/pillm-backend.service
systemctl daemon-reload

echo "3. Removing Nginx configuration..."
rm -f /etc/nginx/sites-enabled/pillm.conf
rm -f /etc/nginx/sites-available/pillm.conf
if [ -f /etc/nginx/sites-available/default ]; then
    ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default 2>/dev/null || true
fi
systemctl restart nginx 2>/dev/null || true

read -p "Do you want to delete chat history & database in $INSTALL_DIR/data? (y/N): " -r DEL_DATA
read -p "Do you want to remove the application code directory $INSTALL_DIR? (y/N): " -r DEL_CODE

if [[ "$DEL_CODE" =~ ^[Yy]$ ]]; then
    if [[ ! "$DEL_DATA" =~ ^[Yy]$ ]] && [ -d "$INSTALL_DIR/data" ]; then
        BACKUP_DATA="$HOME/pillm-data-backup-$(date +%Y%m%d_%H%M%S)"
        echo "Preserving data directory to $BACKUP_DATA..."
        cp -r "$INSTALL_DIR/data" "$BACKUP_DATA"
    fi
    echo "Removing $INSTALL_DIR..."
    rm -rf "$INSTALL_DIR"
fi

read -p "Do you want to remove the 'pillm' system user? (y/N): " -r DEL_USER
if [[ "$DEL_USER" =~ ^[Yy]$ ]]; then
    userdel pillm 2>/dev/null || true
fi

echo -e "\n${YELLOW}Note: Ollama and pulled models (e.g. gemma4:e2b) were kept intact.${NC}"
echo "To remove Ollama completely if no longer needed:"
echo "  sudo systemctl stop ollama"
echo "  sudo systemctl disable ollama"
echo "  sudo rm -rf /usr/share/ollama /usr/local/bin/ollama"

echo -e "\n${GREEN}PiLLM has been uninstalled.${NC}"
