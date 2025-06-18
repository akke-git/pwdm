# `frontend/src/jwt.ts` 문서

## 1. 파일 개요

`jwt.ts` 파일은 JSON Web Token (JWT)과 관련된 유틸리티 함수를 제공합니다. 현재 이 파일에는 JWT 토큰 문자열에서 페이로드(payload) 데이터를 추출하고 파싱하는 `parseJwt` 함수가 정의되어 있습니다. 이 함수는 클라이언트 측에서 사용자 인증 상태를 확인하거나 토큰에 담긴 사용자 정보를 활용해야 할 때 유용하게 사용됩니다.

## 2. `parseJwt` 함수

`parseJwt` 함수는 JWT 토큰 문자열을 입력받아, 해당 토큰의 페이로드 부분을 디코딩하고 JSON 객체로 파싱하여 반환합니다.

### 2.1. 소스 코드

```typescript
// JWT 토큰에서 payload를 파싱하는 함수
export function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse JWT:', e);
    return null;
  }
}
```

### 2.2. 상세 설명

-   **목적**: JWT 토큰 문자열에서 두 번째 부분인 페이로드(payload)를 추출하여 Base64 URL 디코딩 및 UTF-8 디코딩을 수행한 후, JSON 객체로 변환합니다.
-   **매개변수**:
    -   `token: string`: 파싱할 JWT 토큰 문자열입니다. JWT는 일반적으로 `xxxxx.yyyyy.zzzzz` 형태로, 각 부분은 Base64 URL로 인코딩되어 있으며 `.`으로 구분됩니다.
-   **반환 값**:
    -   `any`: 성공적으로 파싱된 경우, 페이로드 데이터를 담고 있는 JSON 객체를 반환합니다.
    -   `null`: 토큰 파싱 과정에서 오류가 발생한 경우 (예: 유효하지 않은 토큰 형식, 디코딩 실패 등), 콘솔에 오류 메시지를 출력하고 `null`을 반환합니다.

### 2.3. 내부 로직

1.  **페이로드 추출**: `token.split('.')[1]`을 사용하여 JWT 문자열을 `.` 기준으로 분리하고, 두 번째 요소(인덱스 1)인 페이로드 부분을 가져옵니다. 이 부분은 Base64 URL로 인코딩되어 있습니다.
2.  **Base64 URL to Base64 변환**: `base64Url.replace(/-/g, '+').replace(/_/g, '/')`를 통해 Base64 URL 인코딩에서 사용되는 문자(`-`, `_`)를 표준 Base64 인코딩에서 사용되는 문자(`+`, `/`)로 변환합니다. 이는 `atob` 함수가 표준 Base64 문자열을 처리하기 때문입니다.
3.  **Base64 디코딩 및 UTF-8 문자열 복원**:
    -   `atob(base64)`: Base64로 인코딩된 문자열을 디코딩합니다.
    -   `.split('')`: 디코딩된 문자열을 각 문자로 분리합니다.
    -   `.map(function (c) { return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2); })`: 각 문자를 UTF-8 퍼센트 인코딩 형식(예: `%E1%88%B4`)으로 변환합니다. 이는 다국어 문자나 특수 문자가 올바르게 처리되도록 하기 위함입니다.
    -   `.join('')`: 변환된 퍼센트 인코딩 문자열들을 다시 합칩니다.
    -   `decodeURIComponent(...)`: 최종적으로 퍼센트 인코딩된 UTF-8 문자열을 일반 문자열로 디코딩합니다.
4.  **JSON 파싱**: `JSON.parse(jsonPayload)`를 사용하여 디코딩된 JSON 형식의 문자열을 실제 JavaScript 객체로 변환합니다.
5.  **오류 처리**: `try...catch` 블록을 사용하여 파싱 과정 중 발생할 수 있는 모든 예외를 처리합니다. 오류 발생 시, `console.error`를 통해 오류 메시지를 기록하고 `null`을 반환하여 함수 호출 측에서 오류 상황을 인지하고 대처할 수 있도록 합니다.

이 함수는 클라이언트 애플리케이션에서 JWT를 안전하게 다루고, 토큰에 포함된 정보를 활용하는 데 핵심적인 역할을 합니다.
