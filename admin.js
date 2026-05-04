// ZOLNGEN Command Center v2.0 Logic
let mainChart;

// 1. Auth & Login Logic
document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;

    if (u === 'admin' && p === 'admin123') {
        const overlay = document.getElementById('login-overlay');
        overlay.style.transition = 'opacity 1s ease, transform 1s ease';
        overlay.style.opacity = '0';
        overlay.style.transform = 'scale(1.1)';
        
        setTimeout(() => {
            overlay.style.display = 'none';
            document.getElementById('admin-shell').style.display = 'grid';
            DB.logAction('System Initialized: Root Access Granted');
            initCommandCenter();
        }, 1000);
    } else {
        const err = document.getElementById('login-error');
        err.style.display = 'block';
        err.style.animation = 'shake 0.3s';
    }
});

function logout() { location.reload(); }

// 2. Tab Navigation
function showTab(tab) {
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.admin-nav-link').forEach(l => l.classList.remove('active'));
    document.getElementById(tab + '-tab').style.display = 'block';
    event.currentTarget.classList.add('active');
    
    if (tab === 'dashboard') initCommandCenter();
    if (tab === 'orders') renderOrders();
    if (tab === 'products') renderInventory();
    if (tab === 'audit') renderAuditLogs();
}

// 3. Command Center (Dashboard)
function initCommandCenter() {
    const orders = DB.getOrders();
    const products = DB.getProducts();
    const entities = [...new Set(orders.map(o => o.entity))];
    const sales = orders.reduce((acc, o) => acc + o.total, 0);

    document.getElementById('stat-sales').innerText = sales.toLocaleString() + ' JOD';
    document.getElementById('stat-orders').innerText = orders.length;
    document.getElementById('stat-entities').innerText = entities.length;

    // Mini Logs
    const mini = document.getElementById('mini-logs');
    mini.innerHTML = DB.getAuditLog().slice(0, 6).map(l => `
        <div style="border-bottom: 1px solid rgba(255,255,255,0.02); padding: 5px 0;">
            <span style="color:#444;">[${l.date.split(' ')[0]}]</span> 
            <span style="color:var(--primary-gold);">${l.action}</span>
        </div>
    `).join('');

    // Chart.js
    const ctx = document.getElementById('mainChart').getContext('2d');
    if (mainChart) mainChart.destroy();
    mainChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['01', '02', '03', '04', '05', '06', '07'],
            datasets: [{
                label: 'Revenue Stream',
                data: [4000, 7000, 5000, 11000, 15000, 12000, sales || 18000],
                borderColor: '#D4AF37',
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: '#D4AF37',
                fill: true,
                backgroundColor: 'rgba(212, 175, 55, 0.05)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.02)' }, ticks: { color: '#444' } },
                x: { grid: { display: false }, ticks: { color: '#444' } }
            }
        }
    });
}

// 4. Order Rendering
function renderOrders() {
    const tbody = document.querySelector('#orders-table tbody');
    tbody.innerHTML = DB.getOrders().map(o => `
        <tr>
            <td>#${o.id}</td>
            <td><strong>${o.entity}</strong><br><small style="color:#555;">${o.fullName}</small></td>
            <td>${o.date}</td>
            <td style="color:var(--primary-gold); font-weight:700;">${o.total.toFixed(2)}</td>
            <td><span class="status-pill pill-gold">PROCESSING</span></td>
            <td><button class="btn-primary btn-sm" onclick="alert('Viewing Details for ' + '${o.id}')">VIEW</button></td>
        </tr>
    `).join('');
}

// 5. Inventory Rendering
function renderInventory() {
    const tbody = document.querySelector('#products-table tbody');
    tbody.innerHTML = DB.getProducts().map(p => `
        <tr>
            <td><strong>${p.name}</strong><br><small style="color:#555;">${p.category}</small></td>
            <td style="color:var(--primary-gold);">${p.price.toFixed(2)}</td>
            <td style="color:${p.stock < 10 ? '#ff4757' : '#2ecc71'};">${p.stock}</td>
            <td>${p.supplier || 'N/A'}</td>
            <td>
                <button class="btn-outline btn-sm" onclick="editProduct(${p.id})"><i class="fas fa-cog"></i></button>
            </td>
        </tr>
    `).join('');
}

// 6. Audit Log Rendering
function renderAuditLogs() {
    const container = document.getElementById('full-audit-log');
    container.innerHTML = DB.getAuditLog().map(l => `
        <div>[${l.date}] > USER: ${l.user} > ACTION: <span style="color:#fff;">${l.action}</span></div>
    `).join('');
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
    document.getElementById('prod-desc').value = p.description || '';
    document.getElementById('product-modal').style.display = 'flex';
}

document.getElementById('product-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const product = {
        id: document.getElementById('prod-id').value || null,
        name: document.getElementById('prod-name').value,
        supplier: document.getElementById('prod-supplier').value,
        price: parseFloat(document.getElementById('prod-price').value),
        stock: parseInt(document.getElementById('prod-stock').value),
        description: document.getElementById('prod-desc').value,
        category: 'electronics', img: 'category_laptops.png', tag: 'High-End'
    };
    DB.saveProduct(product); closeModal(); renderInventory();
});

console.log("ZOLNGEN CommandCenter v2.0 Active");
