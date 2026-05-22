self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Skip service worker for audio/video to avoid Range request issues
    if (event.request.destination === 'audio' || event.request.destination === 'video') {
        return;
    }
    
    event.respondWith(
        fetch(event.request).catch(() => {
            // Optional: Return a fallback for offline if needed
        })
    );
});
