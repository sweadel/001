# server.py - ZOLNGEN INSTITUTIONAL SERVER V123.0 (MASTER CORRECTION)
import http.server
import socketserver
import logging
import os
from datetime import datetime

PORT = 8000

# Adjust path to root since server is in backend/
os.chdir("..")

# Setup Institutional Logging
logging.basicConfig(filename='backend/server_access.log', level=logging.INFO, 
                    format='[%(asctime)s] %(message)s', datefmt='%Y-%m-%d %H:%M:%S')

class ZolngenHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        logging.info(f"REQUEST: {self.address_string()} - {format%args}")
        print(f"[SERVER] [{datetime.now().strftime('%H:%M:%S')}] {format%args}")

if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), ZolngenHandler) as httpd:
        print(f"--- ZOLNGEN ENTERPRISE OS V125.0 ---")
        print(f"--- SERVER ACTIVE AT PORT: {PORT} ---")
        print(f"--- ROOT DIR: {os.getcwd()} ---")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("[SERVER] TERMINATING INSTITUTIONAL HOSTING.")
