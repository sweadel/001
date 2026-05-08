# server.py - ZOLNGEN SOVEREIGN MASTER SERVER V150.0
import http.server
import socketserver
import json
import sqlite3
import os
from datetime import datetime

PORT = 8000
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DB_PATH = os.path.join(PROJECT_ROOT, "backend", "enterprise.db")
SECRET_TOKEN = "ZOLN-ADMIN-TOKEN-2026"

def init_db():
    if not os.path.exists(os.path.dirname(DB_PATH)): os.makedirs(os.path.dirname(DB_PATH))
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, sku TEXT, name TEXT, price REAL, stock INTEGER)")
    cursor.execute("CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, customer TEXT, total REAL, status TEXT, date TEXT)")
    cursor.execute("CREATE TABLE IF NOT EXISTS inquiries (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, message TEXT, date TEXT)")
    cursor.execute("CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY AUTOINCREMENT, action TEXT, timestamp TEXT)")
    cursor.execute("CREATE TABLE IF NOT EXISTS subscribers (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT, date TEXT)")
    conn.commit(); conn.close()

init_db()

class ZolngenGlobalHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PROJECT_ROOT, **kwargs)

    def _send_json(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def do_OPTIONS(self): self._send_json({}, 200)

    def do_GET(self):
        if self.path.startswith('/api/'):
            conn = sqlite3.connect(DB_PATH); conn.row_factory = sqlite3.Row; cursor = conn.cursor()
            try:
                if self.path == '/api/products':
                    cursor.execute("SELECT * FROM products"); self._send_json([dict(r) for r in cursor.fetchall()])
                elif self.path == '/api/orders':
                    cursor.execute("SELECT * FROM orders"); self._send_json([dict(r) for r in cursor.fetchall()])
                elif self.path == '/api/inquiries':
                    cursor.execute("SELECT * FROM inquiries"); self._send_json([dict(r) for r in cursor.fetchall()])
                elif self.path == '/api/logs':
                    cursor.execute("SELECT * FROM logs ORDER BY id DESC LIMIT 50"); self._send_json([dict(r) for r in cursor.fetchall()])
                elif self.path == '/api/subscribers':
                    cursor.execute("SELECT * FROM subscribers"); self._send_json([dict(r) for r in cursor.fetchall()])
            except Exception as e: self._send_json({"error": str(e)}, 500)
            finally: conn.close()
        else: return super().do_GET()

    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        data = json.loads(self.rfile.read(length).decode()) if length > 0 else {}
        conn = sqlite3.connect(DB_PATH); cursor = conn.cursor()
        try:
            if self.path == '/api/login':
                if data.get('username') == 'admin' and data.get('password') == '1234':
                    self._send_json({"token": SECRET_TOKEN})
                else: self._send_json({"error": "Unauthorized"}, 401)
            elif self.path == '/api/subscribe':
                cursor.execute("INSERT INTO subscribers (email, date) VALUES (?, ?)", (data['email'], datetime.now().isoformat()))
                conn.commit(); self._send_json({"msg": "Subscribed"}, 201)
            elif self.path == '/api/products':
                if self.headers.get('Authorization') == f"Bearer {SECRET_TOKEN}":
                    cursor.execute("INSERT INTO products (sku, name, price, stock) VALUES (?, ?, ?, ?)", (data['sku'], data['name'], data['price'], data['stock']))
                    conn.commit(); self._send_json({"msg": "Created"}, 201)
                else: self._send_json({"error": "Forbidden"}, 403)
            elif self.path == '/api/orders':
                cursor.execute("INSERT INTO orders (customer, total, status, date) VALUES (?, ?, ?, ?)", (data['customer'], data['total'], 'Pending', datetime.now().isoformat()))
                conn.commit(); self._send_json({"msg": "Order Placed"}, 201)
            elif self.path == '/api/inquiries':
                cursor.execute("INSERT INTO inquiries (name, email, message, date) VALUES (?, ?, ?, ?)", (data['name'], data['email'], data['message'], datetime.now().isoformat()))
                conn.commit(); self._send_json({"msg": "Sent"}, 201)
        except Exception as e: self._send_json({"error": str(e)}, 500)
        finally: conn.close()

    def do_PUT(self):
        length = int(self.headers.get('Content-Length', 0)); data = json.loads(self.rfile.read(length).decode())
        conn = sqlite3.connect(DB_PATH); cursor = conn.cursor()
        try:
            if self.path == '/api/orders/status':
                cursor.execute("UPDATE orders SET status = ? WHERE id = ?", (data['status'], data['id']))
                conn.commit(); self._send_json({"msg": "Updated"})
            elif self.path == '/api/products/update':
                cursor.execute("UPDATE products SET name = ?, price = ?, stock = ? WHERE id = ?", (data['name'], data['price'], data['stock'], data['id']))
                conn.commit(); self._send_json({"msg": "Updated"})
        except Exception as e: self._send_json({"error": str(e)}, 500)
        finally: conn.close()

if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), ZolngenGlobalHandler) as httpd:
        print(f"--- ZOLNGEN GLOBAL SERVER V150.0 ON PORT {PORT} ---")
        httpd.serve_forever()
