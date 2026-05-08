/* INDEX PAGE LOGIC - V100.8 MASTER */
function init() {
    UI.initNeural();
    updateUI();
}

function updateUI() {
    const session = Auth.getSession();
    const loginBtn = document.getElementById('login-btn');
    const adminLink = document.getElementById('admin-link');

    if (session) {
        if(loginBtn) loginBtn.innerText = 'خروج (' + session.user + ')';
        if(loginBtn) loginBtn.onclick = () => { Auth.logout(); };
        if (session.role === 'ADMIN' && adminLink) adminLink.classList.remove('hidden');
    } else {
        if(loginBtn) loginBtn.innerText = 'دخول';
        if(loginBtn) loginBtn.onclick = () => openLogin();
        if(adminLink) adminLink.classList.add('hidden');
    }
}

function openLogin() {
    document.getElementById('modal-bg').classList.remove('hidden');
    document.getElementById('login-modal').classList.remove('hidden');
}

function closeLogin() {
    document.getElementById('modal-bg').classList.add('hidden');
    document.getElementById('login-modal').classList.add('hidden');
}

function handleLogin() {
    const u = document.getElementById('user').value;
    const p = document.getElementById('pass').value;
    if (Auth.login(u, p)) {
        UI.showToast('تم تسجيل الدخول بنجاح');
        closeLogin(); // AUTO-CLOSE MODAL
        updateUI();
        if (Auth.getSession().role === 'ADMIN') {
            setTimeout(() => window.location.href = 'admin.html', 1000);
        }
    } else {
        UI.showToast('بيانات الدخول غير صحيحة');
    }
}

document.addEventListener('DOMContentLoaded', init);
