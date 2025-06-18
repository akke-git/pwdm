# Backend Entry Point: `index.ts`

이 파일은 백엔드 애플리케이션의 주요 진입점입니다. Node.js와 Express 프레임워크를 기반으로 서버를 설정하고, 필요한 미들웨어를 구성하며, API 라우트를 정의하고, 데이터베이스 연결을 처리하는 등 애플리케이션의 시작에 필요한 모든 준비 작업을 수행합니다.

## 1. 주요 라이브러리 및 모듈 임포트 (Imports)

애플리케이션을 실행하는 데 필요한 다양한 외부 라이브러리(패키지)와 내부적으로 작성된 모듈들을 가져오는 부분입니다.

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { sequelize } from './models/index';
import authRoutes from './routes/authRoutes';
import passwordRoutes from './routes/passwordRoutes';
import categoryRoutes from './routes/categoryRoutes';
import tagRoutes from './routes/tagRoutes';
import twoFactorRoutes from './routes/twoFactorRoutes';
import sessionRoutes from './routes/sessionRoutes';
import { apiLimiter } from './middlewares/security';
import { cleanupExpiredSessions } from './controllers/sessionController';
```

**각 항목 설명:**

*   `express`: Node.js 환경에서 웹 서버 및 API를 쉽게 만들 수 있도록 도와주는 매우 인기 있는 웹 프레임워크입니다.
*   `cors`: Cross-Origin Resource Sharing의 약자로, 웹 브라우저에서 다른 도메인으로 리소스 요청을 할 때 보안상의 이유로 제한되는 것을 풀어주는 미들웨어입니다. 예를 들어, 프론트엔드(예: `http://localhost:5173`)와 백엔드(예: `http://localhost:5000`)가 다른 포트에서 실행될 때 필요합니다.
*   `dotenv`: `.env`라는 파일에 프로젝트의 중요한 설정값(예: 데이터베이스 접속 정보, API 키 등)을 저장하고, 이를 환경 변수로 로드하여 코드에서 안전하게 사용할 수 있게 해줍니다.
*   `helmet`: Express 애플리케이션의 보안을 강화해주는 미들웨어입니다. 다양한 HTTP 헤더를 적절히 설정하여 일반적인 웹 공격(XSS, 클릭재킹 등)으로부터 보호하는 데 도움을 줍니다.
*   `{ sequelize } from './models/index'`: Sequelize는 Node.js용 ORM(Object-Relational Mapper)입니다. 데이터베이스의 테이블을 자바스크립트 객체처럼 다룰 수 있게 해줍니다. `./models/index.js` (또는 `.ts`) 파일에서 설정된 Sequelize 인스턴스를 가져옵니다.
*   `authRoutes`, `passwordRoutes`, ... , `sessionRoutes`: 애플리케이션의 각 기능별 API 라우트(경로) 정의를 담고 있는 파일들입니다. 예를 들어, `authRoutes`는 회원가입, 로그인 등 인증 관련 API들을 모아둔 모듈입니다. 이렇게 기능을 분리하면 코드를 관리하기가 더 쉬워집니다.
*   `{ apiLimiter } from './middlewares/security'`: API 요청 횟수를 제한하는 커스텀 미들웨어입니다. 특정 시간 동안 한 IP에서 너무 많은 요청이 오는 것을 막아 서버를 보호합니다.
*   `{ cleanupExpiredSessions } from './controllers/sessionController'`: 만료된 사용자 세션(로그인 정보)을 주기적으로 정리하는 함수입니다.

## 2. 환경 변수 설정 및 Express 앱 초기화

애플리케이션 설정을 위한 환경 변수를 로드하고, Express 애플리케이션의 핵심 객체를 생성합니다.

```typescript
// 환경 변수 설정
dotenv.config();

// Express 앱 초기화
const app = express();
const PORT = process.env.PORT || 5000;
```

**각 항목 설명:**

*   `dotenv.config()`: 이 함수를 호출하면 프로젝트 루트 디렉토리에 있는 `.env` 파일의 내용이 환경 변수로 로드됩니다. 이렇게 로드된 환경 변수는 `process.env.변수명` 형태로 코드 내에서 접근할 수 있습니다.
*   `const app = express();`: Express 프레임워크를 사용하기 위해 가장 먼저 해야 할 일입니다. `express()` 함수를 호출하여 Express 애플리케이션 객체(`app`)를 생성합니다. 이 `app` 객체를 통해 각종 설정을 하고 서버를 실행합니다.
*   `const PORT = process.env.PORT || 5000;`: 서버가 실행될 포트 번호를 결정합니다. `.env` 파일에 `PORT`라는 이름으로 설정된 값이 있으면 그 값을 사용하고, 없다면 기본값으로 `5000`번 포트를 사용합니다.

## 3. 미들웨어 설정 (Middleware Setup)

미들웨어는 Express 애플리케이션으로 들어오는 요청(request)과 나가는 응답(response) 사이에서 다양한 기능을 수행하는 함수들입니다. 요청을 가공하거나, 보안 검사를 하거나, 로그를 남기는 등의 역할을 합니다.

```typescript
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(helmet()); // 보안 헤더 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter); // API 요청 속도 제한
```

**각 항목 설명:**

*   `app.use(cors(...))`: CORS 미들웨어를 설정합니다.
    *   `origin: ['http://localhost:5173', 'http://127.0.0.1:5173']`: 이 서버로 요청을 보낼 수 있도록 허용된 출처(프론트엔드 주소) 목록입니다.
    *   `credentials: true`: 다른 도메인 간 요청 시 인증 정보(예: 쿠키)를 주고받을 수 있도록 허용합니다.
*   `app.use(helmet())`: `helmet` 미들웨어를 적용하여 HTTP 헤더를 안전하게 설정합니다.
*   `app.use(express.json())`: 클라이언트가 서버로 보내는 데이터 중 JSON 형식의 본문(body)을 파싱(해석)하여 `req.body` 객체에 넣어줍니다. API 서버에서 클라이언트와 JSON으로 데이터를 주고받을 때 필수적입니다.
*   `app.use(express.urlencoded({ extended: true }))`: HTML 폼(form)을 통해 제출되는 데이터(URL-encoded 형식)를 파싱하여 `req.body` 객체에 넣어줍니다. `extended: true` 옵션은 복잡한 객체 형태의 데이터도 파싱할 수 있게 합니다.
*   `app.use(apiLimiter)`: 앞서 임포트한 `apiLimiter` 미들웨어를 적용하여, 모든 API 요청에 대해 속도 제한 기능을 활성화합니다.

## 4. 기본 라우트 정의 (Basic Route)

애플리케이션의 가장 기본적인 경로(루트 URL, `/`)로 GET 요청이 왔을 때 어떻게 응답할지를 정의합니다.

```typescript
app.get('/', (req, res) => {
  res.json({ message: 'Personal Password Manager API 서버에 오신 것을 환영합니다!' });
});
```

**각 항목 설명:**

*   `app.get('/', ...)`: HTTP GET 메소드로 서버의 루트 경로 (`/`)에 요청이 들어왔을 때 실행될 함수를 등록합니다.
*   `(req, res) => { ... }`: 이 함수는 요청 객체(`req`)와 응답 객체(`res`)를 인자로 받습니다. `req`는 클라이언트가 보낸 요청에 대한 정보를 담고 있고, `res`는 서버가 클라이언트에게 보낼 응답을 제어하는 데 사용됩니다.
*   `res.json(...)`: 클라이언트에게 JSON 형식으로 응답을 보냅니다. 여기서는 간단한 환영 메시지를 전달합니다.

## 5. API 라우트 연결 (API Routes Mounting)

애플리케이션의 주요 기능별 API 라우트들을 특정 기본 경로(prefix)에 연결(마운트)합니다. 이렇게 하면 API 경로를 체계적으로 관리할 수 있습니다.

```typescript
app.use('/api/auth', authRoutes);
app.use('/api/passwords', passwordRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/2fa', twoFactorRoutes);
app.use('/api/sessions', sessionRoutes);
```

**각 항목 설명:**

*   `app.use('/api/경로', 라우트모듈)`: 특정 기본 경로로 시작하는 모든 요청을 해당 라우트 모듈에서 처리하도록 위임합니다.
    *   예를 들어, `app.use('/api/auth', authRoutes);`는 `/api/auth`로 시작하는 모든 URL(예: `/api/auth/login`, `/api/auth/register`)에 대한 요청 처리를 `authRoutes` 모듈에 정의된 라우터에게 맡깁니다.
    *   이렇게 API를 기능별로 모듈화하면 코드가 훨씬 깔끔해지고 유지보수가 쉬워집니다.

## 6. 서버 시작 및 데이터베이스 연동

모든 설정이 완료된 후, 실제로 서버를 실행하고 데이터베이스와의 연결을 시도하며 필요한 초기화 작업을 수행합니다.

```typescript
app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log('데이터베이스 연결 성공');
    
    // 데이터베이스 동기화
    // 개발 환경에서는 alter 옵션으로, 프로덕션에서는 force 옵션 없이 실행
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('개발 환경: 데이터베이스 모델 동기화 완료');
    } else {
      await sequelize.sync();
      console.log('프로덕션 환경: 데이터베이스 모델 동기화 완료');
    }
    
    // 만료된 세션 정리 스케줄러 (하루에 한 번)
    setInterval(cleanupExpiredSessions, 24 * 60 * 60 * 1000); // 24시간 * 60분 * 60초 * 1000밀리초 = 하루
    
    console.log(`서버가 포트 ${PORT}에서 실행 중...`);
  } catch (error) {
    console.error('데이터베이스 연결 오류:', error);
  }
});
```

**각 항목 설명:**

*   `app.listen(PORT, async () => { ... })`: 지정된 `PORT`에서 HTTP 서버를 시작합니다. 서버가 성공적으로 시작되면 두 번째 인자로 전달된 콜백 함수가 실행됩니다. 이 콜백 함수는 `async`로 선언되어 내부에서 `await`를 사용한 비동기 작업을 처리할 수 있습니다.
*   `try...catch`: 서버 시작 과정(특히 데이터베이스 관련 작업)에서 오류가 발생할 경우 이를 감지하고 적절히 처리하기 위한 구문입니다.
*   `await sequelize.authenticate()`: Sequelize를 사용하여 설정된 데이터베이스 정보로 실제 연결을 시도하고 인증합니다. 성공하면 콘솔에 "데이터베이스 연결 성공" 메시지를 출력합니다.
*   **데이터베이스 동기화 (`sequelize.sync`)**:
    *   이 작업은 코드에 정의된 Sequelize 모델(테이블 구조)과 실제 데이터베이스의 스키마를 일치시키는 과정입니다.
    *   `process.env.NODE_ENV === 'development'`: 현재 실행 환경이 '개발(development)' 환경인지 확인합니다. (보통 `NODE_ENV` 환경 변수로 설정)
    *   `await sequelize.sync({ alter: true })` (개발 환경): 개발 중에는 모델이 자주 변경될 수 있으므로, `alter: true` 옵션을 사용합니다. 이 옵션은 기존 테이블의 데이터를 유지하면서 모델 변경사항을 최대한 반영하려고 시도합니다. (예: 새로운 컬럼 추가)
    *   `await sequelize.sync()` (프로덕션 환경 또는 기타): 프로덕션 환경에서는 보통 `alter: true`나 `force: true`(테이블 삭제 후 재생성, 데이터 손실 위험) 옵션 없이 사용합니다. 이는 모델에 정의된 대로 테이블이 존재하지 않으면 생성하고, 존재하면 변경하지 않는 것을 목표로 합니다.
*   **만료된 세션 정리 스케줄러**:
    *   `setInterval(cleanupExpiredSessions, 24 * 60 * 60 * 1000)`: `cleanupExpiredSessions` 함수를 24시간(하루)마다 주기적으로 실행하도록 스케줄링합니다. 이렇게 하면 데이터베이스에 쌓인 만료된 사용자 세션 정보를 자동으로 정리하여 시스템을 효율적으로 관리할 수 있습니다.
*   `console.log(...)`: 서버가 성공적으로 시작되었음을 알리는 메시지를 콘솔에 출력합니다.
*   `console.error(...)`: 서버 시작 과정에서 (주로 데이터베이스 연결 관련) 오류가 발생하면 해당 오류 메시지를 콘솔에 출력합니다.

---

이 `index.ts` 파일은 백엔드 애플리케이션의 심장과 같은 역할을 하며, 모든 요청 처리의 시작점이 됩니다. 각 부분의 역할을 이해하면 전체 시스템의 동작 방식을 파악하는 데 큰 도움이 됩니다. 초급 개발자로서 이 파일의 구조와 각 코드 라인이 어떤 의미를 가지는지 파악하는 것은 매우 중요합니다.
