# Security Middleware (`security.ts`)

이 파일은 애플리케이션의 보안을 강화하기 위한 미들웨어 함수들을 정의합니다. 비밀번호 강도 검사, 로그인 시도 제한, 일반 API 요청 제한 등의 기능을 포함합니다.

## 목차

1.  [개요](#개요)
2.  [의존성](#의존성)
3.  [미들웨어 함수](#미들웨어-함수)
    *   [`passwordStrengthCheck`](#passwordstrengthcheck)
    *   [`masterPasswordStrengthCheck`](#masterpasswordstrengthcheck)
    *   [`loginLimiter`](#loginlimiter)
    *   [`apiLimiter`](#apilimiter)
4.  [오류 및 응답 형식](#오류-및-응답-형식)

## 1. 개요

보안 미들웨어는 사용자 입력의 유효성을 검사하고, 서비스 거부(DoS) 공격과 같은 악의적인 시도를 방지하여 애플리케이션을 보호하는 데 중점을 둡니다.

## 2. 의존성

이 파일의 미들웨어는 다음 라이브러리를 사용합니다:

*   `express-rate-limit`: API 요청 횟수를 제한하여 브루트 포스 공격 등을 방지합니다.
*   `zxcvbn`: 비밀번호의 강도를 평가하고 사용자에게 피드백을 제공합니다.

## 3. 미들웨어 함수

### `passwordStrengthCheck`

```typescript
import zxcvbn from 'zxcvbn';

export const passwordStrengthCheck = (req: Request, res: Response, next: NextFunction): void => {
  const { password } = req.body;
  
  if (!password) {
    res.status(400).json({
      success: false,
      message: '비밀번호가 제공되지 않았습니다.'
    });
    return;
  }
  
  const result = zxcvbn(password);
  
  if (result.score < 1) { // 0-4 척도, 1 미만은 약함
    res.status(400).json({
      success: false,
      message: '비밀번호가 너무 약합니다. 더 강력한 비밀번호를 사용하세요.',
      feedback: result.feedback.suggestions,
      score: result.score
    });
    return;
  }
  
  next();
};
```

**목적:**

사용자가 회원가입하거나 비밀번호를 변경할 때 입력한 일반 비밀번호의 강도를 검사합니다.

**동작 방식:**

1.  요청 본문(`req.body`)에서 `password` 필드를 가져옵니다.
2.  `password`가 제공되지 않으면 `400 Bad Request`와 함께 오류 메시지를 응답합니다.
3.  `zxcvbn` 라이브러리를 사용하여 비밀번호 강도를 평가합니다. `zxcvbn`은 0에서 4까지의 점수(score)를 반환하며, 점수가 높을수록 강력한 비밀번호입니다.
4.  점수가 1 미만이면 (즉, 0점), 비밀번호가 너무 약하다고 판단하고 `400 Bad Request`와 함께 오류 메시지, 개선을 위한 제안(`feedback.suggestions`), 그리고 실제 점수(`score`)를 응답합니다.
5.  비밀번호 강도가 충분하면 `next()`를 호출하여 다음 미들웨어나 라우트 핸들러로 제어를 전달합니다.

**요청:**

*   **본문 (`req.body`):**
    *   `password` (string, 필수): 검사할 비밀번호.

**응답:**

*   **성공 시:** 다음 미들웨어로 제어를 전달합니다.
*   **실패 시:**
    *   `400 Bad Request`: 비밀번호가 제공되지 않았거나 너무 약한 경우.
        *   비밀번호 누락 시:
            ```json
            {
              "success": false,
              "message": "비밀번호가 제공되지 않았습니다."
            }
            ```
        *   비밀번호 약함 시:
            ```json
            {
              "success": false,
              "message": "비밀번호가 너무 약합니다. 더 강력한 비밀번호를 사용하세요.",
              "feedback": ["Add another word or two. Uncommon words are better."], // 예시 피드백
              "score": 0 // 예시 점수
            }
            ```

### `masterPasswordStrengthCheck`

```typescript
export const masterPasswordStrengthCheck = (req: Request, res: Response, next: NextFunction): void => {
  const { masterPassword } = req.body;
  
  if (!masterPassword) {
    res.status(400).json({
      success: false,
      message: '마스터 비밀번호가 제공되지 않았습니다.'
    });
    return;
  }
  
  const result = zxcvbn(masterPassword);
  
  if (result.score < 1) { // 마스터 비밀번호는 더 높은 기준을 적용할 수 있음 (예: < 2 또는 < 3)
    res.status(400).json({
      success: false,
      message: '마스터 비밀번호가 너무 약합니다. 매우 강력한 비밀번호를 사용하세요.',
      feedback: result.feedback.suggestions,
      score: result.score
    });
    return;
  }
  
  next();
};
```

**목적:**

사용자가 마스터 비밀번호를 설정하거나 변경할 때 입력한 마스터 비밀번호의 강도를 검사합니다. 마스터 비밀번호는 모든 데이터를 암호화하는 중요한 키이므로, 일반 비밀번호보다 더 높은 강도가 요구될 수 있습니다. (현재 코드에서는 일반 비밀번호와 동일하게 `score < 1`을 기준으로 하지만, 실제 운영 시에는 `score < 2` 또는 `score < 3` 등으로 기준을 상향 조정하는 것을 고려해야 합니다.)

**동작 방식:**

1.  요청 본문(`req.body`)에서 `masterPassword` 필드를 가져옵니다.
2.  `masterPassword`가 제공되지 않으면 `400 Bad Request`와 함께 오류 메시지를 응답합니다.
3.  `zxcvbn` 라이브러리를 사용하여 마스터 비밀번호 강도를 평가합니다.
4.  점수가 1 미만이면, 비밀번호가 너무 약하다고 판단하고 `400 Bad Request`와 함께 오류 메시지, 개선을 위한 제안, 그리고 실제 점수를 응답합니다.
5.  비밀번호 강도가 충분하면 `next()`를 호출합니다.

**요청:**

*   **본문 (`req.body`):**
    *   `masterPassword` (string, 필수): 검사할 마스터 비밀번호.

**응답:**

*   **성공 시:** 다음 미들웨어로 제어를 전달합니다.
*   **실패 시:**
    *   `400 Bad Request`: 마스터 비밀번호가 제공되지 않았거나 너무 약한 경우.
        *   마스터 비밀번호 누락 시:
            ```json
            {
              "success": false,
              "message": "마스터 비밀번호가 제공되지 않았습니다."
            }
            ```
        *   마스터 비밀번호 약함 시:
            ```json
            {
              "success": false,
              "message": "마스터 비밀번호가 너무 약합니다. 매우 강력한 비밀번호를 사용하세요.",
              "feedback": ["Add another word or two. Uncommon words are better."],
              "score": 0
            }
            ```

### `loginLimiter`

```typescript
import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 15분 동안 최대 5번의 요청만 허용
  message: {
    success: false,
    message: '너무 많은 로그인 시도가 있었습니다. 15분 후에 다시 시도해주세요.'
  },
  standardHeaders: true, // RateLimit-* 헤더를 응답에 포함
  legacyHeaders: false, // X-RateLimit-* 헤더 사용 안 함
});
```

**목적:**

로그인 API 경로에 대한 요청 횟수를 제한하여 브루트 포스(Brute-force) 공격을 방지합니다.

**동작 방식:**

*   `express-rate-limit` 라이브러리를 사용하여 구현됩니다.
*   `windowMs`: 제한을 적용할 시간 창 (밀리초 단위). 여기서는 15분입니다.
*   `max`: `windowMs` 동안 허용되는 최대 요청 횟수. 여기서는 5회입니다.
*   즉, 동일 IP 주소에서 15분 동안 5회를 초과하여 로그인 시도를 하면, 그 이후의 요청은 차단됩니다.
*   차단 시 `message`에 정의된 JSON 객체가 `429 Too Many Requests` 상태 코드와 함께 응답됩니다.
*   `standardHeaders: true`로 설정되어 `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` 등의 표준 헤더가 응답에 포함되어 클라이언트가 현재 제한 상태를 알 수 있도록 합니다.

**응답 (제한 초과 시):**

*   `429 Too Many Requests`:
    ```json
    {
      "success": false,
      "message": "너무 많은 로그인 시도가 있었습니다. 15분 후에 다시 시도해주세요."
    }
    ```

### `apiLimiter`

```typescript
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 100, // 1분 동안 최대 100번의 요청만 허용
  message: {
    success: false,
    message: '너무 많은 요청이 있었습니다. 잠시 후에 다시 시도해주세요.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
```

**목적:**

일반적인 API 요청에 대한 전역적인 횟수 제한을 설정하여 서비스의 안정성을 확보하고 과도한 트래픽으로부터 보호합니다.

**동작 방식:**

*   `loginLimiter`와 유사하게 `express-rate-limit`을 사용합니다.
*   `windowMs`: 1분 (60 * 1000 밀리초).
*   `max`: 1분 동안 허용되는 최대 요청 횟수는 100회입니다.
*   동일 IP 주소에서 1분 동안 100회를 초과하는 요청은 차단됩니다.
*   차단 시 `message`에 정의된 JSON 객체가 `429 Too Many Requests` 상태 코드와 함께 응답됩니다.

**응답 (제한 초과 시):**

*   `429 Too Many Requests`:
    ```json
    {
      "success": false,
      "message": "너무 많은 요청이 있었습니다. 잠시 후에 다시 시도해주세요."
    }
    ```

## 4. 오류 및 응답 형식

*   **비밀번호 강도 검사 실패 시 (`passwordStrengthCheck`, `masterPasswordStrengthCheck`):**
    *   상태 코드: `400 Bad Request`
    *   응답 본문: 오류 원인(누락 또는 약함), 피드백, 점수를 포함하는 JSON 객체.
*   **요청 횟수 제한 초과 시 (`loginLimiter`, `apiLimiter`):**
    *   상태 코드: `429 Too Many Requests`
    *   응답 본문: 제한 초과 메시지를 포함하는 JSON 객체.

이러한 보안 미들웨어들은 Express 애플리케이션의 라우트 정의 시 적절한 경로에 적용되어야 합니다. 예를 들어, `loginLimiter`는 로그인 라우트에, `passwordStrengthCheck`는 회원가입 또는 비밀번호 변경 라우트에 적용됩니다.
