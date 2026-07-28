// Pengaturan iklan & domain
self.options = {
  "domain": "5gvci.com",
  "zoneId": 11439425
};
self.lary = "";

// Memuat file inti iklan
importScripts('https://5gvci.com/act/files/service-worker.min.js?r=sw');

// Tambahan agar pembaruan berjalan lancar
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
