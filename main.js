// ZOLNGEN Storefront Intelligence v19 - THE ULTIMATE STABLE
document.addEventListener('DOMContentLoaded', () => {
    let cart = JSON.parse(localStorage.getItem('zolngen_cart')) || [];

    const productContainer = document.getElementById('product-container');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartCount = document.getElementById('cart-count');
    const cartTotalVal = document.getElementById('cart-total-val');
    const cartItemsContainer = document.getElementById('cart-items');
    const orderModal = document.getElementById('order-modal');
    
    // --- RENDER LOGIC ---
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
                <p class="sub">${p.category || 'تجهيزات تقنية'}</p>
                <div class="price">${(p.price || 0).toFixed(2)} د.أ</div>
                <button class="btn-add-order" data-id="${p.id}">أضف إلى الطلب</button>
            </div>
        `).join('') : '<p style="grid-column:1/-1; text-align:center; padding:100px; color:#555;">لا توجد منتجات مطابقة.</p>';

        productContainer.querySelectorAll('.btn-add-order').forEach(btn => {
            btn.addEventListener('click', (e) => addToCart(e.target.dataset.id));
        });
    };

    const updateCartUI = () => {
        localStorage.setItem('zolngen_cart', JSON.stringify(cart));
        if (cartCount) cartCount.innerText = cart.reduce((acc, i) => acc + i.qty, 0);
        if (cartTotalVal) cartTotalVal.innerText = cart.reduce((acc, i) => acc + (i.price * i.qty), 0).toFixed(2);
        
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = cart.length ? cart.map(item => `
                <div style="display:flex; gap:12px; margin-bottom:15px; padding:12px; background:rgba(255,255,255,0.03); border-radius:10px; align-items:center;">
                    <img src="${item.img}" style="width:40px; height:40px; object-fit:contain; background:#fff; border-radius:5px;" onerror="this.src='https://placehold.co/50x50'">
                    <div style="flex:1;">
                        <h4 style="font-size:0.8rem; color:#fff; margin-bottom:4px;">${item.name}</h4>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <button class="qty-btn" data-id="${item.id}" data-delta="-1" style="background:#222; border:none; color:#fff; width:20px; cursor:pointer;">-</button>
                            <span>${item.qty}</span>
                            <button class="qty-btn" data-id="${item.id}" data-delta="1" style="background:#222; border:none; color:#fff; width:20px; cursor:pointer;">+</button>
                        </div>
                    </div>
                    <button class="remove-btn" data-id="${item.id}" style="background:none; border:none; color:#ff4757; cursor:pointer;"><i class="fas fa-trash-alt"></i></button>
                </div>
            `).join('') : '<p style="text-align:center; color:#444; margin-top:50px;">السلة فارغة</p>';

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

    // --- EVENTS ---
    document.getElementById('cart-trigger')?.addEventListener('click', () => toggleCart());
    document.getElementById('cart-close')?.addEventListener('click', () => toggleCart(false));
    document.getElementById('btn-hero-order')?.addEventListener('click', () => orderModal.style.display = 'flex');
    document.getElementById('modal-close')?.addEventListener('click', () => orderModal.style.display = 'none');

    document.getElementById('order-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!cart.length) return alert('يرجى إضافة منتجات للسلة أولاً.');
        const order = DB.placeOrder({
            fullName: document.getElementById('full-name').value,
            phone: document.getElementById('phone').value,
            entity: document.getElementById('university').value,
            items: [...cart],
            total: cart.reduce((acc, i) => acc + (i.price * i.qty), 0)
        });
        localStorage.removeItem('zolngen_cart');
        alert(`تم استلام طلبكم! رقم التتبع: ${order.id}`);
        location.reload();
    });

    document.getElementById('btn-track')?.addEventListener('click', () => {
        const id = document.getElementById('track-id').value;
        const order = DB.getOrders().find(o => String(o.id) === String(id));
        const res = document.getElementById('track-result');
        if (res) res.innerHTML = order ? `<div style="margin-top:2rem; padding:2rem; background:rgba(212,175,55,0.1); border:1px solid var(--gold); border-radius:15px;">حالة الطلب: <strong style="color:var(--gold);">${order.status.toUpperCase()}</strong></div>` : '<p style="color:#ff4757; margin-top:1.5rem;">رقم الطلب غير صحيح.</p>';
    });

    // --- INITIALIZE ---
    renderProducts();
    updateCartUI();
    const stats = DB.getStats();
    if (document.getElementById('dyn-entities')) document.getElementById('dyn-entities').innerText = stats.entities || 25;

    window.searchProducts = (val) => renderProducts(val);
    window.toggleCart = toggleCart;
    window.generatePDFQuote = () => {
        if (!cart.length) return alert('السلة فارغة!');
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text("ZOLNGEN - Official Quote", 20, 20);
        let y = 40;
        cart.forEach(i => { doc.text(`${i.name} x ${i.qty} = ${(i.price * i.qty).toFixed(2)}`, 20, y); y += 10; });
        doc.text(`Total: ${cart.reduce((acc, i) => acc + (i.price * i.qty), 0).toFixed(2)} JOD`, 20, y + 10);
        doc.save("ZOLNGEN_Quote.pdf");
    };
});
