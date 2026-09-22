# PiLLM

```ascii
  _____  _  _       _      __  __ 
 |  __ \(_)| |     | |    |  \/  |
 | |__) |_ | |     | |    | \  / |
 |  ___/| || |     | |    | |\/| |
 | |    | || |____ | |____| |  | |
 |_|    |_||______||______|_|  |_|
```

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![OS: Ubuntu 24.04](https://img.shields.io/badge/OS-Ubuntu%2024.04-orange.svg)
![Hardware: Raspberry Pi 5](https://img.shields.io/badge/Hardware-Raspberry%20Pi%205-red.svg)

PiLLM is a private, local AI chat server designed specifically to run entirely on a Raspberry Pi 5. It uses Ollama to run the `gemma4:e2b` model locally, ensuring 100% data privacy with zero external API calls.

## Features
- **100% Local Processing:** No data leaves your network.
- **LAN-Only Security:** Strict firewall rules prevent internet exposure.
- **Responsive UI:** Next.js frontend with real-time SSE streaming.
- **Optimized for Pi 5:** Tuned systemd services and Nginx configuration.
- **Idempotent Installer:** Single-command setup script.
- **mDNS Support:** Access via `http://raspberrypi.local`.

## Architecture Diagram
See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for a detailed breakdown.

## Hardware Requirements
- **Board:** Raspberry Pi 5
- **RAM:** 8GB recommended (4GB minimum with degraded performance)
- **Storage:** 64GB+ fast microSD card (A2 class) or external NVMe SSD
- **Network:** Wi-Fi or Ethernet (LAN only)

## Software Requirements
- **OS:** Ubuntu Server 24.04 LTS ARM64 (aarch64)

## Quick Start / Installation
Clone the repository and run the installer as root:
```bash
git clone https://github.com/yourusername/pi-llm.git /opt/pillm
cd /opt/pillm
sudo bash scripts/install.sh
```

## First Run
After installation, access PiLLM from any device on your local network:
- http://raspberrypi.local
- http://<YOUR_PI_IP_ADDRESS>

## Network Configuration
PiLLM uses `avahi-daemon` to broadcast `raspberrypi.local`. If this fails, use the IP address printed at the end of the installation.

## LAN-Only Security Explanation
The installer configures `ufw` (Uncomplicated Firewall) to DENY all incoming traffic by default. It detects your local subnet (e.g., 192.168.1.0/24) and ONLY allows ports 80 (HTTP) and 22 (SSH) from that subnet. Port 11434 (Ollama) is bound to `127.0.0.1` and never exposed.

## Ollama Configuration
Ollama runs as a systemd service. By default, it runs on `127.0.0.1:11434`.

## Gemma 4 E2B Info
This project defaults to `gemma4:e2b`, a highly optimized model for edge devices providing excellent performance-to-RAM ratio on the Pi 5.

## Development Mode Instructions
To run locally for development:
1. Stop production services: `sudo systemctl stop pillm-frontend pillm-backend nginx`
2. Start Next.js: `cd frontend && npm run dev`
3. Start FastAPI: `cd backend && source .venv/bin/activate && uvicorn app.main:app --reload`

## Production Deployment
The installer sets up Nginx as a reverse proxy, mapping `/` to Next.js and `/api/` to FastAPI. Systemd keeps both services running automatically across reboots.

## Storage Management
Models are stored in `/usr/share/ollama/.ollama/models`. SQLite database is in `/opt/pillm/data/`. Monitor your storage using `df -h`.

## Backup and Restore
Run the backup script to create an archive of your settings and database:
```bash
sudo bash scripts/backup.sh
```
Restoration instructions are printed by the script.

## Update Instructions
To update PiLLM to the latest version without losing data:
```bash
cd /opt/pillm
git pull
sudo bash scripts/update.sh
```

## Useful Commands
- Get IP: `hostname -I`
- Check RAM: `free -h`
- Check Disk: `df -h`
- List Models: `ollama list`
- Backend Logs: `sudo journalctl -u pillm-backend -f`
- Frontend Logs: `sudo journalctl -u pillm-frontend -f`

## Troubleshooting Quick Reference
See [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for detailed fixes.

## Performance Considerations for Pi 5
- **Cooling:** An active cooler is highly recommended. Thermal throttling will severely impact token generation speed.
- **Storage:** MicroSD cards are slow. Using an NVMe Base with a fast SSD will improve model load times and database operations.

## Security Overview
- No external APIs.
- Nginx blocks direct access to `/ollama/`.
- Strict LAN firewall rules.
- Services run under limited `pillm` user.
- Security headers enabled in Nginx.

## Future Improvements
- **Phase 2:** Search & Export functionality.
- **Phase 3:** RAG (Retrieval-Augmented Generation) with local documents.
- **Phase 4:** Vision model support via Pi Camera.
- **Phase 5:** IoT integration (Home Assistant).

## Contributing
Pull requests are welcome. For major changes, please open an issue first.

## License
MIT
