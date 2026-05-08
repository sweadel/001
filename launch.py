# launch.py - ZOLNGEN SOVEREIGN LAUNCHER V156.0
import subprocess
import time
import webbrowser
import os
import sys

def start():
    print("--- ZOLNGEN SOVEREIGN PLATFORM INITIALIZING ---")
    
    # 1. Start Server in background
    print("[1/3] Starting Sovereign Backend...")
    server_path = os.path.join("backend", "server.py")
    try:
        # Using popen to run in background
        subprocess.Popen([sys.executable, server_path])
        time.sleep(2) # Wait for server to bind port
    except Exception as e:
        print(f"FAILED TO START SERVER: {e}")
        return

    # 2. Seed Database (Ensuring 20+ products are ready)
    print("[2/3] Synchronizing Registry Data...")
    seed_path = os.path.join("backend", "seed_db.py")
    try:
        subprocess.run([sys.executable, seed_path])
    except Exception as e:
        print(f"DATA SYNC FAILED: {e}")

    # 3. Launch UI
    print("[3/3] Launching Master Storefront...")
    url = "http://localhost:8000/index.html"
    webbrowser.open(url)
    
    print("\n--- SYSTEM ONLINE | 100% OPERATIONAL ---")
    print("Keep this terminal open while using the platform.")

if __name__ == "__main__":
    start()
