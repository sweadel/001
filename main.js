// ZOLNGEN Storefront Logic v10
let cart = JSON.parse(localStorage.getItem('zolngen_cart')) || [];
let currentCategory = 'all';

// 1. Initial Render & Search
function renderStorefront(filter = '') {
    const products = DB.getProducts().filter(p => !p.isHidden && (p.name.toLowerCase().includes(filter.toLowerCase()) || p.category.includes(filter)));
    const container = document.getElementById('product-container');
    if (!container) return;

    container.innerHTML = products.length ? products.map(p => `
        <div class="product-card" data-category="${p.category}">
            ${p.tag ? `<span class="product-tag">${p.tag}</span>` : ''}
            <div class="product-img">
                <img src="${p.img}" alt="${p.name}">
            </div>
            <div class="product-info">
                <h3>${p.name}</h3>
                <p class="product-supplier">${p.supplier || 'M-Trade Jordan'}</p>
                <div class="product-price-row">
                    <span class="price gold-gradient-text">${p.price.toFixed(2)} د.أ</span>
                    <button class="add-to-cart-btn" onclick="addToCart(${p.id})"><i class="fas fa-plus"></i></button>
                </div>
                <button class="btn-outline btn-sm" style="width:100%; margin-top:10px;" onclick="addToComparison(${p.id})">مقارنة المواصفات</button>
            </div>
        </div>
    `).join('') : '<div class="empty-state"><i class="fas fa-search"></i><p>عذراً، لم نجد نتائج تطابق بحثك.</p></div>';
    
    updateCartUI();
}

window.searchProducts = (val) => {
    renderStorefront(val);
};

// 2. Cart Management
function addToCart(id) {
    const product = DB.getProducts().find(p => p.id === id);
    const existing = cart.find(item => item.id === id);
    
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    
    saveCart();
    updateCartUI();
    toggleCart(true);
}

function updateCartUI() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total-val');
    
    if (!cartItems) return;

    cartCount.innerText = cart.reduce((acc, item) => acc + item.qty, 0);
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.img}" style="width: 50px;">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>${item.price.toFixed(2)} د.أ</p>
                <div class="qty-control">
                    <button onclick="updateQty(${item.id}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button onclick="updateQty(${item.id}, 1)">+</button>
                </div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${item.id})">&times;</button>
        </div>
    `).join('');
    
    const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    cartTotal.innerText = total.toFixed(2);
}

function updateQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) removeFromCart(id);
        else {
            saveCart();
            updateCartUI();
        }
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartUI();
}

function saveCart() { localStorage.setItem('zolngen_cart', JSON.stringify(cart)); }
function toggleCart(forceOpen = false) { 
    const sidebar = document.getElementById('cart-sidebar');
    if (forceOpen) sidebar.classList.add('active');
    else sidebar.classList.toggle('active');
}

// 3. Stats Counter Animation
function initCounters() {
    const counters = document.querySelectorAll('.counter');
    const speed = 200;

    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            const inc = target / speed;

            if (count < target) {
                counter.innerText = Math.ceil(count + inc);
                setTimeout(updateCount, 1);
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    });
}

// 4. Order Tracking
function trackOrder() {
    const id = document.getElementById('track-id').value;
    const orders = DB.getOrders();
    const order = orders.find(o => o.id === id);
    const result = document.getElementById('track-result');
    
    if (order) {
        result.innerHTML = `
            <div class="tracking-status">
                <p>الحالة: <strong>قيد المراجعة الفنية</strong></p>
                <p>تاريخ الطلب: ${order.date}</p>
                <div class="progress-bar"><div class="progress-fill" style="width: 25%;"></div></div>
            </div>
        `;
    } else {
        result.innerHTML = '<p style="color: #ff4757;">عذراً، رقم الطلب غير موجود.</p>';
    }
}

// 5. Order Form Submission
document.getElementById('order-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const orderData = {
        fullName: document.getElementById('full-name').value,
        phone: document.getElementById('phone').value,
        entity: document.getElementById('university').value,
        email: document.getElementById('email').value,
        notes: document.getElementById('notes').value,
        items: cart,
        total: cart.reduce((acc, i) => acc + (i.price * i.qty), 0)
    };
    
    const orderId = DB.placeOrder(orderData);
    alert(`تم استلام طلبكم بنجاح! رقم المرجع الخاص بكم هو: ${orderId}`);
    cart = [];
    saveCart();
    location.reload();
});

// 6. PDF Generation (jsPDF)
function generatePDFQuote() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.text("ZOLNGEN - عرض سعر رسمي", 105, 20, { align: "center" });
    doc.text("-----------------------------------", 105, 25, { align: "center" });
    
    let y = 40;
    cart.forEach((item, index) => {
        doc.text(`${index + 1}. ${item.name} - ${item.qty} x ${item.price} JOD`, 20, y);
        y += 10;
    });
    
    const total = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    doc.text(`إجمالي القيمة: ${total.toFixed(2)} دينار أردني`, 20, y + 10);
    doc.save(`Zolngen_Quote_${Date.now()}.pdf`);
}

function openOrderModal() { document.getElementById('order-modal').style.display = 'flex'; }
function closeOrderModal() { document.getElementById('order-modal').style.display = 'none'; }
function scrollToForm() { closeOrderModal(); window.scrollTo({ top: document.getElementById('featured').offsetTop, behavior: 'smooth' }); openOrderModal(); }

document.addEventListener('DOMContentLoaded', () => {
    renderStorefront();
    initCounters();
});
