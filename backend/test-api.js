/**
 * 백엔드 API 테스트 스크립트
 * 
 * 사용 방법:
 * 1. 서버를 실행합니다: npm run dev
 * 2. 다른 터미널에서 이 스크립트를 실행합니다: node test-api.js
 */

const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000/api';
let authToken = '';

// 콘솔에 결과를 출력하는 함수
const logResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    console.log('상태 코드:', response.status);
    console.log('응답 데이터:', JSON.stringify(data, null, 2));
    return data;
  } else {
    const text = await response.text();
    console.log('상태 코드:', response.status);
    console.log('응답 텍스트:', text);
    return text;
  }
};

// 사용자 등록 테스트
const testRegister = async () => {
  console.log('\n===== 사용자 등록 테스트 =====');
  
  const userData = {
    username: '테스트사용자',
    email: 'test@example.com',
    password: 'Test1234!',
    masterPassword: 'MasterPass1234!'
  };
  
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    return await logResponse(response);
  } catch (error) {
    console.error('사용자 등록 오류:', error.message);
  }
};

// 로그인 테스트
const testLogin = async () => {
  console.log('\n===== 로그인 테스트 =====');
  
  const loginData = {
    email: 'test@example.com',
    password: 'Test1234!',
    masterPassword: 'MasterPass1234!'
  };
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });
    
    const data = await logResponse(response);
    if (data.data && data.data.token) {
      authToken = data.data.token;
      console.log('인증 토큰 저장됨:', authToken.substring(0, 15) + '...');
    }
    return data;
  } catch (error) {
    console.error('로그인 오류:', error.message);
  }
};

// 프로필 조회 테스트
const testGetProfile = async () => {
  console.log('\n===== 프로필 조회 테스트 =====');
  
  if (!authToken) {
    console.log('인증 토큰이 없습니다. 먼저 로그인하세요.');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${authToken}` 
      }
    });
    
    return await logResponse(response);
  } catch (error) {
    console.error('프로필 조회 오류:', error.message);
  }
};

// 비밀번호 항목 생성 테스트
const testCreatePasswordItem = async () => {
  console.log('\n===== 비밀번호 항목 생성 테스트 =====');
  
  if (!authToken) {
    console.log('인증 토큰이 없습니다. 먼저 로그인하세요.');
    return;
  }
  
  const passwordData = {
    title: '테스트 계정',
    url: 'https://example.com',
    username: 'testuser',
    password: 'SecurePassword123!',
    category: '웹사이트',
    notes: '테스트용 계정입니다.',
    is_favorite: true
  };
  
  try {
    const response = await fetch(`${API_URL}/passwords`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}` 
      },
      body: JSON.stringify(passwordData)
    });
    
    return await logResponse(response);
  } catch (error) {
    console.error('비밀번호 항목 생성 오류:', error.message);
  }
};

// 비밀번호 항목 목록 조회 테스트
const testGetPasswordItems = async () => {
  console.log('\n===== 비밀번호 항목 목록 조회 테스트 =====');
  
  if (!authToken) {
    console.log('인증 토큰이 없습니다. 먼저 로그인하세요.');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/passwords`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${authToken}` 
      }
    });
    
    return await logResponse(response);
  } catch (error) {
    console.error('비밀번호 항목 목록 조회 오류:', error.message);
  }
};

// 모든 테스트 실행
const runAllTests = async () => {
  try {
    await testRegister();
    const loginResult = await testLogin();
    if (loginResult && loginResult.success) {
      await testGetProfile();
      const createResult = await testCreatePasswordItem();
      if (createResult && createResult.success) {
        await testGetPasswordItems();
      }
    }
  } catch (error) {
    console.error('테스트 실행 중 오류 발생:', error);
  }
};

// 테스트 실행
runAllTests();
