import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Container, 
  Alert, 
  CircularProgress, 
  List, 
  ListItem, 
  ListItemText 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

// 파일 업로드 영역 스타일
const UploadBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  border: '2px dashed #ccc',
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  transition: 'border .3s ease-in-out',
  '&:hover': {
    border: '2px dashed #2196f3',
  },
  marginBottom: theme.spacing(3)
}));

// 숨겨진 파일 입력 스타일
const HiddenInput = styled('input')({
  display: 'none',
});

const PasswordImportPage: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    total: number;
    imported: number;
    errors: number;
  } | null>(null);

  // 파일 선택 핸들러
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    
    // 파일 유효성 검사
    if (!selectedFile) {
      return;
    }
    
    // CSV 파일만 허용
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setError('CSV 파일만 업로드할 수 있습니다.');
      return;
    }
    
    setFile(selectedFile);
    setError(null);
  };

  // 파일 업로드 핸들러
  const handleUpload = async () => {
    if (!file) {
      setError('업로드할 파일을 선택해주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/passwords/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess({
        total: response.data.results.total,
        imported: response.data.results.imported,
        errors: response.data.results.errors
      });
      
      // 파일 선택 초기화
      setFile(null);
      if (document.getElementById('file-input') as HTMLInputElement) {
        (document.getElementById('file-input') as HTMLInputElement).value = '';
      }
      
    } catch (err: any) {
      console.error('비밀번호 가져오기 오류:', err);
      setError(err.response?.data?.message || '파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 파일 드래그 앤 드롭 핸들러
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const droppedFile = event.dataTransfer.files?.[0];
    if (!droppedFile) return;
    
    if (!droppedFile.name.toLowerCase().endsWith('.csv')) {
      setError('CSV 파일만 업로드할 수 있습니다.');
      return;
    }
    
    setFile(droppedFile);
    setError(null);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/settings')}
          sx={{ mr: 2 }}
        >
          뒤로
        </Button>
        <Typography variant="h4" component="h1" fontFamily="Apple Gothic, sans-serif">
          비밀번호 가져오기
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" paragraph fontFamily="Apple Gothic, sans-serif">
          CSV 파일에서 비밀번호를 가져옵니다. 파일은 다음 열을 포함해야 합니다:
        </Typography>
        
        <List dense>
          <ListItem>
            <ListItemText primary="name: 사이트명 (필수)" />
          </ListItem>
          <ListItem>
            <ListItemText primary="site url: 사이트 URL" />
          </ListItem>
          <ListItem>
            <ListItemText primary="id: 사용자 아이디" />
          </ListItem>
          <ListItem>
            <ListItemText primary="password: 비밀번호" />
          </ListItem>
          <ListItem>
            <ListItemText primary="category: 카테고리" />
          </ListItem>
          <ListItem>
            <ListItemText primary="memo: 메모" />
          </ListItem>
        </List>
        
        <Typography variant="body2" color="text.secondary" fontFamily="Apple Gothic, sans-serif">
          * 동일한 사이트명이 이미 존재하는 경우, 자동으로 번호가 추가됩니다 (예: "사이트명 2").
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography fontFamily="Apple Gothic, sans-serif">
            비밀번호 가져오기가 완료되었습니다.
          </Typography>
          <Box mt={1}>
            <Typography variant="body2" fontFamily="Apple Gothic, sans-serif">
              총 항목: {success.total}개
            </Typography>
            <Typography variant="body2" fontFamily="Apple Gothic, sans-serif">
              가져온 항목: {success.imported}개
            </Typography>
            {success.errors > 0 && (
              <Typography variant="body2" fontFamily="Apple Gothic, sans-serif">
                오류 항목: {success.errors}개
              </Typography>
            )}
          </Box>
        </Alert>
      )}

      <UploadBox 
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" fontFamily="Apple Gothic, sans-serif">
          CSV 파일을 드래그하거나 클릭하여 업로드
        </Typography>
        {file && (
          <Box mt={2} display="flex" alignItems="center">
            <CheckCircleIcon color="success" sx={{ mr: 1 }} />
            <Typography fontFamily="Apple Gothic, sans-serif">
              {file.name}
            </Typography>
          </Box>
        )}
        <HiddenInput
          id="file-input"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
        />
      </UploadBox>

      <Box display="flex" justifyContent="center">
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={!file || loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? '업로드 중...' : 'Import'}
        </Button>
      </Box>
    </Container>
  );
};

export default PasswordImportPage;
