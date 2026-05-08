# healer.py - ZOLNGEN SOVEREIGN HEALER V127.0 (GRAND AUDIT)
import os
import subprocess
import time
from datetime import datetime

class SovereignOverlord:
    def __init__(self):
        self.log_file = "backend/overlord_audit.log"
        self.project_structure = {
            "root": ["index.html", "admin.html", "products.html", "maintenance.html"],
            "src": ["database.js", "ai_engine.js", "security_core.js", "i18n.js", "ui.js"],
            "assets": ["global.css"],
            "backend": ["server.py", "healer.py"]
        }

    def log(self, msg):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        entry = f"[SOVEREIGN-OVERLORD] [{timestamp}] {msg}"
        print(entry)
        with open(self.log_file, "a", encoding="utf-8") as l: 
            l.write(entry + "\n")

    def audit_structure(self):
        # Move to project root
        os.chdir("..")
        for folder, files in self.project_structure.items():
            if folder != "root" and not os.path.exists(folder):
                os.makedirs(folder)
                self.log(f"REPAIR: Created missing structural folder: {folder}")
            
            for f in files:
                path = f if folder == "root" else f"{folder}/{f}"
                if not os.path.exists(path):
                    self.log(f"CRITICAL REPAIR: Restoring missing component {path}")
                    with open(path, "w", encoding="utf-8") as restore: 
                        restore.write("// Sovereign Self-Healing Recovery System\n")
        
        # Return to backend
        os.chdir("backend")

    def orchestrate_sync(self):
        os.chdir("..")
        try:
            # Check for changes
            status = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True).stdout
            if status:
                self.log("INITIATING AUTONOMOUS GLOBAL SYNC...")
                subprocess.run(["git", "add", "."], check=True)
                msg = f"V127.0 SOVEREIGN AUDIT: Total Integration & Unity - {datetime.now().strftime('%H:%M:%S')}"
                subprocess.run(["git", "commit", "-m", msg], check=True)
                subprocess.run(["git", "push"], check=True)
                self.log("GLOBAL SYNC: SUCCESSFUL.")
            else:
                self.log("SYSTEM STATUS: SYNCHRONIZED. NO CHANGES DETECTED.")
        except Exception as e:
            self.log(f"SYNC ANOMALY: {e}")
        os.chdir("backend")

    def run(self, interval=60):
        self.log("SOVEREIGN ORCHESTRATOR ACTIVE. COMMENCING GRAND AUDIT...")
        while True:
            try:
                self.audit_structure()
                self.orchestrate_sync()
                time.sleep(interval)
            except KeyboardInterrupt: break
            except Exception as e:
                self.log(f"CORE ANOMALY: {e}")
                time.sleep(10)

if __name__ == "__main__":
    # Ensure working directory is backend/
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    overlord = SovereignOverlord()
    overlord.run()
