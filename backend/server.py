# server.py - ZOLNGEN PROFESSIONAL BACKEND V136.0 (REST API)
import http.server
import socketserver
import json
import os
import secrets
from datetime import datetime

PORT = 8000
DB_FILE = "backend/database.json"
SECRET_TOKEN = "ZOLN-ADMIN-TOKEN-2026" # Simulation of a secure token

class ZolngenEnterpriseHandler(http.server.SimpleHTTPRequestHandler):
    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers()

    def do_GET(self):
        if self.path == '/api/products':
            self._set_headers()
            with open(DB_FILE, "r", encoding="utf-8") as f:
                self.wfile.write(f.read().encode())
        else:
            # Serve frontend files from root
            os.chdir("..")
            try: super().do_GET()
            except: pass
            os.chdir("backend")

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        # LOGIN ENDPOINT
        if self.path == '/api/login':
            data = json.loads(post_data.decode())
            if data.get('username') == 'admin' and data.get('password') == '1234':
                self._set_headers(200)
                self.wfile.write(json.dumps({"token": SECRET_TOKEN, "user": "Zolngen Admin"}).encode())
            else:
                self._set_headers(401)
                self.wfile.write(b'{"error": "Unauthorized Access Anomaly"}')

        # SECURE SAVE ENDPOINT (AUTH REQUIRED)
        elif self.path == '/api/products':
            auth_header = self.headers.get('Authorization')
            if auth_header == f"Bearer {SECRET_TOKEN}":
                try:
                    data = json.loads(post_data.decode())
                    with open(DB_FILE, "w", encoding="utf-8") as f:
                        json.dump(data, f, indent=4)
                    self._set_headers(200)
                    self.wfile.write(b'{"status": "SUCCESS", "msg": "Registry Updated"}')
                except Exception as e:
                    self._set_headers(500)
                    self.wfile.write(f'{{"error": "{str(e)}"}}'.encode())
            else:
                self._set_headers(403)
                self.wfile.write(b'{"error": "Forbidden: Token Invalid"}')

    def do_DELETE(self):
        # Implementation of Delete via API if needed, 
        # current architecture uses POST to save the entire state for simplicity.
        pass

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    with socketserver.TCPServer(("", PORT), ZolngenEnterpriseHandler) as httpd:
        print(f"--- ZOLNGEN ENTERPRISE BACKEND V136.0 ACTIVE ---")
        print(f"--- REST API LISTENING AT PORT: {PORT} ---")
        httpd.serve_forever()
