#!/usr/bin/env bash
set -e

echo "======================================"
echo "  PiLLM Network & Firewall Setup"
echo "======================================"

if [ "$EUID" -ne 0 ]; then
  echo "Please run as root or with sudo"
  exit 1
fi

# Detect active interface (not loopback)
ACTIVE_IFACE=$(ip route | grep default | awk '{print $5}' | head -n 1)
if [ -z "$ACTIVE_IFACE" ]; then
    echo "Could not detect active network interface. Exiting."
    exit 1
fi

# Detect LAN subnet
SUBNET=$(ip route show dev "$ACTIVE_IFACE" | grep -v default | awk '{print $1}' | grep '/' | head -n 1)
if [ -z "$SUBNET" ]; then
    echo "Could not detect LAN subnet. Exiting."
    exit 1
fi

echo "Detected Interface: $ACTIVE_IFACE"
echo "Detected Subnet: $SUBNET"
echo "Configuring UFW for LAN-only access..."

# Reset UFW
ufw --force reset

# Set defaults
ufw default deny incoming
ufw default allow outgoing

# Allow specific traffic from LAN
ufw allow from "$SUBNET" to any port 22 proto tcp comment 'SSH from LAN'
ufw allow from "$SUBNET" to any port 80 proto tcp comment 'HTTP from LAN'

# Enable UFW
echo "y" | ufw enable

echo ""
echo "PiLLM Network Mode: LOCAL LAN ONLY"
echo "Internet Exposure: DISABLED"
echo ""
echo "Final UFW Status:"
ufw status verbose
