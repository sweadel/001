/* ui.js - ZOLNGEN OPERATIONAL UI V126.0 (DATA BINDING) */
const ZolngenUI = {
    init() {
        this.bindEvents();
        this.renderAll();
    },

    bindEvents() {
        window.addEventListener('zolngen_sql_update', () => {
            this.renderAll();
        });
    },

    renderAll() {
        this.renderProducts();
        this.renderStats();
    },

    renderProducts() {
        const productList = document.getElementById('product-list');
        if (!productList) return;

        const products = ZolngenDB.select('products');
        productList.innerHTML = products.map(p => `
            <div class="glass p-6 rounded-3xl border border-gold/10 hover:border-gold/40 transition-all">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-xl font-bold text-gold">${p.name}</h3>
                    <span class="text-xs opacity-50">SKU: ${p.sku}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-2xl font-black">$${p.price.toLocaleString()}</span>
                    <span class="px-3 py-1 bg-gold/10 text-gold rounded-lg text-xs">Stock: ${p.stock}</span>
                </div>
            </div>
        `).join('');
    },

    renderStats() {
        const salesEl = document.getElementById('stat-sales');
        if (salesEl) {
            const products = ZolngenDB.select('products');
            const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
            salesEl.innerText = totalStock.toLocaleString();
        }
    }
};

document.addEventListener('DOMContentLoaded', () => ZolngenUI.init());
window.ZolngenUI = ZolngenUI;
