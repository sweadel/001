/* ADMIN PAGE ORCHESTRATION LOGIC - V100.6 MASTER */
function checkInit() {
    if (Auth.checkAccess('ADMIN')) {
        document.getElementById('admin-content').classList.remove('hidden');
        document.getElementById('admin-lock-screen').classList.add('hidden');
        renderAdmin();
        document.getElementById('admin-name').innerText = Auth.getSession().name;
    } else {
        document.getElementById('admin-content').classList.add('hidden');
        document.getElementById('admin-lock-screen').classList.remove('hidden');
    }
}

function unlockAdmin() {
    const u = document.getElementById('lock-user').value;
    const p = document.getElementById('lock-pass').value;
    if(Auth.login(u, p) && Auth.getSession().role === 'ADMIN') {
        UI.showToast('مرحباً بك في مركز القيادة');
        checkInit();
    } else {
        UI.showToast('بيانات غير صحيحة');
    }
}

function showTab(id) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + id).classList.remove('hidden');
    event.currentTarget.classList.add('active');
    
    // Header Title Mapping
    const titles = { overview: 'Command Center', inventory: 'Supply Chain', orders: 'Operations', accounts: 'Human Capital', chat: 'Unified Comms' };
    document.getElementById('tab-title').innerText = titles[id] || 'Admin Console';

    if(id === 'chat') populateChatSelect();
    renderAdmin();
}

function renderAdmin() {
    const stats = DB.getProStats();
    document.getElementById('stat-sales').innerText = stats.totalSales.toLocaleString() + ' JOD';
    document.getElementById('stat-profit').innerText = (stats.totalSales * 0.2).toLocaleString() + ' JOD';
    document.getElementById('stat-inv').innerText = stats.inventoryValue.toLocaleString() + ' JOD';
    document.getElementById('stat-tck').innerText = stats.openTickets;

    // Inventory Rendering
    const invBody = document.getElementById('inv-body');
    invBody.innerHTML = DB.getProducts().map(p => `
        <tr class="border-b border-white/5 hover:bg-white/5 transition-all">
            <td class="p-6 font-bold text-sm">${p.name}</td>
            <td class="p-6 text-gray-500 text-xs">${p.category}</td>
            <td class="p-6 text-gold font-black">${p.price} JOD</td>
            <td class="p-6 font-mono">${p.stock}</td>
            <td class="p-6 flex gap-3">
                <button onclick="editP('${p.id}')" class="hover:text-gold transition-all"><i class="fas fa-edit"></i></button>
                <button onclick="if(confirm('حذف المنتج؟')) { DB.deleteProduct('${p.id}'); renderAdmin(); }" class="text-red-500 hover:scale-110 transition-all"><i class="fas fa-trash-alt"></i></button>
            </td>
        </tr>
    `).join('');

    // Accounts Rendering
    const accGrid = document.getElementById('acc-grid');
    accGrid.innerHTML = DB.getAccounts().map(a => `
        <div class="glass p-8 rounded-[32px] border border-white/5 relative group overflow-hidden">
            <div class="absolute top-0 left-0 w-1 h-full ${a.role === 'ADMIN' ? 'bg-gold' : 'bg-blue-500'}"></div>
            <h5 class="text-lg font-bold">${a.name}</h5>
            <p class="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">${a.role} • ${a.user}</p>
            <button onclick="if(confirm('حذف الحساب؟')){ DB.deleteAccount('${a.user}'); renderAdmin(); }" class="mt-6 text-red-500 text-[10px] opacity-0 group-hover:opacity-100 transition-all hover:underline">إزالة الحساب</button>
        </div>
    `).join('');

    renderChart();
}

function renderChart() {
    const ctx = document.getElementById('forecastChart');
    if (!ctx) return;
    const stats = DB.getProStats();
    if(window.myChart) window.myChart.destroy();
    window.myChart = new Chart(ctx, {
        type: 'line',
        data: { 
            labels: ['Q1', 'Q2', 'Q3', 'Q4'], 
            datasets: [{ 
                data: [stats.totalSales*0.6, stats.totalSales*0.8, stats.totalSales, stats.totalSales*1.3], 
                borderColor: '#D4AF37', 
                borderWidth: 3,
                tension: 0.4, 
                fill: true, 
                backgroundColor: 'rgba(212, 175, 55, 0.05)',
                pointBackgroundColor: '#D4AF37'
            }] 
        },
        options: { 
            responsive: true, 
            plugins: { legend: { display: false } }, 
            scales: { y: { display: false }, x: { grid: { display: false }, ticks: { color: '#444' } } } 
        }
    });
}

function populateChatSelect() {
    const sel = document.getElementById('chat-select');
    const entities = [...new Set(DB.getOrders().map(o => o.entity))];
    sel.innerHTML = entities.map(e => `<option value="${e}">${e}</option>`).join('') || '<option value="">لا توجد رسائل</option>';
    loadChat();
}

function loadChat() {
    const ent = document.getElementById('chat-select').value;
    const box = document.getElementById('chat-box');
    if(!ent) { box.innerHTML = '<p class="text-center text-gray-700 py-20">ابدأ محادثة مع مؤسسة</p>'; return; }
    const msgs = DB.getMessages(ent);
    box.innerHTML = msgs.map(m => `
        <div class="chat-bubble ${m.sender === 'ADMIN' ? 'sent' : 'received'}">
            <p class="font-bold text-[9px] mb-1 opacity-40 uppercase">${m.sender}</p>
            <p>${m.text}</p>
            <small class="text-[7px] block mt-1 opacity-30">${m.date}</small>
        </div>
    `).join('');
    box.scrollTop = box.scrollHeight;
}

function sendChat() {
    const input = document.getElementById('chat-input');
    const ent = document.getElementById('chat-select').value;
    if(!input.value || !ent) return;
    DB.sendMessage({ sender: 'ADMIN', receiver: ent, text: input.value, entity: ent });
    input.value = ''; loadChat();
}

function editP(id) {
    const p = DB.getProducts().find(x => x.id === id);
    if (!p) return;
    document.getElementById('p-id').value = p.id;
    document.getElementById('p-name').value = p.name;
    document.getElementById('p-cat').value = p.category;
    document.getElementById('p-price').value = p.price;
    document.getElementById('p-stock').value = p.stock;
    openProdModal();
}

function openProdModal() { document.getElementById('modal-bg').classList.remove('hidden'); document.getElementById('prod-modal').classList.remove('hidden'); }
function openAccModal() { document.getElementById('modal-bg').classList.remove('hidden'); document.getElementById('acc-modal').classList.remove('hidden'); }
function closeModals() { document.getElementById('modal-bg').classList.add('hidden'); document.getElementById('prod-modal').classList.add('hidden'); document.getElementById('acc-modal').classList.add('hidden'); }

document.addEventListener('DOMContentLoaded', () => {
    UI.initNeural();
    checkInit();

    // Form Event Listeners
    const prodForm = document.getElementById('prod-form');
    if (prodForm) {
        prodForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = { 
                name: document.getElementById('p-name').value, 
                category: document.getElementById('p-cat').value, 
                price: parseFloat(document.getElementById('p-price').value), 
                stock: parseInt(document.getElementById('p-stock').value), 
                img: 'images/hp.png',
                specs: 'New Institutional Unit'
            };
            const id = document.getElementById('p-id').value;
            if(id) DB.saveProduct({id, ...data}); else DB.saveProduct(data);
            UI.showToast('تم تحديث المخزون'); closeModals(); renderAdmin();
        });
    }

    const accForm = document.getElementById('acc-form');
    if (accForm) {
        accForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = { 
                user: document.getElementById('a-user').value, 
                name: document.getElementById('a-name').value, 
                pass: document.getElementById('a-pass').value, 
                role: document.getElementById('a-role').value,
                email: document.getElementById('a-user').value + '@zolngen.com'
            };
            DB.saveAccount(data);
            UI.showToast('تم إنشاء الحساب'); closeModals(); renderAdmin();
        });
    }
});
