/* ZOLNGEN UI ORCHESTRATOR V100.0 */
const UI = {
    initNeural: function() {
        const canvas = document.getElementById('neural-bg');
        if(!canvas) return;
        const ctx = canvas.getContext('2d');
        let dots = [];
        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        window.addEventListener('resize', resize);
        resize();

        for(let i=0; i<60; i++) dots.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, vx: (Math.random()-0.5)*0.3, vy: (Math.random()-0.5)*0.3 });

        const draw = () => {
            ctx.clearRect(0,0,canvas.width,canvas.height);
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--gold') || '#D4AF37';
            ctx.globalAlpha = 0.15;
            dots.forEach(d => {
                d.x += d.vx; d.y += d.vy;
                if(d.x<0 || d.x>canvas.width) d.vx *= -1;
                if(d.y<0 || d.y>canvas.height) d.vy *= -1;
                ctx.beginPath(); ctx.arc(d.x, d.y, 1.5, 0, Math.PI*2); ctx.fill();
            });
            requestAnimationFrame(draw);
        };
        draw();
    },

    initSearch: function() {
        window.addEventListener('keydown', (e) => {
            if(e.ctrlKey && e.key === 'k') { e.preventDefault(); this.toggleSearch(true); }
            if(e.key === 'Escape') this.toggleSearch(false);
        });

        const input = document.getElementById('cmd-input');
        if(input) {
            input.addEventListener('input', (e) => {
                const q = e.target.value.toLowerCase();
                const res = document.getElementById('cmd-results');
                if(!q) { res.innerHTML = ''; return; }
                const products = DB.getProducts().filter(p => p.name.toLowerCase().includes(q));
                res.innerHTML = products.map(p => `
                    <a href="products.html" class="block p-4 hover:bg-gold/10 rounded-xl flex justify-between items-center transition-all">
                        <span>📦 ${p.name}</span>
                        <span class="text-gold font-bold">${p.price} JOD</span>
                    </a>
                `).join('') || '<p class="text-center text-gray-500 py-4">No results found...</p>';
            });
        }
    },

    toggleSearch: function(show) {
        const ov = document.getElementById('cmd-overlay');
        if(!ov) return;
        if(show) { 
            ov.style.display = 'block'; 
            setTimeout(() => { ov.style.opacity = '1'; document.getElementById('cmd-input').focus(); }, 10); 
        } else { 
            ov.style.opacity = '0'; 
            setTimeout(() => { ov.style.display = 'none'; }, 300); 
        }
    },

    showToast: function(msg, type = 'success') {
        const t = document.createElement('div');
        t.className = `fixed bottom-10 right-10 glass px-8 py-4 rounded-2xl font-black z-[1000] border-l-4 shadow-2xl transition-all ${type === 'success' ? 'border-gold text-gold' : 'border-red-500 text-red-500'}`;
        t.innerText = msg;
        document.body.appendChild(t);
        gsap.from(t, { x: 100, opacity: 0 });
        setTimeout(() => {
            gsap.to(t, { x: 100, opacity: 0, onComplete: () => t.remove() });
        }, 3000);
    }
};

window.UI = UI;
