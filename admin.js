/* ADMIN PAGE ORCHESTRATION LOGIC - V100.4 */
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
    if(id === 'chat') populateChatSelect();
    renderAdmin();
}

function renderAdmin() {
    const stats = DB.getProStats();
    document.getElementById('stat-sales').innerText = stats.totalSales.toLocaleString() + ' JOD';
    document.getElementById('stat-profit').innerText = stats.totalProfit.toLocaleString() + ' JOD';
    document.getElementById('stat-inv').innerText = stats.inventoryValue.toLocaleString() + ' JOD';
    document.getElementById('stat-tck').innerText = stats.openTickets;

    // Inventory
    const invBody = document.getElementById('inv-body');
    invBody.innerHTML = DB.getProducts().map(p => `
        <tr class="border-b border-white/5">
            <td class="p-6 font-bold text-sm">${p.name}</td>
            <td class="p-6 text-gray-500 text-xs">${p.category}</td>
            <td class="p-6 text-gold font-black">${p.price} JOD</td>
            <td class="p-6">${p.stock}</td>
            <td class="p-6 flex gap-3">
                <button onclick="editP('${p.id}')">📝</button>
                <button onclick="DB.deleteProduct('${p.id}'); renderAdmin();">🗑️</button>
            </td>
        </tr>
    `).join('');

    // Accounts
    const accGrid = document.getElementById('acc-grid');
    accGrid.innerHTML = DB.getAccounts().map(a => `
        <div class="glass p-8 rounded-[32px] border border-white/5 relative group">
            <div class="absolute top-0 left-0 w-1 h-full ${a.role === 'ADMIN' ? 'bg-gold' : 'bg-blue-500'}"></div>
            <h5 class="text-lg font-bold">${a.name}</h5>
            <p class="text-[10px] text-gray-500 mt-1 uppercase">${a.role} • ${a.user}</p>
            <button onclick="DB.deleteAccount('${a.user}'); renderAdmin();" class="mt-6 text-red-500 text-[10px] opacity-0 group-hover:opacity-100 transition-all">حذف</button>
        </div>
    `).join('');

    renderChart();
}

function populateChatSelect() {
    const sel = document.getElementById('chat-select');
    const entities = [...new Set(DB.getOrders().map(o => o.entity))];
    sel.innerHTML = entities.map(e => `<option value="${e}">${e}</option>`).join('') || '<option>لا توجد رسائل</option>';
    loadChat();
}

function loadChat() {
    const ent = document.getElementById('chat-select').value;
    const box = document.getElementById('chat-box');
    if(!ent) return;
    const msgs = DB.getMessages(ent);
    box.innerHTML = msgs.map(m => `
        <div class="chat-bubble ${m.sender === 'ADMIN' ? 'sent' : 'received'}">
            <p class="font-bold text-[9px] mb-1 opacity-40">${m.sender}</p>
            <p>${m.text}</p>
            <small class="text-[7px] block mt-1 opacity-30">${m.date}</small>
        </div>
    `).join('');
    box.scrollTop = box.scrollHeight;
}

window.addEventListener('DOMContentLoaded', () => {
    UI.initNeural();
    checkInit();
});
