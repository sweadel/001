# seed_db.py - ZOLNGEN DATA SEEDING V143.0
import sqlite3
import os
from datetime import datetime

DB_PATH = "backend/enterprise.db"

def seed():
    if not os.path.exists("backend"): os.makedirs("backend")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create Tables
    cursor.execute('''CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, sku TEXT, name TEXT, price REAL, stock INTEGER)''')
    cursor.execute('''CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, customer TEXT, total REAL, status TEXT, date TEXT)''')
    cursor.execute('''CREATE TABLE IF NOT EXISTS inquiries (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, message TEXT, date TEXT)''')
    cursor.execute('''CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY AUTOINCREMENT, action TEXT, timestamp TEXT)''')

    # Sample Products
    products = [
        ('Z-NODE-01', 'ZOLNGEN Quantum Laptop', 4500.0, 12),
        ('Z-STATION-X', 'Sovereign Desktop Node', 8900.0, 5),
        ('Z-PART-S1', 'Titanium Storage Cell', 1200.0, 50),
        ('Z-CORE-9', 'Enterprise CPU Module', 3200.0, 8),
        ('Z-VISION-4K', 'Retina Inspection Display', 2100.0, 15)
    ]
    cursor.executemany("INSERT INTO products (sku, name, price, stock) VALUES (?, ?, ?, ?)", products)

    # Sample Orders
    orders = [
        ('Institutional Partner A', 14500.0, 'Completed', datetime.now().isoformat()),
        ('Global Tech Node', 3200.0, 'Pending', datetime.now().isoformat()),
        ('Sovereign Hub', 8900.0, 'Completed', datetime.now().isoformat())
    ]
    cursor.executemany("INSERT INTO orders (customer, total, status, date) VALUES (?, ?, ?, ?)", orders)

    # Sample Logs
    logs = [
        ("System Initialized", datetime.now().isoformat()),
        ("Database Migrated to SQLite", datetime.now().isoformat()),
        ("Registry Seeded for Inspection", datetime.now().isoformat())
    ]
    cursor.executemany("INSERT INTO logs (action, timestamp) VALUES (?, ?)", logs)

    conn.commit()
    conn.close()
    print("--- ZOLNGEN REGISTRY SEEDED SUCCESSFULLY ---")

if __name__ == "__main__":
    seed()
