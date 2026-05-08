# server.py - ZOLNGEN HYPER-FUNCTIONAL BACKEND V141.0 (SQLITE)
import http.server
import socketserver
import json
import sqlite3
import os
from datetime import datetime

PORT = 8000
DB_PATH = "backend/enterprise.db"
SECRET_TOKEN = "ZOLN-ADMIN-TOKEN-2026"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, sku TEXT, name TEXT, price REAL, stock INTEGER)''')
    cursor.execute('''CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, customer TEXT, total REAL, status TEXT, date TEXT)''')
    cursor.execute('''CREATE TABLE IF NOT EXISTS inquiries (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, message TEXT, date TEXT)''')
    cursor.execute('''CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY AUTOINCREMENT, action TEXT, timestamp TEXT)''')
    conn.commit()
    conn.close()

init_db()

class ZolngenHyperHandler(http.server.SimpleHTTPRequestHandler):
    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_OPTIONS(self): self._set_headers()

    def do_GET(self):
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        if self.path == '/api/products':
            cursor.execute("SELECT * FROM products")
            self._set_headers(); self.wfile.write(json.dumps([dict(r) for r in cursor.fetchall()]).encode())
        elif self.path == '/api/orders':
            cursor.execute("SELECT * FROM orders")
            self._set_headers(); self.wfile.write(json.dumps([dict(r) for r in cursor.fetchall()]).encode())
        elif self.path == '/api/logs':
            cursor.execute("SELECT * FROM logs ORDER BY id DESC LIMIT 50")
            self._set_headers(); self.wfile.write(json.dumps([dict(r) for r in cursor.fetchall()]).encode())
        elif self.path == '/api/inquiries':
            cursor.execute("SELECT * FROM inquiries")
            self._set_headers(); self.wfile.write(json.dumps([dict(r) for r in cursor.fetchall()]).encode())
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
        
        elif self.path == '/api/products':
            if self.headers.get('Authorization') == f"Bearer {SECRET_TOKEN}":
                cursor.execute("INSERT INTO products (sku, name, price, stock) VALUES (?, ?, ?, ?)", (data['sku'], data['name'], data['price'], data['stock']))
                cursor.execute("INSERT INTO logs (action, timestamp) VALUES (?, ?)", (f"Product Added: {data['name']}", datetime.now().isoformat()))
                conn.commit(); self._set_headers(201)
            else: self._set_headers(403)

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
            if self.headers.get('Authorization') == f"Bearer {SECRET_TOKEN}":
                cursor.execute("UPDATE orders SET status = ? WHERE id = ?", (data['status'], data['id']))
                conn.commit(); self._set_headers(200)
            else: self._set_headers(403)
        
        elif self.path == '/api/products/update':
            if self.headers.get('Authorization') == f"Bearer {SECRET_TOKEN}":
                cursor.execute("UPDATE products SET name = ?, price = ?, stock = ? WHERE id = ?", (data['name'], data['price'], data['stock'], data['id']))
                conn.commit(); self._set_headers(200)
            else: self._set_headers(403)

        conn.close()

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    with socketserver.TCPServer(("", PORT), ZolngenHyperHandler) as httpd:
        print("--- ZOLNGEN HYPER-FUNCTIONAL SERVER V141.0 ACTIVE ---")
        httpd.serve_forever()
