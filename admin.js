// ZOLNGEN COMMAND CENTER v18 - DYNAMIC ERP STANDARD
let growthChart;
let currentTab = 'dashboard';

document.addEventListener('DOMContentLoaded', () => {
    // --- AUTH LOGIC ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const u = document.getElementById('username').value;
            const p = document.getElementById('password').value;
            if (u === 'admin' && p === 'admin123') {
                document.getElementById('login-overlay').style.display = 'none';
                document.getElementById('admin-shell').style.display = 'grid';
                DB.logAction('تسجيل دخول ناجح للمدير');
                initAdmin();
            } else alert('Access Denied: Invalid Credentials');
        });
    }

    const initAdmin = () => { showTab('dashboard'); };

    const showTab = (tab) => {
        currentTab = tab;
        document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        
        const target = document.getElementById(tab + '-tab');
        if (target) target.style.display = 'block';
        
        document.querySelectorAll('.sidebar .nav-link').forEach(link => {
            if (link.getAttribute('data-tab') === tab) link.classList.add('active');
        });

        refreshData();
    };

    const refreshData = () => {
        if (currentTab === 'dashboard') renderDashboard();
        if (currentTab === 'orders') renderOrders();
        if (currentTab === 'inventory') renderInventory();
        if (currentTab === 'audit') renderAudit();
    };

    const renderDashboard = () => {
        const stats = DB.getStats();
        const orders = DB.getOrders();
        const totalSales = orders.reduce((acc, o) => acc + (o.total || 0), 0);

        // Update real counters (No fake numbers)
        document.getElementById('stat-sales').innerText = totalSales.toLocaleString() + ' JOD';
        document.getElementById('stat-orders').innerText = stats.orders;
        document.getElementById('stat-entities').innerText = stats.entities;
        document.getElementById('stat-low-stock').innerText = DB.getProducts().filter(p => p.stock < 10).length;

        const ctx = document.getElementById('growthChart')?.getContext('2d');
        if (!ctx) return;
        if (growthChart) growthChart.destroy();
        growthChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                datasets: [{
                    label: 'Revenue', data: [5000, 15000, 10000, totalSales],
                    borderColor: '#D4AF37', tension: 0.4, fill: true, backgroundColor: 'rgba(212, 175, 55, 0.05)'
                }]
            },
            options: { responsive: true, plugins: { legend: { display: false } } }
        });
    };

    const renderOrders = (filter = '') => {
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
                    <button class="btn-action btn-outline btn-sm view-order" data-id="${o.id}">عرض</button>
                    <button class="btn-action btn-gold btn-sm update-order" data-id="${o.id}">تسليم</button>
                </td>
            </tr>
        `).join('');

        tbody.querySelectorAll('.view-order').forEach(btn => btn.addEventListener('click', (e) => viewOrder(e.target.dataset.id)));
        tbody.querySelectorAll('.update-order').forEach(btn => btn.addEventListener('click', (e) => {
            DB.updateOrderStatus(e.target.dataset.id, 'delivered');
            refreshData();
        }));
    };

    const viewOrder = (id) => {
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
    };

    const renderInventory = () => {
        const tbody = document.getElementById('inventory-tbody');
        if (!tbody) return;
        tbody.innerHTML = DB.getProducts().map(p => `
            <tr>
                <td><strong>${p.name}</strong><br><small style="color:#444;">${p.category}</small></td>
                <td style="color:var(--primary); font-weight:700;">${(p.price || 0).toFixed(2)}</td>
                <td style="color:${p.stock < 10 ? '#ff4757' : '#2ecc71'}">${p.stock}</td>
                <td>${p.supplier || 'N/A'}</td>
                <td>
                    <button class="btn-action btn-outline btn-sm edit-prod" data-id="${p.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn-action btn-outline btn-sm delete-prod" data-id="${p.id}" style="color:#ff4757;"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');

        tbody.querySelectorAll('.edit-prod').forEach(btn => btn.addEventListener('click', (e) => editProd(e.target.closest('button').dataset.id)));
        tbody.querySelectorAll('.delete-prod').forEach(btn => btn.addEventListener('click', (e) => {
            if (confirm('هل أنت متأكد من الحذف؟')) {
                DB.deleteProduct(e.target.closest('button').dataset.id);
                refreshData();
            }
        }));
    };

    const editProd = (id) => {
        const p = DB.getProducts().find(p => String(p.id) === String(id));
        if (!p) return;
        document.getElementById('p-id').value = p.id;
        document.getElementById('p-name').value = p.name;
        document.getElementById('p-supplier').value = p.supplier || '';
        document.getElementById('p-price').value = p.price;
        document.getElementById('p-stock').value = p.stock;
        document.getElementById('product-modal').style.display = 'flex';
    };

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
        refreshData();
    });

    const renderAudit = () => {
        const container = document.getElementById('audit-log-container');
        if (!container) return;
        container.innerHTML = DB.getAuditLog().map(l => `
            <div style="padding:10px; border-bottom:1px solid #111;">[${l.date}] <b>${l.user}</b>: ${l.action}</div>
        `).join('');
    };

    const closeModal = () => document.querySelectorAll('.pro-modal').forEach(m => m.style.display = 'none');

    // Bind sidebar links
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        link.addEventListener('click', (e) => showTab(e.target.closest('.nav-link').getAttribute('data-tab')));
    });

    // Global Exposure for Search
    window.handleSearch = (val) => {
        if (currentTab === 'orders') renderOrders(val);
        if (currentTab === 'inventory') {
            const rows = document.querySelectorAll('#inventory-tbody tr');
            rows.forEach(r => r.style.display = r.innerText.toLowerCase().includes(val.toLowerCase()) ? 'table-row' : 'none');
        }
    };
    window.closeModal = closeModal;
    window.openProductModal = () => {
        document.getElementById('product-form').reset();
        document.getElementById('p-id').value = '';
        document.getElementById('product-modal').style.display = 'flex';
    };

    // Initialize
    if (document.getElementById('admin-shell').style.display !== 'none') initAdmin();
});
