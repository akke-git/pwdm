#!/bin/sh

echo "도커 컨테이너 시작 중..."

# Nginx 설정 확인
echo "Nginx 설정 확인 중..."
nginx -t

# Nginx 시작 (프론트엔드 서빙) - 백그라운드로 실행
echo "Nginx 시작 중..."
nginx

# Nginx 상태 확인
echo "Nginx 상태 확인 중..."
ps aux | grep nginx

# 백엔드 서버 시작
echo "백엔드 서버 시작 중..."
cd /app/backend
exec node dist/index.js
