// ZOLNGEN ENTERPRISE v18 - DYNAMIC CORE (ZERO HARDCODED DATA)
const DB = {
    get: (k) => JSON.parse(localStorage.getItem(k)) || [],
    set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),

    // 1. Inventory Logic
    getProducts: function() {
        let p = this.get('zolngen_inventory');
        return p.length ? p : this.seed();
    },
    saveProduct: function(p) {
        let prods = this.getProducts();
        if (p.id && String(p.id).startsWith('PRD')) {
            const idx = prods.findIndex(x => String(x.id) === String(p.id));
            if (idx > -1) prods[idx] = { ...prods[idx], ...p };
        } else {
            p.id = 'PRD-' + Date.now();
            prods.push(p);
        }
        this.set('zolngen_inventory', prods);
        this.logAction(`حفظ منتج: ${p.name}`);
    },

    // 2. Orders & Tracking
    getOrders: function() { return this.get('zolngen_orders'); },
    placeOrder: function(o) {
        let ords = this.getOrders();
        o.id = 'ORD-' + (Math.floor(Math.random() * 9000) + 1000);
        o.date = new Date().toLocaleDateString('ar-EG');
        o.status = 'pending'; // Initial status
        ords.unshift(o);
        this.set('zolngen_orders', ords);
        this.logAction(`طلب توريد جديد: ${o.id}`);
        return o;
    },
    updateOrderStatus: function(id, status) {
        let ords = this.getOrders();
        let o = ords.find(x => String(x.id) === String(id));
        if (o) {
            o.status = status;
            this.set('zolngen_orders', ords);
            this.logAction(`تحديث حالة الطلب ${id} إلى ${status}`);
        }
    },

    // 3. Maintenance Tickets
    getTickets: function() { return this.get('zolngen_tickets'); },
    saveTicket: function(t) {
        let tickets = this.getTickets();
        t.id = 'TCK-' + Date.now();
        t.date = new Date().toLocaleString('ar-EG');
        tickets.unshift(t);
        this.set('zolngen_tickets', tickets);
        this.logAction(`طلب صيانة جديد: ${t.id}`);
        return t;
    },

    // 4. System Analytics (Dynamic)
    getStats: function() {
        const prods = this.getProducts();
        const orders = this.getOrders();
        const entities = [...new Set(orders.map(o => o.entity))];
        return {
            products: prods.length,
            orders: orders.length,
            entities: entities.length,
            experience: 10 // This remains as business logic
        };
    },

    // 5. Audit Log
    getAuditLog: function() { return this.get('zolngen_audit'); },
    logAction: function(a) {
        let logs = this.getAuditLog();
        logs.unshift({ date: new Date().toLocaleString('ar-EG'), user: 'نظام زولنجن', action: a });
        this.set('zolngen_audit', logs.slice(0, 50));
    },

    // 6. Realistic Seed Data (Matching Image Categories)
    seed: function() {
        const initial = [
            { id: 'PRD-1', name: 'HP EliteBook 840 G9', price: 1250, stock: 45, category: 'Laptops', supplier: 'HP Jordan', tag: 'الأكثر طلباً', img: 'category_laptops_luxury.png' },
            { id: 'PRD-2', name: 'Dell Latitude 7430', price: 1180, stock: 30, category: 'Laptops', supplier: 'Dell Enterprise', tag: 'احترافي', img: 'zolngen_premium_hero_laptop.png' },
            { id: 'PRD-3', name: 'ZOLNGEN Desktop Pro', price: 2100, stock: 5, category: 'Desktops', supplier: 'ZOLNGEN', tag: 'الأعلى أداءً', img: 'category_desktops_luxury.png' },
            { id: 'PRD-4', name: 'LG 27" 4K UHD Monitor', price: 450, stock: 25, category: 'Electronics', supplier: 'LG Jordan', tag: 'جديد', img: 'category_electronics_luxury.png' },
            { id: 'PRD-5', name: 'ZOLNGEN Smart Washer', price: 650, stock: 15, category: 'Electronics', supplier: 'ZOLNGEN', tag: 'عروض', img: 'category_electronics_luxury.png' }
        ];
        this.set('zolngen_inventory', initial);
        return initial;
    }
};

window.DB = DB;
if (!localStorage.getItem('zolngen_inventory')) DB.seed();
console.log("ZOLNGEN Dynamic Engine v18 Ready");
