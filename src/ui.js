/* ui.js - ZOLNGEN PRECISE UI V134.0 */
const ZolngenUI = {
    chart: null,

    init() {
        this.createStatusBadgeContainer();
        this.createToastContainer();
        this.setupCursorInteraction();
        this.bindEvents();
        this.renderAll();
    },

    createStatusBadgeContainer() {
        if (!document.getElementById('sovereign-status-badge')) {
            const badge = document.createElement('div');
            badge.id = 'sovereign-status-badge';
            badge.className = "fixed bottom-10 left-10 z-[3000]";
            document.body.appendChild(badge);
        }
    },

    createToastContainer() {
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
    },

    // POINT (125) - REACTIVE GOLDEN HALO
    setupCursorInteraction() {
        const cursor = document.getElementById('cursor');
        document.querySelectorAll('.btn-gold, button, .glass-card, a').forEach(el => {
            el.addEventListener('mouseenter', () => {
                gsap.to(cursor, { 
                    scale: 4, 
                    backgroundColor: 'rgba(212, 175, 55, 0.4)', 
                    boxShadow: '0 0 40px rgba(212, 175, 55, 0.8)',
                    duration: 0.4 
                });
            });
            el.addEventListener('mouseleave', () => {
                gsap.to(cursor, { 
                    scale: 1, 
                    backgroundColor: 'rgba(212, 175, 55, 0.1)', 
                    boxShadow: '0 0 10px rgba(212, 175, 55, 0.5)',
                    duration: 0.4 
                });
            });
        });
    },

    bindEvents() {
        window.addEventListener('zolngen_sql_update', () => {
            this.renderAll(); // POINT (137) - IMMEDIATE RE-RENDER
        });
    },

    renderAll() {
        this.renderProducts();
        this.renderStats();
        this.updateCharts();
        this.setupCursorInteraction(); // Re-apply for new items
    },

    renderProducts() {
        const list = document.getElementById('product-list');
        if (!list) return;
        const products = ZolngenDB.select('products');
        list.innerHTML = products.map(p => `
            <div class="glass-card">
                <div class="flex justify-between items-start">
                    <h3 class="text-2xl font-black text-gold">${p.name}</h3>
                    <button onclick="ZolngenDB.delete('products', ${p.id})" class="text-red-500 opacity-20 hover:opacity-100"><i class="fas fa-trash"></i></button>
                </div>
                <div class="mt-6 flex justify-between items-end">
                    <span class="text-3xl font-black">$${p.price.toLocaleString()}</span>
                    <span class="text-xs opacity-50 uppercase">${p.stock} Units</span>
                </div>
            </div>
        `).join('');
    },

    renderStats() {
        const stat = document.getElementById('stat-sales');
        if (stat) {
            const products = ZolngenDB.select('products');
            stat.innerText = products.length; // Dynamic Count
        }
    },

    updateCharts() {
        const ctx = document.getElementById('forecastChart');
        if (!ctx) return;
        const products = ZolngenDB.select('products');
        
        if (this.chart) this.chart.destroy();
        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Active Assets', 'Available Capacity'],
                datasets: [{
                    data: [products.length, 100 - products.length],
                    backgroundColor: ['#D4AF37', 'rgba(212, 175, 55, 0.1)'],
                    borderWidth: 0
                }]
            },
            options: { cutout: '80%', plugins: { legend: { display: false } } }
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
window.ZolngenUI = ZolngenUI;
