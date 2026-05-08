/* ui.js - ZOLNGEN SOVEREIGN CLUSTER V133.0 (DYNAMIC UX) */
const ZolngenUI = {
    chart: null,

    init() {
        this.createStatusContainer();
        this.createToastContainer();
        this.setupCursorInteraction();
        this.bindEvents();
        this.renderAll();
        this.registerPWA();
    },

    registerPWA() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then(() => {
                console.log("[PWA] Sovereign Service Worker Active.");
            });
        }
    },

    createStatusContainer() {
        if (!document.getElementById('server-status')) {
            const status = document.createElement('div');
            status.id = 'server-status';
            status.className = "fixed top-5 right-5 text-[10px] font-bold z-[2000] uppercase tracking-widest";
            status.innerHTML = '<i class="fas fa-circle-notch animate-spin"></i> Syncing Pulse...';
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

    // CURSOR INTERACTION (POINT 125)
    setupCursorInteraction() {
        const cursor = document.getElementById('cursor');
        document.querySelectorAll('.btn-gold, .glass-card, button, a').forEach(el => {
            el.addEventListener('mouseenter', () => {
                gsap.to(cursor, { scale: 3, backgroundColor: '#D4AF37', mixBlendMode: 'difference', duration: 0.3 });
            });
            el.addEventListener('mouseleave', () => {
                gsap.to(cursor, { scale: 1, backgroundColor: 'transparent', mixBlendMode: 'normal', duration: 0.3 });
            });
        });
    },

    bindEvents() {
        window.addEventListener('zolngen_sql_update', () => {
            this.renderAll();
            this.showToast("Cluster Registry Synchronized.", "success");
        });
    },

    renderAll() {
        this.renderProducts();
        this.renderStats();
        this.updateCharts();
    },

    // DYNAMIC RENDERING (forEach)
    renderProducts() {
        const productList = document.getElementById('product-list');
        if (!productList) return;

        const products = ZolngenDB.select('products');
        productList.innerHTML = ''; // Clear
        
        products.forEach(p => {
            const card = document.createElement('div');
            card.className = "glass-card transition-slow";
            card.innerHTML = `
                <div class="flex justify-between items-start mb-6">
                    <h3 class="text-2xl font-black text-gold">${p.name}</h3>
                    <button onclick="ZolngenDB.delete('products', ${p.id})" class="text-red-500 opacity-20 hover:opacity-100"><i class="fas fa-trash"></i></button>
                </div>
                <div class="flex justify-between items-end">
                    <span class="text-3xl font-black">$${p.price.toLocaleString()}</span>
                    <span class="px-4 py-2 bg-gold/10 text-gold rounded-full text-sm font-bold">${p.stock} Units</span>
                </div>
            `;
            productList.appendChild(card);
        });
        this.setupCursorInteraction(); // Re-bind for new elements
    },

    renderStats() {
        const salesEl = document.getElementById('stat-sales');
        if (salesEl) {
            const products = ZolngenDB.select('products');
            salesEl.innerText = products.reduce((sum, p) => sum + p.stock, 0).toLocaleString();
        }
    },

    // DYNAMIC CHARTS (POINT 156)
    updateCharts() {
        const ctx = document.getElementById('forecastChart');
        if (!ctx) return;
        const products = ZolngenDB.select('products');
        const labels = products.map(p => p.name);
        const data = products.map(p => p.stock);

        if (this.chart) this.chart.destroy();
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Inventory Pulse',
                    data: data,
                    backgroundColor: 'rgba(212, 175, 55, 0.4)',
                    borderColor: '#D4AF37',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true, ticks: { color: '#D4AF37' } } }
            }
        });
    },

    showToast(msg, type) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerText = msg;
        container.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 500); }, 3000);
    }
};

document.addEventListener('DOMContentLoaded', () => ZolngenUI.init());
