# server.py - ZOLNGEN FUNCTIONAL AUTHORITY V131.0 (LIVE API)
import http.server
import socketserver
import json
import os
from datetime import datetime

PORT = 8000
DB_FILE = "backend/database.json"

# Institutional Setup
if not os.path.exists(DB_FILE):
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump({"products": [], "audit_log": []}, f, indent=4)

class ZolngenBridgeHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/data':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            with open(DB_FILE, "r", encoding="utf-8") as f:
                self.wfile.write(f.read().encode())
        else:
            # Change to root to serve static files (index, admin, etc.)
            os.chdir("..")
            try:
                super().do_GET()
            except Exception as e:
                print(f"[BRIDGE ERROR] {e}")
            os.chdir("backend")

    def do_POST(self):
        if self.path == '/api/save':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode())
                with open(DB_FILE, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=4)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(b'{"status": "OK", "msg": "Sovereign Persistence Active."}')
                print(f"[BRIDGE] [{datetime.now().strftime('%H:%M:%S')}] DATA SAVED TO DISK.")
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(f'{{"error": "{str(e)}"}}'.encode())

    def log_message(self, format, *args):
        # Override to keep console clean for bridge logging
        pass

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    with socketserver.TCPServer(("", PORT), ZolngenBridgeHandler) as httpd:
        print(f"--- ZOLNGEN FUNCTIONAL BRIDGE ACTIVE ---")
        print(f"--- SERVER LISTENING AT PORT: {PORT} ---")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[BRIDGE] TERMINATING AUTHORITY.")
