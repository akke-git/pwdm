# Password Manager (패스워드 관리자)

## 1. 프로젝트 목적

본 프로젝트는 개인 및 팀 환경에서 비밀번호를 안전하고 효율적으로 관리할 수 있는 웹 애플리케이션을 개발하는 것을 목표로 합니다. 사용자 친화적인 인터페이스를 통해 비밀번호의 생성, 저장, 자동 완성 기능을 제공하며, 강력한 암호화 알고리즘을 적용하여 저장된 데이터의 보안을 최우선으로 합니다.

## 2. 프로젝트 구조

프로젝트는 최신 웹 기술 스택을 활용하여 프론트엔드와 백엔드로 구성됩니다.

### 2.1. Frontend (React + TypeScript)

*   **주요 기술**: React, TypeScript, Axios (API 통신), React Router (라우팅), Zustand/Redux (상태 관리 - 선택적)
*   **디렉토리 구조**:
    *   `frontend/`
        *   `public/`: 정적 파일 (index.html, 파비콘 등)
        *   `src/`: 프론트엔드 애플리케이션 소스 코드
            *   `components/`: 재사용 가능한 UI 컴포넌트 (버튼, 입력 필드, 모달 등)
            *   `pages/`: 애플리케이션의 주요 페이지 (로그인, 회원가입, 대시보드, 설정 등)
            *   `services/`: 백엔드 API 연동을 위한 서비스 모듈
            *   `store/` 또는 `contexts/`: 전역 상태 관리 로직
            *   `hooks/`: 커스텀 React Hooks
            *   `utils/`: 공통 유틸리티 함수 (포맷팅, 유효성 검사 등)
            *   `assets/`: 이미지, 폰트 등 정적 리소스
            *   `styles/`: 전역 스타일 및 테마 관련 파일
            *   `App.tsx`: 애플리케이션 최상위 컴포넌트
            *   `index.tsx`: 애플리케이션 진입점

### 2.2. Backend (Node.js + Express + TypeScript + Sequelize)

*   **주요 기술**: Node.js, Express.js, TypeScript, Sequelize (ORM), PostgreSQL (데이터베이스)
*   **디렉토리 구조**:
    *   `backend/`
        *   `src/`: 백엔드 애플리케이션 소스 코드
            *   `config/`: 환경 설정 (데이터베이스, JWT 시크릿 등)
            *   `controllers/`: HTTP 요청 처리, 데이터 유효성 검사, 서비스 계층 호출
            *   `services/`: 핵심 비즈니스 로직 구현
            *   `models/`: Sequelize 데이터베이스 모델 정의 및 관계 설정
            *   `routes/`: API 엔드포인트 라우팅 정의
            *   `middlewares/`: 요청-응답 사이클의 중간 처리 로직 (인증, 로깅, 오류 처리 등)
            *   `utils/`: 공통 유틸리티 함수 (암호화, 토큰 관리 등)
            *   `db/`: 데이터베이스 마이그레이션 및 시드 파일 (Sequelize-CLI 사용 시)
            *   `app.ts`: Express 애플리케이션 설정 및 미들웨어 구성
            *   `server.ts`: 서버 시작 스크립트
        *   `temp/`: 파일 업로드/다운로드 시 사용되는 임시 저장 공간

### 2.3. Database

*   **데이터베이스 시스템**: PostgreSQL (또는 프로젝트에서 사용하는 DBMS)
*   **주요 테이블**: Users, PasswordItems, PasswordHistories, Categories, Tags 등

## 3. 주요 처리 프로세스

### 3.1. 사용자 인증 (회원가입 및 로그인)

1.  **회원가입**:
    *   사용자: 이메일, 마스터 비밀번호 등 정보 입력.
    *   Frontend: 입력 정보 유효성 검사 후 백엔드 `/auth/register` API 호출.
    *   Backend (`AuthController` -> `AuthService`):
        *   이메일 중복 확인.
        *   마스터 비밀번호 해시화 (bcrypt 사용).
        *   사용자 정보 데이터베이스 저장.
    *   Frontend: 성공/실패 메시지 표시.
2.  **로그인**:
    *   사용자: 이메일, 마스터 비밀번호 입력.
    *   Frontend: 백엔드 `/auth/login` API 호출.
    *   Backend (`AuthController` -> `AuthService`):
        *   사용자 존재 여부 및 마스터 비밀번호 일치 확인.
        *   JWT (Access Token, Refresh Token) 생성 및 반환.
    *   Frontend: JWT 저장 (HttpOnly 쿠키 또는 localStorage), 로그인 상태 변경, 대시보드로 이동.

### 3.2. 비밀번호 항목 관리

1.  **생성**:
    *   사용자: 사이트명, URL, 아이디, 비밀번호 등 항목 정보 입력.
    *   Frontend: 백엔드 `/passwords` (POST) API 호출.
    *   Backend (`PasswordController` -> `PasswordItemService`):
        *   요청 데이터 유효성 검사.
        *   입력된 비밀번호 암호화 (AES-256-GCM 등, 사용자의 마스터 비밀번호에서 파생된 키 사용).
        *   데이터베이스에 새 항목 저장.
    *   Frontend: 목록 업데이트 및 성공 메시지 표시.
2.  **조회**:
    *   Frontend: 백엔드 `/passwords` (GET) API 호출 (필터링/검색 조건 포함 가능).
    *   Backend (`PasswordController` -> `PasswordItemService`):
        *   사용자 ID 기반으로 항목 조회.
        *   (필요시) 저장된 비밀번호 복호화 후 반환 (일반적으로는 상세 조회 시 복호화).
    *   Frontend: 수신된 데이터 목록 형태로 표시.
3.  **수정/삭제**: 유사한 흐름으로 API 호출 및 서비스 로직 처리.

### 3.3. 데이터 가져오기/내보내기

1.  **내보내기**:
    *   사용자: 내보내기 기능 실행.
    *   Frontend: 백엔드 `/passwords/export` API 호출.
    *   Backend (`PasswordController` -> `PasswordItemService`):
        *   사용자의 모든 비밀번호 항목 조회.
        *   각 항목의 비밀번호 복호화.
        *   JSON 형식으로 데이터 구성 후 파일 생성 (임시 저장).
        *   파일 다운로드 응답 전송 및 임시 파일 삭제.
    *   Frontend: 파일 다운로드 시작.
2.  **가져오기**:
    *   사용자: JSON 파일 선택.
    *   Frontend: 백엔드 `/passwords/import` API로 파일 업로드.
    *   Backend (`PasswordController` -> `PasswordItemService`):
        *   업로드된 파일 파싱.
        *   각 항목 데이터 유효성 검사 및 비밀번호 암호화.
        *   데이터베이스에 저장 (중복 처리 로직 포함).
        *   임시 파일 삭제.
    *   Frontend: 가져오기 결과 (성공/실패 항목 수) 표시.

## 4. 주요 기능 목록

*   **사용자 관리**:
    *   안전한 회원 가입 (이메일 인증 옵션).
    *   마스터 비밀번호 기반 로그인.
    *   JWT를 사용한 세션 관리 및 API 인증.
*   **비밀번호 항목 관리 (CRUD)**:
    *   비밀번호 항목 생성, 조회, 수정, 삭제.
    *   사이트명, URL, 사용자명, 비밀번호, 메모, 태그, 카테고리 등 상세 정보 관리.
    *   강력한 비밀번호 자동 생성 기능 (길이, 문자 종류 조합).
    *   AES-256-GCM (또는 유사한 강력한 알고리즘)을 사용한 개별 비밀번호 암호화.
*   **데이터 관리**:
    *   JSON 형식을 통한 비밀번호 데이터 가져오기.
    *   암호화된 JSON 형식을 통한 비밀번호 데이터 내보내기.
*   **부가 기능**:
    *   카테고리별 비밀번호 항목 분류 및 필터링.
    *   중요 항목 즐겨찾기 기능.
    *   태그를 이용한 자유로운 항목 분류 및 검색.
    *   비밀번호 만료일 설정 및 만료 예정/만료된 항목 알림.
    *   비밀번호 사용 기록 추적 (마지막 사용일, 복사/자동 채우기 등의 액션).
    *   비밀번호 강도 실시간 검사 및 피드백.
*   **보안**:
    *   사용자의 마스터 비밀번호는 서버에 저장되지 않으며, 암호화 키 파생에만 사용 (클라이언트 측 또는 서버 측 PBKDF2/Argon2 등 활용).
    *   모든 민감 데이터 전송 시 HTTPS 강제 (배포 환경).
    *   SQL Injection, XSS 등 주요 웹 취약점 방어.

## 5. 향후 개발 및 개선 사항

*   **팀 및 공유 기능**:
    *   팀(조직) 생성 및 사용자 초대 기능.
    *   팀 구성원 간 특정 비밀번호 항목 또는 카테고리 공유.
    *   공유 항목에 대한 접근 권한 (읽기 전용, 수정 가능 등) 관리.
*   **브라우저 확장 프로그램**:
    *   Chrome, Firefox 등 주요 브라우저를 위한 확장 프로그램 개발.
    *   웹사이트 방문 시 아이디/비밀번호 자동 채우기.
    *   새로운 로그인 정보 자동 저장 제안.
*   **모바일 애플리케이션**:
    *   iOS 및 Android 네이티브 앱 개발 또는 PWA(Progressive Web App) 지원 강화.
*   **고급 보안 기능**:
    *   2단계 인증(2FA/MFA) 지원: TOTP (Google Authenticator 등), U2F/WebAuthn (YubiKey 등 하드웨어 키).
    *   보안 감사 로그: 계정 활동, 중요 데이터 접근 및 변경 이력 기록.
    *   데이터 유출 모니터링 서비스 연동 (Have I Been Pwned? 등).
*   **사용성 개선**:
    *   다국어 지원 확대.
    *   사용자 정의 필드 추가 기능.
    *   자동 백업 (클라우드 스토리지 연동 또는 로컬 암호화 백업) 및 복원 기능.
    *   비밀번호 변경 주기 알림 및 자동 변경 제안 (지원 사이트에 한함).
*   **성능 최적화**:
    *   대량의 비밀번호 항목 관리 시 UI 및 API 응답 속도 최적화.
    *   데이터베이스 쿼리 최적화 및 인덱싱 강화.

## 6. 기술 스택

*   **Frontend**: React, TypeScript, Axios, React Router, Zustand/Redux (상태 관리), Styled Components/Tailwind CSS (스타일링)
*   **Backend**: Node.js, Express.js, TypeScript, Sequelize (ORM), PostgreSQL
*   **Authentication**: JWT (jsonwebtoken), bcrypt
*   **Encryption**: Node.js `crypto` module (AES-256-GCM), PBKDF2/Argon2 (키 파생)
*   **File Handling**: Multer (파일 업로드)
*   **DevOps (예상)**: Docker, Nginx, Git, GitHub Actions/Jenkins (CI/CD)
*   **Testing (예상)**: Jest, React Testing Library (Frontend), Jest, Supertest (Backend)

## 7. 시작하기

### 7.1. 공통 요구사항

*   Node.js (v18.x 이상 권장)
*   npm (v9.x 이상 권장) 또는 yarn
*   PostgreSQL (v14 이상 권장) 데이터베이스 서버 실행 중

### 7.2. Backend 설정

1.  **저장소 복제 및 디렉토리 이동**:
    ```bash
    git clone <repository_url>
    cd project-password-manager/backend
    ```
2.  **의존성 설치**:
    ```bash
    npm install
    ```
3.  **환경 변수 설정**:
    `.env.example` 파일을 복사하여 `.env` 파일을 생성하고, 내부의 설정을 환경에 맞게 수정합니다. (DB 접속 정보, JWT 시크릿 키 등)
    ```bash
    cp .env.example .env
    # nano .env 또는 다른 편집기로 .env 파일 수정
    ```
4.  **데이터베이스 마이그레이션**:
    (Sequelize-CLI를 사용하는 경우)
    ```bash
    npx sequelize-cli db:migrate
    ```
    (선택적) **데이터베이스 시딩**:
    ```bash
    npx sequelize-cli db:seed:all
    ```
5.  **개발 서버 실행**:
    ```bash
    npm run dev
    ```
    기본적으로 `http://localhost:5000` (또는 `.env`에서 설정한 포트)에서 실행됩니다.

### 7.3. Frontend 설정

1.  **디렉토리 이동**:
    ```bash
    cd ../frontend 
    # (만약 backend 디렉토리 안에 있다면)
    # 또는 cd project-password-manager/frontend (루트에서 시작 시)
    ```
2.  **의존성 설치**:
    ```bash
    npm install
    ```
3.  **환경 변수 설정**:
    (필요시) `.env.example` 파일을 복사하여 `.env` 파일을 생성하고, 백엔드 API 주소 등을 설정합니다.
    ```bash
    cp .env.example .env
    # REACT_APP_API_BASE_URL=http://localhost:5000/api 등을 설정
    ```
4.  **개발 서버 실행**:
    ```bash
    npm start
    ```
    기본적으로 `http://localhost:3000` 에서 실행됩니다.

