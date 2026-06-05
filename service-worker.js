const CACHE_NAME = 'optics-v5-cache-network-first-v1'; // 往後每次更新網頁，只要把尾部的 v1 改 v2、v3 即可

// 需要離線快取的靜態資源
const urlsToCache = [
  './',
  './光學計算機_V5_Professional.html', // 如果你在 GitHub 上改名叫 index.html，請這裡改寫 './index.html'
  './manifest.json'
];

// 安裝時強制跳過等待
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(urlsToCache))
  );
  self.skipWaiting(); 
});

// 啟用時自動刪除舊快取
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key); 
          }
        })
      );
    })
  );
  return self.clients.claim(); 
});

// 【核心修改】攔截請求：改為「網路優先 (Network-First)」
self.addEventListener('fetch', e => {
  // 如果使用者是在瀏覽網頁(HTML導頁)，一律強迫先走網路抓取最新版
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(response => {
          // 網路正常：順便把最新網頁更新到快取中，供未來斷網時使用
          let copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, copy));
          return response;
        })
        .catch(() => {
          // 網路斷線（無塵室、沒訊號）：才好心地吐出手機裡的離線快取
          return caches.match(e.request);
        })
    );
  } else {
    // 其他如 manifest.json 等附屬檔案，走快取優先即可
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request))
    );
  }
});
