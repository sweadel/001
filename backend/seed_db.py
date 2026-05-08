# seed_db.py - ZOLNGEN ROBUST MASSIVE SEEDING V151.1
import sqlite3
import os
from datetime import datetime

DB_PATH = "backend/enterprise.db"

def seed():
    if not os.path.exists("backend"): os.makedirs("backend")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Ensure tables exist before deletion/injection
    cursor.execute("CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, sku TEXT, name TEXT, price REAL, stock INTEGER)")
    cursor.execute("CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, customer TEXT, total REAL, status TEXT, date TEXT)")
    cursor.execute("CREATE TABLE IF NOT EXISTS inquiries (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, message TEXT, date TEXT)")
    cursor.execute("CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY AUTOINCREMENT, action TEXT, timestamp TEXT)")
    cursor.execute("CREATE TABLE IF NOT EXISTS subscribers (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT, date TEXT)")

    # Clear existing data
    cursor.execute("DELETE FROM products")
    cursor.execute("DELETE FROM orders")
    cursor.execute("DELETE FROM inquiries")
    cursor.execute("DELETE FROM logs")
    cursor.execute("DELETE FROM subscribers")

    # 20+ High-End Institutional Products
    products = [
        ('Z-LAP-Q1', 'ZOLNGEN Quantum-1 Laptop (i9/64GB)', 4500.0, 15),
        ('Z-LAP-Q2', 'ZOLNGEN Quantum-X Pro (Threadripper)', 6200.0, 8),
        ('Z-DSK-T1', 'Titan Node Workstation S1', 8900.0, 5),
        ('Z-DSK-T2', 'Titan Node Ultra (Dual RTX 4090)', 12500.0, 3),
        ('Z-SRV-S1', 'Sovereign Edge Server V1', 15000.0, 4),
        ('Z-SRV-S2', 'Sovereign Cluster Node (Liquid Cooled)', 22000.0, 2),
        ('Z-MON-R1', 'Retina Inspection Display 32" 8K', 3500.0, 10),
        ('Z-MON-R2', 'Panoramic Command Center 49"', 2800.0, 12),
        ('Z-ACC-K1', 'Mechanical Neural Keyboard (Tactile)', 450.0, 50),
        ('Z-ACC-M1', 'Precision Laser Tracking Node (Mouse)', 250.0, 100),
        ('Z-ACC-H1', 'Neural Link Headset (Spatial Audio)', 600.0, 40),
        ('Z-STO-X1', 'Titanium Storage Cell 100TB SSD', 3200.0, 20),
        ('Z-STO-X2', 'Sovereign Data Vault (Encrypted)', 5500.0, 10),
        ('Z-NET-R1', 'Quantum Router Hub (20Gbps)', 1200.0, 30),
        ('Z-GPU-A1', 'AI Processing Core (H100)', 35000.0, 5),
        ('Z-CPU-C1', 'Sovereign Core-99 Module', 1800.0, 25),
        ('Z-RAM-M1', 'Neural Memory Kit 128GB DDR5', 900.0, 60),
        ('Z-POW-P1', 'Titanium Power Cell 2000W', 550.0, 45),
        ('Z-CAS-C1', 'Titanium Chassis (EMI Shielded)', 800.0, 20),
        ('Z-PAD-P1', 'Retina Touch Surface Controller', 1500.0, 15)
    ]
    cursor.executemany("INSERT INTO products (sku, name, price, stock) VALUES (?, ?, ?, ?)", products)

    # Sample Orders
    orders = [
        ('Institutional Partner A', 45000.0, 'Completed', datetime.now().isoformat()),
        ('Global Tech Hub', 12500.0, 'Pending', datetime.now().isoformat())
    ]
    cursor.executemany("INSERT INTO orders (customer, total, status, date) VALUES (?, ?, ?, ?)", orders)

    conn.commit(); conn.close()
    print("--- ZOLNGEN REGISTRY POPULATED SUCCESSFULLY ---")

if __name__ == "__main__":
    seed()
