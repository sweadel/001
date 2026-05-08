/* ui.js - ZOLNGEN ZERO-DEFECT UI V142.0 */
const ZolngenUI = {
    chart: null,

    init() {
        this.injectGlobalStyles();
        this.createCursor();
        this.createToastContainer();
        this.setupGlobalEvents();
        this.checkAuthPersistence();
        console.log("[SYSTEM] ZOLNGEN UI V142.0 INITIALIZED.");
    },

    injectGlobalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            * { cursor: none !important; scroll-behavior: smooth; }
            .cursor-glow { 
                width: 25px; height: 25px; background: rgba(212, 175, 55, 0.1); 
                border: 1px solid rgba(212, 175, 55, 0.5); border-radius: 50%; 
                position: fixed; pointer-events: none; z-index: 9999; 
                backdrop-filter: blur(2px); transition: transform 0.1s;
            }
            .toast { 
                background: rgba(10,10,10,0.9); backdrop-filter: blur(20px); 
                border: 1px solid rgba(212,175,55,0.3); padding: 20px 40px; 
                border-radius: 20px; color: #D4AF37; font-weight: 900; 
                box-shadow: 0 20px 50px rgba(0,0,0,0.5); z-index: 10000;
            }
        `;
        document.head.appendChild(style);
    },

    createCursor() {
        if (!document.getElementById('cursor')) {
            const cursor = document.createElement('div');
            cursor.id = 'cursor';
            cursor.className = 'cursor-glow';
            document.body.appendChild(cursor);
            document.addEventListener('mousemove', (e) => {
                gsap.to(cursor, { x: e.clientX - 12, y: e.clientY - 12, duration: 0.1 });
            });
            this.setupCursorInteraction();
        }
    },

    setupCursorInteraction() {
        const cursor = document.getElementById('cursor');
        document.querySelectorAll('button, a, input, .glass-card, .glass').forEach(el => {
            el.addEventListener('mouseenter', () => gsap.to(cursor, { scale: 3, backgroundColor: 'rgba(212, 175, 55, 0.3)', duration: 0.3 }));
            el.addEventListener('mouseleave', () => gsap.to(cursor, { scale: 1, backgroundColor: 'rgba(212, 175, 55, 0.1)', duration: 0.3 }));
        });
    },

    createToastContainer() {
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.className = "fixed bottom-10 right-10 flex flex-col gap-4 z-[10000]";
            document.body.appendChild(container);
        }
    },

    showToast(msg, type = "success") {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast animate-fade-up';
        toast.innerHTML = `<i class="fas fa-shield-check mr-3"></i> ${msg}`;
        container.appendChild(toast);
        gsap.from(toast, { x: 100, opacity: 0, duration: 0.5 });
        setTimeout(() => {
            gsap.to(toast, { opacity: 0, y: -20, duration: 0.5, onComplete: () => toast.remove() });
        }, 3000);
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
        window.addEventListener('load', () => this.setupCursorInteraction());
    }
};

document.addEventListener('DOMContentLoaded', () => ZolngenUI.init());
