import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.tsx'

// 구글 OAuth 클라이언트 ID - .env 파일에서 가져옵니다.
// 엔브 파일이 없을 경우 오류를 발생시켜 의도적으로 환경변수를 설정하도록 합니다.
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// 환경 변수가 설정되지 않은 경우 오류 발생
if (!GOOGLE_CLIENT_ID) {
  throw new Error('환경 변수 VITE_GOOGLE_CLIENT_ID가 설정되지 않았습니다. .env 파일을 확인해주세요.');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
