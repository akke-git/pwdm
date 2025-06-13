import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, CircularProgress, Typography,
  Box, Divider, IconButton, InputAdornment, Alert,
  Avatar
} from '@mui/material';
import { useSnackbar } from './SnackbarContext';
import api from '../api/axios';
import PersonIcon from '@mui/icons-material/Person';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';

interface EditProfileDialogProps {
  open: boolean;
  onClose: () => void;
  userInfo: { email: string; username?: string };
  onUpdated: (username: string) => void;
}

const EditProfileDialog: React.FC<EditProfileDialogProps> = ({ open, onClose, userInfo, onUpdated }) => {
  const [username, setUsername] = useState(userInfo.username || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showMessage } = useSnackbar();

  React.useEffect(() => {
    setUsername(userInfo.username || '');
    setError('');
  }, [userInfo, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('닉네임을 입력하세요.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.put('/auth/profile', { username }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        showMessage('닉네임이 변경되었습니다.', 'success');
        onUpdated(username);
        onClose();
      } else {
        setError(res.data.message || '변경 실패');
        showMessage(res.data.message || '변경 실패', 'error');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '서버 오류');
      showMessage(err.response?.data?.message || '서버 오류', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={!loading ? onClose : undefined}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 40px rgba(0,0,0,0.12)'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Typography variant="h6" fontWeight="600">
          프로필 수정
        </Typography>
        <IconButton onClick={onClose} disabled={loading} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      
      <Divider />
      
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            mb: 3
          }}>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: 'primary.main',
                mb: 2,
                fontSize: '2rem'
              }}
            >
              {username ? username.charAt(0).toUpperCase() : <PersonIcon fontSize="large" />}
            </Avatar>
            
            <Typography variant="body2" color="text.secondary">
              {userInfo.email}
            </Typography>
          </Box>
          
          <TextField
            label="닉네임"
            fullWidth
            value={username}
            onChange={e => setUsername(e.target.value)}
            disabled={loading}
            autoFocus
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action" fontSize="small" />
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiInputBase-root': {
                borderRadius: 1.5
              }
            }}
          />
          
          <TextField
            label="이메일"
            fullWidth
            value={userInfo.email}
            disabled
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" fontSize="small" />
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiInputBase-root': {
                borderRadius: 1.5
              },
              mt: 2
            }}
          />
        </DialogContent>
        
        <Divider />
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={onClose} 
            disabled={loading}
            startIcon={<CancelIcon />}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            취소
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
            sx={{ 
              borderRadius: 2,
              ml: 1
            }}
          >
            {loading ? '저장 중...' : '저장'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditProfileDialog;
