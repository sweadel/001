/* ANTIGRAVITY AI BOT V100.6 - THE MASTER MIND */
const Bot = {
    process: function(input) {
        input = input.toLowerCase();
        const stats = DB.getProStats();
        const products = DB.getProducts();

        // INTELLIGENT GREETING
        if (input.includes('مرحبا') || input.includes('hello') || input.includes('سلام') || input.includes('zolngen')) {
            return "مرحباً بك في ZOLNGEN V100.6. أنا المساعد الذكي الخاص بك. يمكنني تزويدك بتقارير المبيعات، حالة المخزون، أو تتبع طلبات التوريد الخاصة بمؤسستك.";
        }

        // CATALOG KNOWLEDGE
        if (input.includes('أجهزة') || input.includes('products') || input.includes('كتالوج') || input.includes('بضاعة')) {
            const list = products.slice(0, 4).map(p => p.name).join('، ');
            return `لدينا أحدث الأجهزة المؤسسية، تشمل: ${list} والمزيد. هل ترغب في معرفة سعر أو مواصفات جهاز معين؟`;
        }

        // LIVE STATS
        if (input.includes('حالة') || input.includes('stats') || input.includes('أرقام') || input.includes('إحصائيات')) {
            return `تقرير المنظومة المباشر: المبيعات الإجمالية [${stats.totalSales} JOD]، القيمة التقديرية للمخزون [${stats.inventoryValue} JOD]، والطلبات النشطة [${stats.activeOrders}].`;
        }

        // TECHNICAL SPECS
        if (input.includes('hp') || input.includes('macbook') || input.includes('dell') || input.includes('thinkpad')) {
            const prod = products.find(p => input.includes(p.name.split(' ')[0].toLowerCase()));
            if (prod) return `الجهاز: ${prod.name}. المواصفات: ${prod.specs}. السعر الرسمي: ${prod.price} JOD.`;
        }

        // ORDER TRACKING
        const orderIdMatch = input.match(/ord-\d{4}/i);
        if (orderIdMatch) {
            const orderId = orderIdMatch[0].toUpperCase();
            const order = DB.getOrders().find(o => o.id === orderId);
            if (order) return `تقرير تتبع الطلب ${orderId}: المؤسسة [${order.entity}]، الحالة الحالية [${order.status}]، القيمة الإجمالية [${order.total} JOD].`;
            return `عذراً، لم أجد أي طلب برقم ${orderId} في سجلاتنا المركزية.`;
        }

        // FALLBACK
        return "فهمت طلبك. هل تريد مني استخراج تقرير مالي دقيق، أم ترغب في مقارنة الأجهزة المتوفرة في المخازن حالياً؟";
    }
};

window.Bot = Bot;
