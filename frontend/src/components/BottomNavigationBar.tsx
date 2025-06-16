import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BottomNavigation, 
  BottomNavigationAction, 
  Box
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import CategoryIcon from '@mui/icons-material/Category';
import SettingsIcon from '@mui/icons-material/Settings';
import AddPasswordDialog from './AddPasswordDialog';
import CategoryList from './CategoryList';

const BottomNavigationBar: React.FC = () => {
  const location = useLocation();
  const [addPasswordOpen, setAddPasswordOpen] = useState(false);
  const [categoryListOpen, setCategoryListOpen] = useState(false);


  const getRouteValue = (pathname: string) => {
    if (pathname.startsWith('/settings')) return '/settings';
    if (pathname.startsWith('/dashboard')) return '/dashboard';
    return '/dashboard'; // Default to home
  };
  
  const handleAddSuccess = () => {
    // 비밀번호 추가 성공 시 처리
    window.location.reload();
  };
  
  const handleCategoryUpdated = () => {
    // 카테고리 업데이트 성공 시 처리
    window.location.reload();
  };

  return (
    <>
      <Box sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        width: '100%', /* 전체 너비 사용 */
        margin: 0, /* 좌우 여백 제거 */
        padding: 0, /* 좌우 패딩 제거 */
        paddingBottom: 'env(safe-area-inset-bottom)', /* iOS 안전 영역 고려 */
        zIndex: 9999, /* 더 높은 z-index 값 사용 */
        border: 'none',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '0px -2px 10px rgba(0,0,0,0.1)', /* 약간의 그림자 추가 */
        bgcolor: '#1e1e1e',
        display: 'block !important', /* 반드시 표시하도록 설정 */
      }}>
        <BottomNavigation
          showLabels
          value={getRouteValue(location.pathname)}
          sx={{ 
            bgcolor: '#1e1e1e', 
            color: '#fff',
            width: '100%', /* 전체 너비 사용 */
            margin: 0, /* 좌우 여백 제거 */
            padding: 0, /* 좌우 패딩 제거 */
            '& .MuiBottomNavigationAction-root': {
              borderRadius: 0,
              minWidth: 0, /* 최소 너비 제한 제거 */
              padding: '6px 0', /* 좌우 패딩 줄이기 */
            }
          }}
        >
          <BottomNavigationAction 
            label="Home"
            value="/dashboard"
            icon={<HomeIcon sx={{ color: '#64b5f6' }} />}
            component={Link}
            to="/dashboard"
            sx={{ 
              fontFamily: 'apple gothic',
              color: 'rgba(255,255,255,0.7)',
              '&.Mui-selected': {
                color: '#64b5f6'
              }
            }}
          />
          <BottomNavigationAction 
            label="Pass Add"
            icon={<AddIcon sx={{ color: '#81c784' }} />}
            onClick={() => setAddPasswordOpen(true)}
            sx={{ 
              fontFamily: 'apple gothic',
              color: 'rgba(255,255,255,0.7)',
              '&.Mui-selected': {
                color: '#81c784'
              }
            }}
          />
          <BottomNavigationAction 
            label="Category"
            icon={<CategoryIcon sx={{ color: '#ffb74d' }} />}
            onClick={() => setCategoryListOpen(true)}
            sx={{ 
              fontFamily: 'apple gothic',
              color: 'rgba(255,255,255,0.7)',
              '&.Mui-selected': {
                color: '#ffb74d'
              }
            }}
          />
          <BottomNavigationAction 
            label="Settings"
            value="/settings"
            icon={<SettingsIcon sx={{ color: '#ba68c8' }} />}
            component={Link}
            to="/settings"
            sx={{ 
              fontFamily: 'apple gothic',
              color: 'rgba(255,255,255,0.7)',
              '&.Mui-selected': {
                color: '#ba68c8'
              }
            }}
          />
        </BottomNavigation>
      </Box>
      
      {/* 다이얼로그 */}
      <AddPasswordDialog 
        open={addPasswordOpen} 
        onClose={() => setAddPasswordOpen(false)} 
        onAdd={handleAddSuccess} 
      />
      <CategoryList
        open={categoryListOpen}
        onClose={() => setCategoryListOpen(false)}
        onCategoryUpdated={handleCategoryUpdated}
      />
    </>
  );
};

export default BottomNavigationBar;
