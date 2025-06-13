import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Typography, Divider, IconButton,
  InputAdornment, CircularProgress, Alert, MenuItem, Select,
  FormControl, InputLabel
} from '@mui/material';
import { useSnackbar } from './SnackbarContext';
import type { Category, CategoryFormData } from '../types/category';
import { createCategory, updateCategory } from '../api/categoryApi';

// Material UI 아이콘
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import LabelIcon from '@mui/icons-material/Label';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import DescriptionIcon from '@mui/icons-material/Description';

// 카테고리 아이콘 유틸리티 가져오기
import { AVAILABLE_ICONS } from '../utils/categoryIcons';

// 사용 가능한 색상 목록
const AVAILABLE_COLORS = [
  { value: '#3498db', label: '파랑' },
  { value: '#2ecc71', label: '녹색' },
  { value: '#e74c3c', label: '빨강' },
  { value: '#f39c12', label: '주황' },
  { value: '#9b59b6', label: '보라' },
  { value: '#1abc9c', label: '청록' },
  { value: '#34495e', label: '남색' },
  { value: '#7f8c8d', label: '회색' },
  { value: '#f1c40f', label: '노랑' },
  { value: '#d35400', label: '갈색' }
];

interface CategoryDialogProps {
  open: boolean;
  onClose: () => void;
  category?: Category;
  onSaved: () => void;
}

const CategoryDialog: React.FC<CategoryDialogProps> = ({ open, onClose, category, onSaved }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3498db');
  const [icon, setIcon] = useState('folder');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showMessage } = useSnackbar();

  useEffect(() => {
    if (category) {
      setName(category.name);
      setColor(category.color);
      setIcon(category.icon);
      setDescription(category.description || '');
    } else {
      setName('');
      setColor('#3498db');
      setIcon('folder');
      setDescription('');
    }
    setError('');
  }, [category, open]);

  const validate = (): boolean => {
    if (!name.trim()) {
      setError('카테고리 이름은 필수 입력 항목입니다.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const categoryData: CategoryFormData = {
      name: name.trim(),
      color,
      icon,
      description: description.trim() || undefined
    };

    setLoading(true);
    try {
      if (category) {
        // 카테고리 수정
        await updateCategory(category.id, categoryData);
        showMessage('카테고리가 수정되었습니다.', 'success');
      } else {
        // 새 카테고리 생성
        await createCategory(categoryData);
        showMessage('새 카테고리가 생성되었습니다.', 'success');
      }
      onSaved();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || '서버 오류가 발생했습니다.');
      showMessage(err.response?.data?.message || '서버 오류가 발생했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setName('');
      setColor('#3498db');
      setIcon('folder');
      setDescription('');
      setError('');
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
          border: '2px solid rgba(255,255,255,0.5)', // 보더라인 더 진하게 수정
          outline: '1px solid rgba(255,255,255,0.2)', // 추가 아웃라인으로 보더 강조
          outlineOffset: '-3px' // 아웃라인 위치 조정
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
          {category ? '카테고리 수정' : '새 카테고리 생성'}
        </Typography>
        <IconButton onClick={handleClose} disabled={loading} size="small" sx={{ color: 'rgba(255,255,255,0.7)' }}>
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
            alignItems: 'center',
            mb: 3,
            p: 2,
            borderRadius: 2,
            bgcolor: '#1e1e1e', // 다크 테마 배경색
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}>
            <Box 
              sx={{ 
                width: 50, 
                height: 50, 
                borderRadius: '50%', 
                bgcolor: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                mr: 2
              }}
            >
              {AVAILABLE_ICONS.find(i => i.value === icon)?.icon || AVAILABLE_ICONS[0].icon}
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight="500" sx={{ color: '#fff' }}>
                {name || '새 카테고리'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                {description || '카테고리 설명'}
              </Typography>
            </Box>
          </Box>
          
          <TextField
            label="카테고리 이름"
            fullWidth
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={loading}
            autoFocus
            margin="normal"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LabelIcon sx={{ color: 'rgba(255,255,255,0.7)' }} fontSize="small" />
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiInputBase-root': {
                borderRadius: 1.5
              },
              mb: 2,
              '& .MuiInputLabel-root': {
                color: 'rgba(255,255,255,0.7)'
              },
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.3)'
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255,255,255,0.5)'
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgba(255,255,255,0.7)'
                }
              }
            }}
          />
          
          <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
            <InputLabel id="color-select-label" sx={{ color: 'rgba(255,255,255,0.7)' }}>색상</InputLabel>
            <Select
              labelId="color-select-label"
              value={color}
              onChange={e => setColor(e.target.value)}
              disabled={loading}
              label="색상"
              sx={{
                '& .MuiInputBase-root': {
                  borderRadius: 1.5
                }
              }}
              startAdornment={
                <InputAdornment position="start">
                  <ColorLensIcon sx={{ color: 'rgba(255,255,255,0.7)' }} fontSize="small" />
                </InputAdornment>
              }
            >
              {AVAILABLE_COLORS.map(colorOption => (
                <MenuItem key={colorOption.value} value={colorOption.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      sx={{ 
                        width: 20, 
                        height: 20, 
                        borderRadius: '50%', 
                        bgcolor: colorOption.value,
                        mr: 1
                      }} 
                    />
                    {colorOption.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
            <InputLabel id="icon-select-label" sx={{ color: 'rgba(255,255,255,0.7)' }}>아이콘</InputLabel>
            <Select
              labelId="icon-select-label"
              value={icon}
              onChange={e => setIcon(e.target.value)}
              disabled={loading}
              label="아이콘"
              sx={{
                '& .MuiInputBase-root': {
                  borderRadius: 1.5
                }
              }}
            >
              {AVAILABLE_ICONS.map(iconOption => (
                <MenuItem key={iconOption.value} value={iconOption.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {iconOption.icon}
                    <Box sx={{ ml: 1 }}>{iconOption.label}</Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
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
              '& .MuiInputLabel-root': {
                color: 'rgba(255,255,255,0.7)'
              },
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.3)'
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255,255,255,0.5)'
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgba(255,255,255,0.7)'
                }
              }
            }}
          />
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
            startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
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
            {loading ? '저장 중...' : '저장'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CategoryDialog;
