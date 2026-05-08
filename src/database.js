/* database.js - ZOLNGEN SOVEREIGN SQL ENGINE V127.0 (GRAND AUDIT) */
class ZolngenSQL {
    constructor() {
        this.dbKey = "zolngen_sovereign_db";
        this.apiUrl = "/api/data";
        this.saveUrl = "/api/save";
        this.init();
    }

    async init() {
        // Institutional Sync Protocol
        try {
            const response = await fetch(this.apiUrl);
            if (response.ok) {
                const data = await response.json();
                if (data && data.products) {
                    localStorage.setItem(this.dbKey, JSON.stringify(data));
                    console.log("[SQL] Institutional Data Synced from Server.");
                }
            }
        } catch (e) {
            console.warn("[SQL] Server Node Unreachable. Operating in Autonomous Local Mode.");
        }

        if (!localStorage.getItem(this.dbKey)) {
            const initialSchema = {
                products: [
                    { id: 1, sku: "Z-001", name: "Quantum Blade", price: 15000, stock: 12 },
                    { id: 2, sku: "Z-002", name: "Nebula Core", price: 8500, stock: 8 },
                    { id: 3, sku: "Z-003", name: "Obsidian Shield", price: 4200, stock: 25 }
                ],
                audit_log: [],
                settings: { theme: "dark", lang: "ar" }
            };
            this.saveLocally(initialSchema);
        }
        this.notifyUpdate();
    }

    saveLocally(data) {
        localStorage.setItem(this.dbKey, JSON.stringify(data));
        this.syncWithServer(data);
    }

    async syncWithServer(data) {
        try {
            await fetch(this.saveUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            console.log("[SQL] Server Persistence: SUCCESS.");
        } catch (e) {
            console.error("[SQL] Persistence Anomaly:", e);
        }
    }

    getData() {
        return JSON.parse(localStorage.getItem(this.dbKey)) || { products: [], audit_log: [] };
    }

    select(table, criteria = null) {
        const db = this.getData();
        const data = db[table] || [];
        if (!criteria) return data;
        return data.filter(item => Object.keys(criteria).every(key => item[key] === criteria[key]));
    }

    insert(table, row) {
        const db = this.getData();
        if (!db[table]) db[table] = [];
        row.id = Date.now();
        db[table].push(row);
        this.saveLocally(db);
        this.notifyUpdate();
        return row;
    }

    update(table, id, newValues) {
        const db = this.getData();
        const index = db[table].findIndex(item => item.id === id);
        if (index !== -1) {
            db[table][index] = { ...db[table][index], ...newValues };
            this.saveLocally(db);
            this.notifyUpdate();
        }
    }

    delete(table, id) {
        const db = this.getData();
        db[table] = db[table].filter(item => item.id !== id);
        this.saveLocally(db);
        this.notifyUpdate();
    }

    notifyUpdate() {
        window.dispatchEvent(new Event('zolngen_sql_update'));
    }
}

const db = new ZolngenSQL();
window.ZolngenDB = db;
