/* ui.js - ZOLNGEN SOVEREIGN INTERACTION V135.0 */
const ZolngenUI = {
    chart: null,

    init() {
        this.createStatusBadgeContainer();
        this.createToastContainer();
        this.setupCursorInteraction(); // POINT (125)
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
            container.className = "fixed bottom-10 right-10 flex flex-col gap-3 z-[4000]";
            document.body.appendChild(container);
        }
    },

    // POINT (167) - GSAP GOLDEN TOASTS
    showToast(message, type = "info") {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `glass p-5 rounded-2xl border border-gold/30 text-gold font-bold shadow-2xl flex items-center gap-4`;
        toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'} text-gold"></i> ${message}`;
        
        container.appendChild(toast);
        
        // GSAP Entrance
        gsap.from(toast, { x: 100, opacity: 0, duration: 0.5, ease: "back.out" });

        setTimeout(() => {
            gsap.to(toast, { 
                opacity: 0, 
                y: -20, 
                duration: 0.5, 
                onComplete: () => toast.remove() 
            });
        }, 3500);
    },

    // POINT (125) - REACTIVE GOLDEN HALO (SCALE)
    setupCursorInteraction() {
        const cursor = document.getElementById('cursor');
        if (!cursor) return;
        
        document.querySelectorAll('.btn-gold, button, .glass-card, a').forEach(el => {
            el.addEventListener('mouseenter', () => {
                gsap.to(cursor, { 
                    scale: 3.5, 
                    backgroundColor: 'rgba(212, 175, 55, 0.4)', 
                    boxShadow: '0 0 50px rgba(212, 175, 55, 0.9)',
                    duration: 0.4,
                    ease: "power2.out"
                });
            });
            el.addEventListener('mouseleave', () => {
                gsap.to(cursor, { 
                    scale: 1, 
                    backgroundColor: 'rgba(212, 175, 55, 0.15)', 
                    boxShadow: '0 0 15px rgba(212, 175, 55, 0.5)',
                    duration: 0.4,
                    ease: "power2.inOut"
                });
            });
        });
    },

    bindEvents() {
        window.addEventListener('zolngen_sql_update', () => {
            this.renderAll();
        });
    },

    renderAll() {
        this.renderProducts();
        this.renderStats();
        this.updateCharts();
        this.setupCursorInteraction(); 
    },

    renderProducts() {
        const list = document.getElementById('product-list');
        if (!list) return;
        const products = ZolngenDB.select('products');
        list.innerHTML = products.map(p => `
            <div class="glass p-8 rounded-[40px] border border-gold/10 hover:border-gold/40 transition-all">
                <div class="flex justify-between items-start mb-6">
                    <h3 class="text-2xl font-black text-gold">${p.name}</h3>
                    <button onclick="ZolngenDB.delete('products', ${p.id})" class="text-red-500 opacity-20 hover:opacity-100 transition-opacity"><i class="fas fa-trash"></i></button>
                </div>
                <div class="flex justify-between items-end">
                    <span class="text-3xl font-black">$${p.price.toLocaleString()}</span>
                    <span class="px-4 py-2 bg-gold/10 text-gold rounded-full text-xs font-bold uppercase tracking-widest">${p.stock} Units</span>
                </div>
            </div>
        `).join('');
    },

    renderStats() {
        const stat = document.getElementById('stat-sales');
        if (stat) {
            const products = ZolngenDB.select('products');
            stat.innerText = products.length;
        }
    },

    updateCharts() {
        const ctx = document.getElementById('forecastChart');
        if (!ctx) return;
        const products = ZolngenDB.select('products');
        if (this.chart) this.chart.destroy();
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: products.map(p => p.name),
                datasets: [{
                    label: 'Asset Levels',
                    data: products.map(p => p.stock),
                    backgroundColor: 'rgba(212, 175, 55, 0.3)',
                    borderColor: '#D4AF37',
                    borderWidth: 2
                }]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true, ticks: { color: '#D4AF37' } } } }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => ZolngenUI.init());
window.ZolngenUI = ZolngenUI;
