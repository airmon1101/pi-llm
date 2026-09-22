# Troubleshooting PiLLM

## 1. Ollama Not Running
**Symptoms:** "Connection Refused" when chatting.
**Fix:**
```bash
sudo systemctl restart ollama
sudo systemctl status ollama
```

## 2. Gemma 4 E2B Model Missing
**Symptoms:** "Model not found" errors in backend logs.
**Fix:**
```bash
ollama pull gemma4:e2b
```

## 3. Insufficient Disk Space
**Symptoms:** Model pulling fails, SQLite errors.
**Fix:** Check space and clear logs/models.
```bash
df -h
journalctl --vacuum-time=3d
ollama rm <unused_model>
```

## 4. High RAM Usage
**Symptoms:** System freezing, OOM kills.
**Fix:** Check memory usage.
```bash
free -h
top -o %MEM
```
Consider restarting Ollama to free memory: `sudo systemctl restart ollama`

## 5. Slow Inference
**Symptoms:** Taking >10s to generate the first token.
**Fix:** Ensure you are using the Pi 5 with 8GB RAM, and no other heavy background processes are running. Check CPU temps (thermal throttling).
```bash
cat /sys/class/thermal/thermal_zone0/temp
```

## 6. Frontend Unavailable
**Symptoms:** 502 Bad Gateway on /.
**Fix:**
```bash
sudo systemctl restart pillm-frontend
sudo journalctl -u pillm-frontend -f
```

## 7. Backend Unavailable
**Symptoms:** UI loads but chats fail, 502 on /api.
**Fix:**
```bash
sudo systemctl restart pillm-backend
sudo journalctl -u pillm-backend -f
```

## 8. Nginx Errors
**Symptoms:** Cannot connect to IP at all.
**Fix:**
```bash
sudo nginx -t
sudo systemctl restart nginx
sudo tail -f /var/log/nginx/pillm_error.log
```

## 9. UFW Blocking Access
**Symptoms:** Cannot access from another device on LAN.
**Fix:** Ensure UFW is allowing your subnet.
```bash
sudo ufw status
# If blocked, allow your subnet (e.g., 192.168.1.0/24)
sudo ufw allow from 192.168.1.0/24 to any port 80
```

## 10. raspberrypi.local Not Resolving
**Symptoms:** http://raspberrypi.local fails, but IP works.
**Fix:** Ensure Avahi is running.
```bash
sudo systemctl restart avahi-daemon
```
(Note: Windows devices may need Bonjour Print Services installed).

## 11. Incorrect LAN IP
**Symptoms:** Cannot find the Pi on the network.
**Fix:**
```bash
hostname -I
```

## 12. Wi-Fi Disconnected
**Symptoms:** Network unreachable.
**Fix:** Use `nmtui` to reconnect or check wpa_supplicant.

## 13. Raspberry Pi Reboot
**Fix:**
```bash
sudo reboot
```
Services will start automatically.

## 14. SQLite Failure
**Symptoms:** "Database locked" or IO errors.
**Fix:** Check permissions and disk space.
```bash
ls -l /opt/pillm/data/pillm.db
sudo chown pillm:pillm /opt/pillm/data/pillm.db
```

## 15. MicroSD Running Out of Space
**Symptoms:** System unstable.
**Fix:** Use `ncdu` to find large files. Consider moving `/opt/pillm/data` or Ollama models to an external SSD.
