/* ui.js - ZOLNGEN OPERATIONAL UI V128.0 (PERFECTION) */
const ZolngenUI = {
    init() {
        this.createToastContainer();
        this.bindEvents();
        this.renderAll();
    },

    createToastContainer() {
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
    },

    showToast(message, type = "info") {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerText = message;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    },

    bindEvents() {
        window.addEventListener('zolngen_sql_update', () => {
            this.renderAll();
            this.showToast("Registry Updated Successfully", "success");
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
            <div class="glass-card transition-slow">
                <div class="flex justify-between items-start mb-6">
                    <h3 class="text-2xl font-black text-gold">${p.name}</h3>
                    <span class="text-[10px] opacity-40 uppercase tracking-widest">SKU: ${p.sku}</span>
                </div>
                <div class="flex justify-between items-end">
                    <div>
                        <p class="text-xs opacity-50 uppercase mb-1">Institutional Value</p>
                        <span class="text-3xl font-black">$${p.price.toLocaleString()}</span>
                    </div>
                    <div class="text-left">
                        <p class="text-xs opacity-50 uppercase mb-1">Inventory</p>
                        <span class="px-4 py-2 bg-gold/10 text-gold rounded-full text-sm font-bold">${p.stock} Units</span>
                    </div>
                </div>
            </div>
        `).join('');
    },

    renderStats() {
        const salesEl = document.getElementById('stat-sales');
        if (salesEl) {
            const products = ZolngenDB.select('products');
            const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);
            salesEl.innerText = totalUnits.toLocaleString();
        }
    }
};

document.addEventListener('DOMContentLoaded', () => ZolngenUI.init());
window.ZolngenUI = ZolngenUI;
