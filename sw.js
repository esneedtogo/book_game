const CACHE_NAME = 'knigolyub-v4';
const ASSETS = ['./index.html', './', './manifest.json'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(ASSETS.map((url) => cache.add(url).catch(() => null)))
    )
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((names) => Promise.all(
      names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Любой переход на страницу (открытие ссылки, иконка с экрана «Домой» и т.п.) —
  // сперва пробуем сеть, а если её нет — всегда отдаём index.html из кэша,
  // независимо от точного вида адреса (слэш на конце, случайные параметры и т.д.)
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('./index.html'))
    );
    return;
  }
  // Остальные файлы (manifest.json и т.п.) — сначала кэш, игнорируя параметры запроса
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((cached) => cached || fetch(e.request))
  );
});
