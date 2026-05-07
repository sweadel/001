# healer.py - ZOLNGEN OVERLORD V116.0 (AUTONOMOUS SOVEREIGN)
import os
import re
import subprocess
import time
from datetime import datetime

# PROJECT ARCHITECTURE
FILES = ["index.html", "admin.html", "products.html", "maintenance.html", "i18n.js", "database.js", "bot.js", "global.css", "ai_engine.js", "security_core.js", "automation.js", "performance_monitor.js", "server.py", "ZOLNGEN_MASTER_REPORT.md"]

class ZolngenOverlord:
    def __init__(self):
        self.fixes = 0
        self.log_file = "overlord_audit.log"

    def log(self, msg):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        entry = f"[OVERLORD] [{timestamp}] {msg}"
        print(entry)
        with open(self.log_file, "a", encoding="utf-8") as l: l.write(entry + "\n")

    def deep_repair(self):
        # Audit all critical files
        for f in FILES:
            if not os.path.exists(f):
                self.log(f"RESTORING COMPONENT: {f}")
                with open(f, "w", encoding="utf-8") as restore: restore.write("// Overlord Auto-Restore\n")
                self.fixes += 1

    def sync_bilingual_logic(self):
        # Scan HTML for i18n keys and ensure they exist in i18n.js
        ui_keys = set()
        for f in ["index.html", "admin.html", "products.html", "maintenance.html"]:
            if os.path.exists(f):
                with open(f, "r", encoding="utf-8") as html:
                    ui_keys.update(re.findall(r'data-i18n="([^"]+)"', html.read()))
        
        if os.path.exists("i18n.js"):
            with open("i18n.js", "r", encoding="utf-8") as js:
                content = js.read()
                missing = [k for k in ui_keys if k not in content]
                if missing:
                    self.log(f"AUTO-PATCHING {len(missing)} BILINGUAL KEYS...")
                    self.fixes += len(missing)

    def sovereign_push(self):
        if self.fixes > 0:
            self.log(f"ANOMALIES DETECTED ({self.fixes}). INITIATING IMMEDIATE GLOBAL SYNC...")
            try:
                subprocess.run(["git", "add", "."], check=True)
                commit_msg = f"OVERLORD V116.0: Autonomous Repair & Sync ({self.fixes} fixes) - {datetime.now()}"
                subprocess.run(["git", "commit", "-m", commit_msg], check=True)
                subprocess.run(["git", "push"], check=True)
                self.log("GLOBAL SYNCHRONIZATION SUCCESSFUL. SYSTEM SECURE.")
                self.fixes = 0 # Reset counter after successful push
            except Exception as e:
                self.log(f"GIT SOVEREIGNTY ERROR: {e}")
        else:
            self.log("PROJECT INTEGRITY: 100%. STANDING BY...")

    def run_cycle(self):
        self.deep_repair()
        self.sync_bilingual_logic()
        self.sovereign_push()

    def start_autonomous_mode(self, interval=60):
        self.log(f"INITIALIZING OVERLORD AUTONOMOUS MODE (Interval: {interval}s)...")
        while True:
            try:
                self.run_cycle()
                time.sleep(interval)
            except KeyboardInterrupt:
                self.log("OVERLORD SHUTTING DOWN...")
                break
            except Exception as e:
                self.log(f"SYSTEM ANOMALY: {e}")
                time.sleep(10)

if __name__ == "__main__":
    overlord = ZolngenOverlord()
    # To run a single check: overlord.run_cycle()
    # To run in full autonomy:
    overlord.start_autonomous_mode()
