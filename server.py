# server.py - ZOLNGEN ENTERPRISE MASTER BACKEND V106.0
import http.server
import socketserver
import os
import json
from datetime import datetime

PORT = 8000
DIRECTORY = "."

class ZolngenHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # LOGGING PROTOCOL
        print(f"[{datetime.now()}] REQ: {self.path} | SOURCE: {self.client_address[0]}")
        
        # API SIMULATION (Future Expansion)
        if self.path == "/api/status":
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            status = {"status": "ONLINE", "version": "V106.0", "health": "100%"}
            self.wfile.write(json.dumps(status).encode())
            return
            
        return super().do_GET()

    def log_message(self, format, *args):
        # SILENT LOGGING FOR CLEAN CONSOLE
        return

def start_server():
    try:
        with socketserver.TCPServer(("", PORT), ZolngenHandler) as httpd:
            print(f"=========================================")
            print(f" ZOLNGEN ENTERPRISE OMNI-SERVER V106.0   ")
            print(f" STATUS: 100% OPERATIONAL                ")
            print(f" PORT: {PORT}                            ")
            print(f" URL: http://localhost:{PORT}            ")
            print(f"=========================================")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nSHUTTING DOWN ZOLNGEN ECOSYSTEM...")
    except Exception as e:
        print(f"CRITICAL SYSTEM ERROR: {e}")

if __name__ == "__main__":
    start_server()
