/* ZOLNGEN AUTH MASTER V100.4 */
const Auth = {
    login: function(user, pass) {
        const accs = DB.getAccounts();
        const found = accs.find(a => a.user === user && a.pass === pass);
        if (found) {
            localStorage.setItem('zolngen_session', JSON.stringify(found));
            DB.logAction(`Login Success: ${found.name}`);
            return true;
        }
        return false;
    },

    logout: function() {
        localStorage.removeItem('zolngen_session');
        window.location.href = 'index.html';
    },

    getSession: function() {
        const s = localStorage.getItem('zolngen_session');
        return s ? JSON.parse(s) : null;
    },

    checkAccess: function(role) {
        const session = this.getSession();
        if (!session || (role && session.role !== role)) {
            // Instead of immediate redirect, we notify the caller
            return false;
        }
        return true;
    }
};

window.Auth = Auth;
