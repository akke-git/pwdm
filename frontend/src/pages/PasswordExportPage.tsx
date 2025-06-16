import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Button, 
  FormControl, 
  FormControlLabel, 
  RadioGroup, 
  Radio, 
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useSnackbar } from '../components/SnackbarContext';

const PasswordExportPage: React.FC = () => {
  const [format, setFormat] = useState<string>('json');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { showMessage } = useSnackbar();
  const navigate = useNavigate();

  const handleFormatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormat(event.target.value);
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);

      // 서버에 내보내기 요청
      const response = await api.post(`/passwords/export?format=${format}`, {}, {
        responseType: 'blob', // 파일 다운로드를 위한 설정
      });

      // 파일 다운로드 처리
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // 파일명 설정
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'password-export';
      
      if (contentDisposition) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }
      
      // 확장자 추가
      filename += format === 'json' ? '.json' : '.csv';
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // 임시 요소 정리
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      showMessage('비밀번호가 성공적으로 내보내기 되었습니다.', 'success');
    } catch (err) {
      console.error('비밀번호 내보내기 오류:', err);
      setError('비밀번호 내보내기 중 오류가 발생했습니다. 다시 시도해주세요.');
      showMessage('비밀번호 내보내기에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 }, fontFamily: 'apple gothic', mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontFamily: 'apple gothic', textAlign: 'center', mb: { xs: 2, sm: 4} }}>
        비밀번호 내보내기
      </Typography>
      
      <Paper elevation={0} sx={{ 
        p: { xs: 3, sm: 4 }, 
        border: '1px solid #eee', 
        borderRadius: 2,
        mb: 4
      }}>
        <Typography variant="h6" gutterBottom sx={{ fontFamily: 'apple gothic', mb: 2 }}>
          내보내기 설정
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" gutterBottom sx={{ fontFamily: 'apple gothic', mb: 2 }}>
            모든 비밀번호 정보를 파일로 내보낼 수 있습니다. 내보낸 파일에는 복호화된 비밀번호가 포함되어 있으니 안전하게 보관하세요.
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'apple gothic', mb: 3 }}>
            내보내기 파일에는 사이트명, URL, 아이디, 비밀번호, 메모 정보가 포함됩니다.
          </Typography>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontFamily: 'apple gothic', mb: 2 }}>
            파일 형식 선택
          </Typography>
          
          <FormControl component="fieldset">
            <RadioGroup
              aria-label="format"
              name="format"
              value={format}
              onChange={handleFormatChange}
            >
              <FormControlLabel 
                value="json" 
                control={<Radio />} 
                label={
                  <Typography sx={{ fontFamily: 'apple gothic' }}>
                    JSON 형식 (모든 정보 포함)
                  </Typography>
                } 
              />
              <FormControlLabel 
                value="csv" 
                control={<Radio />} 
                label={
                  <Typography sx={{ fontFamily: 'apple gothic' }}>
                    CSV 형식 (Excel, 스프레드시트 호환)
                  </Typography>
                } 
              />
            </RadioGroup>
          </FormControl>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/settings')}
            disabled={loading}
          >
            Back
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <FileDownloadIcon />}
            onClick={handleExport}
            disabled={loading}
          >
            Export
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default PasswordExportPage;
