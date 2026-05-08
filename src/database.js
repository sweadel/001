/* database.js - ZOLNGEN OPERATIONAL SQL ENGINE V126.0 (HYBRID SYNC) */
class ZolngenSQL {
    constructor() {
        this.dbKey = "zolngen_sovereign_db";
        this.apiUrl = "/api/data";
        this.saveUrl = "/api/save";
        this.init();
    }

    async init() {
        // Try to load from server first
        try {
            const response = await fetch(this.apiUrl);
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem(this.dbKey, JSON.stringify(data));
                console.log("[SQL] Server Data Loaded Successfully.");
            }
        } catch (e) {
            console.warn("[SQL] Server Offline. Using Local Cache.");
        }

        if (!localStorage.getItem(this.dbKey)) {
            const initialSchema = {
                products: [
                    { id: 1, sku: "Z-001", name: "Quantum Blade", price: 15000, stock: 10 },
                    { id: 2, sku: "Z-002", name: "Nebula Core", price: 8500, stock: 5 }
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
                body: JSON.stringify(data)
            });
            console.log("[SQL] Server Sync: COMPLETE.");
        } catch (e) {
            console.error("[SQL] Sync Failed:", e);
        }
    }

    getData() {
        return JSON.parse(localStorage.getItem(this.dbKey));
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
