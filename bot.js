/* ANTIGRAVITY AI BOT V100.0 */
const Bot = {
    intents: [
        { keywords: ['order', 'طلب', 'شحن'], response: "يمكنني مساعدتك في تتبع طلبك. يرجى إدخال رقم الطلب (مثل ORD-1234)." },
        { keywords: ['stock', 'مخزون', 'متوفر'], response: "لدينا أحدث الأجهزة من HP و Dell و Apple. هل تبحث عن فئة معينة؟" },
        { keywords: ['support', 'صيانة', 'مشكلة'], response: "يمكنك فتح تذكرة صيانة من قسم الدعم الفني، وسيقوم فريقنا بالرد خلال 24 ساعة." },
        { keywords: ['hello', 'مرحبا', 'سلام'], response: "أهلاً بك في ZOLNGEN. أنا مساعدك الذكي Antigravity، كيف يمكنني خدمتك اليوم؟" }
    ],

    process: function(input) {
        input = input.toLowerCase();
        
        // 1. Check for Order Numbers
        const orderMatch = input.match(/ord-\d{4}/i);
        if (orderMatch) {
            const orderId = orderMatch[0].toUpperCase();
            const order = DB.getOrders().find(o => o.id === orderId);
            if (order) return `تفاصيل الطلب ${orderId}: الحالة [${order.status}]، الإجمالي ${order.total} JOD.`;
            return `عذراً، لم أجد طلباً بالرقم ${orderId}.`;
        }

        // 2. Check for Keywords
        for (let intent of this.intents) {
            if (intent.keywords.some(k => input.includes(k))) return intent.response;
        }

        return "أنا أتعلم باستمرار! هل يمكنك صياغة سؤالك بطريقة أخرى أو تجربة كلمات مثل 'مخزون' أو 'صيانة'؟";
    }
};

window.Bot = Bot;
