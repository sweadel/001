/* ANTIGRAVITY AI BOT V100.2 - INTELLIGENCE CORE */
const Bot = {
    process: function(input) {
        input = input.toLowerCase();
        const stats = DB.getProStats();
        const products = DB.getProducts();

        // 1. System Health & Stats
        if (input.includes('status') || input.includes('حالة') || input.includes('نظام')) {
            return `حالة النظام الحالية: المبيعات الإجمالية [${stats.totalSales} JOD]، الطلبات النشطة [${stats.activeOrders}]، التذاكر المفتوحة [${stats.openTickets}]. النظام يعمل بكفاءة 99.9%.`;
        }

        // 2. Inventory Query
        if (input.includes('مخزون') || input.includes('متوفر') || input.includes('stock')) {
            const lowStock = products.filter(p => p.stock < 10);
            if (lowStock.length > 0) return `لدينا عجز في مخزون ${lowStock.map(p => p.name).join(', ')}. يرجى مراجعة الموردين.`;
            return `المخزون مكتمل حالياً. لدينا ${products.length} فئة من أجهزة النخبة المتوفرة.`;
        }

        // 3. Product Comparisons
        if (input.includes('أفضل') || input.includes('best') || input.includes('macbook')) {
            const best = products.sort((a,b) => b.price - a.price)[0];
            return `أقوى جهاز لدينا حالياً هو ${best.name} بسعر ${best.price} JOD. هل تريد رؤية مواصفاته التقنية؟`;
        }

        // 4. Order Tracking
        const orderMatch = input.match(/ord-\d{4}/i);
        if (orderMatch) {
            const orderId = orderMatch[0].toUpperCase();
            const order = DB.getOrders().find(o => o.id === orderId);
            if (order) return `تقرير الطلب ${orderId}: المؤسسة [${order.entity}]، الحالة [${order.status}]، القيمة [${order.total} JOD]. هل يمكنني مساعدتك في شيء آخر؟`;
            return `عذراً، لم يتم العثور على طلب برقم ${orderId} في سجلات ZOLNGEN.`;
        }

        // 5. General Greeting
        if (input.includes('hello') || input.includes('مرحبا') || input.includes('سلام')) {
            return "أهلاً بك في ZOLNGEN PRO V100.2. أنا محرك الذكاء الاصطناعي الخاص بك. يمكنك سؤالي عن المبيعات، المخزون، أو تتبع أي طلب توريد.";
        }

        return "أنا أفهمك جيداً! جرب سؤالي عن 'حالة النظام' أو 'المخزون المتوفر' أو ابحث عن رقم طلب توريد معين.";
    }
};

window.Bot = Bot;
