// sw.js
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  // You can cache assets here if needed
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
});

self.addEventListener('fetch', (event) => {
  console.log('Fetching:', event.request.url);
  // You can handle requests here
});
