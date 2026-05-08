# server.py - ZOLNGEN OPERATIONAL SERVER V126.0 (API LAYER)
import http.server
import socketserver
import json
import os
import logging
from datetime import datetime

PORT = 8000
DB_FILE = "backend/database.json"

# Ensure DB exists
if not os.path.exists(DB_FILE):
    with open(DB_FILE, "w") as f: json.dump({"products": [], "audit": []}, f)

class ZolngenAPIHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/data':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            with open(DB_FILE, "r") as f: self.wfile.write(f.read().encode())
        else:
            # Change to root for static files
            os.chdir("..")
            super().do_GET()
            os.chdir("backend")

    def do_POST(self):
        if self.path == '/api/save':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            with open(DB_FILE, "w") as f: f.write(post_data.decode())
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b'{"status": "SAVED"}')

    def log_message(self, format, *args):
        # logging.info(f"REQUEST: {self.address_string()} - {format%args}")
        print(f"[SERVER] [{datetime.now().strftime('%H:%M:%S')}] {format%args}")

if __name__ == "__main__":
    # Ensure we are in backend/
    if not os.path.basename(os.getcwd()) == "backend":
        if os.path.exists("backend"): os.chdir("backend")

    with socketserver.TCPServer(("", PORT), ZolngenAPIHandler) as httpd:
        print(f"--- ZOLNGEN OPERATIONAL OS V126.0 ---")
        print(f"--- SERVER ACTIVE AT PORT: {PORT} ---")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt: pass
