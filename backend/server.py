# server.py - ZOLNGEN INSTITUTIONAL SERVER V127.0 (GRAND AUDIT)
import http.server
import socketserver
import json
import os
import logging
from datetime import datetime

PORT = 8000
DB_FILE = "backend/database.json"

# Institutional Setup
if not os.path.exists(DB_FILE):
    with open(DB_FILE, "w", encoding="utf-8") as f: 
        json.dump({"products": [], "audit_log": []}, f)

class ZolngenSovereignHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/data':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            with open(DB_FILE, "r", encoding="utf-8") as f: 
                self.wfile.write(f.read().encode())
        else:
            # Serve static files from root
            os.chdir("..")
            try:
                super().do_GET()
            except Exception as e:
                print(f"[SERVER ERROR] {e}")
            os.chdir("backend")

    def do_POST(self):
        if self.path == '/api/save':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                # Validate JSON before saving
                json_data = json.loads(post_data.decode())
                with open(DB_FILE, "w", encoding="utf-8") as f: 
                    json.dump(json_data, f, indent=4)
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(b'{"status": "SUCCESS", "message": "Institutional Data Persisted."}')
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(f'{{"status": "ERROR", "message": "{str(e)}"}}'.encode())

    def log_message(self, format, *args):
        # Professional Logging to Console
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[ZOLNGEN-SERVER] [{timestamp}] {format%args}")

if __name__ == "__main__":
    # Ensure working directory is backend/
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    with socketserver.TCPServer(("", PORT), ZolngenSovereignHandler) as httpd:
        print(f"--- ZOLNGEN SOVEREIGN OS V127.0 ---")
        print(f"--- INSTITUTIONAL SERVER ACTIVE AT PORT: {PORT} ---")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[SERVER] TERMINATING SOVEREIGN HOSTING.")
