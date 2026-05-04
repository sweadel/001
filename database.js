// ZOLNGEN ENTERPRISE PRO v20 - ULTIMATE DYNAMIC CORE
const DB = {
    get: (k) => JSON.parse(localStorage.getItem(k)) || [],
    set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),

    // 1. Inventory & Profit Management
    getProducts: function() {
        let p = this.get('zolngen_inventory');
        return p.length ? p : this.seed();
    },
    saveProduct: function(p) {
        let prods = this.getProducts();
        if (p.id) {
            const idx = prods.findIndex(x => String(x.id) === String(p.id));
            if (idx > -1) prods[idx] = { ...prods[idx], ...p };
        } else {
            p.id = 'PRD-' + Date.now();
            p.cost = p.cost || (p.price * 0.7); // Auto-cost estimation if missing
            prods.push(p);
        }
        this.set('zolngen_inventory', prods);
        this.logAction(`Inventory Update: ${p.name}`);
    },
    deleteProduct: function(id) {
        let prods = this.getProducts().filter(x => String(x.id) !== String(id));
        this.set('zolngen_inventory', prods);
        this.logAction(`Product Deleted: ${id}`);
    },

    // 2. Advanced Orders & CRM
    getOrders: function() { return this.get('zolngen_orders'); },
    placeOrder: function(o) {
        let ords = this.getOrders();
        o.id = 'ORD-' + (Math.floor(Math.random() * 9000) + 1000);
        o.date = new Date().toLocaleDateString('ar-EG');
        o.status = 'pending';
        o.profit = o.items.reduce((acc, i) => acc + ((i.price - (i.cost || i.price * 0.7)) * i.qty), 0);
        ords.unshift(o);
        this.set('zolngen_orders', ords);
        this.logAction(`New Enterprise Order: ${o.id}`);
        return o;
    },
    updateOrderStatus: function(id, status) {
        let ords = this.getOrders();
        let o = ords.find(x => String(x.id) === String(id));
        if (o) {
            o.status = status;
            this.set('zolngen_orders', ords);
            this.logAction(`Order ${id} marked as ${status}`);
        }
    },

    // 3. Maintenance Ticketing System
    getTickets: function() { return this.get('zolngen_tickets'); },
    createTicket: function(t) {
        let tickets = this.getTickets();
        t.id = 'TCK-' + Date.now();
        t.status = 'open';
        t.date = new Date().toLocaleString('ar-EG');
        tickets.unshift(t);
        this.set('zolngen_tickets', tickets);
        this.logAction(`Maintenance Ticket Created: ${t.id}`);
        return t;
    },

    // 4. Supplier & Entity Management
    getEntities: function() {
        const orders = this.getOrders();
        const names = [...new Set(orders.map(o => o.entity))];
        return names.map(name => ({
            name,
            totalOrders: orders.filter(o => o.entity === name).length,
            totalValue: orders.filter(o => o.entity === name).reduce((acc, o) => acc + o.total, 0)
        }));
    },

    // 5. Audit & Security
    getAuditLog: function() { return this.get('zolngen_audit'); },
    logAction: function(a) {
        let logs = this.getAuditLog();
        logs.unshift({ date: new Date().toLocaleString('ar-EG'), user: 'Admin-System', action: a });
        this.set('zolngen_audit', logs.slice(0, 200));
    },

    // 6. Stats Engine (Dynamic)
    getProStats: function() {
        const prods = this.getProducts();
        const orders = this.getOrders();
        return {
            totalSales: orders.reduce((acc, o) => acc + o.total, 0),
            totalProfit: orders.reduce((acc, o) => acc + (o.profit || 0), 0),
            activeOrders: orders.filter(o => o.status !== 'delivered').length,
            lowStock: prods.filter(p => p.stock < 10).length,
            inventoryValue: prods.reduce((acc, p) => acc + (p.price * p.stock), 0)
        };
    },

    seed: function() {
        const initial = [
            { id: '1', name: 'HP EliteBook 840 G9', price: 1250, cost: 950, stock: 45, category: 'Laptops', supplier: 'HP Jordan', img: 'category_laptops_luxury.png' },
            { id: '2', name: 'Dell Latitude 7430', price: 1180, cost: 880, stock: 5, category: 'Laptops', supplier: 'Dell Enterprise', img: 'zolngen_premium_hero_laptop.png' },
            { id: '3', name: 'Apple MacBook Pro M2', price: 1850, cost: 1600, stock: 12, category: 'Laptops', supplier: 'Apple Authorized', img: 'category_laptops_luxury.png' }
        ];
        this.set('zolngen_inventory', initial);
        return initial;
    }
};

window.DB = DB;
if (!localStorage.getItem('zolngen_inventory')) DB.seed();
