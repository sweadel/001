// ZOLNGEN Storefront Core v14 - Final Stable
let cart = JSON.parse(localStorage.getItem('zolngen_cart')) || [];

// 1. Render Storefront with Safety Checks
function renderStorefront(filter = '') {
    try {
        const products = DB.getProducts().filter(p => 
            !p.isHidden && 
            (p.name.toLowerCase().includes(filter.toLowerCase()) || 
             p.category.toLowerCase().includes(filter.toLowerCase()))
        );
        const container = document.getElementById('product-container');
        if (!container) return;

        container.innerHTML = products.length ? products.map(p => `
            <div class="product-card">
                ${p.tag ? `<span style="position:absolute; top:20px; right:20px; background:var(--primary-gold); color:#000; padding:2px 10px; border-radius:30px; font-size:0.7rem; font-weight:700; z-index:5;">${p.tag}</span>` : ''}
                <div class="product-img">
                    <img src="${p.img}" alt="${p.name}" onerror="this.src='https://placehold.co/400x400/EEE/31343C?text=Hardware+Asset'">
                </div>
                <div class="product-info">
                    <h3 style="margin-bottom:10px; font-size:1.2rem;">${p.name}</h3>
                    <p style="color:#666; font-size:0.8rem; margin-bottom:15px;">${p.supplier || 'المورد المعتمد'}</p>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span class="gold-gradient-text" style="font-weight:800; font-size:1.3rem;">${p.price.toFixed(2)} د.أ</span>
                        <button class="btn-primary" style="padding:10px 15px; border-radius:10px;" onclick="addToCart(${p.id})">
                            <i class="fas fa-cart-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('') : '<div style="grid-column:1/-1; text-align:center; padding:100px; color:#444;"><i class="fas fa-box-open fa-3x"></i><p style="margin-top:20px;">لم يتم العثور على أجهزة تطابق هذا البحث.</p></div>';
        
        updateCartUI();
    } catch (err) {
        console.error("Storefront Render Error:", err);
    }
}

window.searchProducts = (val) => renderStorefront(val);

// 2. Cart Engine
function addToCart(id) {
    const product = DB.getProducts().find(p => p.id === id);
    if (!product) return;

    const existing = cart.find(item => item.id === id);
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
    
    if (!itemsContainer) return;

    countDisplay.innerText = cart.reduce((acc, i) => acc + i.qty, 0);
    
    itemsContainer.innerHTML = cart.map(item => `
        <div style="display:flex; gap:15px; margin-bottom:20px; padding:15px; background:rgba(255,255,255,0.02); border-radius:15px; align-items:center;">
            <img src="${item.img}" style="width:60px; height:60px; object-fit:contain; background:#fff; border-radius:8px;" onerror="this.src='https://placehold.co/100x100'">
            <div style="flex:1;">
                <h4 style="font-size:0.9rem; margin-bottom:5px;">${item.name}</h4>
                <p style="color:var(--primary-gold); font-size:0.85rem;">${item.price.toFixed(2)} د.أ</p>
                <div style="display:flex; align-items:center; gap:10px; margin-top:8px;">
                    <button onclick="updateQty(${item.id}, -1)" style="background:none; border:1px solid #333; color:#fff; width:25px; cursor:pointer;">-</button>
                    <span>${item.qty}</span>
                    <button onclick="updateQty(${item.id}, 1)" style="background:none; border:1px solid #333; color:#fff; width:25px; cursor:pointer;">+</button>
                </div>
            </div>
            <button onclick="removeFromCart(${item.id})" style="background:none; border:none; color:#ff4757; cursor:pointer;"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');
    
    const total = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    totalDisplay.innerText = total.toFixed(2);
}

function updateQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) removeFromCart(id);
        else saveCart(), updateCartUI();
    }
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    updateCartUI();
}

function saveCart() { localStorage.setItem('zolngen_cart', JSON.stringify(cart)); }
function toggleCart(open = false) { 
    const sidebar = document.getElementById('cart-sidebar');
    if (open) sidebar.classList.add('active');
    else sidebar.classList.toggle('active');
}

// 3. Automated Stats
function initCounters() {
    const counters = document.querySelectorAll('.counter');
    counters.forEach(c => {
        const target = +c.getAttribute('data-target');
        let count = 0;
        const inc = target / 100;
        const timer = setInterval(() => {
            count += inc;
            if (count >= target) {
                c.innerText = target;
                clearInterval(timer);
            } else c.innerText = Math.ceil(count);
        }, 20);
    });
}

// 4. Order Tracking
function trackOrder() {
    const id = document.getElementById('track-id').value;
    const order = DB.getOrders().find(o => o.id === id);
    const result = document.getElementById('track-result');
    if (!result) return;

    if (order) {
        result.innerHTML = `
            <div style="margin-top:20px; padding:20px; background:rgba(212,175,55,0.05); border-radius:15px; border:1px solid var(--glass-border);">
                <p style="margin-bottom:10px;">الحالة: <strong style="color:var(--primary-gold);">${(order.status || 'في المعالجة').toUpperCase()}</strong></p>
                <p style="font-size:0.8rem; color:#666;">تاريخ الاعتماد: ${order.date}</p>
                <div style="height:6px; background:#111; border-radius:10px; margin-top:15px; overflow:hidden;">
                    <div style="height:100%; background:var(--primary-gold); width:${order.status === 'delivered' ? '100%' : '35%'}; transition:1s;"></div>
                </div>
            </div>
        `;
    } else {
        result.innerHTML = '<p style="color:#ff4757; margin-top:20px;">عذراً، رقم المرجع غير صحيح.</p>';
    }
}

// 5. Order Execution
document.getElementById('order-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!cart.length) return alert('السلة فارغة!');

    const orderData = {
        fullName: document.getElementById('full-name').value,
        phone: document.getElementById('phone').value,
        entity: document.getElementById('university').value,
        email: document.getElementById('email').value,
        notes: document.getElementById('notes').value,
        items: [...cart],
        total: cart.reduce((acc, i) => acc + (i.price * i.qty), 0),
        status: 'pending'
    };
    
    const order = DB.placeOrder(orderData);
    alert(`تم استلام طلبكم بنجاح! رقم المرجع: ${order.id}`);
    cart = [];
    saveCart();
    location.reload();
});

// 6. PDF Generation
function generatePDFQuote() {
    if (!cart.length) return alert('السلة فارغة!');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(22); doc.text("ZOLNGEN - Official Quotation", 105, 20, { align: "center" });
    doc.setFontSize(12); doc.text("--------------------------------------------------", 105, 25, { align: "center" });
    let y = 45;
    doc.text("Item Details", 20, y); y += 10;
    cart.forEach(i => {
        doc.text(`- ${i.name} (Qty: ${i.qty}) : ${(i.price * i.qty).toFixed(2)} JOD`, 20, y);
        y += 10;
    });
    const total = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    doc.setFontSize(16); doc.text(`Total: ${total.toFixed(2)} JOD`, 20, y + 15);
    doc.save(`ZOLNGEN_Quote_${Date.now()}.pdf`);
}

document.addEventListener('DOMContentLoaded', () => {
    renderStorefront();
    initCounters();
});
