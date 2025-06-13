import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  IconButton,
  Avatar,
  Tooltip,
  Container
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PasswordTable from '../components/PasswordTable';

import { parseJwt } from '../jwt';
import EditProfileDialog from '../components/EditProfileDialog';


import LogoutIcon from '@mui/icons-material/Logout';




const Dashboard: React.FC = () => {
  const navigate = useNavigate();


  const [refreshKey, setRefreshKey] = useState(0);

  // JWT에서 사용자 정보 파싱
  let userInfo: any = null;
  const token = localStorage.getItem('token');
  if (token) {
    userInfo = parseJwt(token);
  }
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [localUsername, setLocalUsername] = useState(userInfo?.username || userInfo?.preferred_username || userInfo?.name || '');
  console.log('userInfo:', userInfo);
  console.log('localUsername:', localUsername);
  // const [twoFactor, setTwoFactor] = useState(userInfo?.twoFactorEnabled || false); // Removed as 2FA UI is removed
  


  // 닉네임이 바뀌면 즉시 반영
  const handleProfileUpdated = (newUsername: string) => {
    setLocalUsername(newUsername);
    if (userInfo) userInfo.username = newUsername;
  };

  // 2FA 활성화/비활성화 기능 제거됨
  // const handleToggle2FA = async () => { ... };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      width: '100%',
      overflow: 'hidden', // 전체 컨테이너에서 오버플로우 방지
      fontFamily: 'apple gothic, sans-serif'
    }}>
      {/* 배너 섹션 */}
      <Box sx={{
        position: 'relative',
        width: '100%',
        height: { xs: '180px', sm: '220px' },
        backgroundColor: '#000',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 1,
        overflow: 'hidden'
      }}>
        {/* 배너 이미지 */}
        <Box sx={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          width: '100%',
          height: '100%',
          zIndex: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <img 
            src="/images/pass.png" 
            alt="Password Banner" 
            style={{
              maxWidth: '80%',
              maxHeight: '60%',
              objectFit: 'contain'
            }}
          />
        </Box>
        {/* 로그아웃 버튼 - 좌상단 */}
        {userInfo && (
          <Box sx={{ p: { xs: 2, sm: 3 }, alignSelf: 'flex-start' }}>
            <Tooltip title="Logout">
              <IconButton 
                onClick={handleLogout}
                size="small"
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                  p: { xs: 0.8, sm: 1 }
                }}
              >
                <LogoutIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
              </IconButton>
            </Tooltip>
          </Box>
        )}
        
        {/* 사용자 정보 - 우하단 */}
        {userInfo && (
          <Box sx={{ 
            p: { xs: 2, sm: 3 }, 
            alignSelf: 'flex-end',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderTopLeftRadius: '8px',
            zIndex: 10, // z-index 증가
            position: 'relative' // position 추가
          }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'flex-end',
              minWidth: '100px' // 최소 너비 추가
            }}>
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: '1.1rem', sm: '1.3rem' },
                  fontFamily: 'apple gothic, sans-serif',
                  color: '#fff',
                  fontWeight: 600,
                  lineHeight: 1.1,
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)' // 가독성 향상
                }}
              >
                {localUsername || userInfo?.name || userInfo?.preferred_username || '사용자'}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  fontFamily: 'apple gothic, sans-serif',
                  color: 'rgba(255,255,255,0.8)',
                  lineHeight: 1.2,
                  textShadow: '0 1px 1px rgba(0,0,0,0.5)', // 가독성 향상
                  maxWidth: '200px', // 최대 너비 제한
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {userInfo?.email || ''}
              </Typography>
            </Box>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: { xs: 38, sm: 46 },
                height: { xs: 38, sm: 46 },
                fontSize: { xs: '1.2rem', sm: '1.5rem' },
                fontFamily: 'inherit',
                border: '2px solid rgba(255,255,255,0.2)' // 테두리 추가
              }}
            >
              {(localUsername || userInfo?.name || userInfo?.preferred_username || '?').charAt(0).toUpperCase()}
            </Avatar>
          </Box>
        )}
      </Box>
      
      {/* 메인 컨테이너 - 다크 테마로 변경 */}
      <Box sx={{ 
        flexGrow: 1, 
        pb: 4,
        bgcolor: '#0a0a0a', // 약간 밝은 다크 테마 배경색으로 변경하여 대비 개선
        width: '100%',
        minHeight: '100vh',
        px: { xs: 1, sm: 4 },
        boxSizing: 'border-box',
        maxWidth: { xs: '100vw', sm: '100%' },
        fontFamily: 'apple gothic, sans-serif',
        color: '#fff', // 기본 텍스트 색상을 흰색으로 유지
        position: 'relative',
        zIndex: 1
      }}>
        <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2 } }}>
          <Box 
            sx={{ 
              width: '100%',
              maxWidth: { xs: '100vw', sm: 420, md: 'lg' }, // 모바일은 화면 가득, 데스크탑은 고정폭
              fontFamily: 'inherit',
              mx: { sm: 'auto' }
            }}
          >
          
          {/* 비밀번호 섹션 헤더 */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: { xs: 2.5, sm: 3 },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2.5, sm: 0 },
            width: '100%',
            maxWidth: { xs: 420, sm: '100%' },
            color: '#fff' // 텍스트 색상을 흰색으로 변경
          }}>
            <Typography 
              component="h1" 
              variant="h4" 
              fontWeight="600"
              sx={{ 
                fontSize: { xs: '1.5rem', sm: '2rem' },
                fontFamily: 'apple gothic, sans-serif',
                textAlign: { xs: 'center', sm: 'left' }
              }}
            >
              {/* PASSWORD LIST */}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 1.5, sm: 2 },
              width: { xs: '100%', sm: 'auto' }, // 모바일에서 전체 너비
              justifyContent: { xs: 'center', sm: 'flex-end' }
            }}>


            </Box>
          </Box>
          

          
          {/* 테이블 컨테이너 - 다크 테마로 변경 */}
          <Box 
            sx={{ 
              borderRadius: '4px',
              overflow: 'hidden',
              border: 'none',
              backgroundColor: '#1e1e1e', // 다크 테마 배경색
              width: '100%',
              maxWidth: { xs: 420, sm: '100%' },
              mx: 'auto'
            }}
          >
            <PasswordTable 
              refreshKey={refreshKey} 
              onRefreshProp={() => setRefreshKey(prev => prev + 1)}
            />
          </Box>
          </Box>
        </Container>
      </Box>
      
      {/* 다이얼로그 */}
      <EditProfileDialog 
        open={editProfileOpen} 
        onClose={() => setEditProfileOpen(false)} 
        userInfo={{ email: userInfo?.email, username: localUsername }} 
        onUpdated={handleProfileUpdated} 
      />

    </Box>
  );
};

export default Dashboard;