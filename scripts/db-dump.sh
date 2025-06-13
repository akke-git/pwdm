#!/bin/bash

# 환경 변수 로드 (필요한 경우)
if [ -f ../.env ]; then
  source ../.env
fi

# 기본값 설정
DB_USER=${DB_USER:-juu}
DB_PASSWORD=${DB_PASSWORD:-kazama2@}
DB_NAME=${DB_NAME:-password_manager}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-3306}

# 디버깅 정보 출력
echo "사용할 데이터베이스 정보:"
echo "호스트: $DB_HOST"
echo "포트: $DB_PORT"
echo "사용자: $DB_USER"
echo "데이터베이스: $DB_NAME"

# 덤프 파일 이름 설정
DUMP_FILE="password_manager_$(date +%Y%m%d_%H%M%S).sql"

echo "데이터베이스 덤프를 시작합니다..."
mysqldump -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME > $DUMP_FILE

if [ $? -eq 0 ]; then
  echo "덤프가 성공적으로 생성되었습니다: $DUMP_FILE"
else
  echo "덤프 생성 중 오류가 발생했습니다."
  exit 1
fi
