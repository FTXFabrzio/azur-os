
// Mock Service Worker
self.addEventListener('install', (event) => {
    console.log('MOCK SW Installed');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('MOCK SW Activated');
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Pass through
});
