// ZOLNGEN Ultimate Command Center JS v8
let proChart;

// 1. Auth & Shell
document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (user === 'admin' && pass === 'admin123') {
        document.getElementById('login-overlay').style.display = 'none';
        document.getElementById('admin-container').style.display = 'block';
        DB.logAction('Super Admin Login');
        initUltimateDashboard();
    } else {
        const err = document.getElementById('login-error');
        err.style.display = 'block';
        err.style.animation = 'shake 0.3s';
    }
});

function logout() { location.reload(); }

// 2. Navigation & Smart Search
function showTab(tab) {
    document.querySelectorAll('.tab-content-pro').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(l => l.classList.remove('active'));
    document.getElementById(tab + '-tab').style.display = 'block';
    event.currentTarget.classList.add('active');
    
    if (tab === 'dashboard') initUltimateDashboard();
    if (tab === 'products') renderProducts();
    if (tab === 'orders') renderOrders();
    if (tab === 'audit') renderFullAudit();
}

// Keyboard shortcut '/' to search
document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        document.getElementById('pro-search').focus();
    }
});

// 3. Ultimate Dashboard Logic
function initUltimateDashboard() {
    const orders = DB.getOrders();
    const products = DB.getProducts();
    const totalSales = orders.reduce((acc, o) => acc + o.total, 0);
    const lowStock = products.filter(p => p.stock < 10).length;

    document.getElementById('stat-sales-pro').innerText = totalSales.toLocaleString() + ' د.أ';
    document.getElementById('stat-orders-pro').innerText = orders.length;
    document.getElementById('stat-entities-pro').innerText = [...new Set(orders.map(o => o.entity))].length;
    document.getElementById('stat-alerts-pro').innerText = lowStock;

    // Pro Chart
    const ctx = document.getElementById('proChart').getContext('2d');
    if (proChart) proChart.destroy();
    proChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['01', '02', '03', '04', '05', '06', '07'],
            datasets: [{
                label: 'نمو المبيعات',
                data: [5000, 7000, 4500, 9000, 12000, 8500, totalSales || 15000],
                borderColor: '#D4AF37',
                borderWidth: 3,
                pointBackgroundColor: '#D4AF37',
                fill: true,
                backgroundColor: 'rgba(212, 175, 55, 0.03)',
                tension: 0.4
            }]
        },
        options: { 
            responsive: true, 
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666' } },
                x: { grid: { display: false }, ticks: { color: '#666' } }
            }
        }
    });

    // Update Notifications
    updateNotifBell();
}

// 4. Notifications System
function toggleNotifications() {
    const drop = document.getElementById('notif-drop');
    drop.style.display = drop.style.display === 'block' ? 'none' : 'block';
}

function updateNotifBell() {
    const logs = DB.getAuditLog().slice(0, 5);
    const container = document.getElementById('notif-items');
    container.innerHTML = logs.map(l => `
        <div style="padding: 0.8rem; border-bottom: 1px solid #222; font-size: 0.8rem;">
            <p style="color:#eee;">${l.action}</p>
            <small style="color:var(--admin-accent);">${l.date}</small>
        </div>
    `).join('');
}

// 5. Orders Management
function renderOrders(filter = '') {
    const orders = DB.getOrders().filter(o => o.entity.includes(filter) || o.id.includes(filter));
    const tbody = document.getElementById('orders-tbody-pro');
    const empty = document.getElementById('orders-empty');

    if (orders.length === 0) {
        tbody.innerHTML = '';
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';
    tbody.innerHTML = orders.map(o => `
        <tr>
            <td>#${o.id}</td>
            <td><strong>${o.entity}</strong><br><small>${o.fullName}</small></td>
            <td>${o.date}</td>
            <td style="color:var(--admin-accent); font-weight:700;">${o.total.toFixed(2)}</td>
            <td><span class="badge badge-pending">في المعالجة</span></td>
            <td>
                <button class="btn-primary btn-sm" onclick="viewOrderDetails('${o.id}')">التفاصيل</button>
            </td>
        </tr>
    `).join('');
}

function viewOrderDetails(id) {
    const order = DB.getOrders().find(o => o.id === id);
    const body = document.getElementById('order-modal-body');
    
    body.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:3rem; margin-bottom:2rem; background:rgba(255,255,255,0.01); padding:2rem; border-radius:12px;">
            <div>
                <h5 style="color:var(--admin-accent); margin-bottom:1rem; text-transform:uppercase; letter-spacing:1px;">المشتري:</h5>
                <p style="font-size:1.2rem; font-weight:700;">${order.entity}</p>
                <p>${order.fullName}</p>
                <p>${order.phone}</p>
            </div>
            <div>
                <h5 style="color:var(--admin-accent); margin-bottom:1rem; text-transform:uppercase; letter-spacing:1px;">حالة الطلب:</h5>
                <p><b>التاريخ:</b> ${order.date}</p>
                <p><b>الرقم المرجعي:</b> ${order.id}</p>
                <p><b>الحالة الفنية:</b> قيد المراجعة النهائية</p>
            </div>
        </div>
        <table style="width:100%; text-align:right; border-collapse:collapse;">
            <thead style="color:var(--text-muted); border-bottom:1px solid #333;">
                <tr><th style="padding:1rem;">الصنف</th><th style="padding:1rem;">الكمية</th><th style="padding:1rem;">السعر</th></tr>
            </thead>
            <tbody>
                ${order.items.map(i => `
                    <tr style="border-bottom:1px solid #222;">
                        <td style="padding:1rem;">${i.name}</td>
                        <td style="padding:1rem;">${i.qty}</td>
                        <td style="padding:1rem;">${(i.price * i.qty).toFixed(2)} د.أ</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div style="margin-top:2rem; padding:1.5rem; background:#000; border-radius:8px; border:1px dashed #333;">
            <p><b>الملاحظات الفنية:</b> ${order.notes || 'لا يوجد ملاحظات مرفقة'}</p>
        </div>
    `;
    document.getElementById('order-detail-modal').style.display = 'flex';
}

function closeOrderModal() { document.getElementById('order-detail-modal').style.display = 'none'; }

// 6. Products Management
function renderProducts() {
    const products = DB.getProducts();
    const tbody = document.getElementById('products-tbody-pro');
    tbody.innerHTML = products.map(p => `
        <tr>
            <td>
                <div style="display:flex; align-items:center; gap:1rem;">
                    <img src="${p.img}" style="width:40px; height:40px; background:#fff; border-radius:4px; padding:2px;">
                    <div><strong>${p.name}</strong><br><small style="color:#666;">${p.tag}</small></div>
                </div>
            </td>
            <td>${p.supplier || 'Generic'}</td>
            <td style="color:var(--admin-accent); font-weight:700;">${p.price.toFixed(2)}</td>
            <td style="color:${p.stock < 10 ? '#ff4757' : '#2ecc71'};">${p.stock}</td>
            <td>
                <button class="btn-outline btn-sm" onclick="editProduct(${p.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-outline btn-sm" onclick="deleteProduct(${p.id})" style="color:#ff4757; border-color:#ff4757;"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function openProductModal() { document.getElementById('product-form-pro').reset(); document.getElementById('p-id').value = ''; document.getElementById('product-modal-pro').style.display = 'flex'; }
function closeProductModal() { document.getElementById('product-modal-pro').style.display = 'none'; }

function editProduct(id) {
    const p = DB.getProducts().find(p => p.id == id);
    document.getElementById('p-id').value = p.id;
    document.getElementById('p-name').value = p.name;
    document.getElementById('p-supplier').value = p.supplier || '';
    document.getElementById('p-price').value = p.price;
    document.getElementById('p-stock').value = p.stock;
    document.getElementById('p-desc').value = p.description || '';
    document.getElementById('product-modal-pro').style.display = 'flex';
}

function deleteProduct(id) { if(confirm('هل تود حذف هذا المنتج من المستودع؟')) { DB.deleteProduct(id); renderProducts(); } }

document.getElementById('product-form-pro')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const product = {
        id: document.getElementById('p-id').value || null,
        name: document.getElementById('p-name').value,
        supplier: document.getElementById('p-supplier').value,
        price: parseFloat(document.getElementById('p-price').value),
        stock: parseInt(document.getElementById('p-stock').value),
        description: document.getElementById('p-desc').value,
        category: 'electronics', img: 'category_laptops.png', tag: 'High-End'
    };
    DB.saveProduct(product); closeProductModal(); renderProducts();
});

// 7. Search Logic
window.handleProSearch = (val) => {
    const activeTab = document.querySelector('.nav-item.active').innerText.trim();
    if (activeTab.includes('الطلبات')) renderOrders(val);
    else if (activeTab.includes('المستودع')) {
        const rows = document.querySelectorAll('#products-tbody-pro tr');
        rows.forEach(r => r.style.display = r.innerText.includes(val) ? 'table-row' : 'none');
    }
};

function renderFullAudit() {
    const container = document.getElementById('audit-full-log');
    container.innerHTML = DB.getAuditLog().map(l => `
        <div style="padding:1rem; border-bottom:1px solid #222; font-family:monospace; font-size:0.9rem;">
            <span style="color:#666;">[${l.date}]</span> <span style="color:var(--admin-accent);">${l.user}</span>: ${l.action}
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('login-overlay').style.display === 'none') initUltimateDashboard();
});
