# ZOLNGEN BACKEND ENGINE V100.6 - THE INSTITUTIONAL CORE
# [!] Blueprint for Full-Stack Orchestration
from flask import Flask, jsonify, request, session
import json
import os

app = Flask(__name__)
app.secret_key = 'zolngen_master_key_2026'

# Mock Database Persistence
DB_PATH = 'institutional_db.json'

def load_db():
    if not os.path.exists(DB_PATH):
        return {"products": [], "orders": [], "accounts": [{"user": "admin", "pass": "admin123", "role": "ADMIN"}]}
    with open(DB_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_db(data):
    with open(DB_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    db = load_db()
    user = next((a for a in db['accounts'] if a['user'] == data['user'] and a['pass'] == data['pass']), None)
    if user:
        session['user'] = user['user']
        return jsonify({"status": "success", "user": user}), 200
    return jsonify({"status": "error", "message": "Invalid credentials"}), 401

@app.route('/api/inventory', methods=['GET'])
def get_inventory():
    db = load_db()
    return jsonify(db['products']), 200

@app.route('/api/inventory/update', methods=['POST'])
def update_product():
    if 'user' not in session: return jsonify({"status": "error"}), 403
    prod_data = request.json
    db = load_db()
    # Logic to update/append product
    db['products'].append(prod_data)
    save_db(db)
    return jsonify({"status": "success"}), 200

@app.route('/api/orders', methods=['GET'])
def get_orders():
    db = load_db()
    return jsonify(db['orders']), 200

@app.route('/api/stats', methods=['GET'])
def get_stats():
    db = load_db()
    total_sales = sum(o['total'] for o in db['orders'])
    return jsonify({
        "totalSales": total_sales,
        "inventoryCount": len(db['products']),
        "activeTickets": 0
    }), 200

if __name__ == '__main__':
    print("ZOLNGEN MASTER BACKEND V100.6 ACTIVE")
    # app.run(port=5000, debug=True)
