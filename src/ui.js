/* ui.js - ZOLNGEN FUNCTIONAL UI V131.0 (LIVE BRIDGE) */
const ZolngenUI = {
    init() {
        this.createStatusIndicator();
        this.createToastContainer();
        this.bindEvents();
        this.renderAll();
    },

    createStatusIndicator() {
        if (!document.getElementById('server-status')) {
            const status = document.createElement('div');
            status.id = 'server-status';
            status.style = "position:fixed; top:20px; right:20px; font-size:10px; color:var(--gold); opacity:0.6; z-index:1000;";
            status.innerHTML = '<i class="fas fa-link"></i> Connected to Sovereign Backend';
            document.body.appendChild(status);
        }
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
                    <div class="flex gap-2">
                        <span class="text-[10px] opacity-40 uppercase tracking-widest">SKU: ${p.sku}</span>
                        <button onclick="ZolngenDB.delete('products', ${p.id})" class="text-red-500 hover:text-red-700 opacity-0 hover:opacity-100 transition-opacity"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                <div class="flex justify-between items-end">
                    <div>
                        <p class="text-xs opacity-50 uppercase mb-1">Price</p>
                        <span class="text-3xl font-black">$${p.price.toLocaleString()}</span>
                    </div>
                    <div class="text-left">
                        <p class="text-xs opacity-50 uppercase mb-1">In Stock</p>
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
