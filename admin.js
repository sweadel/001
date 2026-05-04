// ZOLNGEN COMMAND CENTER v17 - THE ABSOLUTE FINAL STANDARD
let growthChart;
let currentTab = 'dashboard';

// Global Expose
window.showTab = showTab;
window.viewOrder = viewOrder;
window.quickUpdate = quickUpdate;
window.editProd = editProd;
window.deleteProd = deleteProd;
window.handleSearch = handleSearch;
window.closeModal = closeModal;
window.openProductModal = openProductModal;

// 1. Authentication
document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (document.getElementById('username').value === 'admin' && document.getElementById('password').value === 'admin123') {
        document.getElementById('login-overlay').style.display = 'none';
        document.getElementById('admin-shell').style.display = 'grid';
        DB.logAction('System Secure Session Started');
        initAdmin();
    } else alert('خطأ في بيانات الدخول');
});

function initAdmin() {
    showTab('dashboard');
}

// 2. Navigation
function showTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    const target = document.getElementById(tab + '-tab');
    if (target) target.style.display = 'block';
    
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        if (link.getAttribute('onclick')?.includes(`'${tab}'`)) link.classList.add('active');
    });

    refreshCurrentTab();
}

function refreshCurrentTab() {
    if (currentTab === 'dashboard') renderDashboard();
    if (currentTab === 'orders') renderOrders();
    if (currentTab === 'inventory') renderInventory();
    if (currentTab === 'audit') renderAudit();
}

// 3. Logic Modules
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
            labels: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'],
            datasets: [{
                label: 'Growth', data: [4000, 15000, 8000, 12000, 18000, totalSales || 25000],
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

    tbody.innerHTML = orders.map(o => `
        <tr>
            <td>#${o.id}</td>
            <td><strong>${o.entity}</strong><br><small>${o.fullName}</small></td>
            <td>${o.date}</td>
            <td style="color:var(--primary); font-weight:700;">${(o.total || 0).toFixed(2)}</td>
            <td><span class="badge ${o.status === 'delivered' ? 'badge-done' : 'badge-pending'}">${o.status.toUpperCase()}</span></td>
            <td>
                <button class="btn-action btn-outline btn-sm" onclick="viewOrder('${o.id}')">عرض</button>
                <button class="btn-action btn-gold btn-sm" onclick="quickUpdate('${o.id}', 'delivered')">تسليم</button>
            </td>
        </tr>
    `).join('');
}

function viewOrder(id) {
    const order = DB.getOrders().find(o => String(o.id) === String(id));
    if (!order) return;
    document.getElementById('modal-title').innerText = `تفاصيل الطلب #${order.id}`;
    document.getElementById('modal-body').innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; border-bottom:1px solid #222; padding-bottom:15px; text-align:right;">
            <div><p><b>المؤسسة:</b> ${order.entity}</p><p><b>المسؤول:</b> ${order.fullName}</p></div>
            <div><p><b>التاريخ:</b> ${order.date}</p><p><b>الهاتف:</b> ${order.phone}</p></div>
        </div>
        <table style="width:100%; margin-top:20px; text-align:right;">
            <thead><tr><th>الصنف</th><th>الكمية</th><th>السعر</th></tr></thead>
            <tbody>${(order.items || []).map(i => `<tr><td>${i.name}</td><td>${i.qty}</td><td>${i.price}</td></tr>`).join('')}</tbody>
        </table>
    `;
    document.getElementById('order-modal').style.display = 'flex';
}

function quickUpdate(id, status) {
    DB.updateOrderStatus(id, status);
    refreshCurrentTab();
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
            <td>
                <button class="btn-action btn-outline btn-sm" onclick="editProd('${p.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn-action btn-outline btn-sm" style="color:#ff4757;" onclick="deleteProd('${p.id}')"><i class="fas fa-trash"></i></button>
            </td>
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
    document.getElementById('product-modal').style.display = 'flex';
}

function deleteProd(id) {
    if (confirm('هل أنت متأكد من حذف هذا المنتج نهائياً من المستودع؟')) {
        DB.deleteProduct(id);
        renderInventory();
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
        category: 'Hardware', img: 'category_laptops_luxury.png'
    };
    DB.saveProduct(prod);
    closeModal();
    renderInventory();
});

function handleSearch(val) {
    if (currentTab === 'orders') renderOrders(val);
    if (currentTab === 'inventory') {
        const rows = document.querySelectorAll('#inventory-tbody tr');
        rows.forEach(r => r.style.display = r.innerText.toLowerCase().includes(val.toLowerCase()) ? 'table-row' : 'none');
    }
}

function renderAudit() {
    const container = document.getElementById('audit-log-container');
    if (!container) return;
    container.innerHTML = DB.getAuditLog().map(l => `
        <div style="padding:10px; border-bottom:1px solid #111;">[${l.date}] <b>${l.user}</b>: ${l.action}</div>
    `).join('');
}

function closeModal() { document.querySelectorAll('.pro-modal').forEach(m => m.style.display = 'none'); }

console.log("ZOLNGEN COMMAND CENTER v17 - DEPLOYED");
