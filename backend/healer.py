# healer.py - ZOLNGEN SOVEREIGN HEALER V125.0 (BACKEND ORCHESTRATOR)
import os
import subprocess
import time
from datetime import datetime

class SovereignOverlord:
    def __init__(self):
        self.log_file = "backend/overlord_audit.log"
        self.project_structure = {
            "root": ["index.html", "admin.html", "maintenance.html"],
            "src": ["database.js", "ai_engine.js", "security_core.js", "i18n.js"],
            "assets": ["global.css"],
            "backend": ["server.py", "healer.py"]
        }

    def log(self, msg):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        entry = f"[SOVEREIGN-OVERLORD] [{timestamp}] {msg}"
        print(entry)
        with open(self.log_file, "a", encoding="utf-8") as l: l.write(entry + "\n")

    def audit_structure(self):
        # Move back to root for check
        os.chdir("..")
        for folder, files in self.project_structure.items():
            if folder != "root" and not os.path.exists(folder):
                os.makedirs(folder)
                self.log(f"CREATED MISSING FOLDER: {folder}")
            
            for f in files:
                path = f if folder == "root" else f"{folder}/{f}"
                if not os.path.exists(path):
                    self.log(f"ALERT: Missing component {path}. Restoring...")
                    with open(path, "w", encoding="utf-8") as restore: restore.write("// Sovereign Restore\n")
        
        # Return to backend for sync
        os.chdir("backend")

    def orchestrate_sync(self):
        os.chdir("..")
        try:
            subprocess.run(["git", "add", "."], check=True)
            msg = f"SOVEREIGN ARCHITECTURE V125.0: Professional Refactor - {datetime.now()}"
            subprocess.run(["git", "commit", "-m", msg], check=True)
            subprocess.run(["git", "push"], check=True)
            self.log("GLOBAL SOVEREIGN SYNC: SUCCESSFUL.")
        except Exception as e:
            self.log(f"SYNC ANOMALY: {e}")
        os.chdir("backend")

    def run(self, interval=60):
        self.log("SOVEREIGN BACKEND ACTIVE. MANAGING INSTITUTIONAL STRUCTURE.")
        while True:
            try:
                self.audit_structure()
                self.orchestrate_sync()
                time.sleep(interval)
            except KeyboardInterrupt: break
            except Exception as e:
                self.log(f"SYSTEM ANOMALY: {e}")
                time.sleep(10)

if __name__ == "__main__":
    # Ensure we are in backend/
    if not os.path.basename(os.getcwd()) == "backend":
        if os.path.exists("backend"): os.chdir("backend")
    
    overlord = SovereignOverlord()
    overlord.run()
