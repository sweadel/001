# launch.py - ZOLNGEN OFFICIAL INSPECTION LAUNCHER V143.0
import os
import subprocess
import time
import webbrowser
import sys

def main():
    print("--- ZOLNGEN ENTERPRISE SYSTEM: INSPECTION MODE ---")
    
    # 1. Seed Database
    print("[1/3] Synchronizing Registry...")
    subprocess.run([sys.executable, "backend/seed_db.py"])
    
    # 2. Open Storefront in Browser
    print("[2/3] Opening Institutional Interface...")
    webbrowser.open("http://localhost:8000/index.html")
    
    # 3. Start Server
    print("[3/3] Activating Sovereign Server V141.0...")
    print("\nACCESS INFO:")
    print("-----------------------------------------")
    print("STOREFRONT: http://localhost:8000/index.html")
    print("ADMIN PANEL: http://localhost:8000/admin.html")
    print("CREDENTIALS: Username: admin | Password: 1234")
    print("-----------------------------------------\n")
    
    try:
        subprocess.run([sys.executable, "backend/server.py"])
    except KeyboardInterrupt:
        print("\n--- SYSTEM SHUTDOWN INITIATED ---")

if __name__ == "__main__":
    main()
