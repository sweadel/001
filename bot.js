/* ANTIGRAVITY AI BOT V100.5 - MASTER KNOWLEDGE */
const Bot = {
    process: function(input) {
        input = input.toLowerCase();
        const stats = DB.getProStats();
        const products = DB.getProducts();

        // 1. Intelligence Greeting
        if (input.includes('مرحبا') || input.includes('hello') || input.includes('zolngen')) {
            return "مرحباً بك في ZOLNGEN V100.5. أنا المساعد الذكي الخاص بك. يمكنني تزويدك بتقارير المبيعات، حالة المخزون، أو تتبع طلبات التوريد الخاصة بمؤسستك.";
        }

        // 2. Hardware Catalog Knowledge
        if (input.includes('أجهزة') || input.includes('products') || input.includes('كتالوج')) {
            const list = products.slice(0, 4).map(p => p.name).join('، ');
            return `لدينا تشكيلة واسعة من النخبة، تشمل: ${list} والمزيد. هل تريد مواصفات جهاز معين؟`;
        }

        // 3. System Stats
        if (input.includes('حالة') || input.includes('stats') || input.includes('أرقام')) {
            return `حالة المنظومة: مبيعات إجمالية [${stats.totalSales} JOD]، قيمة المخزون [${stats.inventoryValue} JOD]، والطلبات النشطة [${stats.activeOrders}].`;
        }

        // 4. Specific Product Specs
        if (input.includes('hp') || input.includes('macbook') || input.includes('dell')) {
            const prod = products.find(p => input.includes(p.name.split(' ')[0].toLowerCase()));
            if (prod) return `الجهاز: ${prod.name}. المواصفات الفنية: ${prod.specs}. السعر: ${prod.price} JOD.`;
        }

        // 5. Order Tracking Logic
        const orderId = input.match(/ord-\d{4}/i);
        if (orderId) {
            const order = DB.getOrders().find(o => o.id === orderId[0].toUpperCase());
            if (order) return `تقرير الطلب ${orderId[0].toUpperCase()}: المؤسسة [${order.entity}]، الحالة [${order.status}]، القيمة [${order.total} JOD].`;
            return `عذراً، لم يتم العثور على الطلب رقم ${orderId[0].toUpperCase()}.`;
        }

        return "فهمت طلبك. هل تريد مني استخراج تقرير مالي، أم ترغب في مقارنة مواصفات أجهزة السيرفر والمحطات المحمولة؟";
    }
};

window.Bot = Bot;
