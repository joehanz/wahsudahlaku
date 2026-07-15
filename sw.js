// sw.js - File ini wajib ada supaya pembaruan berjalan
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
