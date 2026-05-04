// ZOLNGEN Ultimate Storefront JS v5
let cart = [];
let currency = 'JOD';
let compareList = [];

// 1. Render Storefront with Comparison Features
function renderStorefront() {
    const products = DB.getProducts();
    const container = document.getElementById('product-container');
    if (!container) return;

    container.innerHTML = products.map(p => {
        const displayPrice = currency === 'JOD' ? p.price : (p.price / 0.71);
        const lowStock = p.stock < 10;
        
        return `
            <div class="product-card" data-category="${p.category}">
                <div class="product-img">
                    <img src="${p.img}" alt="${p.name}">
                    ${lowStock ? '<span style="position: absolute; top: 10px; right: 10px; background: #ff4757; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem;">مخزون منخفض!</span>' : ''}
                </div>
                <div class="product-info">
                    <span class="product-tag">${p.tag}</span>
                    <h3>${p.name}</h3>
                    <p class="product-price">${displayPrice.toFixed(2)} ${currency}</p>
                    <div style="display: flex; gap: 5px; margin-bottom: 1rem;">
                        <button class="btn-outline btn-sm" onclick="addToCompare(${p.id})" style="flex: 1; font-size: 0.7rem;"><i class="fas fa-exchange-alt"></i> مقارنة</button>
                        <button class="btn-outline btn-sm" onclick="alert('جارٍ تحميل ملفات التعريف لـ ${p.name}')" style="flex: 1; font-size: 0.7rem;"><i class="fas fa-download"></i> تعريفات</button>
                    </div>
                    <button class="btn-primary" style="width: 100%; justify-content: center;" onclick="addToCart(${p.id})">أضف للطلب</button>
                </div>
            </div>
        `;
    }).join('');
}

// 2. Currency Toggle
window.toggleCurrency = () => {
    currency = currency === 'JOD' ? 'USD' : 'JOD';
    document.getElementById('currency-label').innerText = currency;
    renderStorefront();
    updateCartUI();
};

// 3. Product Comparison
window.addToCompare = (id) => {
    const p = DB.getProducts().find(p => p.id == id);
    if (compareList.length >= 3) {
        alert("يمكنك مقارنة 3 منتجات بحد أقصى");
        return;
    }
    if (compareList.find(item => item.id == id)) return;
    
    compareList.push(p);
    renderCompare();
    document.getElementById('compare-modal').style.display = 'flex';
};

function renderCompare() {
    const grid = document.getElementById('compare-grid');
    grid.innerHTML = compareList.map(p => `
        <div class="comp-card" style="text-align: center; border: 1px solid var(--glass-border); padding: 1.5rem; border-radius: 12px;">
            <img src="${p.img}" style="width: 100px; margin-bottom: 1rem;">
            <h4>${p.name}</h4>
            <p style="color: var(--primary-gold); font-weight: bold; margin: 1rem 0;">${p.price} د.أ</p>
            <ul style="font-size: 0.8rem; color: var(--text-muted); text-align: right;">
                <li>الفئة: ${p.category}</li>
                <li>المخزون: ${p.stock}</li>
                <li>الحالة: ${p.tag}</li>
            </ul>
            <button class="btn-outline btn-sm" style="margin-top: 1rem;" onclick="removeFromCompare(${p.id})">حذف</button>
        </div>
    `).join('');
}

window.closeCompare = () => document.getElementById('compare-modal').style.display = 'none';
window.removeFromCompare = (id) => {
    compareList = compareList.filter(p => p.id != id);
    if (compareList.length === 0) closeCompare();
    else renderCompare();
};

// 4. Order Tracking
window.trackOrder = () => {
    const id = document.getElementById('track-id').value.trim();
    const order = DB.getOrders().find(o => o.id === id);
    if (order) {
        alert(`حالة الطلب ${id}:\nالجهة: ${order.entity}\nالحالة: قيد التجهيز الفني\nالتاريخ: ${order.date}`);
    } else {
        alert("عذراً، لم يتم العثور على طلب بهذا الرقم.");
    }
};

// 5. PDF Generation (Quotation)
window.generatePDFQuote = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.text("ZOLNGEN - Official Quotation", 10, 10);
    doc.text("Date: " + new Date().toLocaleDateString(), 10, 20);
    doc.text("----------------------------------", 10, 25);
    
    let y = 35;
    cart.forEach(item => {
        doc.text(`${item.name} x ${item.qty} : ${(item.price * item.qty).toFixed(2)} JOD`, 10, y);
        y += 10;
    });
    
    doc.text("----------------------------------", 10, y);
    const total = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    doc.text(`Total: ${total.toFixed(2)} JOD`, 10, y + 10);
    
    doc.save("ZOLNGEN_Quotation.pdf");
};

// 6. Existing Logic (Modified)
function addToCart(id) {
    const product = DB.getProducts().find(p => p.id == id);
    const existing = cart.find(item => item.id == id);
    if (existing) existing.qty++;
    else cart.push({ ...product, qty: 1 });
    updateCartUI();
    document.getElementById('cart-sidebar').classList.add('open');
}

function updateCartUI() {
    const cartList = document.getElementById('cart-items-list');
    const cartCountEl = document.getElementById('cart-count');
    const cartTotalEl = document.getElementById('cart-total');
    const footer = document.getElementById('cart-footer');
    const summaryText = document.getElementById('summary-text');
    const submitBtn = document.getElementById('submit-order-btn');

    const totalQty = cart.reduce((acc, i) => acc + i.qty, 0);
    const totalPrice = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    const finalPrice = currency === 'JOD' ? totalPrice : (totalPrice / 0.71);

    if (cartCountEl) cartCountEl.innerText = totalQty;
    if (cartTotalEl) cartTotalEl.innerText = finalPrice.toFixed(2) + ' ' + currency;

    if (cart.length === 0) {
        footer.style.display = 'none';
        summaryText.innerText = 'السلة فارغة حالياً.';
        submitBtn.disabled = true;
    } else {
        footer.style.display = 'block';
        summaryText.innerText = `ملخص الطلب: ${totalQty} منتجات بقيمة ${totalPrice.toFixed(2)} د.أ`;
        submitBtn.disabled = false;
        cartList.innerHTML = cart.map(item => `
            <div style="display: flex; gap: 1rem; padding: 1rem; border-bottom: 1px solid var(--glass-border); align-items: center;">
                <img src="${item.img}" style="width: 40px; height: 40px; background: white; border-radius: 4px;">
                <div style="flex: 1;">
                    <h4 style="font-size: 0.8rem;">${item.name}</h4>
                    <p style="color: var(--primary-gold); font-size: 0.8rem;">${item.qty} × ${item.price} د.أ</p>
                </div>
                <i class="fas fa-trash" style="color: #ff4757; cursor: pointer;" onclick="removeFromCart(${item.id})"></i>
            </div>
        `).join('');
    }
}

window.removeFromCart = (id) => { cart = cart.filter(i => i.id != id); updateCartUI(); };
window.scrollToContact = () => { document.getElementById('cart-sidebar').classList.remove('open'); document.getElementById('contact').scrollIntoView({ behavior: 'smooth' }); };

document.getElementById('order-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const orderData = {
        fullName: document.getElementById('full-name').value,
        phone: document.getElementById('phone-number').value,
        entity: document.getElementById('entity-select').value,
        email: document.getElementById('entity-email').value,
        notes: document.getElementById('order-notes').value,
        items: cart,
        total: cart.reduce((acc, i) => acc + (i.price * i.qty), 0)
    };
    const newOrder = DB.placeOrder(orderData);
    alert(`تم الإرسال بنجاح! رقم المرجع الخاص بك هو: ${newOrder.id}\nيمكنك تتبع الطلب من أعلى الموقع.`);
    cart = []; updateCartUI(); e.target.reset();
});

// Filter & Nav Logic
window.filterProducts = (category) => {
    const cards = document.querySelectorAll('.product-card');
    document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
    event.currentTarget.classList.add('active');
    cards.forEach(c => c.style.display = (category === 'all' || c.getAttribute('data-category') === category) ? 'block' : 'none');
};

document.getElementById('open-cart')?.addEventListener('click', () => document.getElementById('cart-sidebar').classList.add('open'));
document.querySelector('.close-cart')?.addEventListener('click', () => document.getElementById('cart-sidebar').classList.remove('open'));

document.addEventListener('DOMContentLoaded', renderStorefront);
