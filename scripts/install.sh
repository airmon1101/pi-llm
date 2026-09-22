#!/usr/bin/env bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

INSTALL_DIR=${INSTALL_DIR:-/opt/pillm}
REPO_DIR=$(pwd)

function print_banner() {
    echo -e "${GREEN}"
    echo "=========================================================="
    echo "  _____  _  _       _      __  __ "
    echo " |  __ \(_)| |     | |    |  \/  |"
    echo " | |__) |_ | |     | |    | \  / |"
    echo " |  ___/| || |     | |    | |\/| |"
    echo " | |    | || |____ | |____| |  | |"
    echo " |_|    |_||______||______|_|  |_|"
    echo "                                  "
    echo " PiLLM - Private Local AI Chat Server for Raspberry Pi 5"
    echo "==========================================================${NC}"
}

function check_root() {
    if [ "$EUID" -ne 0 ]; then
        echo -e "${RED}Error: Please run this installer as root or using sudo.${NC}"
        exit 1
    fi
}

function check_architecture() {
    ARCH=$(uname -m)
    if [[ "$ARCH" != "aarch64" && "$ARCH" != "arm64" ]]; then
        echo -e "${RED}Error: Architecture $ARCH is not supported. PiLLM requires aarch64/arm64.${NC}"
        exit 1
    fi
}

function check_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        if [[ "$ID" != "ubuntu" ]]; then
            echo -e "${YELLOW}Warning: OS is not Ubuntu. This installer is tested on Ubuntu 24.04.${NC}"
        elif [[ "$VERSION_ID" != "24.04" ]]; then
            echo -e "${YELLOW}Warning: OS is Ubuntu $VERSION_ID. This installer is optimized for Ubuntu 24.04.${NC}"
        fi
    else
        echo -e "${YELLOW}Warning: Could not detect OS version.${NC}"
    fi
}

function check_ram() {
    RAM_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
    RAM_GB=$((RAM_KB / 1024 / 1024))
    if [ "$RAM_GB" -lt 4 ]; then
        echo -e "${YELLOW}Warning: Less than 4GB RAM detected ($RAM_GB GB). Performance may be degraded.${NC}"
    fi
}

function check_disk() {
    FREE_SPACE=$(df -m / | awk 'NR==2 {print $4}')
    FREE_GB=$((FREE_SPACE / 1024))
    if [ "$FREE_GB" -lt 20 ]; then
        echo -e "${YELLOW}Warning: Less than 20GB free space detected ($FREE_GB GB). Model downloads might fail.${NC}"
    fi
}

function setup_user() {
    if ! id -u pillm > /dev/null 2>&1; then
        echo "Creating 'pillm' system user..."
        useradd -r -s /bin/false -d "$INSTALL_DIR" pillm
    fi
}

function install_packages() {
    echo "Updating apt repositories..."
    apt-get update

    echo "Installing system dependencies..."
    apt-get install -y python3 python3-venv python3-pip nginx avahi-daemon curl git ufw sqlite3

    if ! command -v node >/dev/null 2>&1; then
        echo "Installing Node.js 20.x..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
    fi
}

function install_ollama() {
    if ! command -v ollama >/dev/null 2>&1; then
        echo "Installing Ollama..."
        curl -fsSL https://ollama.ai/install.sh | sh
    else
        echo "Ollama is already installed."
    fi
    
    systemctl enable --now ollama
}

function pull_model() {
    MODEL="gemma4:e2b"
    echo "Checking if model $MODEL is pulled..."
    # Give ollama a moment to start
    sleep 5
    if ! ollama list | grep -q "$MODEL"; then
        echo "Pulling $MODEL... this may take a while."
        ollama pull "$MODEL" || echo -e "${YELLOW}Warning: Failed to pull model. You may need to do it manually.${NC}"
    else
        echo "Model $MODEL is already available."
    fi
}

function create_dirs() {
    echo "Creating directory structure in $INSTALL_DIR..."
    mkdir -p "$INSTALL_DIR/backend"
    mkdir -p "$INSTALL_DIR/frontend"
    mkdir -p "$INSTALL_DIR/data"
    mkdir -p "$INSTALL_DIR/backups"
}

function setup_backend() {
    echo "Setting up backend..."
    if [ -d "$REPO_DIR/backend" ]; then
        cp -r "$REPO_DIR/backend/"* "$INSTALL_DIR/backend/"
    fi
    
    cd "$INSTALL_DIR/backend"
    if [ ! -d ".venv" ]; then
        python3 -m venv .venv
    fi
    
    if [ -f "requirements.txt" ]; then
        .venv/bin/pip install -r requirements.txt
    fi
    
    if [ ! -f "$INSTALL_DIR/backend/.env" ]; then
        if [ -f "$REPO_DIR/.env.example" ]; then
            cp "$REPO_DIR/.env.example" "$INSTALL_DIR/backend/.env"
        fi
    fi
}

function setup_frontend() {
    echo "Setting up frontend..."
    if [ -d "$REPO_DIR/frontend" ]; then
        cp -r "$REPO_DIR/frontend/"* "$INSTALL_DIR/frontend/"
    fi
    
    cd "$INSTALL_DIR/frontend"
    if [ -f "package.json" ]; then
        npm install
        npm run build
    fi
}

function setup_database() {
    echo "Initializing database directory..."
    # The database will be created by the backend on first run, just ensure directory exists and permissions are set.
}

function setup_nginx() {
    echo "Configuring Nginx..."
    if [ -f "$REPO_DIR/deploy/nginx/pillm.conf" ]; then
        cp "$REPO_DIR/deploy/nginx/pillm.conf" /etc/nginx/sites-available/pillm.conf
        ln -sf /etc/nginx/sites-available/pillm.conf /etc/nginx/sites-enabled/pillm.conf
        rm -f /etc/nginx/sites-enabled/default
        nginx -t
    fi
}

function setup_systemd() {
    echo "Installing systemd services..."
    if [ -f "$REPO_DIR/deploy/systemd/pillm-backend.service" ]; then
        cp "$REPO_DIR/deploy/systemd/pillm-backend.service" /etc/systemd/system/
    fi
    if [ -f "$REPO_DIR/deploy/systemd/pillm-frontend.service" ]; then
        cp "$REPO_DIR/deploy/systemd/pillm-frontend.service" /etc/systemd/system/
    fi
    systemctl daemon-reload
}

function setup_ufw() {
    echo "Configuring firewall..."
    if [ -f "$REPO_DIR/deploy/firewall/ufw-setup.sh" ]; then
        bash "$REPO_DIR/deploy/firewall/ufw-setup.sh" || echo -e "${YELLOW}Warning: UFW setup failed.${NC}"
    fi
}

function setup_avahi() {
    echo "Configuring Avahi for mDNS (raspberrypi.local)..."
    systemctl enable --now avahi-daemon
}

function set_permissions() {
    echo "Setting permissions..."
    chown -R pillm:pillm "$INSTALL_DIR"
    chmod -R 750 "$INSTALL_DIR"
    chmod -R 770 "$INSTALL_DIR/data"
}

function start_services() {
    echo "Starting services..."
    systemctl enable --now pillm-backend
    systemctl enable --now pillm-frontend
    systemctl restart nginx
    systemctl enable --now nginx
}

function wait_and_check() {
    echo "Waiting for services to start..."
    for i in {1..30}; do
        if curl -s http://127.0.0.1:8000/api/health > /dev/null; then
            echo -e "${GREEN}Backend is up and running!${NC}"
            break
        fi
        sleep 2
        if [ "$i" -eq 30 ]; then
            echo -e "${RED}Backend did not start in time. Check logs with: journalctl -u pillm-backend${NC}"
        fi
    done
}

function finalize() {
    ACTIVE_IFACE=$(ip route | grep default | awk '{print $5}' | head -n 1)
    LAN_IP=$(ip -4 addr show "$ACTIVE_IFACE" | grep -oP '(?<=inet\s)\d+(\.\d+){3}')
    
    echo -e "${GREEN}"
    echo "=========================================================="
    echo " PiLLM Installation Complete!"
    echo "=========================================================="
    echo " Access PiLLM at:"
    echo " - http://$LAN_IP"
    echo " - http://raspberrypi.local (if your device supports mDNS)"
    echo " "
    echo " Configuration is located in $INSTALL_DIR/backend/.env"
    echo " Logs:"
    echo " - Backend: journalctl -u pillm-backend -f"
    echo " - Frontend: journalctl -u pillm-frontend -f"
    echo "==========================================================${NC}"
}

function main() {
    print_banner
    check_root
    check_architecture
    check_os
    check_ram
    check_disk
    setup_user
    install_packages
    install_ollama
    pull_model
    create_dirs
    setup_backend
    setup_frontend
    setup_database
    setup_nginx
    setup_systemd
    setup_ufw
    setup_avahi
    set_permissions
    start_services
    wait_and_check
    finalize
}

main
