# server.py - ZOLNGEN ULTRA-PRECISE SERVER V147.0
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

def log_action(cursor, action):
    cursor.execute("INSERT INTO logs (action, timestamp) VALUES (?, ?)", (action, datetime.now().isoformat()))

class ZolngenPreciseHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PROJECT_ROOT, **kwargs)

    def _send_res(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def do_OPTIONS(self): self._send_res({}, 200)

    def do_GET(self):
        if self.path.startswith('/api/'):
            conn = sqlite3.connect(DB_PATH); conn.row_factory = sqlite3.Row; cursor = conn.cursor()
            try:
                if self.path == '/api/products':
                    cursor.execute("SELECT * FROM products")
                    self._send_res([dict(r) for r in cursor.fetchall()])
                elif self.path == '/api/orders':
                    cursor.execute("SELECT * FROM orders")
                    self._send_res([dict(r) for r in cursor.fetchall()])
                elif self.path == '/api/inquiries':
                    cursor.execute("SELECT * FROM inquiries")
                    self._send_res([dict(r) for r in cursor.fetchall()])
                elif self.path == '/api/logs':
                    cursor.execute("SELECT * FROM logs ORDER BY id DESC LIMIT 50")
                    self._send_res([dict(r) for r in cursor.fetchall()])
                elif self.path == '/api/heartbeat':
                    self._send_res({"status": "Alive", "timestamp": datetime.now().isoformat()})
            except Exception as e: self._send_res({"error": str(e)}, 500)
            finally: conn.close()
        else: return super().do_GET()

    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        data = json.loads(self.rfile.read(length).decode()) if length > 0 else {}
        conn = sqlite3.connect(DB_PATH); cursor = conn.cursor()
        try:
            if self.path == '/api/login':
                if data.get('username') == 'admin' and data.get('password') == '1234':
                    self._send_res({"token": SECRET_TOKEN})
                else: self._send_res({"error": "Invalid Credentials"}, 401)
            elif self.path == '/api/orders':
                cursor.execute("INSERT INTO orders (customer, total, status, date) VALUES (?, ?, ?, ?)", 
                               (data['customer'], float(data['total']), 'Pending', datetime.now().isoformat()))
                log_action(cursor, f"New Order Placed: {data['customer']}")
                conn.commit(); self._send_res({"msg": "Order Saved"}, 201)
            elif self.path == '/api/products':
                if self.headers.get('Authorization') == f"Bearer {SECRET_TOKEN}":
                    cursor.execute("INSERT INTO products (sku, name, price, stock) VALUES (?, ?, ?, ?)", 
                                   (data['sku'], data['name'], float(data['price']), int(data['stock'])))
                    log_action(cursor, f"Product Added: {data['name']}")
                    conn.commit(); self._send_res({"msg": "Product Created"}, 201)
                else: self._send_res({"error": "Unauthorized"}, 403)
            elif self.path == '/api/inquiries':
                cursor.execute("INSERT INTO inquiries (name, email, message, date) VALUES (?, ?, ?, ?)", 
                               (data['name'], data['email'], data['message'], datetime.now().isoformat()))
                conn.commit(); self._send_res({"msg": "Inquiry Sent"}, 201)
            elif self.path == '/api/heal':
                self._send_res({"status": "Healthy"})
        except Exception as e: self._send_res({"error": str(e)}, 500)
        finally: conn.close()

    def do_PUT(self):
        length = int(self.headers.get('Content-Length', 0))
        data = json.loads(self.rfile.read(length).decode())
        conn = sqlite3.connect(DB_PATH); cursor = conn.cursor()
        try:
            if self.path == '/api/orders/status':
                cursor.execute("UPDATE orders SET status = ? WHERE id = ?", (data['status'], int(data['id'])))
                log_action(cursor, f"Order #{data['id']} Status Updated to {data['status']}")
                conn.commit(); self._send_res({"msg": "Status Updated"})
            elif self.path == '/api/products/update':
                cursor.execute("UPDATE products SET name = ?, price = ?, stock = ? WHERE id = ?", 
                               (data['name'], float(data['price']), int(data['stock']), int(data['id'])))
                log_action(cursor, f"Product Updated: {data['name']}")
                conn.commit(); self._send_res({"msg": "Product Updated"})
        except Exception as e: self._send_res({"error": str(e)}, 500)
        finally: conn.close()

if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), ZolngenPreciseHandler) as httpd:
        print(f"--- ZOLNGEN ULTRA-PRECISE SERVER V147.0 ---")
        httpd.serve_forever()
