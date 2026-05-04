// ZOLNGEN Storefront Intelligence v18 - DYNAMIC & ZERO-HARDCODED
document.addEventListener('DOMContentLoaded', () => {
    let cart = JSON.parse(localStorage.getItem('zolngen_cart')) || [];

    // --- UI ELEMENTS ---
    const productContainer = document.getElementById('product-container');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartCount = document.getElementById('cart-count');
    const cartTotalVal = document.getElementById('cart-total-val');
    const cartItemsContainer = document.getElementById('cart-items');
    
    const orderModal = document.getElementById('order-modal');
    const orderForm = document.getElementById('order-form');
    
    // --- CORE FUNCTIONS ---
    
    const renderProducts = (filter = '') => {
        if (!productContainer) return;
        const products = DB.getProducts().filter(p => 
            (p.name.toLowerCase().includes(filter.toLowerCase()) || 
             (p.category || '').toLowerCase().includes(filter.toLowerCase()))
        );

        productContainer.innerHTML = products.length ? products.map(p => `
            <div class="product-card">
                <div class="img-box">
                    <img src="${p.img}" alt="${p.name}" onerror="this.src='https://placehold.co/400x400/EEE/31343C?text=Hardware'">
                </div>
                <h3>${p.name}</h3>
                <p class="sub">${p.category === 'Laptops' ? 'لابتوب أعمال' : p.category === 'Electronics' ? 'أجهزة مكتبية' : 'تجهيزات تقنية'}</p>
                <div class="price">${(p.price || 0).toFixed(2)} د.أ</div>
                <button class="btn-add-order" data-id="${p.id}">أضف إلى الطلب</button>
            </div>
        `).join('') : '<p style="grid-column:1/-1; text-align:center; padding:50px; color:#555;">لا توجد منتجات مطابقة.</p>';

        // Bind events to buttons
        productContainer.querySelectorAll('.btn-add-order').forEach(btn => {
            btn.addEventListener('click', (e) => addToCart(e.target.dataset.id));
        });
    };

    const updateCartUI = () => {
        if (cartCount) cartCount.innerText = cart.reduce((acc, i) => acc + i.qty, 0);
        if (cartTotalVal) cartTotalVal.innerText = cart.reduce((acc, i) => acc + (i.price * i.qty), 0).toFixed(2);
        
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = cart.length ? cart.map(item => `
                <div style="display:flex; gap:12px; margin-bottom:15px; padding:15px; background:rgba(255,255,255,0.03); border-radius:10px; align-items:center;">
                    <img src="${item.img}" style="width:40px; height:40px; object-fit:contain; background:#fff; border-radius:5px;" onerror="this.src='https://placehold.co/50x50'">
                    <div style="flex:1;">
                        <h4 style="font-size:0.85rem; color:#fff; margin-bottom:5px;">${item.name}</h4>
                        <div style="display:flex; align-items:center; gap:10px;">
                            <button class="qty-btn" data-id="${item.id}" data-delta="-1" style="background:#222; border:none; color:#fff; width:22px; height:22px; cursor:pointer;">-</button>
                            <span style="font-size:0.9rem;">${item.qty}</span>
                            <button class="qty-btn" data-id="${item.id}" data-delta="1" style="background:#222; border:none; color:#fff; width:22px; height:22px; cursor:pointer;">+</button>
                            <span style="margin-right:auto; color:var(--gold); font-weight:800;">${(item.price * item.qty).toFixed(2)}</span>
                        </div>
                    </div>
                    <button class="remove-btn" data-id="${item.id}" style="background:none; border:none; color:#ff4757; cursor:pointer; padding:5px;"><i class="fas fa-trash-alt"></i></button>
                </div>
            `).join('') : '<p style="text-align:center; color:#444; margin-top:100px;">سلة التوريد فارغة حالياً.</p>';

            // Bind events for qty and remove
            cartItemsContainer.querySelectorAll('.qty-btn').forEach(btn => {
                btn.addEventListener('click', (e) => updateQty(e.target.dataset.id, parseInt(e.target.dataset.delta)));
            });
            cartItemsContainer.querySelectorAll('.remove-btn').forEach(btn => {
                btn.addEventListener('click', (e) => removeFromCart(e.target.closest('button').dataset.id));
            });
        }
    };

    const addToCart = (id) => {
        const prod = DB.getProducts().find(p => String(p.id) === String(id));
        if (!prod) return;
        const existing = cart.find(i => String(i.id) === String(id));
        if (existing) existing.qty++;
        else cart.push({ ...prod, qty: 1 });
        saveCart();
        updateCartUI();
        toggleCart(true);
    };

    const updateQty = (id, delta) => {
        const item = cart.find(i => String(i.id) === String(id));
        if (item) {
            item.qty += delta;
            if (item.qty <= 0) removeFromCart(id);
            else saveCart(), updateCartUI();
        }
    };

    const removeFromCart = (id) => {
        cart = cart.filter(i => String(i.id) !== String(id));
        saveCart();
        updateCartUI();
    };

    const saveCart = () => localStorage.setItem('zolngen_cart', JSON.stringify(cart));

    const toggleCart = (force = null) => {
        if (!cartSidebar) return;
        if (force === true) cartSidebar.style.right = '0';
        else if (force === false) cartSidebar.style.right = '-450px';
        else {
            const current = cartSidebar.style.right;
            cartSidebar.style.right = current === '0px' ? '-450px' : '0';
        }
    };

    // --- GLOBAL EXPOSURE (FOR TRACKING/PDF) ---
    window.toggleCart = toggleCart;
    window.generatePDFQuote = () => {
        if (!cart.length) return alert('السلة فارغة!');
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(22); doc.text("ZOLNGEN - Official Quotation", 20, 20);
        let y = 40;
        cart.forEach(i => {
            doc.text(`${i.name} (Qty: ${i.qty}) - ${(i.price * i.qty).toFixed(2)} JOD`, 20, y);
            y += 10;
        });
        doc.setFontSize(16); doc.text(`Total Estimate: ${cart.reduce((acc, i) => acc + (i.price * i.qty), 0).toFixed(2)} JOD`, 20, y + 15);
        doc.save(`ZOLNGEN_Estimate_${Date.now()}.pdf`);
    };

    // --- EVENTS BINDING ---
    document.getElementById('cart-trigger')?.addEventListener('click', () => toggleCart());
    document.getElementById('cart-close')?.addEventListener('click', () => toggleCart(false));
    
    document.getElementById('btn-hero-order')?.addEventListener('click', () => {
        if (orderModal) orderModal.style.display = 'flex';
    });
    document.getElementById('modal-close')?.addEventListener('click', () => {
        if (orderModal) orderModal.style.display = 'none';
    });

    orderForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!cart.length) return alert('يرجى إضافة منتجات للسلة أولاً لإكمال طلب التوريد.');
        
        const data = {
            fullName: document.getElementById('full-name').value,
            phone: document.getElementById('phone').value,
            entity: document.getElementById('university').value,
            items: [...cart],
            total: cart.reduce((acc, i) => acc + (i.price * i.qty), 0)
        };
        
        const o = DB.placeOrder(data);
        alert(`تم إرسال طلبكم بنجاح! رقم التتبع: ${o.id}`);
        cart = []; saveCart();
        location.reload();
    });

    document.getElementById('btn-track')?.addEventListener('click', () => {
        const id = document.getElementById('track-id').value;
        const order = DB.getOrders().find(o => String(o.id) === String(id));
        const res = document.getElementById('track-result');
        if (!res) return;
        if (order) {
            res.innerHTML = `
                <div style="margin-top:2rem; padding:2rem; background:rgba(212,175,55,0.1); border:1.5px solid var(--gold); border-radius:15px; color:#fff;">
                    <p style="font-size:1.2rem; margin-bottom:10px;">حالة الطلب: <strong style="color:var(--gold);">${order.status.toUpperCase()}</strong></p>
                    <p style="font-size:0.9rem; color:#888;">المؤسسة: ${order.entity}</p>
                </div>
            `;
        } else res.innerHTML = '<p style="color:#ff4757; margin-top:2rem;">عذراً، رقم الطلب غير موجود.</p>';
    });

    // --- INITIALIZE ---
    const initStats = () => {
        const stats = DB.getStats();
        const dynEnt = document.getElementById('dyn-entities');
        if (dynEnt) dynEnt.innerText = stats.entities || 25; // Default if empty
    };

    renderProducts();
    updateCartUI();
    initStats();

    // Auto-search
    window.searchProducts = (val) => renderProducts(val);
});
