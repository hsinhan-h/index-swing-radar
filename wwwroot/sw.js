const CACHE = 'csi500-v1';
const SHELL = ['/'];

// 安裝：快取 APP shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL))
  );
  self.skipWaiting();
});

// 啟用：清除舊版快取
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 攔截請求
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // API 請求：永遠走網路，失敗才回傳錯誤（不快取動態資料）
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // 靜態資源：Cache First，快取有就回傳，否則從網路抓並存入快取
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        if (resp && resp.status === 200) {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      });
    }).catch(() => caches.match('/'))   // 離線時 fallback 到 APP shell
  );
});
