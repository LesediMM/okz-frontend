// public/sw.js
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    self.skipWaiting();
  });
  
  self.addEventListener('activate', (event) => {
    console.log('Service Worker activated');
  });
  
  self.addEventListener('fetch', (event) => {
    // For now, just log requests
    console.log('Fetching:', event.request.url);
  });
  