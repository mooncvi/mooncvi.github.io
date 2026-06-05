const CACHE_NAME = 'optics-v5-cache-v3'; // 每次更新改這名稱即可

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(['./光學計算機_V5_Professional.html', './manifest.json']))
  );
  self.skipWaiting(); // 強制跳過等待，立即啟用新版
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key); // 自動刪除所有不符合當前名稱的舊快取
          }
        })
      );
    })
  );
  return self.clients.claim(); // 讓新版 Service Worker 立即接管網頁
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});