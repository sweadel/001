/* ui.js - ZOLNGEN SOVEREIGN PURGE ENGINE V158.0 */
const ZolngenUI = {
    init() {
        this.purgeLegacyCursors();
        this.injectNuclearStyles();
        this.createNuclearCursor();
        this.createToastContainer();
        this.setupCursorEvents();
        console.log("[SYSTEM] ZOLNGEN SOVEREIGN UI V158.0 READY.");
    },

    purgeLegacyCursors() {
        // Find and destroy any old cursor elements from legacy files
        const legacy = document.querySelectorAll('#cursor, .cursor, .cursor-glow, #master-cursor, #nuclear-cursor');
        legacy.forEach(el => el.remove());
    },

    injectNuclearStyles() {
        const style = document.createElement('style');
        style.id = "zolngen-v158-styles";
        style.textContent = `
            /* FORCE SHOW DEFAULT CURSOR BY DEFAULT */
            body, html, * { cursor: auto !important; } 

            .nuclear-cursor { 
                width: 20px; height: 20px; 
                background: #D4AF37; 
                border-radius: 50%; 
                position: fixed; 
                pointer-events: none; 
                z-index: 2147483647 !important; 
                box-shadow: 0 0 20px #D4AF37, 0 0 40px rgba(212, 175, 55, 0.5);
                mix-blend-mode: difference;
                display: none;
                border: 2px solid white;
            }
            .nuclear-cursor.active { display: block; }
            
            /* ONLY HIDE DEFAULT WHEN CUSTOM IS MOVING */
            html.custom-active * { cursor: none !important; }
        `;
        document.head.appendChild(style);
    },

    createNuclearCursor() {
        const cursor = document.createElement('div');
        cursor.id = 'nuclear-cursor';
        cursor.className = 'nuclear-cursor';
        document.body.appendChild(cursor);

        let moving = false;
        document.addEventListener('mousemove', (e) => {
            if(!moving) {
                moving = true;
                cursor.classList.add('active');
                document.documentElement.classList.add('custom-active');
            }
            
            if (window.gsap) {
                gsap.to(cursor, { x: e.clientX - 10, y: e.clientY - 10, duration: 0.05 });
            } else {
                cursor.style.left = (e.clientX - 10) + 'px';
                cursor.style.top = (e.clientY - 10) + 'px';
            }
        });
    },

    setupCursorEvents() {
        const cursor = document.getElementById('nuclear-cursor');
        const trigger = 'button, a, input, [onclick], .glass, .card, .product-card-premium';
        
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(trigger)) {
                if(window.gsap) gsap.to(cursor, { scale: 3, backgroundColor: '#FFF', duration: 0.2 });
                else cursor.style.transform = 'scale(3)';
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.closest(trigger)) {
                if(window.gsap) gsap.to(cursor, { scale: 1, backgroundColor: '#D4AF37', duration: 0.2 });
                else cursor.style.transform = 'scale(1)';
            }
        });
    },

    createToastContainer() {
        if (!document.getElementById('zoln-toasts')) {
            const div = document.createElement('div');
            div.id = 'zoln-toasts';
            div.className = "fixed bottom-10 right-10 z-[2147483647] flex flex-col gap-4";
            document.body.appendChild(div);
        }
    },

    showToast(msg, type = "success") {
        const container = document.getElementById('zoln-toasts');
        const t = document.createElement('div');
        t.className = "glass p-6 rounded-2xl border border-gold/30 text-gold font-bold shadow-2xl";
        t.innerHTML = msg;
        container.appendChild(t);
        setTimeout(() => t.remove(), 3000);
    }
};

document.addEventListener('DOMContentLoaded', () => ZolngenUI.init());
window.ZolngenUI = ZolngenUI;
