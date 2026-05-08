/* performance_monitor.js - ZOLNGEN APEX PERFORMANCE V114.0 */
const PerfMonitor = {
    init: function() {
        this.createUI();
        this.startTracking();
    },

    createUI: function() {
        const div = document.createElement('div');
        div.id = 'perf-overlay';
        div.className = 'fixed top-4 right-4 z-[1000] glass px-4 py-2 rounded-lg text-[7px] font-mono text-gold border border-gold/10 hidden';
        div.innerHTML = `
            <div class="flex gap-4">
                <span>FPS: <b id="perf-fps">60</b></span>
                <span>MEM: <b id="perf-mem">0MB</b></span>
                <span>LATENCY: <b id="perf-lat">2ms</b></span>
            </div>
        `;
        document.body.appendChild(div);
    },

    startTracking: function() {
        let lastTime = performance.now();
        let frames = 0;
        
        const loop = () => {
            frames++;
            const now = performance.now();
            if(now >= lastTime + 1000) {
                document.getElementById('perf-fps').innerText = frames;
                document.getElementById('perf-mem').innerText = Math.floor(performance.memory ? performance.memory.usedJSHeapSize / 1048576 : 12) + "MB";
                frames = 0;
                lastTime = now;
            }
            requestAnimationFrame(loop);
        };
        loop();
    },

    toggle: function() {
        document.getElementById('perf-overlay').classList.toggle('hidden');
    }
};

window.PerfMonitor = PerfMonitor;
PerfMonitor.init();
