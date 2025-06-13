FROM node:18-alpine AS frontend-build

# 프론트엔드 빌드
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:18-alpine AS backend-build

# 백엔드 빌드
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

FROM node:18-alpine

# Nginx 설치
RUN apk add --no-cache nginx

# 백엔드 설정
WORKDIR /app/backend
COPY --from=backend-build /app/backend/package*.json ./
COPY --from=backend-build /app/backend/dist ./dist
RUN npm ci --only=production

# 프론트엔드 파일 복사
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

# Nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/http.d/default.conf

# 시작 스크립트 생성
WORKDIR /app
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 80

# 시작 스크립트 실행
CMD ["/app/start.sh"]
