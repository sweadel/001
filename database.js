// ZOLNGEN Central Database System v6
const DB = {
    seed: () => {
        if (!localStorage.getItem('zolngen_products')) {
            const initialProducts = [
                { id: 1, name: 'HP EliteBook 840 G9', category: 'laptop', price: 499, tag: 'أعمال', img: 'category_laptops.png', stock: 15, supplier: 'HP Jordan' },
                { id: 2, name: 'Dell Latitude 5530', category: 'laptop', price: 549, tag: 'أعمال', img: 'category_laptops.png', stock: 10, supplier: 'Dell Jordan' },
                { id: 3, name: 'Lenovo ThinkPad X1 Carbon', category: 'laptop', price: 699, tag: 'بريميوم', img: 'product_thinkpad_x1.png', stock: 5, supplier: 'Lenovo Jordan' },
                { id: 4, name: 'Dell OptiPlex 7090 SFF', category: 'desktop', price: 379, tag: 'مكتبي', img: 'product_optiplex_7090.png', stock: 20, supplier: 'Dell Jordan' },
                { id: 5, name: 'HP ProDesk 600 G6', category: 'desktop', price: 349, tag: 'مكتبي', img: 'category_desktops.png', stock: 12, supplier: 'HP Jordan' },
                { id: 6, name: 'LG 27" 4K UHD Monitor', category: 'electronics', price: 199, tag: 'شاشات', img: 'category_electronics.png', stock: 8, supplier: 'LG Global' },
                { id: 7, name: 'HP LaserJet Pro MFP 4103fdw', category: 'electronics', price: 299, tag: 'طابعات', img: 'category_electronics.png', stock: 6, supplier: 'HP Jordan' },
                { id: 8, name: 'Sony WH-1000XM5', category: 'accessories', price: 149, tag: 'صوتيات', img: 'product_sony_xm5.png', stock: 25, supplier: 'Sony Jordan' },
                { id: 9, name: 'Mechanical Gaming Keyboard', category: 'accessories', price: 89, tag: 'إكسسوارات', img: 'category_accessories.png', stock: 30, supplier: 'Generic Tech' },
                { id: 10, name: 'USB-C Multi-Hub 7-in-1', category: 'accessories', price: 49, tag: 'إكسسوارات', img: 'category_accessories.png', stock: 50, supplier: 'Generic Tech' }
            ];
            localStorage.setItem('zolngen_products', JSON.stringify(initialProducts));
        }
        if (!localStorage.getItem('zolngen_orders')) localStorage.setItem('zolngen_orders', JSON.stringify([]));
        if (!localStorage.getItem('zolngen_tickets')) localStorage.setItem('zolngen_tickets', JSON.stringify([]));
        if (!localStorage.getItem('zolngen_audit_log')) localStorage.setItem('zolngen_audit_log', JSON.stringify([{ date: new Date().toLocaleString(), action: 'System Initialized', user: 'System' }]));
    },

    getProducts: () => JSON.parse(localStorage.getItem('zolngen_products')),
    getOrders: () => JSON.parse(localStorage.getItem('zolngen_orders')),
    getTickets: () => JSON.parse(localStorage.getItem('zolngen_tickets')),
    getAuditLog: () => JSON.parse(localStorage.getItem('zolngen_audit_log')),

    logAction: (action, user = 'admin') => {
        const logs = DB.getAuditLog();
        logs.unshift({ date: new Date().toLocaleString('ar-JO'), action, user });
        localStorage.setItem('zolngen_audit_log', JSON.stringify(logs.slice(0, 100))); // Keep last 100
    },

    saveProduct: (product) => {
        const products = DB.getProducts();
        if (product.id) {
            const index = products.findIndex(p => p.id == product.id);
            products[index] = product;
            DB.logAction(`Updated product: ${product.name}`);
        } else {
            product.id = Date.now();
            products.push(product);
            DB.logAction(`Added new product: ${product.name}`);
        }
        localStorage.setItem('zolngen_products', JSON.stringify(products));
        return product;
    },

    deleteProduct: (id) => {
        const products = DB.getProducts();
        const p = products.find(prod => prod.id == id);
        const filtered = products.filter(prod => prod.id != id);
        localStorage.setItem('zolngen_products', JSON.stringify(filtered));
        DB.logAction(`Deleted product: ${p.name}`);
    },

    placeOrder: (orderData) => {
        const orders = DB.getOrders();
        const newOrder = { id: 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase(), date: new Date().toLocaleString('ar-JO'), ...orderData };
        orders.unshift(newOrder);
        localStorage.setItem('zolngen_orders', JSON.stringify(orders));
        DB.logAction(`New order received: ${newOrder.id} from ${orderData.entity}`);
        return newOrder;
    },

    createTicket: (ticketData) => {
        const tickets = DB.getTickets();
        const newTicket = { id: 'TCK-' + Date.now().toString().substr(-5), status: 'Open', date: new Date().toLocaleString('ar-JO'), ...ticketData };
        tickets.unshift(newTicket);
        localStorage.setItem('zolngen_tickets', JSON.stringify(tickets));
        DB.logAction(`Maintenance ticket created: ${newTicket.id}`);
    }
};

DB.seed();
