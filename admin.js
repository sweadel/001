// ZOLNGEN Ultimate Multi-Language ERP JS v9
let salesChart;
let currentLang = 'ar';

const translations = {
    ar: {
        dashboard: 'الإحصائيات', orders: 'الطلبات', products: 'المستودع', audit: 'السجلات', settings: 'الإعدادات',
        sales: 'المبيعات', activeOrders: 'الطلبات النشطة', entities: 'الجهات', stock: 'المخزون',
        search: 'بحث...', logout: 'خروج', orderId: 'رقم الطلب', entity: 'الجهة', date: 'التاريخ',
        total: 'الإجمالي', status: 'الحالة', actions: 'إجراءات', view: 'عرض',
        product: 'المنتج', supplier: 'المورد', price: 'السعر', qty: 'الكمية',
        add: 'إضافة', save: 'حفظ', cancel: 'إلغاء', name: 'الاسم', phone: 'الهاتف', notes: 'ملاحظات',
        hide: 'إخفاء', show: 'إظهار', delete: 'حذف', edit: 'تعديل', admin: 'المدير'
    },
    en: {
        dashboard: 'Dashboard', orders: 'Orders', products: 'Inventory', audit: 'Audit Log', settings: 'Settings',
        sales: 'Total Sales', activeOrders: 'Active Orders', entities: 'Entities', stock: 'Total Stock',
        search: 'Search...', logout: 'Logout', orderId: 'Order ID', entity: 'Entity', date: 'Date',
        total: 'Total', status: 'Status', actions: 'Actions', view: 'View',
        product: 'Product', supplier: 'Supplier', price: 'Price', qty: 'Qty',
        add: 'Add', save: 'Save', cancel: 'Cancel', name: 'Name', phone: 'Phone', notes: 'Notes',
        hide: 'Hide', show: 'Show', delete: 'Delete', edit: 'Edit', admin: 'Super Admin'
    }
};

// 1. Language Toggle
window.toggleLang = () => {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    updateAdminUI();
    DB.logAction(`Changed language to ${currentLang.toUpperCase()}`);
};

function updateAdminUI() {
    const t = translations[currentLang];
    document.querySelectorAll('[data-t]').forEach(el => {
        const key = el.getAttribute('data-t');
        if (t[key]) el.innerText = t[key];
    });
    document.querySelectorAll('[data-t-placeholder]').forEach(el => {
        const key = el.getAttribute('data-t-placeholder');
        if (t[key]) el.placeholder = t[key];
    });
    
    // Refresh content
    const activeTab = document.querySelector('.nav-item.active').getAttribute('onclick').match(/'([^']+)'/)[1];
    showTab(activeTab);
}

// 2. Auth Logic
document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (document.getElementById('username').value === 'admin' && document.getElementById('password').value === 'admin123') {
        document.getElementById('login-overlay').style.display = 'none';
        document.getElementById('admin-container').style.display = 'block';
        updateAdminUI();
        initDashboard();
    } else {
        document.getElementById('login-error').style.display = 'block';
    }
});

function logout() { location.reload(); }

// 3. Tab Management
function showTab(tab) {
    document.querySelectorAll('.tab-content-pro').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(l => l.classList.remove('active'));
    document.getElementById(tab + '-tab').style.display = 'block';
    
    // Set active class
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('onclick').includes(tab)) item.classList.add('active');
    });

    if (tab === 'dashboard') initDashboard();
    if (tab === 'products') renderProducts();
    if (tab === 'orders') renderOrders();
    if (tab === 'audit') renderFullAudit();
}

// 4. Detailed Order Viewer (Fixed)
function viewOrderDetails(id) {
    const order = DB.getOrders().find(o => o.id === id);
    const body = document.getElementById('order-modal-body');
    const t = translations[currentLang];

    if (!order) return;

    body.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:2rem; margin-bottom:2rem; background:rgba(255,255,255,0.01); padding:2rem; border-radius:15px; border: 1px solid rgba(255,255,255,0.05);">
            <div>
                <h5 style="color:var(--admin-accent); margin-bottom:1rem; border-bottom:1px solid #333;">${t.entity}</h5>
                <p><b>${t.entity}:</b> ${order.entity}</p>
                <p><b>${t.name}:</b> ${order.fullName}</p>
                <p><b>${t.phone}:</b> ${order.phone}</p>
                <p><b>Email:</b> ${order.email}</p>
            </div>
            <div>
                <h5 style="color:var(--admin-accent); margin-bottom:1rem; border-bottom:1px solid #333;">${t.orderId}</h5>
                <p><b>ID:</b> #${order.id}</p>
                <p><b>${t.date}:</b> ${order.date}</p>
                <p><b>${t.total}:</b> <span style="color:var(--admin-accent); font-weight:700;">${order.total.toFixed(2)} JOD</span></p>
                <p><b>${t.status}:</b> <span class="badge badge-pending">PROCESSING</span></p>
            </div>
        </div>
        <table style="width:100%; border-collapse:collapse; margin-top:1rem;">
            <thead style="color:#666; border-bottom:1px solid #333;">
                <tr><th style="padding:10px; text-align:right;">${t.product}</th><th style="padding:10px;">${t.qty}</th><th style="padding:10px;">${t.price}</th></tr>
            </thead>
            <tbody>
                ${order.items.map(i => `
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                        <td style="padding:10px;">${i.name}</td>
                        <td style="padding:10px; text-align:center;">${i.qty}</td>
                        <td style="padding:10px; text-align:left;">${(i.price * i.qty).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div style="margin-top:2rem; padding:1rem; border:1px dashed #333; border-radius:8px;">
            <p><b>${t.notes}:</b> ${order.notes || '---'}</p>
        </div>
    `;
    document.getElementById('order-detail-modal').style.display = 'flex';
}

function closeOrderModal() { document.getElementById('order-detail-modal').style.display = 'none'; }

// 5. Products & Visibility Logic
function renderProducts() {
    const products = DB.getProducts();
    const tbody = document.getElementById('products-tbody-pro');
    const t = translations[currentLang];

    tbody.innerHTML = products.map(p => `
        <tr style="${p.isHidden ? 'opacity: 0.5;' : ''}">
            <td><strong>${p.name}</strong><br><small style="color:#555;">${p.supplier}</small></td>
            <td>${p.category}</td>
            <td>${p.price.toFixed(2)}</td>
            <td style="color:${p.stock < 10 ? '#ff4757' : '#2ecc71'}">${p.stock}</td>
            <td>
                <div style="display:flex; gap:0.5rem;">
                    <button class="btn-outline btn-sm" onclick="editProduct(${p.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn-outline btn-sm" onclick="toggleProductVisibility(${p.id})">
                        <i class="fas ${p.isHidden ? 'fa-eye-slash' : 'fa-eye'}"></i>
                    </button>
                    <button class="btn-outline btn-sm" style="color:#ff4757; border-color:#ff4757;" onclick="deleteProduct(${p.id})"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

window.toggleProductVisibility = (id) => {
    const products = DB.getProducts();
    const p = products.find(prod => prod.id == id);
    p.isHidden = !p.isHidden;
    localStorage.setItem('zolngen_products', JSON.stringify(products));
    DB.logAction(`${p.isHidden ? 'Hidden' : 'Showed'} product: ${p.name}`);
    renderProducts();
};

// 6. Dashboard & Charts
function initDashboard() {
    const orders = DB.getOrders();
    const products = DB.getProducts();
    const t = translations[currentLang];

    document.getElementById('stat-sales-pro').innerText = orders.reduce((acc, o) => acc + o.total, 0).toLocaleString() + ' JOD';
    document.getElementById('stat-orders-pro').innerText = orders.length;
    document.getElementById('stat-entities-pro').innerText = [...new Set(orders.map(o => o.entity))].length;
    document.getElementById('stat-alerts-pro').innerText = products.filter(p => p.stock < 10).length;

    const ctx = document.getElementById('proChart').getContext('2d');
    if (proChart) proChart.destroy();
    proChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
            datasets: [{
                data: [1200, 1900, 3000, 5000, 2300, 1500, orders.length * 100],
                borderColor: '#D4AF37', fill: true, backgroundColor: 'rgba(212, 175, 55, 0.02)', tension: 0.4
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });
}

function renderOrders(filter = '') {
    const orders = DB.getOrders().filter(o => o.entity.includes(filter) || o.id.includes(filter));
    const tbody = document.getElementById('orders-tbody-pro');
    const t = translations[currentLang];

    tbody.innerHTML = orders.map(o => `
        <tr>
            <td>#${o.id}</td>
            <td><strong>${o.entity}</strong><br><small>${o.fullName}</small></td>
            <td>${o.date}</td>
            <td>${o.total.toFixed(2)}</td>
            <td><span class="badge badge-pending">PENDING</span></td>
            <td><button class="btn-primary btn-sm" onclick="viewOrderDetails('${o.id}')">${t.view}</button></td>
        </tr>
    `).join('');
}

function renderFullAudit() {
    document.getElementById('audit-full-log').innerHTML = DB.getAuditLog().map(l => `<div>[${l.date}] ${l.user}: ${l.action}</div>`).join('');
}

// Reuse modal logic...
function openProductModal() { document.getElementById('product-form-pro').reset(); document.getElementById('p-id').value = ''; document.getElementById('product-modal-pro').style.display = 'flex'; }
function closeProductModal() { document.getElementById('product-modal-pro').style.display = 'none'; }
function editProduct(id) {
    const p = DB.getProducts().find(p => p.id == id);
    document.getElementById('p-id').value = p.id;
    document.getElementById('p-name').value = p.name;
    document.getElementById('p-supplier').value = p.supplier;
    document.getElementById('p-price').value = p.price;
    document.getElementById('p-stock').value = p.stock;
    document.getElementById('p-desc').value = p.description || '';
    document.getElementById('product-modal-pro').style.display = 'flex';
}
function deleteProduct(id) { if(confirm('Delete?')) { DB.deleteProduct(id); renderProducts(); } }

document.getElementById('product-form-pro')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const product = {
        id: document.getElementById('p-id').value || null,
        name: document.getElementById('p-name').value,
        supplier: document.getElementById('p-supplier').value,
        price: parseFloat(document.getElementById('p-price').value),
        stock: parseInt(document.getElementById('p-stock').value),
        description: document.getElementById('p-desc').value,
        category: 'electronics', img: 'category_laptops.png', tag: 'High-End', isHidden: false
    };
    DB.saveProduct(product); closeProductModal(); renderProducts();
});

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('login-overlay').style.display === 'none') updateAdminUI();
});
