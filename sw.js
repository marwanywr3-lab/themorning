const CACHE = 'themorning-shell-v3';
const SHELL = ['./', './index.html', './style.css', './app.js?v=3', './manifest.json', './icon.svg', './icon-192.png', './icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const old = (await caches.keys()).filter(k => k.startsWith('themorning-shell-') && k !== CACHE);
    await Promise.all(old.map(k => caches.delete(k)));
    await self.clients.claim();
    // Older releases had no update listener. Refresh their open dashboard once,
    // after the replacement shell is fully cached, without clearing local state.
    if (old.length) {
      const windows = await self.clients.matchAll({type: 'window'});
      await Promise.all(windows.filter(client => client.url.startsWith(self.registration.scope)).map(client => client.navigate(client.url).catch(() => {})));
    }
  })());
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // Never intercept or cache Google tokens, user data, or third-party requests.
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request, {cache: 'no-cache'}).catch(() => caches.match('./index.html')));
    return;
  }
  if (!SHELL.some(path => new URL(path, self.registration.scope).pathname === url.pathname)) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok) { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); }
    return response;
  })));
});
