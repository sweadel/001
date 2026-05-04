// ZOLNGEN STOREFRONT ENGINE v17 - THE ABSOLUTE FINAL STANDARD
let cart = JSON.parse(localStorage.getItem('zolngen_cart')) || [];

// Global Expose
window.addToCart = addToCart;
window.toggleCart = toggleCart;
window.updateQty = updateQty;
window.removeFromCart = removeFromCart;
window.trackOrder = trackOrder;
window.generatePDFQuote = generatePDFQuote;
window.searchProducts = searchProducts;
window.openOrderModal = () => document.getElementById('order-modal').style.display = 'flex';
window.closeOrderModal = () => document.getElementById('order-modal').style.display = 'none';

function renderStorefront(filter = '') {
    const container = document.getElementById('product-container');
    if (!container) return;

    try {
        const products = DB.getProducts().filter(p => 
            !p.isHidden && 
            (p.name.toLowerCase().includes(filter.toLowerCase()) || 
             (p.category || '').toLowerCase().includes(filter.toLowerCase()))
        );

        container.innerHTML = products.length ? products.map(p => `
            <div class="prod-card">
                <div class="img-box">
                    <img src="${p.img}" alt="${p.name}" onerror="this.src='https://placehold.co/400x400/EEE/31343C?text=Hardware'">
                </div>
                <h3>${p.name}</h3>
                <p style="color:#666; font-size:0.8rem;">${p.category || 'أجهزة مؤسسية'}</p>
                <div class="price">${(p.price || 0).toFixed(2)} د.أ</div>
                <button class="btn-add-to-request" onclick="addToCart('${p.id}')">أضف إلى الطلب</button>
            </div>
        `).join('') : '<p style="grid-column:1/-1; text-align:center; padding:100px; color:#555;">لم يتم العثور على أجهزة مطابقة.</p>';
        
        updateCartUI();
    } catch (err) {
        console.error("Storefront Error:", err);
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
            <img src="${item.img}" style="width:40px; height:40px; object-fit:contain; background:#fff; border-radius:5px;" onerror="this.src='https://placehold.co/50x50'">
            <div style="flex:1;">
                <h4 style="font-size:0.8rem; color:#fff;">${item.name}</h4>
                <div style="display:flex; align-items:center; gap:8px; margin-top:5px;">
                    <button onclick="updateQty('${item.id}', -1)" style="background:#222; border:none; color:#fff; width:20px; cursor:pointer;">-</button>
                    <span style="font-size:0.8rem;">${item.qty}</span>
                    <button onclick="updateQty('${item.id}', 1)" style="background:#222; border:none; color:#fff; width:20px; cursor:pointer;">+</button>
                    <span style="margin-right:auto; color:var(--gold); font-weight:700;">${(item.price * item.qty).toFixed(2)}</span>
                </div>
            </div>
            <button onclick="removeFromCart('${item.id}')" style="background:none; border:none; color:#ff4757; cursor:pointer;"><i class="fas fa-trash-alt"></i></button>
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

function toggleCart(force = null) { 
    const sidebar = document.getElementById('cart-sidebar');
    if (!sidebar) return;
    if (force === true) sidebar.classList.add('active');
    else if (force === false) sidebar.classList.remove('active');
    else sidebar.classList.toggle('active');
}

function trackOrder() {
    const id = document.getElementById('track-id')?.value;
    const order = DB.getOrders().find(o => String(o.id) === String(id));
    const result = document.getElementById('track-result');
    if (!result || !id) return;

    if (order) {
        result.innerHTML = `
            <div style="margin-top:20px; padding:20px; background:rgba(212,175,55,0.1); border:1px solid var(--gold); border-radius:10px;">
                <p>رقم الطلب: <strong>${order.id}</strong></p>
                <p>الحالة المباشرة: <strong style="color:var(--gold); text-transform:uppercase;">${order.status}</strong></p>
                <div style="height:4px; background:#111; border-radius:10px; margin-top:15px; overflow:hidden;">
                    <div style="height:100%; background:var(--gold); width:${order.status === 'delivered' ? '100%' : '25%'}; transition:1s;"></div>
                </div>
            </div>
        `;
    } else result.innerHTML = '<p style="color:#ff4757; margin-top:15px;">رقم الطلب غير صحيح أو غير مفعل حالياً.</p>';
}

function generatePDFQuote() {
    if (!cart.length) return alert('السلة فارغة!');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("ZOLNGEN - Official Institutional Quotation", 20, 20);
    let y = 40;
    cart.forEach(i => {
        doc.text(`${i.name} x ${i.qty} = ${(i.price * i.qty).toFixed(2)} JOD`, 20, y);
        y += 10;
    });
    doc.text(`Grand Total: ${cart.reduce((acc, i) => acc + (i.price * i.qty), 0).toFixed(2)} JOD`, 20, y + 10);
    doc.save(`ZOLNGEN_Procurement_${Date.now()}.pdf`);
}

document.getElementById('order-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!cart.length) return alert('السلة فارغة!');

    const orderData = {
        fullName: document.getElementById('full-name').value,
        phone: document.getElementById('phone').value,
        entity: document.getElementById('university').value,
        items: [...cart],
        total: cart.reduce((acc, i) => acc + (i.price * i.qty), 0),
        status: 'pending'
    };
    
    const o = DB.placeOrder(orderData);
    alert(`تم إرسال طلبكم بنجاح! رقم المرجع: ${o.id}`);
    cart = []; saveCart();
    location.reload();
});

document.addEventListener('DOMContentLoaded', () => {
    renderStorefront();
});
