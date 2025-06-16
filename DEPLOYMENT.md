# PWDM 프로젝트 배포 가이드

이 문서는 PWDM(Password Manager) 프로젝트를 리눅스 도커 환경에 컨테이너로 배포하는 방법을 상세히 설명합니다.

## 목차

1. [사전 준비사항](#사전-준비사항)
2. [도커 환경 설정](#도커-환경-설정)
3. [도커 이미지 빌드 및 배포](#도커-이미지-빌드-및-배포)
4. [배포 후 코드 업데이트 방법](#배포-후-코드-업데이트-방법)
5. [PWA 앱 생성 방법](#pwa-앱-생성-방법)

## 사전 준비사항

### 필수 설치 항목

- Docker: 최신 버전 (20.10.x 이상)
- Docker Compose: 최신 버전 (2.x 이상)

### 환경 변수 설정

1. 프로젝트 루트 디렉토리에서 환경 변수 파일을 생성합니다:

```bash
cp env.production.example .env.production
```

2. `.env.production` 파일을 열고 필요한 환경 변수를 설정합니다:
   - 데이터베이스 연결 정보
   - JWT 시크릿 키
   - 기타 필요한 API 키 등

## 도커 환경 설정

### Dockerfile 생성

프로젝트 루트 디렉토리에 `Dockerfile`을 생성합니다:

```dockerfile
# 기본 이미지로 Node.js 사용
FROM node:20-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# 백엔드 종속성 설치
COPY backend/package*.json ./backend/
RUN cd backend && npm ci

# 프론트엔드 종속성 설치
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci

# 소스 코드 복사
COPY backend ./backend
COPY frontend ./frontend

# 백엔드 빌드
RUN cd backend && npm run build

# 프론트엔드 빌드
RUN cd frontend && npm run build

# 실행 이미지
FROM node:20-alpine

# 작업 디렉토리 설정
WORKDIR /app

# Nginx 설치
RUN apk add --no-cache nginx

# 백엔드 종속성 설치 (프로덕션 모드)
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# 빌드된 백엔드 파일 복사
COPY --from=builder /app/backend/dist ./backend/dist

# 빌드된 프론트엔드 파일 복사
COPY --from=builder /app/frontend/dist ./frontend/dist

# Nginx 설정 파일 복사
COPY frontend/nginx.conf /etc/nginx/http.d/default.conf

# 시작 스크립트 복사
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

# 포트 노출
EXPOSE 80 3000

# 컨테이너 시작 시 실행할 명령
ENTRYPOINT ["/docker-entrypoint.sh"]
```

### docker-entrypoint.sh 스크립트 생성

프로젝트 루트 디렉토리에 `docker-entrypoint.sh` 스크립트를 생성합니다:

```bash
#!/bin/sh

# Nginx 시작 (프론트엔드 서빙)
nginx

# 백엔드 서버 시작
cd /app/backend
node dist/index.js
```

### Docker Compose 설정

프로젝트 루트 디렉토리에 `docker-compose.yml` 파일을 생성합니다:

```yaml
version: '3.8'

services:
  pwdm-app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: pwdm-app
    restart: unless-stopped
    ports:
      - "80:80"     # 프론트엔드 (Nginx)
      - "3000:3000" # 백엔드 API
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    volumes:
      - pwdm-data:/app/backend/data

  # 필요한 경우 MySQL 서비스 추가
  db:
    image: mysql:8.0
    container_name: pwdm-db
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql-data:/var/lib/mysql
    ports:
      - "3306:3306"

volumes:
  pwdm-data:
  mysql-data:
```

## 도커 이미지 빌드 및 배포

### 1. 환경 변수 설정 확인

배포 전 `.env.production` 파일이 올바르게 설정되어 있는지 확인합니다.

### 2. 도커 이미지 빌드

```bash
docker-compose build
```

### 3. 컨테이너 실행

```bash
docker-compose up -d
```

### 4. 로그 확인

```bash
docker-compose logs -f
```

### 5. 배포 확인

웹 브라우저에서 다음 URL로 접속하여 배포가 성공적으로 이루어졌는지 확인합니다:
- 프론트엔드: http://서버IP
- 백엔드 API: http://서버IP:3000

## 배포 후 코드 업데이트 방법

코드 업데이트가 필요한 경우 다음 절차를 따릅니다:

### 1. 코드 변경사항 적용

로컬 개발 환경에서 코드를 변경하고 Git 저장소에 푸시합니다.

### 2. 서버에서 최신 코드 가져오기

```bash
git pull origin main
```

### 3. 도커 이미지 재빌드 및 컨테이너 재시작

```bash
docker-compose down
docker-compose build
docker-compose up -d
```

### 자동화된 업데이트 스크립트 (선택사항)

프로젝트 루트 디렉토리에 `update.sh` 스크립트를 생성하여 업데이트 과정을 자동화할 수 있습니다:

```bash
#!/bin/bash

# 최신 코드 가져오기
git pull origin main

# 도커 컨테이너 재빌드 및 재시작
docker-compose down
docker-compose build
docker-compose up -d

echo "업데이트가 완료되었습니다."
```

스크립트에 실행 권한을 부여합니다:

```bash
chmod +x update.sh
```

이후 업데이트가 필요할 때 다음 명령어로 간단히 실행할 수 있습니다:

```bash
./update.sh
```

## PWA 앱 생성 방법

PWA(Progressive Web App)로 변환하여 모바일 및 데스크톱에서 앱처럼 사용할 수 있습니다.

### 1. 프론트엔드 프로젝트에 PWA 관련 파일 추가

#### manifest.json 생성

`frontend/public/manifest.json` 파일을 생성합니다:

```json
{
  "name": "PWDM - 비밀번호 관리자",
  "short_name": "PWDM",
  "description": "안전한 비밀번호 관리 애플리케이션",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4285f4",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### 서비스 워커 생성

`frontend/public/service-worker.js` 파일을 생성합니다:

```javascript
// 캐시 이름 설정
const CACHE_NAME = 'pwdm-cache-v1';

// 캐시할 파일 목록
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
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
```

#### index.html 수정

`frontend/index.html` 파일에 다음 코드를 추가합니다:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#4285f4" />
  <link rel="manifest" href="/manifest.json" />
  <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
  <title>PWDM - 비밀번호 관리자</title>
  <style>
    @font-face {
      font-family: 'Apple Gothic';
      src: local('Apple Gothic');
    }
    body {
      font-family: 'Apple Gothic', sans-serif;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
  <script>
    // 서비스 워커 등록
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then((registration) => {
            console.log('ServiceWorker 등록 성공:', registration.scope);
          })
          .catch((error) => {
            console.log('ServiceWorker 등록 실패:', error);
          });
      });
    }
  </script>
</body>
</html>
```

### 2. 아이콘 생성

PWA에 필요한 다양한 크기의 아이콘을 생성하여 `frontend/public/icons/` 디렉토리에 저장합니다. 아이콘 생성은 온라인 도구를 사용하거나 디자인 툴을 활용할 수 있습니다.

### 3. vite.config.ts 수정

PWA 지원을 위해 Vite 설정을 수정합니다:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

### 4. 재배포

변경사항을 적용한 후 도커 이미지를 재빌드하고 배포합니다:

```bash
docker-compose down
docker-compose build
docker-compose up -d
```

### 5. PWA 설치 확인

배포된 웹 애플리케이션에 접속하여 브라우저의 주소 표시줄 오른쪽에 설치 아이콘이 표시되는지 확인합니다. 이 아이콘을 클릭하여 PWA를 설치할 수 있습니다.

모바일 기기에서는 브라우저 메뉴에서 "홈 화면에 추가" 옵션을 선택하여 PWA를 설치할 수 있습니다.
