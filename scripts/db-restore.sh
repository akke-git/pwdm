#!/bin/bash

# 환경 변수 로드 (필요한 경우)
if [ -f ../.env ]; then
  source ../.env
fi

# 기본값 설정
DB_USER=${DB_USER:-root}
DB_PASSWORD=${DB_PASSWORD:-password}
DB_NAME=${DB_NAME:-password_manager}
DB_HOST=${DB_HOST:-mysql}
DB_PORT=${DB_PORT:-3306}

# 덤프 파일 확인
if [ -z "$1" ]; then
  echo "사용법: $0 <덤프_파일_경로>"
  exit 1
fi

DUMP_FILE=$1

if [ ! -f "$DUMP_FILE" ]; then
  echo "덤프 파일을 찾을 수 없습니다: $DUMP_FILE"
  exit 1
fi

echo "데이터베이스 복원을 시작합니다..."
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME < $DUMP_FILE

if [ $? -eq 0 ]; then
  echo "데이터베이스가 성공적으로 복원되었습니다."
else
  echo "데이터베이스 복원 중 오류가 발생했습니다."
  exit 1
fi
