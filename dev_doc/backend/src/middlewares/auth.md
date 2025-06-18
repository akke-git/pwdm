# Authentication Middleware (`auth.ts`)

이 파일은 애플리케이션의 인증 관련 미들웨어 함수들을 정의합니다. JWT (JSON Web Token)를 사용하여 사용자를 인증하고 세션 유효성을 확인하는 기능을 제공합니다.

## 목차

1.  [개요](#개요)
2.  [환경 변수](#환경-변수)
3.  [미들웨어 함수](#미들웨어-함수)
    *   [`authenticateToken`](#authenticatetoken)
    *   [`checkSession`](#checksession)
4.  [오류 처리](#오류-처리)

## 1. 개요

인증 미들웨어는 API 요청이 보호된 리소스에 접근하기 전에 사용자의 신원을 확인하는 역할을 합니다. `auth.ts`는 주로 JWT 기반 인증을 처리합니다.

## 2. 환경 변수

이 미들웨어는 다음 환경 변수를 사용합니다:

*   `JWT_SECRET`: JWT를 서명하고 검증하는 데 사용되는 비밀 키입니다. 이 값은 `.env` 파일에 설정되어야 합니다. 설정되지 않은 경우, 개발 환경을 위한 기본값이 사용됩니다.

```typescript
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_for_development';
```

## 3. 미들웨어 함수

### `authenticateToken`

```typescript
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  // 헤더에서 Authorization 값 가져오기
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN 형식에서 TOKEN 부분 추출
  
  if (!token) {
    res.status(401).json({ 
      success: false, 
      message: '인증 토큰이 필요합니다.' 
    });
    return;
  }
  
  // 토큰 검증
  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      res.status(403).json({ 
        success: false, 
        message: '유효하지 않거나 만료된 토큰입니다.' 
      });
      return;
    }
    
    // 검증된 사용자 정보를 요청 객체에 추가
    (req as any).user = decoded;
    next();
  });
};
```

**목적:**

수신되는 요청의 `Authorization` 헤더에 포함된 JWT를 검증합니다.

**동작 방식:**

1.  요청 헤더에서 `Authorization` 값을 가져옵니다. 토큰은 "Bearer [TOKEN]" 형식으로 전달되어야 합니다.
2.  토큰이 존재하지 않으면 `401 Unauthorized` 상태와 함께 오류 메시지를 응답합니다.
3.  토큰이 존재하면 `jwt.verify` 메소드를 사용하여 `JWT_SECRET`으로 토큰을 검증합니다.
4.  검증에 실패하면 (예: 토큰이 유효하지 않거나 만료된 경우) `403 Forbidden` 상태와 함께 오류 메시지를 응답합니다.
5.  검증에 성공하면, 디코딩된 페이로드(사용자 정보)를 요청 객체의 `user` 속성에 할당하고 `next()`를 호출하여 다음 미들웨어나 라우트 핸들러로 제어를 전달합니다.

**요청:**

*   **헤더:**
    *   `Authorization`: `Bearer <jwt_token>`

**응답:**

*   **성공 시:** 다음 미들웨어로 제어를 전달하며, `req.user`에 디코딩된 토큰 정보가 포함됩니다.
*   **실패 시:**
    *   `401 Unauthorized`: 토큰이 제공되지 않은 경우.
        ```json
        {
          "success": false,
          "message": "인증 토큰이 필요합니다."
        }
        ```
    *   `403 Forbidden`: 토큰이 유효하지 않거나 만료된 경우.
        ```json
        {
          "success": false,
          "message": "유효하지 않거나 만료된 토큰입니다."
        }
        ```

### `checkSession`

```typescript
export const checkSession = (req: Request, res: Response): void => {
  res.status(200).json({ 
    success: true, 
    message: '세션이 유효합니다.' 
  });
};
```

**목적:**

클라이언트가 현재 세션(또는 토큰)의 유효성을 확인할 수 있는 간단한 엔드포인트를 제공합니다. 이 미들웨어는 `authenticateToken` 미들웨어 뒤에 사용되어야, `authenticateToken`이 먼저 토큰 유효성을 검증한 후 이 핸들러가 호출됩니다.

**동작 방식:**

1.  이 미들웨어는 특별한 로직 없이 항상 `200 OK` 상태와 함께 세션이 유효하다는 메시지를 응답합니다.
2.  실제 세션 유효성 검증은 이 미들웨어 이전에 실행되는 `authenticateToken` 미들웨어에 의해 처리됩니다. 만약 `authenticateToken`에서 토큰이 유효하지 않다고 판단되면, `checkSession`은 실행되지 않습니다.

**요청:**

*   이 함수 자체는 특정 요청 본문이나 파라미터를 요구하지 않지만, 일반적으로 `authenticateToken` 미들웨어와 함께 사용되므로 유효한 JWT가 `Authorization` 헤더에 포함되어야 합니다.

**응답:**

*   **성공 시 (즉, `authenticateToken` 통과 후):**
    ```json
    {
      "success": true,
      "message": "세션이 유효합니다."
    }
    ```

## 4. 오류 처리

*   **`authenticateToken`:**
    *   토큰 누락: `401 Unauthorized` 응답.
    *   토큰 유효하지 않음/만료: `403 Forbidden` 응답.
*   **`checkSession`:**
    *   자체적으로 오류를 발생시키지 않으나, `authenticateToken` 미들웨어에서 발생한 오류가 먼저 처리됩니다.

이러한 미들웨어 함수들은 Express 애플리케이션의 라우트에 적용되어 특정 경로에 대한 접근을 제어하고 사용자 인증을 강제합니다.
