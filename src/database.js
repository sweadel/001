/* database.js - ZOLNGEN ULTRA-PRECISE DATABASE V147.0 */
class ZolngenEnterpriseDB {
    constructor() {
        this.tokenKey = "zolngen_auth_token";
        this.api = {
            products: "/api/products",
            orders: "/api/orders",
            login: "/api/login",
            inquiries: "/api/inquiries",
            logs: "/api/logs",
            heal: "/api/heal"
        };
    }

    // SHARED REQUEST HANDLER WITH STRICT ERROR CATCHING
    async call(url, options = {}) {
        try {
            const response = await fetch(url, options);
            const data = await response.json().catch(() => ({}));
            
            if (!response.ok) {
                const errorMsg = data.error || `System Error: ${response.status}`;
                if (window.ZolngenUI) ZolngenUI.showToast(errorMsg, "error");
                throw new Error(errorMsg);
            }
            return data;
        } catch (e) {
            console.error(`[DATABASE ERROR] at ${url}:`, e.message);
            throw e;
        }
    }

    async login(username, password) {
        try {
            const data = await this.call(this.api.login, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            localStorage.setItem(this.tokenKey, data.token);
            return true;
        } catch (e) { return false; }
    }

    // PRODUCTS (STRICT TYPE CASTING)
    async getProducts() { return this.call(this.api.products).catch(() => []); }
    
    async createProduct(p) {
        // Ensure numeric data integrity
        const cleanProduct = {
            sku: String(p.sku),
            name: String(p.name),
            price: parseFloat(p.price) || 0,
            stock: parseInt(p.stock) || 0
        };
        const token = localStorage.getItem(this.tokenKey);
        return this.call(this.api.products, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(cleanProduct)
        }).then(() => true).catch(() => false);
    }

    async updateProduct(p) {
        const cleanProduct = {
            id: parseInt(p.id),
            name: String(p.name),
            price: parseFloat(p.price) || 0,
            stock: parseInt(p.stock) || 0
        };
        const token = localStorage.getItem(this.tokenKey);
        return this.call(`${this.api.products}/update`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(cleanProduct)
        }).then(() => true).catch(() => false);
    }

    // ORDERS & STATUS
    async getOrders() { return this.call(this.api.orders).catch(() => []); }
    async updateOrderStatus(id, status) {
        const token = localStorage.getItem(this.tokenKey);
        return this.call(`${this.api.orders}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ id: parseInt(id), status: String(status) })
        }).then(() => true).catch(() => false);
    }

    async placeOrder(order) {
        const cleanOrder = {
            customer: String(order.customer || 'Anonymous'),
            total: parseFloat(order.total) || 0
        };
        return this.call(this.api.orders, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cleanOrder)
        }).then(() => true).catch(() => false);
    }

    // INQUIRIES & LOGS
    async getInquiries() { return this.call(this.api.inquiries).catch(() => []); }
    async getLogs() { return this.call(this.api.logs).catch(() => []); }
    
    async submitInquiry(data) {
        return this.call(this.api.inquiries, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(() => true).catch(() => false);
    }

    async runHealer() {
        const token = localStorage.getItem(this.tokenKey);
        return this.call(this.api.heal, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        });
    }
}

const db = new ZolngenEnterpriseDB();
window.ZolngenDB = db;
