/* ui.js - ZOLNGEN NUCLEAR CURSOR FIX V155.0 */
const ZolngenUI = {
    init() {
        this.injectNuclearStyles();
        this.createNuclearCursor();
        this.createToastContainer();
        this.setupCursorEvents();
        console.log("[SYSTEM] ZOLNGEN NUCLEAR UI V155.0 READY.");
    },

    injectNuclearStyles() {
        const style = document.createElement('style');
        style.id = "zolngen-nuclear-styles";
        style.textContent = `
            /* DO NOT HIDE CURSOR BY DEFAULT */
            body, html, * { cursor: auto !important; } 

            .nuclear-cursor { 
                width: 25px; height: 25px; 
                background: #D4AF37; 
                border-radius: 50%; 
                position: fixed; 
                pointer-events: none; 
                z-index: 2147483647 !important; /* MAXIMUM POSSIBLE Z-INDEX */
                box-shadow: 0 0 25px #D4AF37, 0 0 50px rgba(212, 175, 55, 0.6);
                mix-blend-mode: difference;
                display: none;
                border: 2px solid white;
            }
            .nuclear-cursor.active { display: block; }
            
            /* HIDE DEFAULT ONLY WHEN CUSTOM IS ACTIVE AND MOVING */
            html.custom-active * { cursor: none !important; }
        `;
        document.head.appendChild(style);
    },

    createNuclearCursor() {
        if (!document.getElementById('nuclear-cursor')) {
            const cursor = document.createElement('div');
            cursor.id = 'nuclear-cursor';
            cursor.className = 'nuclear-cursor';
            document.body.appendChild(cursor);

            let hasMoved = false;
            document.addEventListener('mousemove', (e) => {
                if(!hasMoved) {
                    hasMoved = true;
                    cursor.classList.add('active');
                    document.documentElement.classList.add('custom-active');
                }
                
                // Nuclear Fallback: Use standard transform if GSAP fails
                if (window.gsap) {
                    gsap.to(cursor, { x: e.clientX - 12, y: e.clientY - 12, duration: 0.05 });
                } else {
                    cursor.style.left = (e.clientX - 12) + 'px';
                    cursor.style.top = (e.clientY - 12) + 'px';
                }
            });

            // Restore cursor if mouse leaves window
            document.addEventListener('mouseleave', () => {
                document.documentElement.classList.remove('custom-active');
                cursor.classList.remove('active');
            });
            
            document.addEventListener('mouseenter', () => {
                if(hasMoved) {
                    document.documentElement.classList.add('custom-active');
                    cursor.classList.add('active');
                }
            });
        }
    },

    setupCursorEvents() {
        const cursor = document.getElementById('nuclear-cursor');
        const trigger = 'button, a, input, [onclick], .glass, .card';
        
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(trigger)) {
                if(window.gsap) gsap.to(cursor, { scale: 2.5, backgroundColor: '#FFF', duration: 0.2 });
                else cursor.style.transform = 'scale(2.5)';
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
        t.className = "glass p-6 rounded-2xl border border-gold/30 text-gold font-bold shadow-2xl animate-fade-in";
        t.innerHTML = msg;
        container.appendChild(t);
        setTimeout(() => t.remove(), 3000);
    }
};

document.addEventListener('DOMContentLoaded', () => ZolngenUI.init());
window.ZolngenUI = ZolngenUI;
