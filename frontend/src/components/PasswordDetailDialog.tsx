import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, IconButton, InputAdornment, Typography,
  Divider, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem, Chip, Link
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FolderIcon from '@mui/icons-material/Folder';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import { getCategoryIcon } from '../utils/categoryIcons';
import { useSnackbar } from './SnackbarContext';
import { getAllCategories } from '../api/categoryApi';
import type { Category } from '../types/category';

interface PasswordItem {
  id: number;
  title: string;
  username: string;
  password: string;
  site?: string;
  notes?: string;
  description?: string;
  url?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

interface PasswordDetailDialogProps {
  open: boolean;
  onClose: () => void;
  password: PasswordItem | null;
  onUpdated: () => void;
  categoryIconMap?: { [key: string]: string };
  categoryColorMap?: { [key: string]: string };
}

const PasswordDetailDialog: React.FC<PasswordDetailDialogProps> = ({ open, onClose, password, onUpdated }) => {
  const [editMode, setEditMode] = useState(false);
  const [site, setSite] = useState(password?.site || password?.title || '');
  const [username, setUsername] = useState(password?.username || '');
  const [pwValue, setPwValue] = useState(password?.password || '');
  const [description, setDescription] = useState(password?.notes || password?.description || '');
  const [url, setUrl] = useState(password?.url || '');
  const [category, setCategory] = useState(password?.category || '');
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryIcon, setCategoryIcon] = useState<string>('folder');
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { showMessage } = useSnackbar();

  useEffect(() => {
    setSite(password?.site || password?.title || '');
    setUsername(password?.username || '');
    setPwValue(password?.password || '');
    setDescription(password?.notes || password?.description || '');
    setUrl(password?.url || '');
    setCategory(password?.category || '');
    setEditMode(false);
    setShowPw(false);
    setError('');
    setConfirmDelete(false);
  }, [password, open]);

  const handleClose = () => {
    if (!loading) {
      setSite(password?.site || password?.title || '');
      setUsername(password?.username || '');
      setPwValue(password?.password || '');
      setDescription(password?.notes || password?.description || '');
      setUrl(password?.url || '');
      setCategory(password?.category || '');
      setEditMode(false);
      setShowPw(false);
      setError('');
      onClose();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(pwValue);
  };



  const handleUpdate = async () => {
    if (!password) return;
    
    if (!site || !username || !pwValue) {
      setError('사이트, 사용자 이름, 비밀번호는 필수 항목입니다.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const api = (await import('../api/axios')).default;
      const res = await api.put(`/passwords/${password?.id}`, {
        title: site,
        url: url,
        username,
        password: pwValue,
        notes: description,
        category: category || undefined
      }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        setEditMode(false);
        showMessage('수정되었습니다.', 'success');
        onUpdated();
      } else {
        setError(res.data.message || '수정 실패');
        showMessage(res.data.message || '수정 실패', 'error');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '서버 오류');
      showMessage(err.response?.data?.message || '서버 오류', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const api = (await import('../api/axios')).default;
      const res = await api.delete(`/passwords/${password?.id}`,
        { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        setConfirmDelete(false);
        showMessage('삭제되었습니다.', 'success');
        onClose();
        onUpdated();
      } else {
        setError(res.data.message || '삭제 실패');
        showMessage(res.data.message || '삭제 실패', 'error');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '서버 오류');
      showMessage(err.response?.data?.message || '서버 오류', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPw(!showPw);
  };

  useEffect(() => {
    if (open) {
      const fetchCategories = async () => {
        setLoadingCategories(true);
        try {
          const data = await getAllCategories();
          setCategories(data);
          
          // 디버깅을 위한 콘솔 로그
          console.log('카테고리 데이터:', data);
          console.log('현재 비밀번호의 카테고리:', password?.category);
          
          // 현재 카테고리의 아이콘 찾기
          const currentCategory = data.find(cat => cat.name === password?.category);
          console.log('현재 카테고리 정보:', currentCategory);
          
          // 카테고리 아이콘 설정
          if (currentCategory && currentCategory.icon) {
            setCategoryIcon(currentCategory.icon);
          } else {
            setCategoryIcon('folder'); // 기본 아이콘
          }
        } catch (err) {
          console.error('카테고리 불러오기 오류:', err);
        } finally {
          setLoadingCategories(false);
        }
      };
      fetchCategories();
    }
  }, [open, password?.category]);

  if (!password) return null;

  return (
    <Dialog 
      open={open} 
      onClose={!loading ? handleClose : undefined} 
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
        pb: 1.5,
        pt: 2
      }}>
        <Typography variant="h6" fontWeight="600" sx={{ fontFamily: 'apple gothic', color: 'text.primary' }}>
          비밀번호 상세
        </Typography>
        {!editMode && !confirmDelete && (
          <IconButton onClick={handleClose} disabled={loading} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {!editMode && (
          <Box sx={{ mb: 3 }}>
            {password?.category && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                {getCategoryIcon(
                  // 카테고리 아이콘 사용
                  categoryIcon, 
                  { fontSize: "small", style: { marginRight: '12px' } }, 
                  categories.find(c => c.name === password?.category)?.color || 'info.main'
                )}
                <Chip 
                  label={password?.category} 
                  size="small" 
                  color="info" 
                  variant="outlined"
                  sx={{ height: 24, fontSize: '0.8rem', fontFamily: 'apple gothic' }}
                />
              </Box>
            )}
            {password?.url && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <LinkIcon fontSize="small" sx={{ mr: 1.5, color: 'primary.main' }} />
                <Link 
                  href={password?.url.startsWith('http') ? password?.url : `https://${password?.url}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  sx={{ color: 'primary.main', fontFamily: 'apple gothic' }}
                >
                  {password?.url}
                </Link>
              </Box>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <CalendarTodayIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
              <Typography sx={{ fontFamily: 'apple gothic', color: 'text.secondary' }}>
                생성일: {new Date(password?.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        )}
        
        <Box sx={{ mt: 1 }}>
          {editMode ? (
            // 편집 모드일 때 입력 필드 표시
            <>
              <TextField
                margin="dense"
                label="사이트 이름"
                fullWidth
                value={site}
                onChange={(e) => setSite(e.target.value)}
                disabled={loading}
                required
                sx={{
                  '& .MuiInputBase-root': {
                    borderRadius: 1.5
                  },
                  mb: 2,
                  fontFamily: 'apple gothic'
                }}
              />
              
              <TextField
                label="아이디/이메일"
                fullWidth
                margin="dense"
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={loading}
                required
                sx={{
                  '& .MuiInputBase-root': {
                    borderRadius: 1.5
                  },
                  mb: 2,
                  fontFamily: 'apple gothic'
                }}
              />
              
              <TextField
                label="비밀번호"
                fullWidth
                margin="dense"
                type={showPw ? 'text' : 'password'}
                value={pwValue}
                onChange={e => setPwValue(e.target.value)}
                disabled={loading}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={handleTogglePasswordVisibility} 
                        edge="end" 
                        size="small" 
                        disabled={loading}
                        sx={{ mr: 0.5 }}
                      >
                        {showPw ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    borderRadius: 1.5
                  },
                  mb: 2,
                  fontFamily: 'apple gothic'
                }}
              />
              
              <TextField 
                margin="dense" 
                label="설명" 
                fullWidth 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                disabled={loading}
                multiline
                minRows={2}
                sx={{
                  '& .MuiInputBase-root': {
                    borderRadius: 1.5
                  },
                  mb: 2,
                  fontFamily: 'apple gothic'
                }}
              />
            </>
          ) : (
            // 조회 모드일 때 정보성 데이터로 표시
            <>
              <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* 사이트 이름 */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'apple gothic' }}>
                    사이트 이름
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary', fontFamily: 'apple gothic', fontSize: '1.1rem' }}>
                    {site}
                  </Typography>
                </Box>
                
                {/* 아이디/이메일 */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'apple gothic' }}>
                    아이디/이메일
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary', fontFamily: 'apple gothic' }}>
                    {username}
                  </Typography>
                </Box>
                
                {/* 비밀번호 */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'apple gothic' }}>
                    비밀번호
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 500, 
                        color: 'text.primary', 
                        fontFamily: 'apple gothic',
                        letterSpacing: showPw ? 'normal' : '0.1em'
                      }}
                    >
                      {showPw ? pwValue : '••••••••••'}
                    </Typography>
                    <IconButton 
                      onClick={handleTogglePasswordVisibility} 
                      size="small" 
                      sx={{ p: 0.5 }}
                    >
                      {showPw ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                    <Chip 
                      icon={<ContentCopyIcon fontSize="small" />} 
                      label="복사" 
                      size="small" 
                      onClick={handleCopy}
                      sx={{ 
                        height: 28, 
                        '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.08)' },
                        fontFamily: 'apple gothic'
                      }}
                    />
                  </Box>
                </Box>
                
                {/* 설명 */}
                {description && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'apple gothic' }}>
                      설명
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: 'text.primary', 
                        fontFamily: 'apple gothic',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {description}
                    </Typography>
                  </Box>
                )}
              </Box>
            </>
          )}
          
          {editMode && (
            <FormControl fullWidth margin="dense">
              <InputLabel id="category-select-label">카테고리</InputLabel>
              <Select
                labelId="category-select-label"
                value={category}
                onChange={e => setCategory(e.target.value)}
                disabled={!editMode || loading || loadingCategories}
                label="카테고리"
                sx={{
                  '& .MuiInputBase-root': {
                    borderRadius: 1.5
                  }
                }}
                startAdornment={
                  <InputAdornment position="start">
                    <FolderIcon color="action" fontSize="small" />
                  </InputAdornment>
                }
              >
                <MenuItem value=""><em>카테고리 없음</em></MenuItem>
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
          )}
        </Box>
        
        {confirmDelete && (
          <Alert severity="warning" sx={{ mt: 3 }}>
            <Typography fontWeight="500">정말로 삭제하시겠습니까?</Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              이 작업은 되돌릴 수 없습니다.
            </Typography>
          </Alert>
        )}
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        {editMode ? (
          <>
            <Button 
              onClick={() => setEditMode(false)} 
              disabled={loading}
              startIcon={<CancelIcon />}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              취소
            </Button>
            <Button 
              onClick={handleUpdate} 
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
          </>
        ) : confirmDelete ? (
          <>
            <Button 
              onClick={() => setConfirmDelete(false)} 
              disabled={loading}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              취소
            </Button>
            <Button 
              onClick={handleDelete} 
              color="error" 
              variant="contained" 
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
              sx={{ 
                borderRadius: 2,
                ml: 1
              }}
            >
              {loading ? '삭제 중...' : '삭제'}
            </Button>
          </>
        ) : (
          <>
            <Button 
              onClick={() => setEditMode(true)} 
              disabled={loading}
              startIcon={<EditIcon />}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              수정
            </Button>
            <Button 
              onClick={() => setConfirmDelete(true)} 
              color="error" 
              disabled={loading}
              startIcon={<DeleteIcon />}
              variant="outlined"
              sx={{ 
                borderRadius: 2,
                ml: 1
              }}
            >
              삭제
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PasswordDetailDialog;
