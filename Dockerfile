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
