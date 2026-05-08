/* bridge.js - ZOLNGEN SOVEREIGN CLUSTER V133.0 (CONNECTIVITY) */
const SovereignBridge = {
    serverActive: true,

    init() {
        this.monitorPulse();
    },

    // MONITOR SERVER PULSE
    async monitorPulse() {
        setInterval(async () => {
            try {
                const response = await fetch('/api/data');
                this.updateStatus(response.ok);
            } catch (e) {
                this.updateStatus(false);
            }
        }, 5000);
    },

    updateStatus(isActive) {
        this.serverActive = isActive;
        const statusEl = document.getElementById('server-status');
        if (statusEl) {
            if (isActive) {
                statusEl.innerHTML = '<i class="fas fa-link"></i> Connected to Sovereign Backend';
                statusEl.style.color = '#D4AF37';
            } else {
                statusEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i> SOVEREIGNTY IN DANGER: BACKEND OFFLINE';
                statusEl.style.color = '#ff4444';
                statusEl.classList.add('animate-pulse');
            }
        }
    },

    // ACTIVATE THE HEALER
    async activateHealer() {
        if (window.ZolngenUI) window.ZolngenUI.showToast("Initiating Radical Heal...", "info");
        try {
            const response = await fetch('/api/guardian', { method: 'POST' });
            if (response.ok) {
                if (window.ZolngenUI) window.ZolngenUI.showToast("Healer Active: Structure Verified.", "success");
            }
        } catch (e) {
            if (window.ZolngenUI) window.ZolngenUI.showToast("Guardian Connection Failed.", "error");
        }
    }
};

document.addEventListener('DOMContentLoaded', () => SovereignBridge.init());
window.SovereignBridge = SovereignBridge;
