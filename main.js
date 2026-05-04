// ZOLNGEN Storefront Intelligence PRO v20 - ULTIMATE STABILITY
document.addEventListener('DOMContentLoaded', () => {
    let cart = JSON.parse(localStorage.getItem('zolngen_cart')) || [];

    const productContainer = document.getElementById('product-container');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartCount = document.getElementById('cart-count');
    const cartTotalVal = document.getElementById('cart-total-val');
    const cartItemsContainer = document.getElementById('cart-items');
    const orderModal = document.getElementById('order-modal');
    
    // --- PREMIUM UX SETUP ---
    window.setupPremiumUX = () => {
        if (!document.getElementById('toast-container')) {
            const toastCont = document.createElement('div');
            toastCont.id = 'toast-container';
            document.body.appendChild(toastCont);
        }
        if (!document.getElementById('scroll-top')) {
            const btn = document.createElement('button');
            btn.id = 'scroll-top';
            btn.innerHTML = '<i class="fas fa-chevron-up"></i>';
            btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
            document.body.appendChild(btn);
            window.addEventListener('scroll', () => {
                if (window.scrollY > 300) btn.classList.add('visible');
                else btn.classList.remove('visible');
            });
        }
    };
    
    window.showToast = (msg, type = 'success') => {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        toast.innerHTML = `<i class="fas ${icon}"></i> <span>${msg}</span>`;
        container.appendChild(toast);
        
        requestAnimationFrame(() => {
            setTimeout(() => toast.classList.add('show'), 10);
        });
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    };
    
    setupPremiumUX();
    
    let currentCategoryFilter = '';

    window.searchProducts = (val) => renderProducts(val);

    document.querySelectorAll('.pill').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
            e.target.classList.add('active');
            currentCategoryFilter = e.target.dataset.cat;
            renderProducts(document.getElementById('prod-search')?.value || '');
        });
    });

    // --- RENDER LOGIC ---
    const renderProducts = (filter = '') => {
        const prodContainer = document.getElementById('product-container');
        const fullProdContainer = document.getElementById('full-product-container');
        
        const targetContainer = fullProdContainer || prodContainer;
        if (!targetContainer) return;

        let products = DB.getProducts().filter(p => 
            (p.name.toLowerCase().includes(filter.toLowerCase()) || 
             (p.category || '').toLowerCase().includes(filter.toLowerCase())) &&
            (currentCategoryFilter === '' || (p.category || '') === currentCategoryFilter)
        );

        // Limit to 4 items on the home page preview
        if (prodContainer && !fullProdContainer && filter === '') {
            products = products.slice(0, 4);
        }

        targetContainer.innerHTML = products.length ? products.map(p => `
            <div class="product-card reveal active">
                <div class="img-container">
                    <img src="${p.img}" alt="${p.name}" onerror="this.src='https://placehold.co/400x400/EEE/31343C?text=Hardware'">
                </div>
                <h3>${p.name}</h3>
                <p class="category">${p.category || 'تجهيزات تقنية'}</p>
                <div class="price">${(p.price || 0).toFixed(2)} د.أ</div>
                <button class="btn-add" data-id="${p.id}">أضف إلى الطلب</button>
            </div>
        `).join('') : '<p style="grid-column:1/-1; text-align:center; padding:100px; color:#555;">لا توجد أجهزة مطابقة.</p>';

        targetContainer.querySelectorAll('.btn-add').forEach(btn => {
            btn.addEventListener('click', (e) => addToCart(e.target.dataset.id));
        });
    };

    const updateCartUI = () => {
        localStorage.setItem('zolngen_cart', JSON.stringify(cart));
        if (cartCount) cartCount.innerText = cart.reduce((acc, i) => acc + i.qty, 0);
        if (cartTotalVal) cartTotalVal.innerText = cart.reduce((acc, i) => acc + (i.price * i.qty), 0).toFixed(2);
        
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = cart.length ? cart.map(item => `
                <div style="display:flex; gap:12px; margin-bottom:20px; padding:15px; background:rgba(255,255,255,0.03); border-radius:15px; align-items:center;">
                    <img src="${item.img}" style="width:50px; height:50px; object-fit:contain; background:#fff; border-radius:8px;" onerror="this.src='https://placehold.co/60x60'">
                    <div style="flex:1;">
                        <h4 style="font-size:0.9rem; color:#fff; margin-bottom:5px;">${item.name}</h4>
                        <div style="display:flex; align-items:center; gap:10px;">
                            <button class="qty-btn" data-id="${item.id}" data-delta="-1" style="background:#222; border:none; color:#fff; width:25px; height:25px; border-radius:5px; cursor:pointer;">-</button>
                            <span style="font-weight:700;">${item.qty}</span>
                            <button class="qty-btn" data-id="${item.id}" data-delta="1" style="background:#222; border:none; color:#fff; width:25px; height:25px; border-radius:5px; cursor:pointer;">+</button>
                            <span style="margin-right:auto; color:var(--gold); font-weight:900;">${(item.price * item.qty).toFixed(2)}</span>
                        </div>
                    </div>
                    <button class="remove-btn" data-id="${item.id}" style="background:none; border:none; color:#ff4757; cursor:pointer; padding:5px;"><i class="fas fa-trash-alt"></i></button>
                </div>
            `).join('') : '<div style="text-align:center; color:#444; margin-top:100px;"><i class="fas fa-shopping-basket" style="font-size:3rem; margin-bottom:1rem;"></i><p>قائمة التوريد فارغة</p></div>';

            cartItemsContainer.querySelectorAll('.qty-btn').forEach(btn => btn.addEventListener('click', (e) => updateQty(e.target.dataset.id, parseInt(e.target.dataset.delta))));
            cartItemsContainer.querySelectorAll('.remove-btn').forEach(btn => btn.addEventListener('click', (e) => removeFromCart(e.target.closest('button').dataset.id)));
        }
    };

    const addToCart = (id) => {
        const prod = DB.getProducts().find(p => String(p.id) === String(id));
        if (!prod) return;
        const existing = cart.find(i => String(i.id) === String(id));
        if (existing) existing.qty++;
        else cart.push({ ...prod, qty: 1 });
        updateCartUI();
        
        if (cartCount) {
            cartCount.classList.remove('pop-anim');
            void cartCount.offsetWidth; // trigger reflow
            cartCount.classList.add('pop-anim');
        }
        
        window.showToast(`تمت إضافة ${prod.name} لقائمة التوريد`);
        toggleCart(true);
    };

    const updateQty = (id, delta) => {
        const item = cart.find(i => String(i.id) === String(id));
        if (item) {
            item.qty += delta;
            if (item.qty <= 0) removeFromCart(id);
            else updateCartUI();
        }
    };

    const removeFromCart = (id) => {
        cart = cart.filter(i => String(i.id) !== String(id));
        updateCartUI();
    };

    const toggleCart = (force = null) => {
        if (!cartSidebar) return;
        if (force === true) cartSidebar.style.right = '0';
        else if (force === false) cartSidebar.style.right = '-450px';
        else cartSidebar.style.right = cartSidebar.style.right === '0px' ? '-450px' : '0';
    };

    // --- EVENTS & FORMS ---
    document.getElementById('cart-trigger')?.addEventListener('click', () => toggleCart());
    document.getElementById('cart-close')?.addEventListener('click', () => toggleCart(false));
    document.getElementById('btn-order-trigger')?.addEventListener('click', () => {
        if (!cart.length) return window.showToast('يرجى إضافة أجهزة لقائمة التوريد أولاً.', 'error');
        orderModal.style.display = 'flex';
    });
    document.getElementById('modal-close')?.addEventListener('click', () => orderModal.style.display = 'none');

    document.getElementById('order-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const order = DB.placeOrder({
            fullName: document.getElementById('full-name').value,
            phone: document.getElementById('phone').value,
            entity: document.getElementById('university').value,
            notes: document.getElementById('notes').value,
            items: [...cart],
            total: cart.reduce((acc, i) => acc + (i.price * i.qty), 0)
        });
        cart = []; updateCartUI();
        orderModal.style.display = 'none';
        window.showToast(`تم إرسال طلب التوريد بنجاح! رقم المرجع: ${order.id}`, 'success');
        setTimeout(() => location.reload(), 3000);
    });

    // Maintenance Ticket Logic
    const maintenanceForm = document.getElementById('maintenance-form') || document.getElementById('maintenance-form-page');
    maintenanceForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Find inputs regardless of which form it is
        const entityVal = document.getElementById('m-entity-p')?.value || document.getElementById('m-entity')?.value;
        const typeVal = document.getElementById('m-type-p')?.value || document.getElementById('m-type')?.value;
        const issueVal = document.getElementById('m-issue-p')?.value || document.getElementById('m-issue')?.value;

        const ticket = DB.createTicket({
            entity: entityVal,
            type: typeVal,
            issue: issueVal
        });
        window.showToast(`تم فتح تذكرة صيانة برقم: ${ticket.id.split('-')[1]}`, 'success');
        e.target.reset();
    });

    document.getElementById('btn-track')?.addEventListener('click', () => {
        const id = document.getElementById('track-id').value;
        const order = DB.getOrders().find(o => String(o.id) === String(id));
        const res = document.getElementById('track-result');
        if (!res) return;
        if (order) {
            res.innerHTML = `
                <div class="tracking-card">
                    <h3 style="color:var(--gold); margin-bottom:1rem;">حالة الطلب: ${order.status.toUpperCase()}</h3>
                    <p style="color:#888;">الجهة: ${order.entity} | التاريخ: ${order.date}</p>
                    <div style="margin-top:1.5rem; height:4px; background:#222; border-radius:2px; position:relative;">
                        <div style="position:absolute; height:100%; width:${order.status === 'delivered' ? '100%' : '50%'}; background:var(--gold);"></div>
                    </div>
                </div>
            `;
        } else res.innerHTML = '<p style="color:var(--danger); margin-top:2rem;">عذراً، رقم المرجع غير صحيح أو غير موجود في سجلاتنا.</p>';
    });

    // --- INITIALIZE ---
    renderProducts();
    updateCartUI();

    window.generatePDFQuote = () => {
        if (!cart.length) return window.showToast('قائمة التوريد فارغة!', 'error');
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(22); doc.text("ZOLNGEN - Official Quote", 20, 20);
        let y = 40;
        cart.forEach(i => { doc.text(`${i.name} (Qty: ${i.qty}) - ${(i.price * i.qty).toFixed(2)} JOD`, 20, y); y += 10; });
        doc.text(`Total Estimate: ${cart.reduce((acc, i) => acc + (i.price * i.qty), 0).toFixed(2)} JOD`, 20, y + 15);
        doc.save(`ZOLNGEN_Estimate.pdf`);
    };
});
