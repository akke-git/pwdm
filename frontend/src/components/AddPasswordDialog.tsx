import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Typography, Divider, IconButton,
  InputAdornment, CircularProgress, Alert, FormControl,
  InputLabel, Select, MenuItem
} from '@mui/material';
import { useSnackbar } from './SnackbarContext';
import { getAllCategories } from '../api/categoryApi';
import type { Category } from '../types/category';
import FolderIcon from '@mui/icons-material/Folder';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import HttpIcon from '@mui/icons-material/Http';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import DescriptionIcon from '@mui/icons-material/Description';

interface AddPasswordDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: () => void;
}

const AddPasswordDialog: React.FC<AddPasswordDialogProps> = ({ open, onClose, onAdd }) => {
  const [site, setSite] = useState('');
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const { showMessage } = useSnackbar();

  const validate = () => {
    if (!site.trim() || !password.trim()) {
      setError('사이트(제목)와 비밀번호를 모두 입력하세요.');
      return false;
    }
    if (username && username.includes('@') && !/^\S+@\S+\.\S+$/.test(username)) {
      setError('이메일 형식이 올바르지 않습니다.');
      return false;
    }
    if (password.length < 4) {
      setError('비밀번호는 최소 4자 이상이어야 합니다.');
      return false;
    }
    // URL 형식 검증 (입력된 경우)
    if (url && !url.match(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/)) {
      setError('유효한 URL을 입력하세요.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const api = (await import('../api/axios')).default;
      const res = await api.post('/passwords', {
        title: site,
        url: url,
        username,
        password,
        notes: description, // description을 notes로 전송
        category: category || undefined
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showMessage('비밀번호가 등록되었습니다!', 'success');
        onAdd();
        onClose();
        setSite(''); setUsername(''); setPassword(''); setDescription('');
      } else {
        setError(res.data.message || '등록 실패');
        showMessage(res.data.message || '등록 실패', 'error');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '서버 오류');
      showMessage(err.response?.data?.message || '서버 오류', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 카테고리 목록 불러오기
  useEffect(() => {
    if (open) {
      const fetchCategories = async () => {
        setLoadingCategories(true);
        try {
          const data = await getAllCategories();
          setCategories(data);
        } catch (err) {
          console.error('카테고리 불러오기 오류:', err);
        } finally {
          setLoadingCategories(false);
        }
      };
      fetchCategories();
    }
  }, [open]);

  const handleClose = () => {
    if (!loading) {
      setSite(''); 
      setUrl('');
      setUsername(''); 
      setPassword(''); 
      setDescription(''); 
      setCategory('');
      setError('');
      setShowPassword(false);
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={!loading ? handleClose : undefined}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
          bgcolor: '#121212', // 다크 테마 배경색
          color: '#fff', // 텍스트 색상을 흰색으로 변경
          border: '2px solid rgba(255,255,255,0.3)' // 보더라인 더 진하게 수정
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1,
        color: '#fff' // 텍스트 색상을 흰색으로 변경
      }}>
        <Typography variant="h6" fontWeight="600" sx={{ color: '#fff' }}>
          비밀번호 추가
        </Typography>
        <IconButton onClick={handleClose} disabled={loading} size="small" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      
      <Divider />
      
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <TextField 
            autoFocus 
            margin="dense" 
            label="사이트 이름" 
            fullWidth 
            value={site} 
            onChange={e => setSite(e.target.value)} 
            required 
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <HttpIcon sx={{ color: 'rgba(255,255,255,0.7)' }} fontSize="small" />
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiInputBase-root': {
                borderRadius: 1.5
              },
              mb: 2
            }}
          />
          
          <TextField 
            margin="dense" 
            label="사이트 URL (선택사항)" 
            fullWidth 
            value={url} 
            onChange={e => setUrl(e.target.value)} 
            disabled={loading}
            placeholder="https://example.com"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LinkIcon sx={{ color: 'rgba(255,255,255,0.7)' }} fontSize="small" />
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiInputBase-root': {
                borderRadius: 1.5
              },
              mb: 2
            }}
          />
          
          <TextField 
            margin="dense" 
            label="아이디/이메일" 
            fullWidth 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: 'rgba(255,255,255,0.7)' }} fontSize="small" />
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiInputBase-root': {
                borderRadius: 1.5
              },
              mb: 2
            }}
          />
          
          <TextField 
            margin="dense" 
            label="비밀번호" 
            type={showPassword ? 'text' : 'password'} 
            fullWidth 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: 'rgba(255,255,255,0.7)' }} fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                    disabled={loading}
                    sx={{ color: 'rgba(255,255,255,0.7)' }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiInputBase-root': {
                borderRadius: 1.5
              },
              mb: 2
            }}
          />
          
          <TextField 
            margin="dense" 
            label="설명 (선택사항)" 
            fullWidth 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            disabled={loading}
            multiline
            minRows={2}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                  <DescriptionIcon sx={{ color: 'rgba(255,255,255,0.7)' }} fontSize="small" />
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiInputBase-root': {
                borderRadius: 1.5
              },
              mb: 2
            }}
          />
          
          <FormControl fullWidth margin="dense">
            <InputLabel id="category-select-label" sx={{ color: 'rgba(255,255,255,0.7)' }}>카테고리 (선택사항)</InputLabel>
            <Select
              labelId="category-select-label"
              value={category}
              onChange={e => setCategory(e.target.value)}
              disabled={loading || loadingCategories}
              label="카테고리 (선택사항)"
              sx={{
                '& .MuiInputBase-root': {
                  borderRadius: 1.5
                },
                color: '#fff',
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.3)'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.5)'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.7)'
                }
              }}
              startAdornment={
                <InputAdornment position="start">
                  <FolderIcon sx={{ color: 'rgba(255,255,255,0.7)' }} fontSize="small" />
                </InputAdornment>
              }
            >
              <MenuItem value=""><em style={{ color: '#333' }}>카테고리 없음</em></MenuItem>
              {categories.map(cat => (
                <MenuItem key={cat.id} value={cat.name}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      sx={{ 
                        width: 16, 
                        height: 16, 
                        borderRadius: '50%', 
                        bgcolor: cat.color,
                        mr: 1
                      }} 
                    />
                    {cat.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        
        <Divider />
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleClose} 
            disabled={loading}
            startIcon={<CancelIcon />}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              borderColor: 'rgba(255,255,255,0.3)',
              color: '#fff',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.5)'
              }
            }}
          >
            취소
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
            sx={{ 
              borderRadius: 2,
              ml: 1,
              bgcolor: 'rgba(255,255,255,0.2)',
              color: '#fff',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.3)'
              }
            }}
          >
            {loading ? '등록 중...' : '등록'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default AddPasswordDialog;
