// Ultimate ZOLNGEN Script v3
document.addEventListener('DOMContentLoaded', () => {
    // 1. Sidebar Cart Logic
    const openCartBtn = document.getElementById('open-cart');
    const closeCartBtn = document.querySelector('.close-cart');
    const cartSidebar = document.getElementById('cart-sidebar');

    const toggleCart = (isOpen) => {
        cartSidebar.classList.toggle('open', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    };

    openCartBtn?.addEventListener('click', () => toggleCart(true));
    closeCartBtn?.addEventListener('click', () => toggleCart(false));

    // 2. Advanced Filtering with Staggered Animation
    window.filterProducts = (category) => {
        const cards = Array.from(document.querySelectorAll('.product-card'));
        const buttons = document.querySelectorAll('.btn-filter');
        
        buttons.forEach(btn => btn.classList.remove('active'));
        const targetBtn = document.querySelector(`.btn-filter[onclick*="'${category}'"]`);
        targetBtn?.classList.add('active');

        cards.forEach((card, index) => {
            if (category === 'all' || card.getAttribute('data-category') === category) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0) scale(1)';
                }, index * 50); // Staggered reveal
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px) scale(0.95)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 400);
            }
        });
    };

    // 3. Cart Interaction
    let cartCount = 0;
    const cartCountEl = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items');

    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            cartCount++;
            if (cartCountEl) cartCountEl.innerText = cartCount;
            
            // Visual feedback
            const originalText = btn.innerText;
            btn.innerHTML = '<i class="fas fa-check"></i> تمت الإضافة';
            btn.classList.add('success');
            
            // Sidebar Update
            if (cartItemsContainer) {
                cartItemsContainer.innerHTML = `
                    <div style="padding: 1.5rem; background: var(--surface-light); border-radius: 12px; border: 1px solid var(--glass-border);">
                        <p style="color: var(--primary-gold); font-weight: 700;">تمت إضافة ${cartCount} منتجات</p>
                        <small style="color: #888;">سيتم مراجعة الطلب فور إتمامه</small>
                    </div>
                `;
            }

            setTimeout(() => {
                btn.innerText = originalText;
                btn.classList.remove('success');
            }, 1500);
        });
    });

    // 4. Back to Top
    const backToTop = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 600) {
            backToTop.style.display = 'flex';
            setTimeout(() => backToTop.style.opacity = '1', 10);
        } else {
            backToTop.style.opacity = '0';
            setTimeout(() => backToTop.style.display = 'none', 300);
        }
    });
    backToTop?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 5. Scroll Animations (Intersection Observer)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, 100);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.category-card, .feature-item, .process-step, .product-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
        el.style.transition = 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
        observer.observe(el);
    });

    // 6. Header Scroll Effect
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            nav.classList.add('scrolled');
            nav.style.padding = '0.7rem 0';
            nav.style.background = 'rgba(5, 5, 5, 0.98)';
        } else {
            nav.classList.remove('scrolled');
            nav.style.padding = '1.2rem 0';
            nav.style.background = 'rgba(18, 18, 18, 0.85)';
        }
    });
});
