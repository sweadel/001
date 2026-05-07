/* ZOLNGEN UI ORCHESTRATOR V100.4 - THE MASTER ENGINE */
const UI = {
    initNeural: function() {
        const canvas = document.getElementById('neural-bg');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let particles = [];
        
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 1.5;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.speedY = Math.random() * 0.5 - 0.25;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x > canvas.width) this.x = 0;
                if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                if (this.y < 0) this.y = canvas.height;
            }
            draw() {
                ctx.fillStyle = 'rgba(212, 175, 55, 0.15)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < 60; i++) particles.push(new Particle());

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(animate);
        }
        animate();
    },

    showToast: function(msg) {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-10 right-10 glass px-8 py-4 rounded-2xl border border-gold/30 text-gold font-bold z-[3000] animate-in';
        toast.innerHTML = `<i class="fas fa-check-circle ml-3"></i> ${msg}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    toggleBot: function() {
        const bot = document.getElementById('bot-widget');
        bot.classList.toggle('hidden');
        gsap.from(bot, { y: 50, opacity: 0, duration: 0.5, ease: "power4.out" });
    },

    toggleLogin: function() {
        const modal = document.getElementById('login-modal');
        modal.classList.toggle('hidden');
        if(!modal.classList.contains('hidden')) {
            gsap.from(modal.children[0], { scale: 0.8, opacity: 0, duration: 0.4 });
        }
    }
};

window.UI = UI;
