// Sidebar Cart Logic
const openCartBtn = document.getElementById('open-cart');
const closeCartBtn = document.querySelector('.close-cart');
const cartSidebar = document.getElementById('cart-sidebar');

openCartBtn.addEventListener('click', () => {
    cartSidebar.classList.add('open');
});

closeCartBtn.addEventListener('click', () => {
    cartSidebar.classList.remove('open');
});

// Close cart when clicking outside
document.addEventListener('click', (e) => {
    if (!cartSidebar.contains(e.target) && !openCartBtn.contains(e.target)) {
        cartSidebar.classList.remove('open');
    }
});

// Filter Products Functionality
function filterProducts(category) {
    console.log("Filtering to:", category);
    const cards = document.querySelectorAll('.product-card');
    const buttons = document.querySelectorAll('.btn-filter');
    
    // Update active button
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    const targetBtn = document.querySelector(`.btn-filter[onclick*="'${category}'"]`);
    if (targetBtn) targetBtn.classList.add('active');

    cards.forEach(card => {
        card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = 'block';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0) scale(1)';
            }, 50);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px) scale(0.95)';
            setTimeout(() => {
                card.style.display = 'none';
            }, 500);
        }
    });
}

// Cart Functionality
let cartCount = 0;
const cartCountEl = document.getElementById('cart-count');
const cartItemsContainer = document.getElementById('cart-items');

document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
        cartCount++;
        cartCountEl.innerText = cartCount;
        
        // Update Sidebar
        cartItemsContainer.innerHTML = `<p style="padding: 1rem; background: var(--surface-light); border-radius: 8px; margin-bottom: 1rem; color: white;">تم إضافة ${cartCount} منتجات</p>`;
        
        // Success Feedback
        const originalText = btn.innerText;
        btn.innerHTML = 'تمت الإضافة ✓';
        btn.style.background = '#28a745';
        
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.background = '';
        }, 1500);
    });
});

// Back to Top Logic
const backToTop = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        backToTop.style.display = 'flex';
    } else {
        backToTop.style.display = 'none';
    }
});
backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Intersection Observer for Animations
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.category-card, .product-card, .feature-item, .process-step').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(el);
    });
});

// Sticky Header
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
        nav.style.padding = '0.8rem 0';
        nav.style.background = 'rgba(5, 5, 5, 0.98)';
        nav.style.boxShadow = '0 10px 30px rgba(0,0,0,0.8)';
    } else {
        nav.style.padding = '1.2rem 0';
        nav.style.background = 'rgba(18, 18, 18, 0.85)';
        nav.style.boxShadow = 'none';
    }
});

console.log("ZOLNGEN Storefront Ultimate Edition Loaded");
