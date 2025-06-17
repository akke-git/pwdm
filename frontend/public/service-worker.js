// 캐시 이름 설정
const CACHE_NAME = 'pwdm-cache-v2'; // 버전 업데이트

// 캐시할 파일 목록
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // 아이콘 파일 추가
  '/images/icons/icon-72x72.png',
  '/images/icons/icon-96x96.png',
  '/images/icons/icon-128x128.png',
  '/images/icons/icon-144x144.png',
  '/images/icons/icon-152x152.png',
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-384x384.png',
  '/images/icons/icon-512x512.png',
  // CSS, JS 파일 등 필요한 정적 자원 추가
];

// 서비스 워커 설치 시 캐시 생성
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 캐시에 있으면 캐시된 응답 반환
        if (response) {
          return response;
        }
        
        // 캐시에 없으면 네트워크 요청
        return fetch(event.request)
          .then((response) => {
            // 유효한 응답이 아니면 그대로 반환
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // 응답을 복제하여 캐시에 저장
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          });
      })
  );
});

// 이전 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
