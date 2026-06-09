// 💡 重要提示：以後只要網頁有修改，請把下面的 v1 改成 v2、v3... 瀏覽器就會立刻知道要更新！
const CACHE_NAME = 'optics-v8-cache-v5'; 

// 需要快取的靜態資源（已修正為您目前實際應用的 index.html 檔名）
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// 1. 安裝階段：強制跳過等待，立刻讓新版上工
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // 【關鍵】不要讓新版卡在 waiting 狀態
});

// 2. 啟用階段：自動比對並清除「非當前版本」的所有舊快取
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('正在清理舊快取殘留:', key);
            return caches.delete(key); // 【關鍵】刪除舊快取桶子
          }
        })
      );
    })
  );
  return self.clients.claim(); // 【關鍵】讓新版 Service Worker 立即接管當前網頁
});
  // HTML 主文件用網路優先（確保版本正確）
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('./index.html'))
    );
    return;
  }
  // 其他資源（CSS/JS/圖片）快取優先
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});
