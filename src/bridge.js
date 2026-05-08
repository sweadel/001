/* bridge.js - ZOLNGEN PRECISE BRIDGE V134.0 */
const SovereignBridge = {
    isSecured: false,

    init() {
        this.checkSovereignStatus();
        setInterval(() => this.checkSovereignStatus(), 5000);
    },

    // POINT (71) - HTTP PROTOCOL CHECK
    async checkSovereignStatus() {
        const statusEl = document.getElementById('sovereign-status-badge');
        try {
            const response = await fetch('/api/data');
            if (response.ok) {
                this.isSecured = true;
                if (statusEl) {
                    statusEl.innerHTML = '<span class="px-4 py-2 bg-green-500/20 text-green-500 rounded-full text-[10px] font-black border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.3)]"><i class="fas fa-shield-check"></i> النظام مؤمن سيادياً</span>';
                }
            }
        } catch (e) {
            this.isSecured = false;
            if (statusEl) {
                statusEl.innerHTML = '<span class="px-4 py-2 bg-red-500/20 text-red-500 rounded-full text-[10px] font-black border border-red-500/30 animate-pulse"><i class="fas fa-exclamation-triangle"></i> السيادة في خطر - الخادم متوقف</span>';
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => SovereignBridge.init());
window.SovereignBridge = SovereignBridge;
