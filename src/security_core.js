/* security_core.js - ZOLNGEN SOVEREIGN CLUSTER V133.0 (BLOCKCHAIN) */
const SecurityCore = {
    // BLOCKCHAIN HASH GENERATOR
    generateHash(data, prevHash) {
        const raw = `${JSON.stringify(data)}${prevHash}`;
        return this.simpleHash(raw);
    },

    simpleHash(string) {
        let hash = 0;
        for (let i = 0; i < string.length; i++) {
            hash = ((hash << 5) - hash) + string.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
    },

    // LOG WITH BLOCKCHAIN SIGNATURE
    logAction(type, detail) {
        if (!window.ZolngenDB) return;
        
        const logs = window.ZolngenDB.select('audit_log');
        const prevHash = logs.length > 0 ? logs[logs.length - 1].hash : "00000000";
        
        const entry = {
            timestamp: new Date().toISOString(),
            type: type,
            detail: detail,
            id: `ZOLN-${Math.random().toString(36).substring(7).toUpperCase()}`
        };

        entry.hash = this.generateHash(entry, prevHash);
        
        window.ZolngenDB.insert('audit_log', entry);
        console.log(`[BLOCKCHAIN] Block Signed: ${entry.hash}`);
        return entry.hash;
    }
};

window.SecurityCore = SecurityCore;
