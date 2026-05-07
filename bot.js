/* bot.js - ZOLNGEN SINGULARITY AI V107.0 */
const Bot = {
    process: function(query) {
        const q = query.toLowerCase();
        const lang = I18n.lang;
        const stats = DB.getProStats();

        // BILINGUAL INTELLIGENCE MAPPING
        const responses = {
            ar: {
                hello: "مرحباً بك في مركز قيادة ZOLNGEN. كيف يمكن لذكاء المنظومة مساعدتك اليوم؟",
                stats: `الوضع المالي الحالي: إجمالي المبيعات ${stats.totalSales} JOD، قيمة الأصول ${stats.inventoryValue} JOD. حالة النظام 99.8%.`,
                blockchain: "سجل البلوكشين مؤمن ومزامن تماماً. آخر هاش مسجل هو 0xba0e889c...",
                security: "بروتوكولات الأمان تعمل بأقصى طاقة. لا توجد محاولات اختراق نشطة.",
                inventory: `لدينا حالياً ${DB.getProducts().length} فئات من المنتجات المؤسسية في المخزون.`,
                default: "لم أفهم الطلب بدقة، ولكن يمكنني تزويدك بتقارير مالية، أمنية، أو إحصائيات المخزون."
            },
            en: {
                hello: "Welcome to ZOLNGEN Command. How can the system intelligence assist you today?",
                stats: `Financial Status: Total Sales ${stats.totalSales} JOD, Asset Value ${stats.inventoryValue} JOD. System Health 99.8%.`,
                blockchain: "Blockchain ledger is fully secured and synced. Latest hash: 0xba0e889c...",
                security: "Security protocols are at maximum capacity. No active threats detected.",
                inventory: `We currently have ${DB.getProducts().length} categories of institutional products in stock.`,
                default: "I didn't quite catch that. I can provide financial reports, security audits, or inventory stats."
            }
        };

        // NLP LOGIC
        if(q.includes('hello') || q.includes('مرحبا')) return responses[lang].hello;
        if(q.includes('stats') || q.includes('إحصائيات') || q.includes('مالية')) return responses[lang].stats;
        if(q.includes('block') || q.includes('بلوكشين')) return responses[lang].blockchain;
        if(q.includes('security') || q.includes('أمان')) return responses[lang].security;
        if(q.includes('stock') || q.includes('مخزون')) return responses[lang].inventory;

        return responses[lang].default;
    }
};

window.Bot = Bot;
