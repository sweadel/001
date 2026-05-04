// ZOLNGEN Ultimate ERP Logic v10
let adminChart;
let activeOrderId = null;

// 1. Auth & Shell
document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (document.getElementById('username').value === 'admin' && document.getElementById('password').value === 'admin123') {
        document.getElementById('login-overlay').style.display = 'none';
        document.getElementById('admin-shell').style.display = 'grid';
        DB.logAction('System Init: Advanced Command Center');
        initAdminSystem();
    }
});

function initAdminSystem() {
    showTab('dashboard');
    checkLowStock();
}

function showTab(tab) {
    document.querySelectorAll('.tab-content-pro').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.admin-nav-link').forEach(l => l.classList.remove('active'));
    document.getElementById(tab + '-tab').style.display = 'block';
    
    // Set active link
    document.querySelectorAll('.admin-nav-link').forEach(link => {
        if (link.getAttribute('onclick').includes(tab)) link.classList.add('active');
    });

    if (tab === 'dashboard') renderDashboard();
    if (tab === 'orders') renderOrders();
    if (tab === 'products') renderInventory();
    if (tab === 'categories') renderCategories();
    if (tab === 'customers') renderCustomers();
    if (tab === 'audit') renderAudit();
}

// 2. Dashboard Logic
function renderDashboard() {
    const orders = DB.getOrders();
    const products = DB.getProducts();
    const entities = [...new Set(orders.map(o => o.entity))];
    const totalSales = orders.reduce((acc, o) => acc + o.total, 0);

    document.getElementById('stat-sales').innerText = totalSales.toLocaleString() + ' JOD';
    document.getElementById('stat-orders').innerText = orders.length;
    document.getElementById('stat-entities').innerText = entities.length;
    document.getElementById('stat-stock').innerText = products.reduce((acc, p) => acc + p.stock, 0);

    const ctx = document.getElementById('adminChart').getContext('2d');
    if (adminChart) adminChart.destroy();
    adminChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'نمو المبيعات',
                data: [5000, 8000, 4500, 12000, 15000, totalSales || 18000],
                borderColor: '#D4AF37', tension: 0.3, fill: true, backgroundColor: 'rgba(212, 175, 55, 0.05)'
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });
}

// 3. Orders & Workflow
function renderOrders() {
    const tbody = document.getElementById('orders-tbody');
    tbody.innerHTML = DB.getOrders().map(o => `
        <tr>
            <td>#${o.id}</td>
            <td><strong>${o.entity}</strong><br><small>${o.fullName}</small></td>
            <td>${o.date}</td>
            <td style="color:var(--primary-gold);">${o.total.toFixed(2)}</td>
            <td><span class="status-badge status-${o.status || 'pending'}">${(o.status || 'معلق').toUpperCase()}</span></td>
            <td><button class="btn-primary btn-sm" onclick="viewOrderDetails('${o.id}')">عرض</button></td>
        </tr>
    `).join('');
}

function viewOrderDetails(id) {
    activeOrderId = id;
    const order = DB.getOrders().find(o => o.id === id);
    const body = document.getElementById('order-modal-body');
    
    body.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; border-bottom:1px solid #222; padding-bottom:20px;">
            <div>
                <p><b>الجهة:</b> ${order.entity}</p>
                <p><b>مقدم الطلب:</b> ${order.fullName}</p>
                <p><b>الهاتف:</b> ${order.phone}</p>
            </div>
            <div>
                <p><b>التاريخ:</b> ${order.date}</p>
                <p><b>البريد:</b> ${order.email}</p>
                <p><b>الحالة:</b> ${order.status || 'Pending'}</p>
            </div>
        </div>
        <table style="width:100%; margin-top:20px;">
            <thead style="color:#666;"><tr><th>الصنف</th><th>الكمية</th><th>السعر</th></tr></thead>
            <tbody>
                ${order.items.map(i => `<tr><td>${i.name}</td><td>${i.qty}</td><td>${i.price}</td></tr>`).join('')}
            </tbody>
        </table>
    `;
    document.getElementById('order-detail-modal').style.display = 'flex';
}

window.updateOrderStatus = (status) => {
    const orders = DB.getOrders();
    const order = orders.find(o => o.id === activeOrderId);
    if (order) {
        order.status = status;
        localStorage.setItem('zolngen_orders', JSON.stringify(orders));
        DB.logAction(`Updated status of Order #${activeOrderId} to ${status}`);
        renderOrders();
        document.getElementById('order-detail-modal').style.display = 'none';
    }
};

// 4. Inventory & Bulk Actions
function renderInventory() {
    const tbody = document.getElementById('products-tbody');
    tbody.innerHTML = DB.getProducts().map(p => `
        <tr style="${p.isHidden ? 'opacity: 0.5;' : ''}">
            <td><input type="checkbox" class="prod-check" value="${p.id}"></td>
            <td><strong>${p.name}</strong><br><small>${p.supplier}</small></td>
            <td style="color:var(--primary-gold);">${p.price.toFixed(2)}</td>
            <td style="color:${p.stock < 10 ? '#ff4757' : '#2ecc71'}">${p.stock}</td>
            <td>
                <button class="btn-outline btn-sm" onclick="duplicateProduct(${p.id})"><i class="fas fa-copy"></i></button>
                <button class="btn-outline btn-sm" onclick="editProduct(${p.id})"><i class="fas fa-edit"></i></button>
            </td>
        </tr>
    `).join('');
}

window.duplicateProduct = (id) => {
    const products = DB.getProducts();
    const p = products.find(prod => prod.id == id);
    const newP = { ...p, id: Date.now(), name: p.name + ' (نسخة)' };
    products.push(newP);
    localStorage.setItem('zolngen_products', JSON.stringify(products));
    DB.logAction(`Duplicated product: ${p.name}`);
    renderInventory();
};

window.bulkHideSelected = () => {
    const checked = Array.from(document.querySelectorAll('.prod-check:checked')).map(el => el.value);
    const products = DB.getProducts();
    products.forEach(p => { if(checked.includes(p.id.toString())) p.isHidden = true; });
    localStorage.setItem('zolngen_products', JSON.stringify(products));
    DB.logAction(`Bulk hidden ${checked.length} products`);
    renderInventory();
};

// 5. Categories Management
function renderCategories() {
    const products = DB.getProducts();
    const cats = [...new Set(products.map(p => p.category))];
    const container = document.getElementById('categories-list');
    container.innerHTML = cats.map(c => `
        <div style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #222;">
            <span>${c}</span>
            <small style="color:#666;">(${products.filter(p => p.category === c).length} منتج)</small>
        </div>
    `).join('');
}

window.addNewCategory = () => {
    const name = document.getElementById('new-cat-name').value;
    if (name) {
        DB.logAction(`Added new system category: ${name}`);
        alert(`تمت إضافة القسم: ${name}. يمكنك الآن استخدامه عند إضافة منتجات جديدة.`);
        renderCategories();
    }
};

// 6. Customer Profiles
function renderCustomers() {
    const orders = DB.getOrders();
    const entities = [...new Set(orders.map(o => o.entity))];
    const container = document.getElementById('customers-list');
    
    container.innerHTML = entities.map(e => {
        const custOrders = orders.filter(o => o.entity === e);
        const totalValue = custOrders.reduce((acc, o) => acc + o.total, 0);
        return `
            <div class="widget-card" style="margin-bottom: 10px;">
                <div style="display:flex; justify-content:space-between;">
                    <strong>${e}</strong>
                    <span style="color:var(--primary-gold);">${totalValue.toFixed(2)} JOD</span>
                </div>
                <small style="color:#666;">عدد الطلبات: ${custOrders.length}</small>
            </div>
        `;
    }).join('');
}

function checkLowStock() {
    const low = DB.getProducts().some(p => p.stock < 10);
    document.getElementById('low-stock-dot').style.display = low ? 'block' : 'none';
}

function renderAudit() {
    document.getElementById('full-audit-log').innerHTML = DB.getAuditLog().map(l => `<div>[${l.date}] ${l.user} > ${l.action}</div>`).join('');
}

window.adminGlobalSearch = (val) => {
    const activeTab = document.querySelector('.admin-nav-link.active').getAttribute('onclick').match(/'([^']+)'/)[1];
    if (activeTab === 'orders') renderOrders(val);
    if (activeTab === 'products') {
        const rows = document.querySelectorAll('#products-tbody tr');
        rows.forEach(r => r.style.display = r.innerText.toLowerCase().includes(val.toLowerCase()) ? 'table-row' : 'none');
    }
};
