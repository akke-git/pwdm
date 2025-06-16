#!/bin/bash

# 최신 코드 가져오기
git pull origin master

# 도커 컨테이너 재빌드 및 재시작
docker-compose down
docker-compose build
docker-compose up -d

echo "업데이트가 완료되었습니다."
