/* ui.js - ZOLNGEN SOVEREIGN CURSOR ENGINE V148.0 */
const ZolngenUI = {
    init() {
        this.injectGlobalStyles();
        this.createCursor();
        this.createToastContainer();
        this.setupGlobalEvents();
        this.checkAuthPersistence();
        console.log("[SYSTEM] ZOLNGEN MASTER UI V148.0 READY.");
    },

    injectGlobalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* ONLY HIDE CURSOR IF CUSTOM ONE IS READY */
            html.custom-cursor-active * { cursor: none !important; }
            
            .cursor-glow { 
                width: 20px; height: 20px; 
                background: #D4AF37; 
                border-radius: 50%; 
                position: fixed; 
                pointer-events: none; 
                z-index: 999999; 
                box-shadow: 0 0 20px #D4AF37, 0 0 40px rgba(212, 175, 55, 0.5);
                mix-blend-mode: difference;
                display: none; /* Initially hidden until JS confirms movement */
            }
            .cursor-glow.visible { display: block; }

            /* TOASTS */
            .toast-zoln { 
                background: rgba(10,10,10,0.95); backdrop-filter: blur(30px); 
                border: 1px solid rgba(212,175,55,0.4); padding: 20px 40px; 
                border-radius: 25px; color: #D4AF37; font-weight: 900; 
                box-shadow: 0 25px 60px rgba(0,0,0,0.8); z-index: 1000000;
                font-family: 'Tajawal', sans-serif;
            }
        `;
        document.head.appendChild(style);
    },

    createCursor() {
        if (!document.getElementById('master-cursor')) {
            const cursor = document.createElement('div');
            cursor.id = 'master-cursor';
            cursor.className = 'cursor-glow';
            document.body.appendChild(cursor);

            let cursorReady = false;
            document.addEventListener('mousemove', (e) => {
                if(!cursorReady) {
                    cursorReady = true;
                    cursor.classList.add('visible');
                    document.documentElement.classList.add('custom-cursor-active');
                }
                gsap.to(cursor, { x: e.clientX - 10, y: e.clientY - 10, duration: 0.1, ease: "power2.out" });
            });
            this.setupCursorInteraction();
        }
    },

    setupCursorInteraction() {
        const cursor = document.getElementById('master-cursor');
        const interactive = 'button, a, input, select, textarea, .glass, .card, [onclick]';
        
        document.body.addEventListener('mouseover', (e) => {
            if (e.target.closest(interactive)) {
                gsap.to(cursor, { scale: 3, backgroundColor: 'rgba(212, 175, 55, 0.8)', duration: 0.3 });
            }
        });

        document.body.addEventListener('mouseout', (e) => {
            if (e.target.closest(interactive)) {
                gsap.to(cursor, { scale: 1, backgroundColor: '#D4AF37', duration: 0.3 });
            }
        });
    },

    createToastContainer() {
        if (!document.getElementById('toast-container-zoln')) {
            const container = document.createElement('div');
            container.id = 'toast-container-zoln';
            container.className = "fixed bottom-12 right-12 flex flex-col gap-5 z-[1000000]";
            document.body.appendChild(container);
        }
    },

    showToast(msg, type = "success") {
        const container = document.getElementById('toast-container-zoln');
        const toast = document.createElement('div');
        toast.className = 'toast-zoln';
        toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} mr-3"></i> ${msg}`;
        container.appendChild(toast);
        gsap.from(toast, { x: 100, opacity: 0, duration: 0.5 });
        setTimeout(() => {
            gsap.to(toast, { opacity: 0, y: -30, duration: 0.5, onComplete: () => toast.remove() });
        }, 3500);
    },

    checkAuthPersistence() {
        const token = localStorage.getItem('zolngen_auth_token');
        if (token && document.getElementById('login-screen')) {
            document.getElementById('login-screen').classList.add('hidden');
            if (document.getElementById('main-dash')) {
                document.getElementById('main-dash').classList.remove('hidden');
                if (window.refreshAll) window.refreshAll();
            }
        }
    },

    setupGlobalEvents() {
        // Handle dynamic content
        const observer = new MutationObserver(() => this.setupCursorInteraction());
        observer.observe(document.body, { childList: true, subtree: true });
    }
};

document.addEventListener('DOMContentLoaded', () => ZolngenUI.init());
window.ZolngenUI = ZolngenUI;
