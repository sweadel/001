/* ZOLNGEN AUTH SYSTEM V100.0 */
const Auth = {
    login: function(user, pass, isAdmin = false) {
        const accounts = isAdmin ? DB.getAccounts() : DB.getClientAccounts();
        const found = accounts.find(a => (isAdmin ? a.user === user : a.name === user) && a.pass === pass);
        
        if (found) {
            const sessionData = {
                user: user,
                role: isAdmin ? 'ADMIN' : 'CLIENT',
                inst: isAdmin ? 'ZOLNGEN HQ' : (found.inst || 'Private Entity'),
                timestamp: Date.now()
            };
            sessionStorage.setItem('zolngen_session', JSON.stringify(sessionData));
            DB.logAction(`Login Successful: ${user} (${sessionData.role})`);
            return true;
        }
        return false;
    },

    logout: function() {
        const session = this.getSession();
        if(session) DB.logAction(`Logout: ${session.user}`);
        sessionStorage.removeItem('zolngen_session');
        window.location.href = 'index.html';
    },

    getSession: function() {
        return JSON.parse(sessionStorage.getItem('zolngen_session'));
    },

    isAuthenticated: function(requiredRole = null) {
        const session = this.getSession();
        if (!session) return false;
        if (requiredRole && session.role !== requiredRole) return false;
        return true;
    },

    checkAccess: function(requiredRole) {
        if (!this.isAuthenticated(requiredRole)) {
            alert('Access Denied. Redirecting to home...');
            window.location.href = 'index.html';
        }
    }
};

window.Auth = Auth;
