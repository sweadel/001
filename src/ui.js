/* ui.js - ZOLNGEN SOVEREIGN CLOSING V132.0 (FINAL REFINEMENTS) */
const ZolngenUI = {
    chart: null,

    init() {
        this.createStatusIndicator();
        this.createToastContainer();
        this.bindEvents();
        this.setupCursorFeedback();
        this.renderAll();
    },

    bindEvents() {
        window.addEventListener('zolngen_sql_update', () => {
            this.renderAll();
            this.showToast("Registry Synchronized.", "success");
        });
    },

    // SOVEREIGN CURSOR FEEDBACK
    setupCursorFeedback() {
        const cursor = document.getElementById('cursor');
        document.querySelectorAll('button, .glass-card, a').forEach(el => {
            el.addEventListener('mouseenter', () => {
                gsap.to(cursor, { scale: 2.5, backgroundColor: '#D4AF37', filter: 'blur(15px)', duration: 0.3 });
            });
            el.addEventListener('mouseleave', () => {
                gsap.to(cursor, { scale: 1, backgroundColor: '#D4AF37', filter: 'blur(10px)', duration: 0.3 });
            });
        });
    },

    renderAll() {
        this.renderProducts();
        this.renderStats();
        this.updateCharts();
    },

    // LIVE PULSE: CHART BINDING
    updateCharts() {
        const ctx = document.getElementById('forecastChart');
        if (!ctx) return;

        const products = ZolngenDB.select('products');
        const labels = products.map(p => p.name);
        const stockData = products.map(p => p.stock);

        if (this.chart) this.chart.destroy();

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Institutional Asset Levels',
                    data: stockData,
                    borderColor: '#D4AF37',
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { display: false }, x: { ticks: { color: 'rgba(212, 175, 55, 0.5)' } } }
            }
        });
    },

    // GUARDIAN ACTIVATION
    async activateGuardian() {
        this.showToast("Initializing Sovereign Guardian...", "info");
        try {
            const response = await fetch('/api/guardian', { method: 'POST' });
            if (response.ok) {
                this.showToast("Sovereign Protection Active. Vault Secured.", "success");
            }
        } catch (e) {
            this.showToast("Guardian Connection Failed.", "error");
        }
    },

    renderProducts() {
        const productList = document.getElementById('product-list');
        if (!productList) return;
        const products = ZolngenDB.select('products');
        productList.innerHTML = products.map(p => `
            <div class="glass-card transition-slow">
                <div class="flex justify-between items-start mb-6">
                    <h3 class="text-2xl font-black text-gold">${p.name}</h3>
                    <button onclick="ZolngenDB.delete('products', ${p.id})" class="text-red-500 opacity-20 hover:opacity-100"><i class="fas fa-trash"></i></button>
                </div>
                <div class="flex justify-between items-end">
                    <span class="text-3xl font-black">$${p.price.toLocaleString()}</span>
                    <span class="px-4 py-2 bg-gold/10 text-gold rounded-full text-sm font-bold">${p.stock} Units</span>
                </div>
            </div>
        `).join('');
    },

    renderStats() {
        const salesEl = document.getElementById('stat-sales');
        if (salesEl) {
            const products = ZolngenDB.select('products');
            salesEl.innerText = products.reduce((sum, p) => sum + p.stock, 0).toLocaleString();
        }
    },

    showToast(msg, type) { /* ... already implemented ... */ },
    createStatusIndicator() { /* ... already implemented ... */ },
    createToastContainer() { /* ... already implemented ... */ }
};

document.addEventListener('DOMContentLoaded', () => ZolngenUI.init());
