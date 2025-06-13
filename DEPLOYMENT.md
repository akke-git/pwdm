# 패스워드 매니저 배포 가이드

이 문서는 패스워드 매니저 애플리케이션을 도커 컨테이너로 배포하는 과정을 설명합니다.

## 사전 준비사항

- 도커와 도커 컴포즈가 설치된 리눅스 서버
- MySQL 컨테이너가 운영 중인 서버 (또는 새로 설치할 예정)
- SSH 접근 권한

## 1. 프로젝트 준비

### 1.1 프로젝트 복제

```bash
git clone <repository-url> password-manager
cd password-manager
```

### 1.2 환경 변수 설정

#### 백엔드 환경 변수

백엔드 디렉토리에서 `.env.example` 파일을 참고하여 `.env` 파일을 생성합니다:

```bash
cd backend
cp .env.example .env
# 편집기로 .env 파일을 열어 실제 값으로 수정
nano .env
```

다음 환경 변수들을 설정해야 합니다:
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: 데이터베이스 연결 정보
- `JWT_SECRET`: JWT 토큰 암호화에 사용되는 비밀키
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: Google OAuth 인증에 필요한 정보

#### 프론트엔드 환경 변수

프론트엔드 디렉토리에서 `.env.example` 파일을 참고하여 `.env` 파일을 생성합니다:

```bash
cd frontend
cp .env.example .env
# 편집기로 .env 파일을 열어 실제 값으로 수정
nano .env
```

다음 환경 변수들을 설정해야 합니다:
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth 인증에 필요한 클라이언트 ID
- `VITE_API_URL`: 백엔드 API URL

#### 운영 환경 환경 변수

프로젝트 루트 디렉토리에 있는 `env.production.example` 파일을 참고하여 `.env` 파일을 생성합니다:

```bash
cd /path/to/password-manager
cp env.production.example .env
# 편집기로 .env 파일을 열어 실제 값으로 수정
nano .env
```

## 2. 데이터베이스 마이그레이션

### 2.1 로컬 데이터베이스 덤프 생성

로컬 개발 환경에서 다음 명령을 실행하여 데이터베이스 덤프를 생성합니다:

```bash
cd scripts
./db-dump.sh
# 생성된 덤프 파일(password_manager_YYYYMMDD_HHMMSS.sql)을 확인
```

### 2.2 운영 서버에 덤프 파일 전송

SCP 또는 다른 방법을 사용하여 덤프 파일을 운영 서버로 전송합니다:

```bash
scp password_manager_YYYYMMDD_HHMMSS.sql user@server:/path/to/password-manager/scripts/
```

### 2.3 운영 서버에서 데이터베이스 생성 및 복원

운영 서버에서 다음 명령을 실행하여 데이터베이스를 생성하고 덤프 파일을 복원합니다:

```bash
# MySQL 컨테이너에 접속하여 데이터베이스 생성
docker exec -it mysql mysql -u root -p
```

MySQL 프롬프트에서:

```sql
CREATE DATABASE IF NOT EXISTS password_manager;
EXIT;
```

그런 다음 덤프 파일을 복원합니다:

```bash
cd scripts
./db-restore.sh password_manager_YYYYMMDD_HHMMSS.sql
```

## 3. 애플리케이션 배포

### 3.1 도커 컴포즈로 애플리케이션 빌드 및 실행

```bash
cd /path/to/password-manager
docker-compose build
docker-compose up -d
```

이 명령은 백엔드와 프론트엔드 컨테이너를 빌드하고 백그라운드에서 실행합니다.

### 3.2 배포 확인

웹 브라우저에서 서버 IP 주소 또는 도메인으로 접속하여 애플리케이션이 정상적으로 작동하는지 확인합니다:

```
http://서버_IP_주소
```

## 4. 문제 해결

### 4.1 로그 확인

컨테이너 로그를 확인하여 문제를 진단합니다:

```bash
# 백엔드 로그 확인
docker logs password-manager-backend

# 프론트엔드 로그 확인
docker logs password-manager-frontend

# MySQL 로그 확인 (필요한 경우)
docker logs mysql
```

### 4.2 컨테이너 재시작

문제가 발생한 경우 컨테이너를 재시작합니다:

```bash
docker-compose restart backend
docker-compose restart frontend
```

### 4.3 전체 서비스 재시작

필요한 경우 모든 서비스를 재시작합니다:

```bash
docker-compose down
docker-compose up -d
```

## 5. 백업 및 유지보수

### 5.1 정기적인 데이터베이스 백업

cron 작업을 설정하여 정기적으로 데이터베이스를 백업합니다:

```bash
# crontab -e에 다음 줄 추가 (매일 새벽 3시에 백업)
0 3 * * * /path/to/password-manager/scripts/db-dump.sh > /path/to/backups/backup_$(date +\%Y\%m\%d).log 2>&1
```

### 5.2 애플리케이션 업데이트

새 버전으로 업데이트하려면:

```bash
cd /path/to/password-manager
git pull
docker-compose build
docker-compose up -d
```
