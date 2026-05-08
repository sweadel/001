# server.py - ZOLNGEN ENTERPRISE BACKEND V137.0 (SQLITE EDITION)
import http.server
import socketserver
import json
import sqlite3
import os
from datetime import datetime

PORT = 8000
DB_PATH = "backend/enterprise.db"
SECRET_TOKEN = "ZOLN-ADMIN-TOKEN-2026"

# INITIALIZE REAL DATABASE (SQLITE)
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Products Table
    cursor.execute('''CREATE TABLE IF NOT EXISTS products 
                     (id INTEGER PRIMARY KEY AUTOINCREMENT, sku TEXT, name TEXT, price REAL, stock INTEGER)''')
    # Orders Table
    cursor.execute('''CREATE TABLE IF NOT EXISTS orders 
                     (id INTEGER PRIMARY KEY AUTOINCREMENT, customer TEXT, total REAL, status TEXT, date TEXT)''')
    # Admin Logs Table
    cursor.execute('''CREATE TABLE IF NOT EXISTS logs 
                     (id INTEGER PRIMARY KEY AUTOINCREMENT, action TEXT, timestamp TEXT)''')
    conn.commit()
    conn.close()

init_db()

class ZolngenEnterpriseHandler(http.server.SimpleHTTPRequestHandler):
    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_OPTIONS(self): self._set_headers()

    def do_GET(self):
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        if self.path == '/api/products':
            cursor.execute("SELECT * FROM products")
            rows = [dict(row) for row in cursor.fetchall()]
            self._set_headers()
            self.wfile.write(json.dumps(rows).encode())
        
        elif self.path == '/api/orders':
            cursor.execute("SELECT * FROM orders")
            rows = [dict(row) for row in cursor.fetchall()]
            self._set_headers()
            self.wfile.write(json.dumps(rows).encode())

        else:
            os.chdir("..")
            try: super().do_GET()
            except: pass
            os.chdir("backend")
        conn.close()

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode())
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # LOGIN
        if self.path == '/api/login':
            if data.get('username') == 'admin' and data.get('password') == '1234':
                self._set_headers(200)
                self.wfile.write(json.dumps({"token": SECRET_TOKEN}).encode())
            else:
                self._set_headers(401)
                self.wfile.write(b'{"error": "Unauthorized"}')

        # SECURE PRODUCT ADD
        elif self.path == '/api/products':
            if self.headers.get('Authorization') == f"Bearer {SECRET_TOKEN}":
                cursor.execute("INSERT INTO products (sku, name, price, stock) VALUES (?, ?, ?, ?)", 
                               (data['sku'], data['name'], data['price'], data['stock']))
                conn.commit()
                self._set_headers(201)
                self.wfile.write(b'{"msg": "Product Created"}')
            else:
                self._set_headers(403)

        # MOCK ORDER CREATION
        elif self.path == '/api/orders':
            cursor.execute("INSERT INTO orders (customer, total, status, date) VALUES (?, ?, ?, ?)", 
                           (data['customer'], data['total'], 'Pending', datetime.now().isoformat()))
            conn.commit()
            self._set_headers(201)
            self.wfile.write(b'{"msg": "Order Received"}')

        conn.close()

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    with socketserver.TCPServer(("", PORT), ZolngenEnterpriseHandler) as httpd:
        print(f"--- ZOLNGEN ENTERPRISE SQLITE SERVER ACTIVE ---")
        httpd.serve_forever()
