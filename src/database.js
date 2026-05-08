/* database.js - ZOLNGEN ENTERPRISE DATABASE V137.0 (SQLITE & ORDERS) */
class ZolngenEnterpriseDB {
    constructor() {
        this.tokenKey = "zolngen_auth_token";
        this.apiProducts = "/api/products";
        this.apiOrders = "/api/orders";
        this.apiLogin = "/api/login";
        this.init();
    }

    async init() {
        // Real-time sync handled by UI components
    }

    async login(username, password) {
        try {
            const res = await fetch(this.apiLogin, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (res.ok) {
                const data = await res.json();
                localStorage.setItem(this.tokenKey, data.token);
                return true;
            }
            return false;
        } catch (e) { return false; }
    }

    // REAL PRODUCTS FETCH (SQLITE)
    async getProducts() {
        try {
            const res = await fetch(this.apiProducts);
            return res.ok ? await res.json() : [];
        } catch (e) { return []; }
    }

    // REAL ORDERS FETCH (SQLITE)
    async getOrders() {
        try {
            const res = await fetch(this.apiOrders);
            return res.ok ? await res.json() : [];
        } catch (e) { return []; }
    }

    // SECURE PRODUCT CREATION
    async createProduct(product) {
        const token = localStorage.getItem(this.tokenKey);
        try {
            const res = await fetch(this.apiProducts, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(product)
            });
            return res.ok;
        } catch (e) { return false; }
    }

    // ORDER CREATION (CUSTOMER SIDE)
    async placeOrder(order) {
        try {
            const res = await fetch(this.apiOrders, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(order)
            });
            return res.ok;
        } catch (e) { return false; }
    }
}

const db = new ZolngenEnterpriseDB();
window.ZolngenDB = db;
