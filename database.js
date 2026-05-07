/* ZOLNGEN DATABASE ENGINE V100.6 - THE ROBUST CORE */
const DB = {
    get: (key) => JSON.parse(localStorage.getItem(key)) || [],
    set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),

    getProducts: function() { 
        const p = this.get('zolngen_inventory');
        return p.length ? p : this.seed();
    },

    saveProduct: function(prod) {
        let prods = this.getProducts();
        const idx = prods.findIndex(p => p.id === prod.id);
        if (idx > -1) prods[idx] = prod; else { prod.id = 'PRD-' + (prods.length + 101); prods.push(prod); }
        this.set('zolngen_inventory', prods);
    },

    deleteProduct: function(id) {
        let prods = this.getProducts().filter(p => p.id !== id);
        this.set('zolngen_inventory', prods);
    },

    getOrders: function() { return this.get('zolngen_orders'); },
    placeOrder: function(order) {
        let orders = this.getOrders();
        orders.push({
            id: 'ORD-' + (orders.length + 5001),
            date: new Date().toLocaleDateString('ar-EG'),
            ...order,
            status: 'pending'
        });
        this.set('zolngen_orders', orders);
    },

    getTickets: function() { return this.get('zolngen_tickets'); },
    createTicket: function(ticket) {
        let t = this.getTickets();
        t.push({ id: 'TCK-' + (t.length + 800), date: new Date().toLocaleDateString('ar-EG'), status: 'open', ...ticket });
        this.set('zolngen_tickets', t);
    },

    getAccounts: function() { 
        let accs = this.get('zolngen_accounts');
        // AGGRESSIVE SEEDING: Ensure admin always exists
        if (!accs.find(a => a.user === 'admin')) {
            accs.push({user:'admin', pass:'admin123', role:'ADMIN', name:'المدير العام', email:'ceo@zolngen.com'});
            this.set('zolngen_accounts', accs);
        }
        return accs;
    },

    saveAccount: function(acc) {
        let accs = this.getAccounts();
        const idx = accs.findIndex(a => a.user === acc.user);
        if(idx > -1) accs[idx] = { ...accs[idx], ...acc }; else accs.push(acc);
        this.set('zolngen_accounts', accs);
    },

    deleteAccount: function(user) {
        let accs = this.getAccounts().filter(a => a.user !== user);
        this.set('zolngen_accounts', accs);
    },

    getMessages: function(entity) {
        return this.get('zolngen_messages').filter(m => m.entity === entity || m.receiver === entity || m.sender === 'ADMIN');
    },

    sendMessage: function(msg) {
        let msgs = this.get('zolngen_messages');
        msgs.push({ id: Date.now(), date: new Date().toLocaleString('ar-EG'), ...msg });
        this.set('zolngen_messages', msgs);
    },

    getTier: function(user) {
        const total = this.getOrders().filter(o => o.entity === user).reduce((a,b) => a+b.total, 0);
        if (total > 10000) return 'Platinum';
        if (total > 5000) return 'Gold';
        return 'Silver';
    },

    getProStats: function() {
        const prods = this.getProducts();
        const orders = this.getOrders();
        return {
            totalSales: Number(orders.reduce((acc, o) => acc + o.total, 0).toFixed(2)),
            activeOrders: orders.filter(o => ['pending', 'processing'].includes(o.status)).length,
            inventoryValue: Number(prods.reduce((acc, p) => acc + (p.price * p.stock), 0).toFixed(2)),
            openTickets: this.getTickets().filter(t => t.status === 'open').length
        };
    },

    seed: function() {
        const initial = [
            { id: 'PRD-1', name: 'HP EliteBook 840 G9', price: 1250, stock: 45, category: 'أجهزة محمولة', img: 'images/hp.png', specs: 'Intel i7, 16GB RAM, 512GB SSD' },
            { id: 'PRD-2', name: 'Dell Latitude 7430', price: 1180, stock: 5, category: 'أجهزة محمولة', img: 'images/hp.png', specs: 'Intel i5, 16GB RAM, 256GB SSD' },
            { id: 'PRD-3', name: 'MacBook Pro M2', price: 1850, stock: 12, category: 'أجهزة محمولة', img: 'images/mac.png', specs: 'Apple M2, 16GB RAM, 512GB SSD' },
            { id: 'PRD-4', name: 'PowerEdge R750', price: 4500, stock: 3, category: 'خوادم', img: 'images/dell.png', specs: 'Dual Xeon, 128GB RAM, 8TB' },
            { id: 'PRD-5', name: 'ThinkPad X1 Carbon', price: 1700, stock: 15, category: 'أجهزة محمولة', img: 'images/product_thinkpad_x1.png', specs: 'Intel i7, 16GB, 1TB' },
            { id: 'PRD-6', name: 'OptiPlex 7090', price: 850, stock: 10, category: 'مكتبي', img: 'images/product_optiplex_7090.png', specs: 'Intel i7, 8GB, 256GB' }
        ];
        this.set('zolngen_inventory', initial);
        return initial;
    }
};

window.DB = DB;
// Run aggressive check on every load
DB.getAccounts();
if (!localStorage.getItem('zolngen_inventory')) DB.seed();
