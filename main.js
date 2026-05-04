// ZOLNGEN Storefront Engine v16 - PIXEL PERFECT CLONE
let cart = JSON.parse(localStorage.getItem('zolngen_cart')) || [];

// Expose to Window
window.addToCart = addToCart;
window.toggleCart = toggleCart;
window.removeFromCart = removeFromCart;
window.updateQty = updateQty;
window.searchProducts = searchProducts;
window.trackOrder = trackOrder;
window.generatePDFQuote = generatePDFQuote;
window.openOrderModal = () => document.getElementById('order-modal').style.display = 'flex';
window.closeOrderModal = () => document.getElementById('order-modal').style.display = 'none';

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
            <div class="prod-card">
                <div class="img-box">
                    <img src="${p.img}" alt="${p.name}" onerror="this.src='https://placehold.co/400x400/EEE/31343C?text=Hardware'">
                </div>
                <h3>${p.name}</h3>
                <p>${p.category === 'Laptops' ? 'لابتوب أعمال' : p.category === 'Printers' ? 'طابعة ليزر' : 'شاشة عرض'}</p>
                <div class="price">${(p.price || 0).toFixed(2)} د.أ</div>
                <button class="btn-add-to-request" onclick="addToCart('${p.id}')">أضف إلى الطلب</button>
            </div>
        `).join('') : '<p style="grid-column:1/-1; text-align:center; color:#555; padding:50px;">لا توجد منتجات مطابقة.</p>';
        
        updateCartUI();
    } catch (err) {
        console.error("Render Error:", err);
    }
}

function searchProducts(val) { renderStorefront(val); }

function addToCart(id) {
    const product = DB.getProducts().find(p => String(p.id) === String(id));
    if (!product) return;

    const existing = cart.find(item => String(item.id) === String(id));
    if (existing) existing.qty++;
    else cart.push({ ...product, qty: 1 });
    
    saveCart();
    updateCartUI();
    toggleCart(true);
}

function updateCartUI() {
    const itemsContainer = document.getElementById('cart-items');
    const countDisplay = document.getElementById('cart-count');
    const totalDisplay = document.getElementById('cart-total-val');
    
    if (countDisplay) countDisplay.innerText = cart.reduce((acc, i) => acc + i.qty, 0);
    if (!itemsContainer) return;

    itemsContainer.innerHTML = cart.length ? cart.map(item => `
        <div style="display:flex; gap:12px; margin-bottom:15px; padding:12px; background:rgba(255,255,255,0.03); border-radius:10px; align-items:center;">
            <img src="${item.img}" style="width:50px; height:50px; object-fit:contain; background:#fff; border-radius:5px;" onerror="this.src='https://placehold.co/50x50'">
            <div style="flex:1;">
                <h4 style="font-size:0.85rem; margin-bottom:4px; color:#fff;">${item.name}</h4>
                <div style="display:flex; align-items:center; gap:10px;">
                    <button onclick="updateQty('${item.id}', -1)" style="background:#222; border:none; color:#fff; width:20px; cursor:pointer;">-</button>
                    <span style="font-size:0.8rem; color:#fff;">${item.qty}</span>
                    <button onclick="updateQty('${item.id}', 1)" style="background:#222; border:none; color:#fff; width:20px; cursor:pointer;">+</button>
                    <span style="margin-right:auto; color:var(--gold); font-weight:700;">${(item.price * item.qty).toFixed(2)}</span>
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
    const order = DB.getOrders().find(o => o.id === id);
    const result = document.getElementById('track-result');
    if (!result || !id) return;

    if (order) {
        result.innerHTML = `<p style="margin-top:15px; color:var(--gold);">حالة الطلب: <strong>${order.status.toUpperCase()}</strong></p>`;
    } else result.innerHTML = '<p style="color:#ff4757; margin-top:15px;">رقم الطلب غير صحيح.</p>';
}

function generatePDFQuote() {
    if (!cart.length) return alert('يجب إضافة منتجات أولاً');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("ZOLNGEN Official Procurement Quote", 20, 20);
    let y = 40;
    cart.forEach(i => {
        doc.text(`${i.name} x ${i.qty} = ${(i.price * i.qty).toFixed(2)} JOD`, 20, y);
        y += 10;
    });
    doc.text(`Total: ${cart.reduce((acc, i) => acc + (i.price * i.qty), 0).toFixed(2)} JOD`, 20, y + 10);
    doc.save("ZOLNGEN_Procurement.pdf");
}

document.addEventListener('DOMContentLoaded', () => {
    renderStorefront();
});
