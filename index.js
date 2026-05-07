/* INDEX PAGE INTERACTIVE LOGIC - V100.4 */
function toggleMobileMenu() { 
    document.getElementById('mobile-menu').classList.toggle('open'); 
}

function attemptLogin() {
    const u = document.getElementById('login-user').value;
    const p = document.getElementById('login-pass').value;
    if(Auth.login(u, p)) {
        UI.showToast('تم الدخول بنجاح');
        const session = Auth.getSession();
        setTimeout(() => {
            window.location.href = (session.role === 'ADMIN' ? 'admin.html' : 'client-dashboard.html');
        }, 1000);
    } else {
        UI.showToast('بيانات غير صحيحة');
    }
}

function handleBotChat() {
    const input = document.getElementById('bot-input');
    const box = document.getElementById('bot-messages');
    if(!input.value) return;
    box.innerHTML += `<div class="text-right text-gold font-bold mb-2">أنت: ${input.value}</div>`;
    const reply = Bot.process(input.value);
    box.innerHTML += `<div class="bg-white/5 p-4 rounded-2xl mb-4 border border-white/5">ZOLNGEN: ${reply}</div>`;
    input.value = ''; 
    box.scrollTop = box.scrollHeight;
}

window.addEventListener('DOMContentLoaded', () => {
    UI.initNeural();
});
