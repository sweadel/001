# server.py - ZOLNGEN FUNCTIONAL AUTHORITY V132.0 (GUARDIAN API)
import http.server
import socketserver
import json
import os
from datetime import datetime
# Import healer logic for manual trigger
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from healer import SovereignOverlord

PORT = 8000
DB_FILE = "backend/database.json"
guardian = SovereignOverlord()

class ZolngenGuardianHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/data':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            with open(DB_FILE, "r") as f: self.wfile.write(f.read().encode())
        else:
            os.chdir("..")
            try: super().do_GET()
            except: pass
            os.chdir("backend")

    def do_POST(self):
        if self.path == '/api/save':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            with open(DB_FILE, "w", encoding="utf-8") as f: f.write(post_data.decode())
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b'{"status": "SAVED"}')
        
        elif self.path == '/api/guardian':
            # Trigger manual backup/heal
            success = guardian.backup_database()
            self.send_response(200 if success else 500)
            self.end_headers()
            self.wfile.write(b'{"status": "GUARDIAN_ACTIVATED"}' if success else b'{"status": "ERROR"}')

    def log_message(self, format, *args): pass

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    with socketserver.TCPServer(("", PORT), ZolngenGuardianHandler) as httpd:
        print(f"--- ZOLNGEN SOVEREIGN CLOSING ACTIVE ---")
        print(f"--- GUARDIAN API LISTENING AT PORT: {PORT} ---")
        try: httpd.serve_forever()
        except KeyboardInterrupt: pass
