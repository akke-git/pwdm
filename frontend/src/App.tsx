import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, responsiveFontSizes } from '@mui/material';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SearchPage from './pages/SearchPage';
import SettingsPage from './pages/SettingsPage';
import PasswordExportPage from './pages/PasswordExportPage';
import PasswordImportPage from './pages/PasswordImportPage';
import BottomNavigationBar from './components/BottomNavigationBar';
import { SnackbarProvider } from './components/SnackbarContext';
import './App.css';
import { Box } from '@mui/material';

let theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3a7bd5',
      light: '#63a4ff',
      dark: '#0056a3',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00bcd4',
      light: '#62efff',
      dark: '#008ba3',
      contrastText: '#ffffff',
    },
    background: {
      default: '#000',
      paper: '#212121',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    success: {
      main: '#4caf50',
    },
  },
  typography: {
    fontFamily: 'AppleSDGothicNeo, "Apple SD Gothic Neo", Pretendard, -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif',
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #3a7bd5 0%, #00d2ff 100%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #3a7bd5 30%, #00d2ff 90%)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: 'none', // 전역적으로 Paper 그림자 제거
          border: 'none', // 테두리 제거
          backgroundColor: '#212121', // 다크 테마 배경색 조정
        },
        elevation0: {
          border: 'none', // 테두리 제거
        }
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#000',
          margin: 0,
          padding: 0,
          border: 'none',
          outline: 'none',
        },
        html: {
          backgroundColor: '#000',
          margin: 0,
          padding: 0,
          border: 'none',
          outline: 'none',
        },
        '*': {
          boxSizing: 'border-box',
          border: 'none',
          outline: 'none',
        }
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: '#3a7bd5',
            },
          },
        },
      },
    },
  },
});
theme = responsiveFontSizes(theme);

const MainLayout: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          pb: 7, /* Height of BottomNavigationBar */
          px: { xs: 0.5, sm: 1, md: 1.5 }, /* 반응형 좌우 패딩 감소: 모바일(xs)에서는 4px, 태블릿(sm)에서는 8px, 데스크탑(md)에서는 12px */
          maxWidth: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden' /* 오버플로우 방지 */
        }}
      >
        {children}
      </Box>
      <BottomNavigationBar />
    </Box>
  );
};

function RequireAuth({ children }: { children: React.ReactElement }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <SnackbarProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={
                <RequireAuth>
                  <MainLayout><Dashboard /></MainLayout>
                </RequireAuth>
              } 
            />
            <Route 
              path="/search" 
              element={
                <RequireAuth>
                  <MainLayout><SearchPage /></MainLayout>
                </RequireAuth>
              } 
            />
            <Route 
              path="/settings" // Main settings page
              element={
                <RequireAuth>
                  <MainLayout><SettingsPage /></MainLayout>
                </RequireAuth>
              } 
            />
            <Route 
              path="/settings/export" // Password export page
              element={
                <RequireAuth>
                  <MainLayout><PasswordExportPage /></MainLayout>
                </RequireAuth>
              } 
            />
            <Route 
              path="/settings/import" // Password import page
              element={
                <RequireAuth>
                  <MainLayout><PasswordImportPage /></MainLayout>
                </RequireAuth>
              } 
            />
            {/* Default authenticated route */}
            <Route 
              path="/" 
              element={
                <RequireAuth>
                  <Navigate to="/dashboard" replace />
                </RequireAuth>
              }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </SnackbarProvider>
  );
}

export default App;