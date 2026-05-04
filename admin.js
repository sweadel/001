// ZOLNGEN Admin Core v15 - ULTIMATE STABLE & ISOLATED
let growthChart;
let currentLang = 'ar';
let activeOrderId = null;

// Expose to window for HTML events
window.showTab = showTab;
window.viewOrder = viewOrder;
window.quickUpdate = quickUpdate;
window.editProd = editProd;
window.handleSearch = handleSearch;
window.closeModal = closeModal;
window.openProductModal = openProductModal;

const i18n = {
    ar: {
        dash: 'الإحصائيات', ords: 'الطلبات', inv: 'المخزون', customers: 'الجهات', audit: 'الأمن'
    },
    en: {
        dash: 'Dashboard', ords: 'Orders', inv: 'Inventory', customers: 'Entities', audit: 'Audit'
    }
};

// 1. Auth Logic
document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    if (u === 'admin' && p === 'admin123') {
        document.getElementById('login-overlay').style.display = 'none';
        document.getElementById('admin-shell').style.display = 'grid';
        DB.logAction('Secure Admin Access Granted');
        initAdmin();
    } else alert('بيانات الدخول غير صحيحة');
});

function initAdmin() {
    showTab('dashboard');
}

// 2. Tab Management
function showTab(tab) {
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    const target = document.getElementById(tab + '-tab');
    if (target) target.style.display = 'block';
    
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        if (link.getAttribute('onclick')?.includes(`'${tab}'`)) link.classList.add('active');
    });

    if (tab === 'dashboard') renderDashboard();
    if (tab === 'orders') renderOrders();
    if (tab === 'inventory') renderInventory();
    if (tab === 'audit') renderAudit();
}

// 3. Modules Logic
function renderDashboard() {
    const orders = DB.getOrders();
    const products = DB.getProducts();
    const totalSales = orders.reduce((acc, o) => acc + (o.total || 0), 0);
    const lowStock = products.filter(p => (p.stock || 0) < 10).length;

    document.getElementById('stat-sales').innerText = totalSales.toLocaleString() + ' JOD';
    document.getElementById('stat-orders').innerText = orders.length;
    document.getElementById('stat-entities').innerText = [...new Set(orders.map(o => o.entity))].length;
    document.getElementById('stat-low-stock').innerText = lowStock;

    const ctx = document.getElementById('growthChart')?.getContext('2d');
    if (!ctx) return;
    if (growthChart) growthChart.destroy();
    growthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [{
                label: 'Growth',
                data: [5000, 15000, 8000, totalSales || 20000],
                borderColor: '#D4AF37', tension: 0.4, fill: true, backgroundColor: 'rgba(212, 175, 55, 0.05)'
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });
}

function renderOrders(filter = '') {
    const tbody = document.getElementById('orders-tbody');
    if (!tbody) return;
    const orders = DB.getOrders().filter(o => 
        (o.entity || '').toLowerCase().includes(filter.toLowerCase()) || 
        (o.id || '').toLowerCase().includes(filter.toLowerCase())
    );

    tbody.innerHTML = orders.length ? orders.map(o => `
        <tr>
            <td>#${o.id}</td>
            <td><strong>${o.entity}</strong><br><small>${o.fullName || 'مسؤول تقني'}</small></td>
            <td>${o.date}</td>
            <td>${(o.total || 0).toFixed(2)}</td>
            <td><span class="badge ${o.status === 'delivered' ? 'badge-done' : 'badge-pending'}">${(o.status || 'pending').toUpperCase()}</span></td>
            <td>
                <button class="btn-action btn-outline btn-sm" onclick="viewOrder('${o.id}')">تفاصيل</button>
                <button class="btn-action btn-gold btn-sm" onclick="quickUpdate('${o.id}', 'delivered')">تسليم</button>
            </td>
        </tr>
    `).join('') : '<tr><td colspan="6" style="text-align:center; padding:50px;">لا يوجد طلبات حالياً</td></tr>';
}

function viewOrder(id) {
    activeOrderId = id;
    const order = DB.getOrders().find(o => String(o.id) === String(id));
    if (!order) return;
    
    document.getElementById('modal-title').innerText = `تفاصيل الطلب #${order.id}`;
    document.getElementById('modal-body').innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; border-bottom:1px solid #222; padding-bottom:15px; text-align:right;">
            <div><p><b>المؤسسة:</b> ${order.entity}</p><p><b>المسؤول:</b> ${order.fullName}</p></div>
            <div><p><b>التاريخ:</b> ${order.date}</p><p><b>الهاتف:</b> ${order.phone}</p></div>
        </div>
        <table style="width:100%; margin-top:15px; text-align:right; border-collapse:collapse;">
            <thead style="color:#666;"><tr><th>الصنف</th><th>الكمية</th><th>السعر</th></tr></thead>
            <tbody>
                ${(order.items || []).map(i => `<tr><td>${i.name}</td><td>${i.qty}</td><td>${i.price}</td></tr>`).join('')}
            </tbody>
        </table>
    `;
    document.getElementById('order-modal').style.display = 'flex';
}

function quickUpdate(id, status) {
    const orders = DB.getOrders();
    const order = orders.find(o => String(o.id) === String(id));
    if (order) {
        order.status = status;
        DB.set('zolngen_orders', orders);
        DB.logAction(`Updated Order #${id} to ${status}`);
        renderOrders();
    }
}

function renderInventory() {
    const tbody = document.getElementById('inventory-tbody');
    if (!tbody) return;
    tbody.innerHTML = DB.getProducts().map(p => `
        <tr>
            <td><strong>${p.name}</strong><br><small style="color:#444;">${p.category}</small></td>
            <td style="color:var(--primary); font-weight:700;">${(p.price || 0).toFixed(2)}</td>
            <td style="color:${p.stock < 10 ? '#ff4757' : '#2ecc71'}">${p.stock}</td>
            <td>${p.supplier || 'N/A'}</td>
            <td><button class="btn-action btn-outline btn-sm" onclick="editProd('${p.id}')"><i class="fas fa-edit"></i></button></td>
        </tr>
    `).join('');
}

function openProductModal() {
    document.getElementById('product-form')?.reset();
    document.getElementById('p-id').value = '';
    document.getElementById('product-modal').style.display = 'flex';
}

function editProd(id) {
    const p = DB.getProducts().find(p => String(p.id) === String(id));
    if (!p) return;
    document.getElementById('p-id').value = p.id;
    document.getElementById('p-name').value = p.name;
    document.getElementById('p-supplier').value = p.supplier || '';
    document.getElementById('p-price').value = p.price;
    document.getElementById('p-stock').value = p.stock;
    document.getElementById('p-desc').value = p.description || '';
    document.getElementById('product-modal').style.display = 'flex';
}

function closeModal() {
    document.querySelectorAll('.pro-modal').forEach(m => m.style.display = 'none');
}

function handleSearch(val) {
    const active = document.querySelector('.nav-link.active')?.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
    if (active === 'orders') renderOrders(val);
    else if (active === 'inventory') {
        const rows = document.querySelectorAll('#inventory-tbody tr');
        rows.forEach(r => r.style.display = r.innerText.toLowerCase().includes(val.toLowerCase()) ? 'table-row' : 'none');
    }
}

document.getElementById('product-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const prod = {
        id: document.getElementById('p-id').value || null,
        name: document.getElementById('p-name').value,
        supplier: document.getElementById('p-supplier').value,
        price: parseFloat(document.getElementById('p-price').value),
        stock: parseInt(document.getElementById('p-stock').value),
        description: document.getElementById('p-desc').value,
        category: 'Hardware', img: 'category_electronics.png'
    };
    DB.saveProduct(prod);
    closeModal();
    renderInventory();
});

function renderAudit() {
    const container = document.getElementById('audit-log-container');
    if (!container) return;
    container.innerHTML = DB.getAuditLog().map(l => `
        <div style="padding:8px; border-bottom:1px solid #111;">[${l.date}] <b>${l.user}</b>: ${l.action}</div>
    `).join('');
}

console.log("ZOLNGEN Admin v15 Fully Stabilized");
