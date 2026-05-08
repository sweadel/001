# server.py - ZOLNGEN MASTER SERVER V146.0
import http.server
import socketserver
import json
import sqlite3
import os
from datetime import datetime

PORT = 8000
# Ensure we are in the project root for file serving
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DB_PATH = os.path.join(PROJECT_ROOT, "backend", "enterprise.db")
SECRET_TOKEN = "ZOLN-ADMIN-TOKEN-2026"

def init_db():
    if not os.path.exists(os.path.dirname(DB_PATH)): os.makedirs(os.path.dirname(DB_PATH))
    conn = sqlite3.connect(DB_PATH)
    conn.execute("CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, sku TEXT, name TEXT, price REAL, stock INTEGER)")
    conn.execute("CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, customer TEXT, total REAL, status TEXT, date TEXT)")
    conn.execute("CREATE TABLE IF NOT EXISTS inquiries (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, message TEXT, date TEXT)")
    conn.execute("CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY AUTOINCREMENT, action TEXT, timestamp TEXT)")
    conn.commit()
    conn.close()

init_db()

class ZolngenMasterHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PROJECT_ROOT, **kwargs)

    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_OPTIONS(self): self._set_headers()

    def do_GET(self):
        if self.path.startswith('/api/'):
            conn = sqlite3.connect(DB_PATH); conn.row_factory = sqlite3.Row; cursor = conn.cursor()
            try:
                if self.path == '/api/products':
                    cursor.execute("SELECT * FROM products")
                    self._set_headers(); self.wfile.write(json.dumps([dict(r) for r in cursor.fetchall()]).encode())
                elif self.path == '/api/orders':
                    cursor.execute("SELECT * FROM orders")
                    self._set_headers(); self.wfile.write(json.dumps([dict(r) for r in cursor.fetchall()]).encode())
                elif self.path == '/api/inquiries':
                    cursor.execute("SELECT * FROM inquiries")
                    self._set_headers(); self.wfile.write(json.dumps([dict(r) for r in cursor.fetchall()]).encode())
                elif self.path == '/api/logs':
                    cursor.execute("SELECT * FROM logs ORDER BY id DESC LIMIT 50")
                    self._set_headers(); self.wfile.write(json.dumps([dict(r) for r in cursor.fetchall()]).encode())
            except Exception as e:
                self._set_headers(500); self.wfile.write(json.dumps({"error": str(e)}).encode())
            finally: conn.close()
        else:
            return super().do_GET()

    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        data = json.loads(self.rfile.read(length).decode()) if length > 0 else {}
        conn = sqlite3.connect(DB_PATH); cursor = conn.cursor()

        try:
            if self.path == '/api/login':
                if data.get('username') == 'admin' and data.get('password') == '1234':
                    self._set_headers(); self.wfile.write(json.dumps({"token": SECRET_TOKEN}).encode())
                else: self._set_headers(401)
            elif self.path == '/api/orders':
                cursor.execute("INSERT INTO orders (customer, total, status, date) VALUES (?, ?, ?, ?)", 
                               (data['customer'], data['total'], 'Pending', datetime.now().isoformat()))
                conn.commit(); self._set_headers(201)
            elif self.path == '/api/inquiries':
                cursor.execute("INSERT INTO inquiries (name, email, message, date) VALUES (?, ?, ?, ?)", 
                               (data['name'], data['email'], data['message'], datetime.now().isoformat()))
                conn.commit(); self._set_headers(201)
            elif self.path == '/api/products':
                if self.headers.get('Authorization') == f"Bearer {SECRET_TOKEN}":
                    cursor.execute("INSERT INTO products (sku, name, price, stock) VALUES (?, ?, ?, ?)", 
                                   (data['sku'], data['name'], data['price'], data['stock']))
                    conn.commit(); self._set_headers(201)
                else: self._set_headers(403)
        except Exception as e:
            self._set_headers(500); self.wfile.write(json.dumps({"error": str(e)}).encode())
        finally: conn.close()

    def do_PUT(self):
        length = int(self.headers.get('Content-Length', 0))
        data = json.loads(self.rfile.read(length).decode())
        conn = sqlite3.connect(DB_PATH); cursor = conn.cursor()
        try:
            if self.path == '/api/orders/status':
                cursor.execute("UPDATE orders SET status = ? WHERE id = ?", (data['status'], data['id']))
                conn.commit(); self._set_headers(200)
            elif self.path == '/api/products/update':
                cursor.execute("UPDATE products SET name = ?, price = ?, stock = ? WHERE id = ?", 
                               (data['name'], data['price'], data['stock'], data['id']))
                conn.commit(); self._set_headers(200)
        except Exception as e:
            self._set_headers(500); self.wfile.write(json.dumps({"error": str(e)}).encode())
        finally: conn.close()

if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), ZolngenMasterHandler) as httpd:
        print(f"--- ZOLNGEN MASTER SERVER V146.0 ON PORT {PORT} ---")
        httpd.serve_forever()
