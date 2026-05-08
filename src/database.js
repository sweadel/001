/* database.js - ZOLNGEN PROFESSIONAL DATABASE V136.0 (REST & AUTH) */
class ZolngenEnterpriseDB {
    constructor() {
        this.dbKey = "zolngen_enterprise_db";
        this.tokenKey = "zolngen_auth_token";
        this.apiUrl = "/api/products";
        this.loginUrl = "/api/login";
        this.init();
    }

    async init() {
        await this.syncFromServer();
    }

    // REAL AUTH: LOGIN
    async login(username, password) {
        try {
            const response = await fetch(this.loginUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem(this.tokenKey, data.token);
                console.log("[AUTH] Token Acquired and Stored.");
                return true;
            }
            return false;
        } catch (e) {
            console.error("[AUTH] Login Anomaly:", e);
            return false;
        }
    }

    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    // REST API: GET PRODUCTS
    async syncFromServer() {
        try {
            const response = await fetch(this.apiUrl);
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem(this.dbKey, JSON.stringify(data));
                this.notifyUpdate();
                return true;
            }
        } catch (e) {
            console.warn("[DB] Offline Mode: Using local cache.");
            return false;
        }
    }

    // REST API: POST PRODUCTS (SECURE)
    async syncToServer() {
        const data = this.getData();
        const token = this.getToken();
        if (!token) return console.error("[AUTH] Missing Security Token.");

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                console.log("[DB] Data Persisted via Secure REST API.");
                return true;
            } else if (response.status === 403) {
                alert("SESSION EXPIRED: Please re-authorize.");
                location.href = "admin.html";
            }
        } catch (e) {
            console.error("[DB] Save Failed.");
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
        window.dispatchEvent(new Event('zolngen_db_update'));
    }
}

const db = new ZolngenEnterpriseDB();
window.ZolngenDB = db;
