/* i18n.js - ZOLNGEN GLOBAL TRANSLATION ENGINE V123.0 (MASTER CORRECTION) */
const translations = {
    ar: {
        title: "ZOLNGEN Enterprise Pro",
        subtitle: "المعيار المؤسسي العالمي",
        home: "الرئيسية",
        products: "المنتجات",
        maintenance: "الصيانة",
        admin: "الإدارة",
        login: "دخول",
        logout: "خروج",
        hero_title: "إعادة تعريف القوة المؤسسية",
        hero_desc: "المنظومة الأكثر تقدماً في توريد وإدارة التكنولوجيا للشركات الكبرى.",
        explore: "استكشف الحلول",
        contact: "تواصل معنا",
        admin_gate: "بوابة القيادة",
        secure_access: "دخول آمن",
        username: "اسم المستخدم",
        password: "كلمة المرور",
        stats_revenue: "إجمالي الإيرادات",
        stats_profit: "صافي الأرباح",
        stats_inventory: "قيمة الأصول",
        stats_health: "حالة النظام",
        orders: "العمليات",
        inventory: "المخزون",
        hr: "الكادر البشري",
        crm: "المؤسسات",
        security: "الأمن",
        settings: "الإعدادات",
        bot_welcome: "مرحباً بك في ZOLNGEN. كيف يمكنني مساعدتك؟",
        add_product: "إضافة منتج",
        stock: "المخزون",
        price: "السعر",
        category: "الفئة",
        actions: "إجراءات",
        save: "حفظ",
        cancel: "إلغاء",
        order_id: "رقم الطلب",
        status: "الحالة",
        entity: "المؤسسة"
    },
    en: {
        title: "ZOLNGEN Enterprise Pro",
        subtitle: "The Global Institutional Standard",
        home: "Home",
        products: "Products",
        maintenance: "Maintenance",
        admin: "Admin",
        login: "Login",
        logout: "Logout",
        hero_title: "Redefining Institutional Power",
        hero_desc: "The most advanced ecosystem for technology procurement and management.",
        explore: "Explore Solutions",
        contact: "Contact Us",
        admin_gate: "Command Gateway",
        secure_access: "Secure Access",
        username: "Username",
        password: "Password",
        stats_revenue: "Gross Revenue",
        stats_profit: "Net Profit",
        stats_inventory: "Asset Value",
        stats_health: "System Health",
        orders: "Operations",
        inventory: "Supply Chain",
        hr: "Human Capital",
        crm: "Enterprise CRM",
        security: "Security",
        settings: "Settings",
        bot_welcome: "Welcome to ZOLNGEN. How can I assist you?",
        add_product: "Add Product",
        stock: "Stock",
        price: "Price",
        category: "Category",
        actions: "Actions",
        save: "Save",
        cancel: "Cancel",
        order_id: "Order ID",
        status: "Status",
        entity: "Entity"
    }
};

const I18n = {
    lang: localStorage.getItem('zolngen_lang') || 'ar',
    
    init: function() {
        this.apply();
        this.listen();
    },
    
    setLang: function(l) {
        this.lang = l;
        localStorage.setItem('zolngen_lang', l);
        this.apply();
        // location.reload(); // Removed to avoid refresh, using live apply instead
    },
    
    t: function(key) {
        return translations[this.lang][key] || key;
    },
    
    apply: function() {
        document.documentElement.lang = this.lang;
        document.documentElement.dir = this.lang === 'ar' ? 'rtl' : 'ltr';
        
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if(el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = this.t(key);
            } else {
                el.innerText = this.t(key);
            }
        });
    },

    listen: function() {
        // CROSS-TAB SYNC
        window.addEventListener('storage', (e) => {
            if (e.key === 'zolngen_lang') {
                this.lang = e.newValue;
                this.apply();
            }
            if (e.key === 'zolngen_theme') {
                document.documentElement.setAttribute('data-theme', e.newValue);
            }
        });
    }
};

window.I18n = I18n;
document.addEventListener('DOMContentLoaded', () => I18n.init());
