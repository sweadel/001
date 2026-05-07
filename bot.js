/* ANTIGRAVITY AI BOT V100.8 - THE BILINGUAL MASTER MIND */
const Bot = {
    process: function(input) {
        input = input.toLowerCase().trim();
        const stats = DB.getProStats();
        const products = DB.getProducts();

        // INTENT: GREETING
        const greetingWords = ['مرحبا', 'hello', 'hi', 'سلام', 'hey', 'zolngen', 'مرحباً'];
        if (greetingWords.some(w => input.includes(w))) {
            return "مرحباً بك في ZOLNGEN V100.8. كيف يمكنني مساعدتك اليوم؟ (تقرير مالي، قائمة المنتجات، تتبع طلب)";
        }

        // INTENT: STATS / SYSTEM HEALTH
        const statsWords = ['stats', 'status', 'حالة', 'إحصائيات', 'أرقام', 'health', 'financials'];
        if (statsWords.some(w => input.includes(w))) {
            return `ZOLNGEN LIVE REPORT: Total Sales: ${stats.totalSales} JOD | Active Orders: ${stats.activeOrders} | Inventory Value: ${stats.inventoryValue} JOD. System is 100% Operational.`;
        }

        // INTENT: CATALOG / PRODUCTS
        const catalogWords = ['products', 'منتجات', 'أجهزة', 'items', 'list', 'بضاعة', 'show me'];
        if (catalogWords.some(w => input.includes(w))) {
            const list = products.slice(0, 4).map(p => p.name).join('، ');
            return `Our current institutional catalog includes: ${list} and more. Would you like to see specific technical specs for any model?`;
        }

        // INTENT: TECHNICAL SPECS (Dynamic Detection)
        const brandWords = ['hp', 'macbook', 'dell', 'thinkpad', 'laptop', 'server', 'pc'];
        const detectedBrand = brandWords.find(b => input.includes(b));
        if (detectedBrand) {
            const prod = products.find(p => p.name.toLowerCase().includes(detectedBrand));
            if (prod) return `TECHNICAL DATA [${prod.name}]: ${prod.specs}. MSRP: ${prod.price} JOD. Available Units: ${prod.stock}.`;
        }

        // INTENT: ORDER TRACKING
        const orderIdMatch = input.match(/ord-\d{4}/i);
        if (orderIdMatch) {
            const orderId = orderIdMatch[0].toUpperCase();
            const order = DB.getOrders().find(o => o.id === orderId);
            if (order) return `TRACKING REPORT [${orderId}]: Entity: ${order.entity} | Status: ${order.status} | Value: ${order.total} JOD. Expected delivery is within institutional SLA.`;
            return `I could not locate an institutional order with ID ${orderId}. Please verify the serial number.`;
        }

        // FALLBACK
        return "I understand your query. Would you like me to generate a real-time financial projection, or should I list the available enterprise hardware inventory?";
    }
};

window.Bot = Bot;
