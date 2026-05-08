/* ZOLNGEN AUTH MASTER V100.6 */
const Auth = {
    login: function(user, pass) {
        const accs = DB.getAccounts();
        const found = accs.find(a => a.user === user && a.pass === pass);
        if (found) {
            localStorage.setItem('zolngen_session', JSON.stringify(found));
            DB.logAction(`Access Granted: ${found.name} (${found.role})`);
            return true;
        }
        DB.logAction(`Access Denied: ${user}`);
        return false;
    },

    logout: function() {
        const session = this.getSession();
        if(session) DB.logAction(`Session Terminated: ${session.name}`);
        localStorage.removeItem('zolngen_session');
        window.location.href = 'index.html';
    },

    getSession: function() {
        const s = localStorage.getItem('zolngen_session');
        return s ? JSON.parse(s) : null;
    },

    checkAccess: function(role) {
        const session = this.getSession();
        if (!session) return false;
        if (role && session.role !== role) return false;
        return true;
    }
};

window.Auth = Auth;
