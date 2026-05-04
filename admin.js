// ZOLNGEN Isolated Command Logic v12
let growthChart;

// 1. Auth Logic
document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    if (u === 'admin' && p === 'admin123') {
        document.getElementById('login-overlay').style.display = 'none';
        document.getElementById('admin-shell').style.display = 'grid';
        DB.logAction('Secure Login: Admin v12');
        initAdmin();
    } else {
        document.getElementById('login-error').style.display = 'block';
    }
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
    
    // Set active link
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        if (link.getAttribute('onclick') && link.getAttribute('onclick').includes(`'${tab}'`)) {
            link.classList.add('active');
        }
    });

    if (tab === 'dashboard') renderDashboard();
    if (tab === 'orders') renderOrders();
    if (tab === 'inventory') renderInventory();
    if (tab === 'audit') renderAudit();
}

// 3. Dashboard Logic
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
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [{
                label: 'Growth',
                data: [5000, 12000, 8000, totalSales || 15000],
                borderColor: '#D4AF37', tension: 0.4, fill: true, backgroundColor: 'rgba(212, 175, 55, 0.05)'
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });
}

// 4. Orders Logic
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
            <td>${(o.total || 0).toFixed(2)}</td>
            <td><span class="badge badge-pending">في المعالجة</span></td>
            <td><button class="btn-action btn-outline btn-sm" onclick="viewOrder('${o.id}')">عرض</button></td>
        </tr>
    `).join('');
}

function viewOrder(id) {
    const order = DB.getOrders().find(o => o.id === id);
    if (!order) return;
    
    document.getElementById('modal-title').innerText = `تفاصيل الطلب #${order.id}`;
    document.getElementById('modal-body').innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; border-bottom:1px solid #222; padding-bottom:15px;">
            <div><p><b>الجهة:</b> ${order.entity}</p><p><b>مقدم الطلب:</b> ${order.fullName}</p></div>
            <div><p><b>التاريخ:</b> ${order.date}</p><p><b>الهاتف:</b> ${order.phone}</p></div>
        </div>
        <table style="width:100%; margin-top:15px; text-align:right;">
            <thead style="color:#666;"><tr><th>الصنف</th><th>الكمية</th><th>السعر</th></tr></thead>
            <tbody>
                ${(order.items || []).map(i => `<tr><td>${i.name}</td><td>${i.qty}</td><td>${i.price}</td></tr>`).join('')}
            </tbody>
        </table>
    `;
    document.getElementById('order-modal').style.display = 'flex';
}

function closeModal() {
    document.querySelectorAll('.pro-modal').forEach(m => m.style.display = 'none');
}

// 5. Inventory Logic
function renderInventory() {
    const tbody = document.getElementById('inventory-tbody');
    tbody.innerHTML = DB.getProducts().map(p => `
        <tr>
            <td><strong>${p.name}</strong><br><small style="color:#666;">${p.category}</small></td>
            <td style="color:var(--primary); font-weight:700;">${(p.price || 0).toFixed(2)}</td>
            <td style="color:${p.stock < 10 ? '#ff4757' : '#2ecc71'}">${p.stock}</td>
            <td>${p.supplier || 'N/A'}</td>
            <td>
                <button class="btn-action btn-outline btn-sm" onclick="editProd(${p.id})"><i class="fas fa-edit"></i></button>
            </td>
        </tr>
    `).join('');
}

function openProductModal() {
    document.getElementById('product-form').reset();
    document.getElementById('p-id').value = '';
    document.getElementById('product-modal').style.display = 'flex';
}

function editProd(id) {
    const p = DB.getProducts().find(p => p.id == id);
    document.getElementById('p-id').value = p.id;
    document.getElementById('p-name').value = p.name;
    document.getElementById('p-supplier').value = p.supplier || '';
    document.getElementById('p-price').value = p.price;
    document.getElementById('p-stock').value = p.stock;
    document.getElementById('p-desc').value = p.description || '';
    document.getElementById('product-modal').style.display = 'flex';
}

document.getElementById('product-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const product = {
        id: document.getElementById('p-id').value || null,
        name: document.getElementById('p-name').value,
        supplier: document.getElementById('p-supplier').value,
        price: parseFloat(document.getElementById('p-price').value),
        stock: parseInt(document.getElementById('p-stock').value),
        description: document.getElementById('p-desc').value,
        category: 'Electronics', img: 'category_electronics.png'
    };
    DB.saveProduct(product);
    closeModal();
    renderInventory();
});

// 6. Search & Helpers
window.handleSearch = (val) => {
    const activeTab = document.querySelector('.nav-link.active').getAttribute('onclick').match(/'([^']+)'/)[1];
    if (activeTab === 'orders') renderOrders(val);
    else if (activeTab === 'inventory') {
        const rows = document.querySelectorAll('#inventory-tbody tr');
        rows.forEach(r => r.style.display = r.innerText.toLowerCase().includes(val.toLowerCase()) ? 'table-row' : 'none');
    }
};

function renderAudit() {
    document.getElementById('audit-log-container').innerHTML = DB.getAuditLog().map(l => `
        <div>[${l.date}] ${l.user}: ${l.action}</div>
    `).join('');
}

console.log("ZOLNGEN Admin System v12 Isolated");
