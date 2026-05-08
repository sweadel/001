/* sw.js - ZOLNGEN SOVEREIGN CLUSTER V133.0 (PWA) */
const CACHE_NAME = 'zolngen-v133-cache';
const ASSETS = [
    '/',
    '/index.html',
    '/admin.html',
    '/products.html',
    '/assets/global.css',
    '/src/database.js',
    '/src/security_core.js',
    '/src/ui.js',
    '/src/bridge.js',
    'https://fonts.googleapis.com/css2?family=Tajawal:wght@300;500;700;900&display=swap'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
