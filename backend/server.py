# server.py - ZOLNGEN SOVEREIGN BACKEND V144.0
import http.server
import socketserver
import json
import sqlite3
import os
from datetime import datetime

PORT = 8000
DB_PATH = "backend/enterprise.db"
SECRET_TOKEN = "ZOLN-ADMIN-TOKEN-2026"

class ZolngenSovereignHandler(http.server.SimpleHTTPRequestHandler):
    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_OPTIONS(self): self._set_headers()

    def do_GET(self):
        conn = sqlite3.connect(DB_PATH); conn.row_factory = sqlite3.Row; cursor = conn.cursor()
        if self.path == '/api/products':
            cursor.execute("SELECT * FROM products"); self._set_headers(); self.wfile.write(json.dumps([dict(r) for r in cursor.fetchall()]).encode())
        elif self.path == '/api/orders':
            cursor.execute("SELECT * FROM orders"); self._set_headers(); self.wfile.write(json.dumps([dict(r) for r in cursor.fetchall()]).encode())
        elif self.path == '/api/logs':
            cursor.execute("SELECT * FROM logs ORDER BY id DESC LIMIT 50"); self._set_headers(); self.wfile.write(json.dumps([dict(r) for r in cursor.fetchall()]).encode())
        elif self.path == '/api/inquiries':
            cursor.execute("SELECT * FROM inquiries"); self._set_headers(); self.wfile.write(json.dumps([dict(r) for r in cursor.fetchall()]).encode())
        else:
            os.chdir(".."); super().do_GET(); os.chdir("backend")
        conn.close()

    def do_POST(self):
        length = int(self.headers['Content-Length']); data = json.loads(self.rfile.read(length).decode())
        conn = sqlite3.connect(DB_PATH); cursor = conn.cursor()
        if self.path == '/api/login':
            if data.get('username') == 'admin' and data.get('password') == '1234':
                self._set_headers(); self.wfile.write(json.dumps({"token": SECRET_TOKEN}).encode())
            else: self._set_headers(401)
        elif self.path == '/api/heal': # SOVEREIGN HEALER ENDPOINT
            if self.headers.get('Authorization') == f"Bearer {SECRET_TOKEN}":
                # Simulated integrity check
                files = ["../index.html", "../admin.html", "../assets/global.css"]
                status = "Healthy"
                for f in files: 
                    if not os.path.exists(f): status = "Corrupted"
                cursor.execute("INSERT INTO logs (action, timestamp) VALUES (?, ?)", (f"System Integrity Check: {status}", datetime.now().isoformat()))
                conn.commit()
                self._set_headers(); self.wfile.write(json.dumps({"status": status}).encode())
            else: self._set_headers(403)
        elif self.path == '/api/products':
            if self.headers.get('Authorization') == f"Bearer {SECRET_TOKEN}":
                cursor.execute("INSERT INTO products (sku, name, price, stock) VALUES (?, ?, ?, ?)", (data['sku'], data['name'], data['price'], data['stock']))
                conn.commit(); self._set_headers(201)
        elif self.path == '/api/orders':
            cursor.execute("INSERT INTO orders (customer, total, status, date) VALUES (?, ?, ?, ?)", (data['customer'], data['total'], 'Pending', datetime.now().isoformat()))
            conn.commit(); self._set_headers(201)
        elif self.path == '/api/inquiries':
            cursor.execute("INSERT INTO inquiries (name, email, message, date) VALUES (?, ?, ?, ?)", (data['name'], data['email'], data['message'], datetime.now().isoformat()))
            conn.commit(); self._set_headers(201)
        conn.close()

    def do_PUT(self):
        length = int(self.headers['Content-Length']); data = json.loads(self.rfile.read(length).decode())
        conn = sqlite3.connect(DB_PATH); cursor = conn.cursor()
        if self.path == '/api/orders/status':
            cursor.execute("UPDATE orders SET status = ? WHERE id = ?", (data['status'], data['id']))
            conn.commit(); self._set_headers(200)
        elif self.path == '/api/products/update':
            cursor.execute("UPDATE products SET name = ?, price = ?, stock = ? WHERE id = ?", (data['name'], data['price'], data['stock'], data['id']))
            conn.commit(); self._set_headers(200)
        conn.close()

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    with socketserver.TCPServer(("", PORT), ZolngenSovereignHandler) as httpd:
        print("--- ZOLNGEN SOVEREIGN SERVER V144.0 ACTIVE ---")
        httpd.serve_forever()
