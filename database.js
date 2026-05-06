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
    getEntitiesList: function() { return this.get('zolngen_entities_list'); },
    saveEntity: function(name) {
        let list = this.getEntitiesList();
        if(!list.includes(name)) {
            list.push(name);
            this.set('zolngen_entities_list', list);
            this.logAction(`تمت إضافة مؤسسة جديدة: ${name}`);
        }
    },
    getEntities: function() {
        const orders = this.getOrders();
        const customEntities = this.getEntitiesList();
        const names = [...new Set([...orders.map(o => o.entity), ...customEntities])];
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

    // 6. Accounts & Users
    getAccounts: function() {
        let accs = this.get('zolngen_accounts');
        if(!accs.length) {
            accs = [{ user: 'admin', pass: 'admin123', role: 'المدير العام' }];
            this.set('zolngen_accounts', accs);
        }
        return accs;
    },
    saveAccount: function(acc) {
        let accs = this.getAccounts();
        accs.push(acc);
        this.set('zolngen_accounts', accs);
        this.logAction(`تمت إضافة حساب موظف: ${acc.user}`);
    },
    deleteAccount: function(user) {
        let accs = this.getAccounts().filter(a => a.user !== user);
        this.set('zolngen_accounts', accs);
    },

    // 7. Chat System
    getChats: function() { return this.get('zolngen_chats'); },
    addChatMessage: function(sender, message, isClient = false) {
        let chats = this.getChats();
        chats.push({ sender, message, date: new Date().toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'}), isClient });
        this.set('zolngen_chats', chats);
    },

    // 8. Client Accounts
    getClientAccounts: function() { return this.get('zolngen_client_accounts'); },
    saveClientAccount: function(acc) {
        let accs = this.getClientAccounts();
        accs.push(acc);
        this.set('zolngen_client_accounts', accs);
        this.logAction(`تم تسجيل حساب موظف مؤسسي جديد: ${acc.name} (${acc.inst})`);
    },

    // 9. System Settings & Customization
    getSettings: function() {
        return this.get('zolngen_settings').length ? this.get('zolngen_settings')[0] : { storeName: 'ZOLNGEN ENTERPRISE', primaryColor: '#d4af37', darkTheme: true };
    },
    saveSettings: function(s) {
        this.set('zolngen_settings', [s]);
        this.logAction(`تم تحديث إعدادات النظام بنجاح`);
    },

    // 10. Wishlist System
    getWishlist: function() { return this.get('zolngen_wishlist'); },
    toggleWishlist: function(prodId) {
        let wl = this.getWishlist();
        if(wl.includes(prodId)) wl = wl.filter(id => id !== prodId);
        else wl.push(prodId);
        this.set('zolngen_wishlist', wl);
        return wl;
    },

    // 11. Advanced Features (Coupons, Notes)
    getCoupons: function() { return [{code:'JU2024', discount:0.15}, {code:'ZOLNGEN10', discount:0.10}]; },
    getInternalNotes: function() { return this.get('zolngen_internal_notes'); },
    saveInternalNote: function(note) {
        let notes = this.getInternalNotes();
        notes.unshift({ text: note, date: new Date().toLocaleString('ar-EG') });
        this.set('zolngen_internal_notes', notes.slice(0, 50));
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
            inventoryValue: prods.reduce((acc, p) => acc + (p.price * p.stock), 0),
            openTickets: this.getTickets().filter(t => t.status === 'open').length
        };
    },

    seed: function() {
        const initial = [
            { id: '1', name: 'HP EliteBook 840 G9', price: 1250, cost: 950, stock: 45, category: 'أجهزة محمولة', supplier: 'HP Jordan', img: 'category_laptops.png', specs: ['Intel Core i7-1260P', '16GB DDR5 RAM', '512GB PCIe NVMe SSD', '14" WUXGA Display'], rating: 4.8 },
            { id: '2', name: 'Dell Latitude 7430', price: 1180, cost: 880, stock: 5, category: 'أجهزة محمولة', supplier: 'Dell Enterprise', img: 'zolngen_hero_laptop.png', specs: ['Intel Core i5-1245U', '16GB LPDDR5', '256GB SSD', 'Carbon Fiber Chassis'], rating: 4.5 },
            { id: '3', name: 'Apple MacBook Pro M2', price: 1850, cost: 1600, stock: 12, category: 'أجهزة محمولة', supplier: 'Apple Authorized', img: 'category_laptops.png', specs: ['Apple M2 Pro Chip', '16GB Unified Memory', '512GB SSD', 'Liquid Retina XDR'], rating: 5.0 },
            { id: '4', name: 'Dell PowerEdge R750', price: 4500, cost: 3800, stock: 3, category: 'خوادم وشبكات', supplier: 'Dell Enterprise', img: 'zolngen_hero_laptop.png', specs: ['Dual Intel Xeon Silver', '128GB RDIMM', '4x 2TB SAS SSD', 'Dual Hot-plug PSU'], rating: 4.9 }
        ];
        this.set('zolngen_inventory', initial);
        return initial;
    }
};

window.DB = DB;
if (!localStorage.getItem('zolngen_inventory')) DB.seed();
