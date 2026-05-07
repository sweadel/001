/* database.js - ZOLNGEN SINGULARITY DB V107.0 */
const DB = {
    init: function() {
        if(!localStorage.getItem('zolngen_prods')) this.seed();
    },
    
    get: (key) => JSON.parse(localStorage.getItem(key)) || [],
    set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
    
    seed: function() {
        const prods = [
            { id: 'Z1', name: 'ZOLNGEN Server X1', category: 'Computing', price: 15000, stock: 12, ar_ready: true },
            { id: 'Z2', name: 'Quantum Laptop Pro', category: 'Workstations', price: 3500, stock: 45, ar_ready: true },
            { id: 'Z3', name: 'Neural Network Hub', category: 'Networking', price: 8000, stock: 8, ar_ready: false }
        ];
        const orders = [
            { id: 'ORD-882', entity: 'Jordan Ministry of Tech', total: 45000, status: 'shipped', date: '2026-05-01' },
            { id: 'ORD-901', entity: 'Zain HQ Jordan', total: 12000, status: 'pending', date: '2026-05-06' }
        ];
        const accounts = [
            { user: 'admin', pass: 'admin123', name: 'System Master', role: 'ADMIN', level: 99 },
            { user: 'staff1', pass: 'staff123', name: 'Ahmad Tech', role: 'STAFF', level: 5 }
        ];
        const audit = [
            { action: 'SYSTEM_BOOT', user: 'SYSTEM', date: new Date().toLocaleString() },
            { action: 'ADMIN_LOGIN', user: 'admin', date: new Date().toLocaleString() }
        ];
        const blockchain = [
            { hash: '0x7dd8638b...', prev: '0x00000000...', data: 'Genesis Block Created' },
            { hash: '0xba0e889c...', prev: '0x7dd8638b...', data: 'V107.0 Singularity Update' }
        ];

        this.set('zolngen_prods', prods);
        this.set('zolngen_orders', orders);
        this.set('zolngen_accounts', accounts);
        this.set('zolngen_audit', audit);
        this.set('zolngen_blockchain', blockchain);
    },

    getProducts: function() { return this.get('zolngen_prods'); },
    getOrders: function() { return this.get('zolngen_orders'); },
    getAccounts: function() { return this.get('zolngen_accounts'); },
    
    saveProduct: function(p) {
        let prods = this.getProducts();
        const idx = prods.findIndex(x => x.id === p.id);
        if(idx > -1) prods[idx] = p; else prods.push(p);
        this.set('zolngen_prods', prods);
        this.log('PRODUCT_UPDATE', p.name);
    },

    deleteProduct: function(id) {
        let prods = this.getProducts();
        this.set('zolngen_prods', prods.filter(x => x.id !== id));
        this.log('PRODUCT_DELETE', id);
    },

    log: function(action, details) {
        let logs = this.get('zolngen_audit');
        logs.unshift({ action, details, date: new Date().toLocaleString() });
        this.set('zolngen_audit', logs.slice(0, 50));
    },

    getProStats: function() {
        const prods = this.getProducts();
        const orders = this.getOrders();
        return {
            totalSales: orders.reduce((sum, o) => sum + o.total, 0),
            inventoryValue: prods.reduce((sum, p) => sum + (p.price * p.stock), 0),
            activeStaff: this.getAccounts().length,
            systemHealth: 99.8
        };
    }
};

DB.init();
