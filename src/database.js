/* database.js - ZOLNGEN HYPER-FUNCTIONAL DATABASE V141.0 */
class ZolngenEnterpriseDB {
    constructor() {
        this.tokenKey = "zolngen_auth_token";
        this.api = {
            products: "/api/products",
            orders: "/api/orders",
            login: "/api/login",
            inquiries: "/api/inquiries",
            logs: "/api/logs"
        };
    }

    async login(username, password) {
        const res = await fetch(this.api.login, { method: 'POST', body: JSON.stringify({ username, password }) });
        if (res.ok) { localStorage.setItem(this.tokenKey, (await res.json()).token); return true; }
        return false;
    }

    async getProducts() { return (await fetch(this.api.products)).json(); }
    async getOrders() { return (await fetch(this.api.orders)).json(); }
    async getInquiries() { return (await fetch(this.api.inquiries)).json(); }
    async getLogs() { return (await fetch(this.api.logs)).json(); }

    async createProduct(p) {
        const token = localStorage.getItem(this.tokenKey);
        return (await fetch(this.api.products, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: JSON.stringify(p) })).ok;
    }

    // NEW: UPDATE PRODUCT
    async updateProduct(p) {
        const token = localStorage.getItem(this.tokenKey);
        return (await fetch(`${this.api.products}/update`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }, body: JSON.stringify(p) })).ok;
    }

    // NEW: UPDATE ORDER STATUS
    async updateOrderStatus(id, status) {
        const token = localStorage.getItem(this.tokenKey);
        return (await fetch(`${this.api.orders}/status`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ id, status }) })).ok;
    }

    async placeOrder(order) {
        return (await fetch(this.api.orders, { method: 'POST', body: JSON.stringify(order) })).ok;
    }

    // NEW: SUBMIT CONTACT FORM
    async submitInquiry(data) {
        return (await fetch(this.api.inquiries, { method: 'POST', body: JSON.stringify(data) })).ok;
    }
}

const db = new ZolngenEnterpriseDB();
window.ZolngenDB = db;
