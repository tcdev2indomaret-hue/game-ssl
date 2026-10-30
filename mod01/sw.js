/* Service worker Game SSL MOD-01 · TCD2 - ETD © 2026
   Naikkan VERSI setiap kali index.html diubah, supaya HP peserta mengambil versi baru. */
const VERSI = 'mod01-v4';
const INTI = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSI).then(c => c.addAll(INTI)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSI).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;                 // kiriman nilai (POST) tidak pernah di-cache
  const url = new URL(req.url);
  if (/script\.google(usercontent)?\.com$/.test(url.hostname)) return;

  // Halaman: ambil versi terbaru dulu, pakai cache jika tidak ada sinyal
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => {
      const c = r.clone(); caches.open(VERSI).then(x => x.put('./index.html', c)); return r;
    }).catch(() => caches.match('./index.html')));
    return;
  }

  // File lain (ikon, font): cache dulu, perbarui di belakang
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(r => {
      if (r && (r.ok || r.type === 'opaque')) { const c = r.clone(); caches.open(VERSI).then(x => x.put(req, c)); }
      return r;
    }).catch(() => hit);
    return hit || net;
  }));
});
