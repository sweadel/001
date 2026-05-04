// ZOLNGEN ENTERPRISE CORE v17 - THE ABSOLUTE FINAL STANDARD
const DB = {
    get: (k) => JSON.parse(localStorage.getItem(k)) || [],
    set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),

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
            prods.push(p);
        }
        this.set('zolngen_inventory', prods);
        this.logAction(`Saved/Updated Product: ${p.name}`);
    },
    deleteProduct: function(id) {
        let prods = this.getProducts().filter(x => String(x.id) !== String(id));
        this.set('zolngen_inventory', prods);
        this.logAction(`Deleted Product ID: ${id}`);
    },

    getOrders: function() { return this.get('zolngen_orders'); },
    placeOrder: function(o) {
        let ords = this.getOrders();
        o.id = 'ORD-' + (Math.floor(Math.random() * 9000) + 1000);
        o.date = new Date().toLocaleDateString('ar-EG');
        o.status = o.status || 'pending';
        ords.unshift(o);
        this.set('zolngen_orders', ords);
        this.logAction(`New Institutional Order: ${o.id}`);
        return o;
    },
    updateOrderStatus: function(id, status) {
        let ords = this.getOrders();
        let o = ords.find(x => String(x.id) === String(id));
        if (o) {
            o.status = status;
            this.set('zolngen_orders', ords);
            this.logAction(`Order ${id} status updated to ${status}`);
        }
    },

    getAuditLog: function() { return this.get('zolngen_audit'); },
    logAction: function(a) {
        let logs = this.getAuditLog();
        logs.unshift({ date: new Date().toLocaleString('ar-EG'), user: 'Admin-System', action: a });
        this.set('zolngen_audit', logs.slice(0, 100));
    },

    seed: function() {
        const initial = [
            { id: '1', name: 'HP EliteBook 840 G9', price: 1250, stock: 45, category: 'Laptops', supplier: 'HP Jordan', tag: 'الأكثر طلباً', img: 'category_laptops_luxury.png' },
            { id: '2', name: 'Dell Latitude 7430', price: 1180, stock: 30, category: 'Laptops', supplier: 'Dell Enterprise', tag: 'احترافي', img: 'zolngen_premium_hero_laptop.png' },
            { id: '3', name: 'ThinkPad X1 Carbon', price: 1450, stock: 12, category: 'Laptops', supplier: 'Lenovo Jordan', tag: 'مخزون منخفض', img: 'category_laptops_luxury.png' },
            { id: '4', name: 'LG 27" 4K UHD Monitor', price: 450, stock: 25, category: 'Electronics', supplier: 'LG Jordan', tag: 'جديد', img: 'category_electronics_luxury.png' },
            { id: '5', name: 'HP LaserJet Pro MFP', price: 850, stock: 15, category: 'Electronics', supplier: 'HP Jordan', tag: 'توفير', img: 'category_electronics_luxury.png' },
            { id: '6', name: 'ZOLNGEN Custom Workstation', price: 2100, stock: 5, category: 'Desktops', supplier: 'ZOLNGEN', tag: 'الأعلى أداءً', img: 'category_desktops_luxury.png' }
        ];
        this.set('zolngen_inventory', initial);
        return initial;
    }
};

window.DB = DB;
if (!localStorage.getItem('zolngen_inventory')) DB.seed();
