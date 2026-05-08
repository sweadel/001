/* database.js - ZOLNGEN DEBUG-READY DATABASE V145.0 */
class ZolngenEnterpriseDB {
    constructor() {
        this.tokenKey = "zolngen_auth_token";
        this.baseUrl = ""; // Relative to server root
        this.api = {
            products: "/api/products",
            orders: "/api/orders",
            login: "/api/login",
            inquiries: "/api/inquiries",
            logs: "/api/logs",
            heal: "/api/heal"
        };
    }

    async request(url, options = {}) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.error || `HTTP Error ${response.status}`);
            }
            return await response.json();
        } catch (e) {
            console.error(`[API ERROR] at ${url}:`, e.message);
            if (window.ZolngenUI) ZolngenUI.showToast(`Error: ${e.message}`, "error");
            throw e;
        }
    }

    async login(username, password) {
        try {
            const data = await this.request(this.api.login, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }) 
            });
            localStorage.setItem(this.tokenKey, data.token);
            return true;
        } catch (e) { return false; }
    }

    async getProducts() { return this.request(this.api.products).catch(() => []); }
    async getOrders() { return this.request(this.api.orders).catch(() => []); }
    async getInquiries() { return this.request(this.api.inquiries).catch(() => []); }
    async getLogs() { return this.request(this.api.logs).catch(() => []); }

    async createProduct(p) {
        const token = localStorage.getItem(this.tokenKey);
        return this.request(this.api.products, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(p)
        }).then(() => true).catch(() => false);
    }

    async updateProduct(p) {
        const token = localStorage.getItem(this.tokenKey);
        return this.request(`${this.api.products}/update`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(p)
        }).then(() => true).catch(() => false);
    }

    async updateOrderStatus(id, status) {
        const token = localStorage.getItem(this.tokenKey);
        return this.request(`${this.api.orders}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ id, status })
        }).then(() => true).catch(() => false);
    }

    async placeOrder(order) {
        return this.request(this.api.orders, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
        }).then(() => true).catch(() => false);
    }

    async submitInquiry(data) {
        return this.request(this.api.inquiries, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(() => true).catch(() => false);
    }

    async runHealer() {
        const token = localStorage.getItem(this.tokenKey);
        return this.request(this.api.heal, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        });
    }
}

const db = new ZolngenEnterpriseDB();
window.ZolngenDB = db;
