/* database.js - ZOLNGEN SOVEREIGN SQL ENGINE V125.0 (INTERNAL) */
class ZolngenSQL {
    constructor() {
        this.dbKey = "zolngen_sovereign_db";
        this.init();
    }

    init() {
        if (!localStorage.getItem(this.dbKey)) {
            const initialSchema = {
                products: [
                    { id: 1, sku: "Z-001", name: "Quantum Blade", price: 15000, stock: 10 },
                    { id: 2, sku: "Z-002", name: "Nebula Core", price: 8500, stock: 5 }
                ],
                audit_log: [],
                settings: { theme: "dark", lang: "ar" }
            };
            localStorage.setItem(this.dbKey, JSON.stringify(initialSchema));
            console.log("[SQL] Sovereign Database Initialized.");
        }
    }

    // SELECT QUERY
    select(table, criteria = null) {
        const db = JSON.parse(localStorage.getItem(this.dbKey));
        const data = db[table] || [];
        if (!criteria) return data;
        return data.filter(item => Object.keys(criteria).every(key => item[key] === criteria[key]));
    }

    // INSERT QUERY
    insert(table, row) {
        const db = JSON.parse(localStorage.getItem(this.dbKey));
        if (!db[table]) db[table] = [];
        row.id = Date.now();
        db[table].push(row);
        localStorage.setItem(this.dbKey, JSON.stringify(db));
        this.notifyUpdate();
        return row;
    }

    // UPDATE QUERY
    update(table, id, newValues) {
        const db = JSON.parse(localStorage.getItem(this.dbKey));
        const index = db[table].findIndex(item => item.id === id);
        if (index !== -1) {
            db[table][index] = { ...db[table][index], ...newValues };
            localStorage.setItem(this.dbKey, JSON.stringify(db));
            this.notifyUpdate();
        }
    }

    // DELETE QUERY
    delete(table, id) {
        const db = JSON.parse(localStorage.getItem(this.dbKey));
        db[table] = db[table].filter(item => item.id !== id);
        localStorage.setItem(this.dbKey, JSON.stringify(db));
        this.notifyUpdate();
    }

    notifyUpdate() {
        window.dispatchEvent(new Event('zolngen_sql_update'));
    }
}

const db = new ZolngenSQL();
window.ZolngenDB = db;
