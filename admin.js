// ZOLNGEN Admin Core v14 - Final Stable & Isolated
let growthChart;
let currentLang = 'ar';
let activeOrderId = null;

const i18n = {
    ar: {
        dash: 'الإحصائيات', ords: 'الطلبات', inv: 'المخزون', customers: 'الجهات', audit: 'الأمن',
        totalSales: 'إجمالي المبيعات', activeOrders: 'الطلبات النشطة', entities: 'الجهات المتعاقدة', lowStock: 'تنبيهات المخزون',
        searchPlaceholder: 'بحث شامل...', statusPending: 'قيد المعالجة', statusShipped: 'تم الشحن', statusDelivered: 'تم التسليم'
    },
    en: {
        dash: 'Dashboard', ords: 'Orders', inv: 'Inventory', customers: 'Entities', audit: 'Audit',
        totalSales: 'Total Sales', activeOrders: 'Active Orders', entities: 'Partner Entities', lowStock: 'Low Stock Alerts',
        searchPlaceholder: 'Global Search...', statusPending: 'Pending', statusShipped: 'Shipped', statusDelivered: 'Delivered'
    }
};

// 1. Auth & System Init
document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (document.getElementById('username').value === 'admin' && document.getElementById('password').value === 'admin123') {
        document.getElementById('login-overlay').style.display = 'none';
        document.getElementById('admin-shell').style.display = 'grid';
        DB.logAction('System Secure Init: root');
        initAdmin();
    } else alert('Access Denied');
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
    if (tab === 'customers') renderCustomers();
    if (tab === 'audit') renderAudit();
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

    const ctx = document.getElementById('growthChart').getContext('2d');
    if (growthChart) growthChart.destroy();
    growthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'],
            datasets: [{
                label: 'Revenue', data: [4000, 7000, 3000, 9000, 12000, totalSales],
                borderColor: '#D4AF37', tension: 0.4, fill: true, backgroundColor: 'rgba(212, 175, 55, 0.05)'
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });
}

function renderOrders(filter = '') {
    const tbody = document.getElementById('orders-tbody');
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
            <td><span class="badge ${o.status === 'delivered' ? 'badge-done' : 'badge-pending'}">${(o.status || 'pending').toUpperCase()}</span></td>
            <td>
                <div style="display:flex; gap:5px;">
                    <button class="btn-action btn-outline btn-sm" onclick="viewOrder('${o.id}')">View</button>
                    <button class="btn-action btn-gold btn-sm" onclick="quickUpdate('${o.id}', 'delivered')"><i class="fas fa-check"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

window.viewOrder = (id) => {
    activeOrderId = id;
    const order = DB.getOrders().find(o => o.id === id);
    if (!order) return;
    document.getElementById('modal-title').innerText = `Procurement Detail: #${order.id}`;
    document.getElementById('modal-body').innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; border-bottom:1px solid #222; padding-bottom:15px; text-align:right;">
            <div><p><b>الجهة:</b> ${order.entity}</p><p><b>مقدم الطلب:</b> ${order.fullName}</p></div>
            <div><p><b>التاريخ:</b> ${order.date}</p><p><b>الهاتف:</b> ${order.phone}</p></div>
        </div>
        <table style="width:100%; margin-top:20px; text-align:right;">
            <thead style="color:#444; border-bottom:1px solid #111;"><tr><th>المنتج</th><th>الكمية</th><th>السعر</th></tr></thead>
            <tbody>
                ${(order.items || []).map(i => `<tr><td>${i.name}</td><td style="text-align:center;">${i.qty}</td><td style="text-align:left;">${i.price}</td></tr>`).join('')}
            </tbody>
        </table>
        <div style="margin-top:20px; padding:10px; background:rgba(0,0,0,0.3); border-radius:10px;"><b>ملاحظات:</b> ${order.notes || '---'}</div>
    `;
    document.getElementById('order-modal').style.display = 'flex';
};

window.quickUpdate = (id, status) => {
    const orders = DB.getOrders();
    const order = orders.find(o => o.id === id);
    if (order) {
        order.status = status;
        localStorage.setItem('zolngen_orders', JSON.stringify(orders));
        DB.logAction(`Updated Order #${id} status to ${status}`);
        renderOrders();
    }
};

function renderInventory() {
    const tbody = document.getElementById('inventory-tbody');
    tbody.innerHTML = DB.getProducts().map(p => `
        <tr>
            <td><strong>${p.name}</strong><br><small style="color:#444;">${p.category}</small></td>
            <td style="color:var(--primary); font-weight:700;">${(p.price || 0).toFixed(2)}</td>
            <td style="color:${p.stock < 10 ? '#ff4757' : '#2ecc71'}">${p.stock}</td>
            <td>${p.supplier || 'N/A'}</td>
            <td><button class="btn-action btn-outline btn-sm" onclick="editProd(${p.id})"><i class="fas fa-edit"></i></button></td>
        </tr>
    `).join('');
}

function renderCustomers() {
    const orders = DB.getOrders();
    const entities = [...new Set(orders.map(o => o.entity))];
    const container = document.getElementById('dashboard-tab'); // Show as widgets if needed
    // Simple alert-based or list-based view for now
}

function renderAudit() {
    document.getElementById('audit-log-container').innerHTML = DB.getAuditLog().map(l => `
        <div style="padding:5px; border-bottom:1px solid #111;">[${l.date}] <b>${l.user}</b>: ${l.action}</div>
    `).join('');
}

function closeModal() { document.querySelectorAll('.pro-modal').forEach(m => m.style.display = 'none'); }

window.handleSearch = (val) => {
    const active = document.querySelector('.nav-link.active').getAttribute('onclick').match(/'([^']+)'/)[1];
    if (active === 'orders') renderOrders(val);
    if (active === 'inventory') {
        const rows = document.querySelectorAll('#inventory-tbody tr');
        rows.forEach(r => r.style.display = r.innerText.toLowerCase().includes(val.toLowerCase()) ? 'table-row' : 'none');
    }
};

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
    DB.saveProduct(prod); closeModal(); renderInventory();
});

console.log("ZOLNGEN Admin v14 Production Ready");
