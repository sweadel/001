// ZOLNGEN Central Intelligence & Data Engine v15
const DB = {
    // 1. Storage Helpers
    get: (key) => JSON.parse(localStorage.getItem(key)) || [],
    set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),

    // 2. Products Management
    getProducts: function() {
        let prods = this.get('zolngen_inventory');
        if (prods.length === 0) return this.seed();
        return prods;
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
        this.logAction(`Saved Product: ${p.name}`);
    },

    // 3. Orders Management
    getOrders: function() { return this.get('zolngen_orders'); },
    placeOrder: function(order) {
        let orders = this.getOrders();
        order.id = 'ORD-' + (Math.floor(Math.random() * 9000) + 1000);
        order.date = new Date().toLocaleDateString('ar-EG');
        orders.push(order);
        this.set('zolngen_orders', orders);
        this.logAction(`New Procurement Order: ${order.id} from ${order.entity}`);
        return order;
    },

    // 4. Audit & Security
    getAuditLog: function() { return this.get('zolngen_audit'); },
    logAction: function(action) {
        let logs = this.getAuditLog();
        logs.unshift({ date: new Date().toLocaleString('ar-EG'), user: 'Admin-Secure', action });
        this.set('zolngen_audit', logs.slice(0, 50));
    },

    // 5. Initial Seed (Luxury Institutional Selection)
    seed: function() {
        const initial = [
            { id: '1', name: 'HP EliteBook 840 G9', price: 1250, stock: 45, category: 'Laptops', supplier: 'HP Jordan', tag: 'الأكثر طلباً', img: 'product_thinkpad_x1.png' },
            { id: '2', name: 'Dell Latitude 7430', price: 1180, stock: 30, category: 'Laptops', supplier: 'Dell Enterprise', tag: 'احترافي', img: 'zolngen_hero_laptop.png' },
            { id: '3', name: 'Apple MacBook Pro M2', price: 1850, stock: 12, category: 'Laptops', supplier: 'Apple Authorized', tag: 'فائق الأداء', img: 'product_thinkpad_x1.png' },
            { id: '4', name: 'ThinkPad X1 Carbon Gen 10', price: 1450, stock: 8, category: 'Laptops', supplier: 'Lenovo Jordan', tag: 'مخزون منخفض', img: 'product_thinkpad_x1.png' },
            { id: '5', name: 'HP LaserJet Managed E60165', price: 950, stock: 20, category: 'Printers', supplier: 'HP Jordan', tag: 'عروض', img: 'category_electronics.png' },
            { id: '6', name: 'Dell UltraSharp 27" 4K', price: 550, stock: 50, category: 'Monitors', supplier: 'Dell Jordan', tag: 'جديد', img: 'category_electronics.png' }
        ];
        this.set('zolngen_inventory', initial);
        return initial;
    }
};

if (!localStorage.getItem('zolngen_inventory')) DB.seed();
window.DB = DB;
