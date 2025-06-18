# `backend/src/routes/authRoutes.ts` 코드 설명

이 파일은 사용자 인증과 관련된 모든 API 엔드포인트(경로)를 정의하는 라우터(Router)입니다. 사용자의 회원가입, 로그인, 프로필 조회, 마스터 비밀번호 변경 등의 요청을 받아 적절한 컨트롤러 함수로 연결하는 역할을 합니다.

`index.ts`의 `app.use('/api/auth', authRoutes);` 코드를 통해, 이 파일에 정의된 모든 경로는 `/api/auth` 라는 접두사를 갖게 됩니다. 예를 들어, 여기서 정의된 `/login` 경로는 실제로는 `/api/auth/login`으로 접근해야 합니다.

---

## 전체 코드

```typescript
import express, { Request, Response, NextFunction } from 'express';
import * as authController from '../controllers/authController';
import { authenticateToken } from '../middlewares/auth';
import { passwordStrengthCheck, masterPasswordStrengthCheck, loginLimiter } from '../middlewares/security';

const router = express.Router();

// 공개 라우트
router.post('/register', passwordStrengthCheck, masterPasswordStrengthCheck, async (req: Request, res: Response) => {
  try {
    await authController.register(req, res);
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

router.post('/login', loginLimiter, async (req: Request, res: Response) => {
  try {
    await authController.login(req, res);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

router.post('/google-login', async (req: Request, res: Response) => {
  try {
    await authController.googleLogin(req, res);
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 인증 필요 라우트
router.get('/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    await authController.getProfile(req, res);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

router.post('/change-master-password', authenticateToken, async (req: Request, res: Response) => {
  try {
    await authController.changeMasterPassword(req, res);
  } catch (error) {
    console.error('Change master password error:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

export default router;
```

---

## 1. 모듈 임포트 (Import)

라우터를 설정하는 데 필요한 모듈들을 가져옵니다.

```typescript
import express, { Request, Response, NextFunction } from 'express';
import * as authController from '../controllers/authController';
import { authenticateToken } from '../middlewares/auth';
import { passwordStrengthCheck, masterPasswordStrengthCheck, loginLimiter } from '../middlewares/security';
```

-   **`express`**: 라우터를 생성하기 위해 Express 프레임워크를 가져옵니다.
-   **`authController`**: 회원가입, 로그인 등 실제 비즈니스 로직을 처리하는 함수들이 모여있는 컨트롤러 모듈입니다.
-   **`middlewares`**: 요청을 컨트롤러로 넘기기 전에 중간에서 특정 작업을 수행하는 미들웨어 함수들을 가져옵니다.
    -   `authenticateToken`: 사용자가 보낸 JWT(JSON Web Token)를 검증하여 인증된 사용자인지 확인합니다.
    -   `passwordStrengthCheck`, `masterPasswordStrengthCheck`: 회원가입 시 사용자가 입력한 비밀번호가 충분히 강력한지 검사합니다.
    -   `loginLimiter`: 로그인 시도 횟수를 제한하여 무차별 대입 공격(Brute-force attack)을 방지합니다.

---

## 2. 라우터 초기화

Express의 `Router` 객체를 생성합니다. 이 객체를 사용하여 각 경로와 핸들러 함수를 연결합니다.

```typescript
const router = express.Router();
```

---

## 3. 라우트 정의 (Routes)

이 파일은 크게 **공개 라우트**와 **인증이 필요한 라우트** 두 부분으로 나뉩니다.

### 공개 라우트 (Public Routes)

로그인하지 않은 사용자도 접근할 수 있는 경로들입니다.

**1. 회원가입 (`POST /register`)**
```typescript
router.post('/register', passwordStrengthCheck, masterPasswordStrengthCheck, async (req: Request, res: Response) => {
  // ...
  await authController.register(req, res);
  // ...
});
```
-   사용자가 회원가입을 요청하는 경로입니다.
-   `passwordStrengthCheck`와 `masterPasswordStrengthCheck` 미들웨어가 먼저 실행되어 비밀번호의 안전성을 검사합니다.
-   검사를 통과하면 `authController.register` 함수가 호출되어 실제 회원가입 로직을 처리합니다.

**2. 로그인 (`POST /login`)**
```typescript
router.post('/login', loginLimiter, async (req: Request, res: Response) => {
  // ...
  await authController.login(req, res);
  // ...
});
```
-   사용자가 로그인을 요청하는 경로입니다.
-   `loginLimiter` 미들웨어가 먼저 실행되어 단시간에 너무 많은 로그인 시도를 하는지 확인합니다.
-   `authController.login` 함수가 호출되어 사용자 정보가 올바른지 확인하고, 성공 시 JWT를 발급합니다.

**3. 구글 로그인 (`POST /google-login`)**
```typescript
router.post('/google-login', async (req: Request, res: Response) => {
  // ...
  await authController.googleLogin(req, res);
  // ...
});
```
-   Google OAuth를 통해 로그인하는 경로입니다.
-   프론트엔드에서 받은 구글 인증 정보를 바탕으로 `authController.googleLogin` 함수가 로그인/회원가입 처리를 합니다.

### 인증 필요 라우트 (Protected Routes)

반드시 로그인을 한 사용자만 접근할 수 있는 경로들입니다. 모든 경로에 `authenticateToken` 미들웨어가 적용되어 있어, 요청 헤더에 유효한 JWT가 없으면 접근이 차단됩니다.

**1. 프로필 조회 (`GET /profile`)**
```typescript
router.get('/profile', authenticateToken, async (req: Request, res: Response) => {
  // ...
  await authController.getProfile(req, res);
  // ...
});
```
-   로그인된 사용자의 프로필 정보를 가져오는 경로입니다.
-   `authenticateToken` 미들웨어가 토큰을 검증하고, 검증에 성공하면 `req.user` 객체에 사용자 정보를 담아 `authController.getProfile` 함수로 전달합니다.

**2. 마스터 비밀번호 변경 (`POST /change-master-password`)**
```typescript
router.post('/change-master-password', authenticateToken, async (req: Request, res: Response) => {
  // ...
  await authController.changeMasterPassword(req, res);
  // ...
});
```
-   로그인된 사용자가 자신의 마스터 비밀번호를 변경하는 경로입니다.
-   마찬가지로 `authenticateToken` 미들웨어를 통해 인증된 사용자만 이 기능을 사용할 수 있습니다.

---

## 4. 라우터 내보내기 (Export)

설정이 완료된 라우터 객체를 다른 파일(여기서는 `index.ts`)에서 사용할 수 있도록 내보냅니다.

```typescript
export default router;
```
