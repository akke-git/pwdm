#!/bin/sh

# Nginx 시작 (프론트엔드 서빙)
nginx

# 백엔드 서버 시작
cd /app/backend
node dist/index.js
