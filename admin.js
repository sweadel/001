// ZOLNGEN Command Center JS v6
let salesChart;

// 1. Authentication System
document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (user === 'admin' && pass === 'admin123') {
        document.getElementById('login-overlay').style.display = 'none';
        document.getElementById('admin-nav').style.display = 'block';
        document.getElementById('admin-content').style.display = 'grid';
        DB.logAction('Admin Login Successful');
        showNotification('تم تسجيل الدخول بنجاح');
        initDashboard();
    } else {
        document.getElementById('login-error').style.display = 'block';
    }
});

function logout() {
    location.reload();
}

// 2. Notification System
function showNotification(msg) {
    const el = document.getElementById('notification');
    el.innerText = msg;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 3000);
}

// 3. Tab Management
function showTab(tab) {
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.sidebar-item').forEach(l => l.classList.remove('active'));
    document.getElementById(tab + '-tab').style.display = 'block';
    event.currentTarget.classList.add('active');
    
    if (tab === 'dashboard') initDashboard();
    if (tab === 'products') renderProducts();
    if (tab === 'orders') renderOrders();
    if (tab === 'tickets') renderTickets();
    if (tab === 'audit') renderAuditLog();
}

// 4. Dashboard Stats & Chart
function initDashboard() {
    const orders = DB.getOrders();
    const products = DB.getProducts();
    const tickets = DB.getTickets();
    const totalSales = orders.reduce((acc, o) => acc + o.total, 0);
    const lowStock = products.filter(p => p.stock < 10).length;

    document.getElementById('stat-orders').innerText = orders.length;
    document.getElementById('stat-sales').innerText = totalSales.toFixed(2) + ' د.أ';
    document.getElementById('stat-tickets').innerText = tickets.filter(t => t.status === 'Open').length;
    document.getElementById('stat-stock-alert').innerText = lowStock;

    // Mini Audit Log
    const miniLog = document.getElementById('mini-audit-log');
    const logs = DB.getAuditLog();
    miniLog.innerHTML = logs.slice(0, 5).map(l => `
        <div class="log-item"><b>${l.date}</b>: ${l.action}</div>
    `).join('');

    // Chart
    const ctx = document.getElementById('mainChart').getContext('2d');
    if (salesChart) salesChart.destroy();
    salesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['الأسبوع 1', 'الأسبوع 2', 'الأسبوع 3', 'الأسبوع 4'],
            datasets: [{
                label: 'حجم الطلبات',
                data: [12, 19, 25, orders.length || 5],
                backgroundColor: '#D4AF37'
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });
}

// 5. Orders & Search
function renderOrders(filter = '') {
    const orders = DB.getOrders().filter(o => o.entity.includes(filter) || o.id.includes(filter));
    const tbody = document.querySelector('#orders-table tbody');
    tbody.innerHTML = orders.map(o => `
        <tr>
            <td>#${o.id}</td>
            <td><strong>${o.entity}</strong><br><small>${o.fullName}</small></td>
            <td>${o.date}</td>
            <td>${o.total.toFixed(2)} د.أ</td>
            <td><span class="status-badge" style="background:#f39c12; color:white; padding:2px 8px; border-radius:10px; font-size:0.7rem;">قيد المراجعة</span></td>
            <td><button class="btn-primary btn-sm" onclick="alert('تفاصيل: ' + JSON.stringify(${JSON.stringify(o.items)}))">عرض</button></td>
        </tr>
    `).join('');
}
window.searchOrders = (val) => renderOrders(val);

function exportOrders() {
    const orders = DB.getOrders();
    const csv = 'ID,Entity,Date,Total\n' + orders.map(o => `${o.id},${o.entity},${o.date},${o.total}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'orders_export.csv');
    document.body.appendChild(a);
    a.click();
    DB.logAction('Exported Orders to CSV');
}

// 6. Products & Bulk
function renderProducts() {
    const products = DB.getProducts();
    const tbody = document.querySelector('#products-table tbody');
    tbody.innerHTML = products.map(p => `
        <tr>
            <td><strong>${p.name}</strong></td>
            <td>${p.supplier || 'N/A'}</td>
            <td>${p.price.toFixed(2)} د.أ</td>
            <td style="color: ${p.stock < 10 ? '#ff4757' : 'inherit'}">${p.stock}</td>
            <td>
                <button class="btn-outline btn-sm" onclick="editProduct(${p.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-outline btn-sm" onclick="deleteProduct(${p.id})" style="color:#ff4757; border-color:#ff4757;"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function bulkPriceUpdate() {
    const percent = prompt('أدخل نسبة الزيادة/النقصان (مثلاً 5 للزيادة أو -5 للنقصان):');
    if (percent) {
        const products = DB.getProducts();
        products.forEach(p => {
            p.price = p.price * (1 + (parseFloat(percent) / 100));
        });
        localStorage.setItem('zolngen_products', JSON.stringify(products));
        DB.logAction(`Bulk Price Update: ${percent}%`);
        renderProducts();
        showNotification('تم تحديث الأسعار بنجاح');
    }
}

// 7. Maintenance Tickets
function renderTickets() {
    const tickets = DB.getTickets();
    const tbody = document.querySelector('#tickets-table tbody');
    tbody.innerHTML = tickets.map(t => `
        <tr>
            <td>${t.id}</td>
            <td>${t.entity}</td>
            <td>${t.issueType}</td>
            <td>${t.date}</td>
            <td><span style="color:#2ecc71">${t.status}</span></td>
            <td><button class="btn-outline btn-sm" onclick="alert('تفاصيل المشكلة: ' + '${t.notes}')">عرض</button></td>
        </tr>
    `).join('');
}

// 8. Audit Log
function renderAuditLog() {
    const logs = DB.getAuditLog();
    const container = document.getElementById('full-audit-log');
    container.innerHTML = logs.map(l => `
        <div class="log-item"><b>[${l.date}]</b> المستخدم: <u>${l.user}</u> - الإجراء: ${l.action}</div>
    `).join('');
}

// 9. Backups
function backupDB() {
    const data = {
        products: DB.getProducts(),
        orders: DB.getOrders(),
        tickets: DB.getTickets(),
        audit: DB.getAuditLog()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `zolngen_backup_${Date.now()}.json`;
    a.click();
    DB.logAction('System Backup Downloaded');
}

// Modal logic
function openProductModal() { document.getElementById('product-form').reset(); document.getElementById('prod-id').value = ''; document.getElementById('product-modal').style.display = 'flex'; }
function closeModal() { document.getElementById('product-modal').style.display = 'none'; }
function editProduct(id) {
    const p = DB.getProducts().find(p => p.id == id);
    document.getElementById('prod-id').value = p.id;
    document.getElementById('prod-name').value = p.name;
    document.getElementById('prod-supplier').value = p.supplier || '';
    document.getElementById('prod-price').value = p.price;
    document.getElementById('prod-stock').value = p.stock;
    document.getElementById('product-modal').style.display = 'flex';
}
function deleteProduct(id) { if (confirm('حذف المنتج؟')) { DB.deleteProduct(id); renderProducts(); } }

document.getElementById('product-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const product = {
        id: document.getElementById('prod-id').value || null,
        name: document.getElementById('prod-name').value,
        supplier: document.getElementById('prod-supplier').value,
        category: 'laptop', // Default for demo
        price: parseFloat(document.getElementById('prod-price').value),
        stock: parseInt(document.getElementById('prod-stock').value),
        img: 'category_laptops.png', tag: 'محدث'
    };
    DB.saveProduct(product); closeModal(); renderProducts();
});

console.log("ZOLNGEN Admin System v6 Loaded");
