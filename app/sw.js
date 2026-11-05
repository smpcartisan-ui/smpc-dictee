/* SMPC – service worker de l'application installée.
   La page et ses icônes sont servies depuis le téléphone (ouverture immédiate, même sans réseau),
   puis relues en arrière-plan : une nouvelle version s'affiche au lancement suivant.
   Les appels à la webapp Google ne passent jamais par ce cache (les données sont gardées par la page). */
var VERSION = '83c1a78126';
var CACHE = 'smpc-app-' + VERSION;
var FICHIERS = ['./', 'index.html', 'manifest.json', 'icone-192.png', 'icone-512.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FICHIERS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k.indexOf('smpc-app-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(e.request, { ignoreSearch: true }).then(function (r) {
      var reseau = fetch(e.request).then(function (n) { if (n.ok) c.put(e.request, n.clone()); return n; });
      return r || reseau;
    });
  }));
});
