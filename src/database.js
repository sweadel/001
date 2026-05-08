/* database.js - ZOLNGEN HYBRID CONNECTIVITY V153.0 */
class ZolngenEnterpriseDB {
    constructor() {
        this.tokenKey = "zolngen_auth_token";
        
        // SMART ROUTING: Detect if running on GitHub or Localhost
        const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
        this.baseUrl = isLocal ? "" : "http://localhost:8000";

        this.api = {
            products: `${this.baseUrl}/api/products`,
            orders: `${this.baseUrl}/api/orders`,
            login: `${this.baseUrl}/api/login`,
            inquiries: `${this.baseUrl}/api/inquiries`,
            logs: `${this.baseUrl}/api/logs`,
            heal: `${this.baseUrl}/api/heal`,
            subscribe: `${this.baseUrl}/api/subscribe`
        };
    }

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
            // If running from GitHub and server not started, show a specific hint
            if (this.baseUrl && e.message.includes('Failed to fetch')) {
                if (window.ZolngenUI) ZolngenUI.showToast("Local Server Offline. Run launch.py!", "error");
            }
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

    async getProducts() { return this.call(this.api.products).catch(() => []); }
    async getOrders() { return this.call(this.api.orders).catch(() => []); }
    async getInquiries() { return this.call(this.api.inquiries).catch(() => []); }
    async getLogs() { return this.call(this.api.logs).catch(() => []); }
    
    async createProduct(p) {
        const token = localStorage.getItem(this.tokenKey);
        return this.call(this.api.products, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(p)
        }).then(() => true).catch(() => false);
    }

    async updateProduct(p) {
        const token = localStorage.getItem(this.tokenKey);
        return this.call(`${this.baseUrl}/api/products/update`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(p)
        }).then(() => true).catch(() => false);
    }

    async updateOrderStatus(id, status) {
        const token = localStorage.getItem(this.tokenKey);
        return this.call(`${this.baseUrl}/api/orders/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ id, status })
        }).then(() => true).catch(() => false);
    }

    async placeOrder(order) {
        return this.call(this.api.orders, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
        }).then(() => true).catch(() => false);
    }

    async submitInquiry(data) {
        return this.call(this.api.inquiries, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(() => true).catch(() => false);
    }
}

const db = new ZolngenEnterpriseDB();
window.ZolngenDB = db;
