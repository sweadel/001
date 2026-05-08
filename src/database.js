/* database.js - ZOLNGEN FUNCTIONAL BRIDGE V131.0 (LIVE SYNC) */
class ZolngenSQL {
    constructor() {
        this.dbKey = "zolngen_sovereign_db";
        this.apiUrl = "/api/data";
        this.saveUrl = "/api/save";
        this.init();
    }

    async init() {
        console.log("[BRIDGE] Initiating talk with Python Backend...");
        await this.syncFromServer();
        
        // Listen for external storage changes (cross-tab sync)
        window.addEventListener('storage', (e) => {
            if (e.key === this.dbKey) this.notifyUpdate();
        });
    }

    // TALK TO PYTHON: GET DATA
    async syncFromServer() {
        try {
            const response = await fetch(this.apiUrl);
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem(this.dbKey, JSON.stringify(data));
                this.notifyUpdate();
                console.log("[BRIDGE] Server Sync: SUCCESS.");
                return true;
            }
        } catch (e) {
            console.error("[BRIDGE] Backend Unreachable. Using local fallback.");
            return false;
        }
    }

    // TALK TO PYTHON: SAVE DATA
    async syncToServer() {
        const data = this.getData();
        try {
            const response = await fetch(this.saveUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                console.log("[BRIDGE] Data Persisted to Disk.");
                return true;
            }
        } catch (e) {
            console.error("[BRIDGE] Save Failed.");
            return false;
        }
    }

    getData() {
        return JSON.parse(localStorage.getItem(this.dbKey)) || { products: [], audit_log: [] };
    }

    async insert(table, row) {
        const db = this.getData();
        if (!db[table]) db[table] = [];
        row.id = Date.now();
        db[table].push(row);
        localStorage.setItem(this.dbKey, JSON.stringify(db));
        await this.syncToServer();
        this.notifyUpdate();
        return row;
    }

    async delete(table, id) {
        const db = this.getData();
        db[table] = db[table].filter(item => item.id !== id);
        localStorage.setItem(this.dbKey, JSON.stringify(db));
        await this.syncToServer();
        this.notifyUpdate();
    }

    notifyUpdate() {
        window.dispatchEvent(new Event('zolngen_sql_update'));
    }
}

const db = new ZolngenSQL();
window.ZolngenDB = db;
