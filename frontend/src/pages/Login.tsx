import React, { useState, useEffect } from 'react';
import { 
  Avatar, 
  Button, 
  TextField, 
  Box, 
  Typography, 
  Container, 
  Paper, 
  InputAdornment, 
  IconButton,
  Link,
  CircularProgress,
  Divider
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useSnackbar } from '../components/SnackbarContext';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

// 구글 사용자 정보를 위한 커스텀 인터페이스
interface GoogleUserInfo {
  email: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  jti: string; // JWT ID
  exp: number; // 만료 시간
  iat: number; // 발급 시간
  sub: string; // Subject (사용자 ID)
  originalToken?: string; // 원본 토큰 저장
}

const Login: React.FC = () => {
  // 페이지 로드 시 body 스타일 설정
  useEffect(() => {
    // 기존 body 스타일 저장
    const originalStyle = document.body.style.cssText;
    
    // body에 스타일 적용
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.border = 'none';
    document.body.style.backgroundColor = '#000';
    
    // 컴포넌트 언마운트 시 원래 스타일로 복원
    return () => {
      document.body.style.cssText = originalStyle;
    };
  }, []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 구글 로그인 관련 상태
  const [googleLoginStep, setGoogleLoginStep] = useState(false);
  const [googleUserInfo, setGoogleUserInfo] = useState<GoogleUserInfo | null>(null); // 구글 사용자 정보
  const [googleCredential, setGoogleCredential] = useState<string>(''); // 구글 원본 토큰
  const navigate = useNavigate();
  const { showMessage } = useSnackbar();

  const validate = () => {
    // 일반 로그인 경우
    if (!googleLoginStep) {
      if (!email.trim() || !password.trim() || !masterPassword.trim()) {
        setError('이메일, 비밀번호, 마스터 비밀번호를 모두 입력하세요.');
        return false;
      }
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        setError('이메일 형식이 올바르지 않습니다.');
        return false;
      }
      if (password.length < 4) {
        setError('비밀번호는 최소 4자 이상이어야 합니다.');
        return false;
      }
    } 
    // 구글 로그인 후 마스터 비밀번호 입력 경우
    if (!masterPassword.trim()) {
      setError('마스터 비밀번호를 입력하세요.');
      return false;
    }
    if (masterPassword.length < 4) {
      setError('마스터 비밀번호는 최소 4자 이상이어야 합니다.');
      return false;
    }
    setError('');
    return true;
  };
  
  // 구글 로그인 성공 후 호출되는 함수
  const handleGoogleLoginSuccess = (credentialResponse: any) => {
    try {
      // 구글에서 받은 토큰 디코딩 및 GoogleUserInfo 타입으로 캐스팅
      const decoded = jwtDecode(credentialResponse.credential) as GoogleUserInfo;
      
      // 원본 토큰 저장
      setGoogleCredential(credentialResponse.credential);
      
      // 사용자 정보에 원본 토큰 추가
      decoded.originalToken = credentialResponse.credential;
      setGoogleUserInfo(decoded);
      setGoogleLoginStep(true); // 마스터 비밀번호 입력 단계로 전환
      
      // 구글 사용자 정보에서 이메일 가져오기
      if (decoded.email) {
        setEmail(decoded.email);
      }
      
      showMessage('구글 로그인 성공! 마스터 비밀번호를 입력해주세요.', 'success');
    } catch (error) {
      console.error('구글 로그인 토큰 처리 오류:', error);
      showMessage('구글 로그인 처리 중 오류가 발생했습니다.', 'error');
    }
  };
  
  // 구글 로그인 실패 후 호출되는 함수
  const handleGoogleLoginError = () => {
    showMessage('구글 로그인이 취소되었습니다.', 'error');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setError('');
    try {
      setLoading(true);
      
      // 일반 로그인과 구글 로그인 구분
      let res;
      if (googleLoginStep && googleUserInfo) {
        // 구글 로그인 후 마스터 비밀번호 입력 경우
        res = await api.post('/auth/google-login', {
          googleToken: googleCredential, // 원본 ID 토큰 사용
          email: googleUserInfo.email,
          name: googleUserInfo.name,
          masterPassword,
        });
      } else {
        // 일반 로그인 경우
        res = await api.post('/auth/login', {
          email,
          password,
          masterPassword,
        });
      }
      
      if (res.data.success) {
        localStorage.setItem('token', res.data.data.token);
        showMessage('로그인 성공!', 'success');
        navigate('/dashboard');
      } else {
        setError(res.data.message || '로그인 실패');
        showMessage(res.data.message || '로그인 실패', 'error');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '서버 오류');
      showMessage(err.response?.data?.message || '서버 오류', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      width: '100%',
      overflow: 'hidden',
      bgcolor: '#000', // 검은색 배경색으로 변경
      fontFamily: 'apple gothic, sans-serif',
      border: 'none',
      outline: 'none'
    }}>
    {/* Container의 maxWidth를 md로 변경하고, 패딩 제거 */}
    <Container 
      maxWidth="md" 
      sx={{ 
        border: 'none', 
        outline: 'none',
        px: 0, // 좌우 패딩 제거
        width: '100%',
        maxWidth: { xs: '100%', sm: '95%', md: '90%' } // 반응형으로 너비 조정
      }}
    >
      <Box sx={{ 
        mt: { xs: 2, sm: 4 }, // 상단 여백 줄임
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        border: 'none',
        outline: 'none',
        width: '100%'
      }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 2, sm: 3 }, // 반응형 패딩 적용
            width: '100%', 
            borderRadius: 2,
            bgcolor: '#000', // 검은색으로 통일
            color: '#fff', // 텍스트 색상 흰색
            border: 'none',
            outline: 'none'
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ 
              m: 1, 
              bgcolor: 'primary.main', 
              width: 56, 
              height: 56,
              boxShadow: '0 4px 8px rgba(58, 123, 213, 0.2)'
            }}>
              <LockOutlinedIcon fontSize="large" />
            </Avatar>
            <Typography component="h1" variant="h4" sx={{ mt: 2, fontWeight: 600, color: '#fff' }}>
              Log-In
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: 'rgba(255,255,255,0.7)' }}>
              Safe Password Management
            </Typography>
          </Box>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', border: 'none', outline: 'none' }}>
            {/* 구글 로그인 후 마스터 비밀번호 입력 화면 */}
            {googleLoginStep ? (
              <>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
                    구글 로그인 성공
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    데이터 보호를 위해 마스터 비밀번호를 입력해주세요.
                  </Typography>
                  {googleUserInfo?.email && (
                    <Typography variant="body2" sx={{ mt: 1, color: '#90caf9' }}>
                      {googleUserInfo.email}
                    </Typography>
                  )}
                </Box>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="masterPassword"
                  label="마스터 비밀번호"
                  type={showMasterPassword ? 'text' : 'password'}
                  id="masterPassword"
                  value={masterPassword}
                  onChange={e => setMasterPassword(e.target.value)}
                  disabled={loading}
                  autoFocus
                  sx={{
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                    '& .MuiOutlinedInput-root': { 
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.23)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                      '&.Mui-focused fieldset': { borderColor: 'primary.main' }
                    },
                    '& .MuiInputBase-input': { color: '#fff' }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <VpnKeyIcon color="secondary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle master password visibility"
                          onClick={() => setShowMasterPassword(!showMasterPassword)}
                          edge="end"
                        >
                          {showMasterPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </>
            ) : (
              /* 일반 로그인 화면 */
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="이메일 주소"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading}
                  sx={{
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                    '& .MuiOutlinedInput-root': { 
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.23)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                      '&.Mui-focused fieldset': { borderColor: 'primary.main' }
                    },
                    '& .MuiInputBase-input': { color: '#fff' }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="비밀번호"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                  sx={{
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                    '& .MuiOutlinedInput-root': { 
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.23)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                      '&.Mui-focused fieldset': { borderColor: 'primary.main' }
                    },
                    '& .MuiInputBase-input': { color: '#fff' }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <VpnKeyIcon color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="masterPassword"
                  label="마스터 비밀번호"
                  type={showMasterPassword ? 'text' : 'password'}
                  id="masterPassword"
                  value={masterPassword}
                  onChange={e => setMasterPassword(e.target.value)}
                  disabled={loading}
                  sx={{
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                    '& .MuiOutlinedInput-root': { 
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.23)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                      '&.Mui-focused fieldset': { borderColor: 'primary.main' }
                    },
                    '& .MuiInputBase-input': { color: '#fff' }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <VpnKeyIcon color="secondary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle master password visibility"
                          onClick={() => setShowMasterPassword(!showMasterPassword)}
                          edge="end"
                        >
                          {showMasterPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </>
            )}
            
            {error && (
              <Typography sx={{ mt: 2, textAlign: 'center', color: '#ff6b6b' }}>
                {error}
              </Typography>
            )}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 2,
                py: 1.5,
                fontSize: '1rem',
              }}
              disabled={loading}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                  로그인 중...
                </Box>
              ) : '로그인'}
            </Button>
            
            {/* 구글 로그인 버튼 - 일반 로그인 화면에서만 표시 */}
            {!googleLoginStep && (
              <>
                <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.12)' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                    또는
                  </Typography>
                </Divider>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <GoogleLogin
                    onSuccess={handleGoogleLoginSuccess}
                    onError={handleGoogleLoginError}
                    theme="filled_black"
                    text="signin_with"
                    shape="rectangular"
                    locale="ko"
                    useOneTap
                  />
                </Box>
              </>
            )}
            
            {/* 회원가입 링크 - 일반 로그인 화면에서만 표시 */}
            {!googleLoginStep && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" display="inline" sx={{ color: 'rgba(255,255,255,0.7)' }}>계정이 없으신가요? </Typography>
                <Link 
                  href="#" 
                  onClick={() => navigate('/register')} 
                  variant="body2"
                  sx={{ 
                    fontWeight: 600,
                    color: '#90caf9',
                    '&:hover': { textDecoration: 'underline' } 
                  }}
                >
                  회원가입
                </Link>
              </Box>
            )}
            
            {/* 구글 로그인 취소 버튼 - 구글 로그인 후 화면에서만 표시 */}
            {googleLoginStep && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Link
                  href="#"
                  onClick={() => {
                    setGoogleLoginStep(false);
                    setGoogleUserInfo(null);
                    setMasterPassword('');
                  }}
                  variant="body2"
                  sx={{ 
                    fontWeight: 600,
                    color: '#90caf9',
                    '&:hover': { textDecoration: 'underline' } 
                  }}
                >
                  일반 로그인으로 돌아가기
                </Link>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
    </Box>
  );
};

export default Login;
