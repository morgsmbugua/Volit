// BUILD: 20260304000001
const CACHE = 'hfin-20260304000001';
const ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const isDoc = e.request.destination === 'document' || e.request.url.endsWith('.html') || e.request.url.endsWith('/');
  if (isDoc) {
    e.respondWith(
      fetch(e.request).then(r => { if(r.ok){const c=r.clone();caches.open(CACHE).then(ca=>ca.put(e.request,c));} return r; })
        .catch(() => caches.match(e.request))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(c => c || fetch(e.request).then(r => {
        if(r.ok){const cl=r.clone();caches.open(CACHE).then(ca=>ca.put(e.request,cl));} return r;
      }).catch(() => new Response('Offline',{status:503})))
    );
  }
});
