<<<<<<< HEAD
// ZOLNGEN Storefront Engine v16 - PIXEL PERFECT CLONE
let cart = JSON.parse(localStorage.getItem('zolngen_cart')) || [];

// Expose to Window
=======
// ZOLNGEN Storefront Engine v15 - ULTIMATE STABLE
let cart = JSON.parse(localStorage.getItem('zolngen_cart')) || [];

// 1. Expose to Window for direct HTML access
>>>>>>> 0622911ec337ce69505d775f200071a4e2e11130
window.addToCart = addToCart;
window.toggleCart = toggleCart;
window.removeFromCart = removeFromCart;
window.updateQty = updateQty;
window.searchProducts = searchProducts;
window.trackOrder = trackOrder;
window.generatePDFQuote = generatePDFQuote;
<<<<<<< HEAD
window.openOrderModal = () => document.getElementById('order-modal').style.display = 'flex';
window.closeOrderModal = () => document.getElementById('order-modal').style.display = 'none';
=======
>>>>>>> 0622911ec337ce69505d775f200071a4e2e11130

function renderStorefront(filter = '') {
    const container = document.getElementById('product-container');
    if (!container) return;

    try {
        const products = DB.getProducts().filter(p => 
            !p.isHidden && 
            (p.name.toLowerCase().includes(filter.toLowerCase()) || 
             p.category.toLowerCase().includes(filter.toLowerCase()))
        );

        // Render as White Premium Cards
        container.innerHTML = products.length ? products.map(p => `
<<<<<<< HEAD
            <div class="prod-card">
                <div class="img-box">
                    <img src="${p.img}" alt="${p.name}" onerror="this.src='https://placehold.co/400x400/EEE/31343C?text=Hardware'">
=======
            <div class="product-card">
                ${p.tag ? `<span style="position:absolute; top:20px; right:20px; background:var(--primary-gold); color:#000; padding:2px 10px; border-radius:30px; font-size:0.7rem; font-weight:700; z-index:5;">${p.tag}</span>` : ''}
                <div class="product-img">
                    <img src="${p.img}" alt="${p.name}" onerror="this.src='https://placehold.co/400x400/EEE/31343C?text=Hardware'">
                </div>
                <div class="product-info">
                    <h3 style="margin-bottom:10px; font-size:1.1rem;">${p.name}</h3>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:15px;">
                        <span class="gold-gradient-text" style="font-weight:800; font-size:1.2rem;">${(p.price || 0).toFixed(2)} د.أ</span>
                        <button class="btn-primary" onclick="addToCart('${p.id}')">
                            <i class="fas fa-cart-plus"></i> إضافة
                        </button>
                    </div>
>>>>>>> 0622911ec337ce69505d775f200071a4e2e11130
                </div>
                <h3>${p.name}</h3>
                <p>${p.category === 'Laptops' ? 'لابتوب أعمال' : p.category === 'Printers' ? 'طابعة ليزر' : 'شاشة عرض'}</p>
                <div class="price">${(p.price || 0).toFixed(2)} د.أ</div>
                <button class="btn-add-to-request" onclick="addToCart('${p.id}')">أضف إلى الطلب</button>
            </div>
<<<<<<< HEAD
        `).join('') : '<p style="grid-column:1/-1; text-align:center; color:#555; padding:50px;">لا توجد منتجات مطابقة.</p>';
=======
        `).join('') : '<p style="grid-column:1/-1; text-align:center; padding:100px; color:#555;">لا توجد نتائج مطابقة.</p>';
>>>>>>> 0622911ec337ce69505d775f200071a4e2e11130
        
        updateCartUI();
    } catch (err) {
        console.error("Render Error:", err);
    }
}

function searchProducts(val) { renderStorefront(val); }

function addToCart(id) {
<<<<<<< HEAD
    const product = DB.getProducts().find(p => String(p.id) === String(id));
    if (!product) return;
=======
    console.log("Adding to cart ID:", id);
    const product = DB.getProducts().find(p => String(p.id) === String(id));
    if (!product) return alert('المنتج غير موجود');
>>>>>>> 0622911ec337ce69505d775f200071a4e2e11130

    const existing = cart.find(item => String(item.id) === String(id));
    if (existing) existing.qty++;
    else cart.push({ ...product, qty: 1 });
    
    saveCart();
    updateCartUI();
    toggleCart(true); // Open sidebar automatically
}

function updateCartUI() {
    const itemsContainer = document.getElementById('cart-items');
    const countDisplay = document.getElementById('cart-count');
    const totalDisplay = document.getElementById('cart-total-val');
    
    if (countDisplay) countDisplay.innerText = cart.reduce((acc, i) => acc + i.qty, 0);
    if (!itemsContainer) return;

    itemsContainer.innerHTML = cart.length ? cart.map(item => `
<<<<<<< HEAD
        <div style="display:flex; gap:12px; margin-bottom:15px; padding:12px; background:rgba(255,255,255,0.03); border-radius:10px; align-items:center;">
            <img src="${item.img}" style="width:50px; height:50px; object-fit:contain; background:#fff; border-radius:5px;" onerror="this.src='https://placehold.co/50x50'">
            <div style="flex:1;">
                <h4 style="font-size:0.85rem; margin-bottom:4px; color:#fff;">${item.name}</h4>
                <div style="display:flex; align-items:center; gap:10px;">
                    <button onclick="updateQty('${item.id}', -1)" style="background:#222; border:none; color:#fff; width:20px; cursor:pointer;">-</button>
                    <span style="font-size:0.8rem; color:#fff;">${item.qty}</span>
                    <button onclick="updateQty('${item.id}', 1)" style="background:#222; border:none; color:#fff; width:20px; cursor:pointer;">+</button>
                    <span style="margin-right:auto; color:var(--gold); font-weight:700;">${(item.price * item.qty).toFixed(2)}</span>
=======
        <div style="display:flex; gap:12px; margin-bottom:15px; padding:12px; background:rgba(255,255,255,0.03); border-radius:12px; align-items:center;">
            <img src="${item.img}" style="width:50px; height:50px; object-fit:contain; background:#fff; border-radius:5px;" onerror="this.src='https://placehold.co/50x50'">
            <div style="flex:1;">
                <h4 style="font-size:0.85rem; margin-bottom:4px;">${item.name}</h4>
                <div style="display:flex; align-items:center; gap:10px;">
                    <button onclick="updateQty('${item.id}', -1)" style="background:#222; border:none; color:#fff; width:20px; border-radius:4px; cursor:pointer;">-</button>
                    <span style="font-size:0.8rem;">${item.qty}</span>
                    <button onclick="updateQty('${item.id}', 1)" style="background:#222; border:none; color:#fff; width:20px; border-radius:4px; cursor:pointer;">+</button>
                    <span style="margin-right:auto; color:var(--primary-gold); font-weight:700;">${(item.price * item.qty).toFixed(2)}</span>
>>>>>>> 0622911ec337ce69505d775f200071a4e2e11130
                </div>
            </div>
            <button onclick="removeFromCart('${item.id}')" style="background:none; border:none; color:#ff4757; cursor:pointer; padding:5px;"><i class="fas fa-trash-alt"></i></button>
        </div>
    `).join('') : '<p style="text-align:center; color:#444; margin-top:50px;">السلة فارغة</p>';
    
    const total = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    if (totalDisplay) totalDisplay.innerText = total.toFixed(2);
}

function updateQty(id, delta) {
    const item = cart.find(i => String(i.id) === String(id));
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) removeFromCart(id);
        else saveCart(), updateCartUI();
    }
}

function removeFromCart(id) {
    cart = cart.filter(i => String(i.id) !== String(id));
    saveCart();
    updateCartUI();
}

function saveCart() { localStorage.setItem('zolngen_cart', JSON.stringify(cart)); }

function toggleCart(forceOpen = null) { 
    const sidebar = document.getElementById('cart-sidebar');
    if (!sidebar) return;
    if (forceOpen === true) sidebar.classList.add('active');
    else if (forceOpen === false) sidebar.classList.remove('active');
    else sidebar.classList.toggle('active');
}

function trackOrder() {
    const id = document.getElementById('track-id')?.value;
<<<<<<< HEAD
=======
    if (!id) return;
>>>>>>> 0622911ec337ce69505d775f200071a4e2e11130
    const order = DB.getOrders().find(o => o.id === id);
    const result = document.getElementById('track-result');
    if (!result || !id) return;

    if (order) {
<<<<<<< HEAD
        result.innerHTML = `<p style="margin-top:15px; color:var(--gold);">حالة الطلب: <strong>${order.status.toUpperCase()}</strong></p>`;
    } else result.innerHTML = '<p style="color:#ff4757; margin-top:15px;">رقم الطلب غير صحيح.</p>';
=======
        result.innerHTML = `
            <div style="margin-top:20px; padding:20px; background:rgba(212,175,55,0.1); border-radius:15px; border:1px solid var(--primary-gold);">
                <p>الحالة المباشرة: <strong style="color:var(--primary-gold);">${(order.status || 'pending').toUpperCase()}</strong></p>
                <p style="font-size:0.8rem; color:#888; margin-top:5px;">رقم الطلب: ${order.id}</p>
            </div>
        `;
    } else result.innerHTML = '<p style="color:#ff4757; margin-top:20px;">الرقم غير موجود في سجلاتنا.</p>';
>>>>>>> 0622911ec337ce69505d775f200071a4e2e11130
}

function generatePDFQuote() {
    if (!cart.length) return alert('يجب إضافة منتجات أولاً');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
<<<<<<< HEAD
    doc.text("ZOLNGEN Official Procurement Quote", 20, 20);
=======
    doc.text("ZOLNGEN Official Quotation", 20, 20);
>>>>>>> 0622911ec337ce69505d775f200071a4e2e11130
    let y = 40;
    cart.forEach(i => {
        doc.text(`${i.name} x ${i.qty} = ${(i.price * i.qty).toFixed(2)} JOD`, 20, y);
        y += 10;
    });
    doc.text(`Total: ${cart.reduce((acc, i) => acc + (i.price * i.qty), 0).toFixed(2)} JOD`, 20, y + 10);
<<<<<<< HEAD
    doc.save("ZOLNGEN_Procurement.pdf");
=======
    doc.save("ZOLNGEN_Quotation.pdf");
>>>>>>> 0622911ec337ce69505d775f200071a4e2e11130
}

document.addEventListener('DOMContentLoaded', () => {
    renderStorefront();
});
