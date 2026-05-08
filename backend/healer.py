# healer.py - ZOLNGEN SOVEREIGN HEALER V132.0 (FINAL REFINEMENTS)
import os
import shutil
import subprocess
import time
from datetime import datetime

class SovereignOverlord:
    def __init__(self):
        self.log_file = "backend/overlord_audit.log"
        self.db_file = "backend/database.json"
        self.backup_dir = "backend/backups/"
        if not os.path.exists(self.backup_dir): os.makedirs(self.backup_dir)

    def log(self, msg):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        entry = f"[SOVEREIGN-OVERLORD] [{timestamp}] {msg}"
        print(entry)
        with open(self.log_file, "a", encoding="utf-8") as l: l.write(entry + "\n")

    def backup_database(self):
        if os.path.exists(self.db_file):
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_path = f"{self.backup_dir}database_v{timestamp}.json"
            shutil.copy2(self.db_file, backup_path)
            self.log(f"RADICAL HEAL: Vault Backup created at {backup_path}")
            return True
        return False

    def audit_and_sync(self):
        # Autonomous sync logic (as before)
        try:
            os.chdir("..")
            subprocess.run(["git", "add", "."], check=True)
            msg = f"SOVEREIGN GUARDIAN V132.0: Automated Backup & Sync - {datetime.now()}"
            subprocess.run(["git", "commit", "-m", msg], capture_output=True)
            subprocess.run(["git", "push"], capture_output=True)
            os.chdir("backend")
        except: pass

    def run(self, interval=60):
        self.log("SOVEREIGN GUARDIAN ACTIVE. PROTECTING THE INSTITUTION.")
        while True:
            try:
                self.backup_database()
                self.audit_and_sync()
                time.sleep(interval)
            except KeyboardInterrupt: break
            except Exception as e:
                self.log(f"ANOMALY: {e}")
                time.sleep(10)

if __name__ == "__main__":
    overlord = SovereignOverlord()
    overlord.run()
