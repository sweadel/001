# ZOLNGEN ENTERPRISE PRO - BACKEND ENGINE (FLASK/PYTHON)
# This file serves as a blueprint for the full-stack transition.

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Simulated Database (In production, connect to PostgreSQL or MongoDB)
inventory = [
    {"id": "PRD-1", "name": "HP EliteBook 840 G9", "price": 1250, "stock": 45},
    {"id": "PRD-2", "name": "Dell Latitude 7430", "price": 1180, "stock": 5},
    {"id": "PRD-3", "name": "MacBook Pro M2", "price": 1850, "stock": 12},
    {"id": "PRD-4", "name": "PowerEdge R750", "price": 4500, "stock": 3}
]

@app.route('/api/inventory', methods=['GET'])
def get_inventory():
    return jsonify(inventory)

@app.route('/api/bot/chat', methods=['POST'])
def bot_chat():
    data = request.json
    query = data.get('query', '').lower()
    
    # Intelligence Logic
    if 'stock' in query:
        return jsonify({"response": "All systems nominal. Inventory is at 98% capacity."})
    
    return jsonify({"response": "ZOLNGEN AI is processing your request."})

if __name__ == '__main__':
    print("ZOLNGEN Enterprise Engine starting on port 5000...")
    app.run(debug=True, port=5000)
