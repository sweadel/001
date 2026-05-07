// ZOLNGEN ENTERPRISE PRO v99.0 - THE SINGULARITY CORE (ULTIMATE EDITION)
const DB = {
    get: (k) => JSON.parse(localStorage.getItem(k)) || [],
    set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),

    // V99 TIER LOGIC
    getTier: function(entity) {
        const total = this.getOrders().filter(o => o.entity === entity).reduce((a,b) => a + b.total, 0);
        if (total > 100000) return 'Platinum';
        if (total > 50000) return 'Gold';
        return 'Silver';
    },
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
    createTicket: function(data) {
        let tickets = this.getTickets();
        const newTicket = {
            id: 'TCK-' + Date.now(),
            entity: data.entity,
            type: data.type,
            issue: data.issue,
            urgency: data.urgency || 'Low',
            status: 'open',
            date: new Date().toLocaleString('ar-EG')
        };
        tickets.unshift(newTicket);
        this.set('zolngen_tickets', tickets);
        this.logAction(`Maintenance Ticket Created: ${newTicket.id}`);
        return newTicket;
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

    // V100.4 - SOPHISTICATED ACCOUNTS
    getAccounts: function() { 
        let accs = this.get('zolngen_accounts');
        if(!accs.length) {
            accs = [
                {user:'admin', pass:'admin123', role:'ADMIN', name:'المدير العام', email:'ceo@zolngen.com'},
                {user:'staff1', pass:'staff123', role:'STAFF', name:'أحمد خالد (مبيعات)', email:'ahmad@zolngen.com'}
            ];
            this.set('zolngen_accounts', accs);
        }
        return accs;
    },
    saveAccount: function(acc) {
        let accs = this.getAccounts();
        const idx = accs.findIndex(a => a.user === acc.user);
        if(idx > -1) accs[idx] = { ...accs[idx], ...acc }; else accs.push(acc);
        this.set('zolngen_accounts', accs);
        this.logAction(`Account Optimized: ${acc.user}`);
    },

    // V100.4 - UNIFIED MESSAGING CORE
    getMessages: function(entity) {
        return this.get('zolngen_messages').filter(m => m.entity === entity || m.receiver === entity || m.sender === 'ADMIN');
    },

    // V100.4 - STATS ACCURACY (Float Precision)
    getProStats: function() {
        const prods = this.getProducts();
        const orders = this.getOrders();
        const tickets = this.getTickets();
        return {
            totalSales: Number(orders.reduce((acc, o) => acc + o.total, 0).toFixed(2)),
            totalProfit: Number(orders.reduce((acc, o) => acc + (o.profit || 0), 0).toFixed(2)),
            activeOrders: orders.filter(o => ['pending', 'processing'].includes(o.status)).length,
            lowStock: prods.filter(p => p.stock < 10).length,
            inventoryValue: Number(prods.reduce((acc, p) => acc + (p.price * p.stock), 0).toFixed(2)),
            openTickets: tickets.filter(t => t.status === 'open').length
        };
    },

    seed: function() {
        const initial = [
            { id: 'PRD-1', name: 'HP EliteBook 840 G9', price: 1250, cost: 950, stock: 45, category: 'أجهزة محمولة', img: 'hp.png' },
            { id: 'PRD-2', name: 'Dell Latitude 7430', price: 1180, cost: 880, stock: 5, category: 'أجهزة محمولة', img: 'hp.png' },
            { id: 'PRD-3', name: 'MacBook Pro M2', price: 1850, cost: 1600, stock: 12, category: 'أجهزة محمولة', img: 'mac.png' },
            { id: 'PRD-4', name: 'PowerEdge R750', price: 4500, cost: 3800, stock: 3, category: 'خوادم', img: 'dell.png' },
            { id: 'PRD-5', name: 'ThinkPad X1 Carbon', price: 1650, cost: 1300, stock: 20, category: 'أجهزة محمولة', img: 'hp.png' }
        ];
        this.set('zolngen_inventory', initial);
        this.set('zolngen_accounts', [
            {user:'admin', pass:'admin123', role:'ADMIN', name:'المدير العام', email:'ceo@zolngen.com'},
            {user:'staff1', pass:'staff123', role:'STAFF', name:'أحمد خالد', email:'ahmad@zolngen.com'}
        ]);
        return initial;
    }
};

window.DB = DB;
if (!localStorage.getItem('zolngen_inventory')) DB.seed();
