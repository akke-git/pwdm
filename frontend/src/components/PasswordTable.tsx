import React, { useEffect, useState } from 'react';
import './PasswordTableStyles.css';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Typography, 
  Box,
  Chip,
  Skeleton,
  Alert,
  IconButton,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
  TablePagination,
  Link,
  Paper,
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField, 
  InputAdornment
} from '@mui/material';
import api from '../api/axios';
import LinkIcon from '@mui/icons-material/Link';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import MoreVertIcon from '@mui/icons-material/MoreVert';

// 카테고리 아이콘 유틸리티 가져오기
import { getCategoryIcon } from '../utils/categoryIcons';
import { getAllCategories } from '../api/categoryApi';
import type { Category } from '../types/category';

import PasswordDetailDialog from './PasswordDetailDialog';
import ShowPasswordDialog from './ShowPasswordDialog';

interface PasswordItem {
  id: number;
  title: string;
  url?: string;
  username: string;
  password: string;
  notes?: string;
  site?: string;
  description?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

interface PasswordTableProps {
  refreshKey?: number;
  onRefreshProp?: () => void; // props 이름을 onRefreshProp으로 변경하여 내부 onRefresh와 충돌 방지
  initialCategoryFilter?: string;
}

const PasswordTable: React.FC<PasswordTableProps> = ({ refreshKey, onRefreshProp, initialCategoryFilter }) => {
  const [passwords, setPasswords] = useState<PasswordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); // setError 사용 예정
  const [detailOpen, setDetailOpen] = useState(false);
  const [passwordDetail, setPasswordDetail] = useState<PasswordItem | null>(null);
  const [categoryIconMap, setCategoryIconMap] = useState<{[key: string]: string}>({});
  const [categoryColorMap, setCategoryColorMap] = useState<{[key: string]: string}>({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 비밀번호 표시 다이얼로그 상태
  const [showPasswordDialogOpen, setShowPasswordDialogOpen] = useState(false);
  const [currentPasswordForDialog, setCurrentPasswordForDialog] = useState('');
  const [currentPasswordTitleForDialog, setCurrentPasswordTitleForDialog] = useState('');

  // States for filtering and search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [categories, setCategories] = useState<string[]>(['All']);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 내부 onRefresh 함수 (PasswordDetailDialog에서 호출될 수 있음)
  const onRefresh = () => {
    fetchPasswords(); // 비밀번호 목록을 다시 불러옴
    if (onRefreshProp) {
      onRefreshProp(); // 부모 컴포넌트의 onRefresh 함수 호출
    }
  };
  
  const fetchPasswords = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/passwords?decrypt=true');
      // 서버 응답 구조: { success: boolean, count: number, data: PasswordItem[] }
      const responseData = response.data;
      
      if (!responseData || !responseData.data || !Array.isArray(responseData.data)) {
        throw new Error('비밀번호 데이터 형식이 올바르지 않습니다.');
      }
      
      const fetchedPasswords = responseData.data;
      setPasswords(fetchedPasswords);

      // 카테고리 필터링 및 중복 제거
      const uniqueCategories: string[] = Array.from(
        new Set(fetchedPasswords
          .map((p: PasswordItem) => p.category)
          .filter((value: string | undefined): value is string => Boolean(value)))
      );
      setCategories(['All', ...uniqueCategories]);

      if (initialCategoryFilter && ['All', ...uniqueCategories].includes(initialCategoryFilter as string)) {
        setSelectedCategory(initialCategoryFilter as string);
      } else {
        setSelectedCategory('All');
      }

    } catch (err) {
      console.error('Failed to fetch passwords:', err);
      setError('비밀번호를 가져오는 데 실패했습니다. 나중에 다시 시도해주세요.');
      setPasswords([]); // 에러 시 빈 배열로 초기화(렌더링 에러 방지)
    } finally {
      setLoading(false);
    }
  };

  // 카테고리 정보 가져오기
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getAllCategories();
        const iconMap: {[key: string]: string} = {};
        const colorMap: {[key: string]: string} = {};
        categoriesData.forEach((cat: Category) => {
          iconMap[cat.name] = cat.icon;
          colorMap[cat.name] = cat.color;
        });
        setCategoryIconMap(iconMap);
        setCategoryColorMap(colorMap);
      } catch (err: any) {
        console.error('카테고리 정보를 가져오는 중 오류가 발생했습니다:', err);
        // 카테고리 로딩 실패에 대한 사용자 알림은 선택 사항
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPasswords();
  }, [refreshKey, initialCategoryFilter]);

  // Pagination handlers
  const handleChangePage = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredPasswords = passwords.filter(pw => {
    const categoryMatch = selectedCategory === 'All' || pw.category === selectedCategory;
    
    // 검색어가 없으면 모든 항목 표시
    if (!searchTerm.trim()) {
      return categoryMatch;
    }
    
    const term = searchTerm.toLowerCase();
    
    // 각 필드별 검색 결과 확인 (디버깅용 로그 추가)
    const siteMatch = pw.site ? pw.site.toLowerCase().includes(term) : false;
    const titleMatch = pw.title ? pw.title.toLowerCase().includes(term) : false;
    const descMatch = pw.description ? pw.description.toLowerCase().includes(term) : false;
    const notesMatch = pw.notes ? pw.notes.toLowerCase().includes(term) : false;
    
    // 디버깅용 로그 (실제 데이터 확인)
    if (term.length > 2 && (siteMatch || titleMatch || descMatch || notesMatch)) {
      console.log('검색어:', term);
      console.log('매치된 항목:', { 
        id: pw.id, 
        title: pw.title, 
        site: pw.site,
        description: pw.description,
        siteMatch, 
        titleMatch, 
        descMatch,
        notesMatch
      });
    }
    
    // 검색 조건: site, title, description, notes 중 하나라도 일치하면 표시
    const searchMatch = siteMatch || titleMatch || descMatch || notesMatch;
    
    return categoryMatch && searchMatch;
  });

  // Pagination logic: Reset to first page when filters change
  useEffect(() => {
    setPage(0);
  }, [selectedCategory, searchTerm, passwords]);


  // 비밀번호 표시 다이얼로그 핸들러
  const handleOpenShowPasswordDialog = (passwordValue: string, title: string) => {
    setCurrentPasswordForDialog(passwordValue);
    setCurrentPasswordTitleForDialog(title);
    setShowPasswordDialogOpen(true);
  };

  const handleCloseShowPasswordDialog = () => {
    setShowPasswordDialogOpen(false);
    setCurrentPasswordForDialog('');
    setCurrentPasswordTitleForDialog('');
  };

  if (error && !loading) { // 로딩 중이 아닐 때만 에러 메시지 표시
    return (
      <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ 
        mb: 2, 
        mt: 2, 
        p: 1.5, 
        borderRadius: 2,
        backgroundColor: '#000000 !important',
        background: '#000000 !important',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        '& .MuiPaper-root': {
          backgroundColor: '#000000 !important'
        }
      }}>
        <Grid container spacing={1} alignItems="center">
          {/* 카테고리 선택 - 모바일에서는 적절한 크기로 표시 */}
          <Grid sx={{ gridColumn: { xs: 'span 6', sm: 'span 4', md: 'span 3' } }}>
            <FormControl 
              fullWidth 
              variant="outlined" 
              size="small"
              sx={{ minWidth: { xs: '100px', sm: '150px', md: '180px' } }}
            >
              <InputLabel id="category-select-label" sx={{ fontFamily: 'apple gothic' }}>Category</InputLabel>
              <Select
                labelId="category-select-label"
                id="category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as string)}
                label="Category"
                sx={{ 
                  fontFamily: 'apple gothic',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.15)'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#90caf9'
                  }
                }}
              >
                {categories.map(cat => (
                  <MenuItem key={cat} value={cat} sx={{ fontFamily: 'apple gothic' }}>
                    {cat === 'All' ? 'All' : cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* 검색바 - 나머지 공간 모두 차지 */}
          <Grid sx={{ gridColumn: { xs: 'span 6', sm: 'span 8', md: 'span 9' } }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by site or title"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                  </InputAdornment>
                ),
                sx: { 
                  fontFamily: 'apple gothic',
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.2)'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.4)'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#90caf9'
                  }
                }
              }}
              InputLabelProps={{
                sx: { fontFamily: 'apple gothic' }
              }}
            />
          </Grid>
        </Grid>
      </Box>
      {loading ? (
        <Box sx={{ p: { xs: 1, sm: 2 }, width: '100%' }}>
          {isMobile ? (
            [...Array(3)].map((_, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1.5, mb: 1 }} />
              </Box>
            ))
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
              <Table stickyHeader aria-label="skeleton table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: '20%' }}><Skeleton animation="wave" height={30} /></TableCell>
                    <TableCell sx={{ width: '20%' }}><Skeleton animation="wave" height={30} /></TableCell>
                    <TableCell sx={{ width: '20%' }}><Skeleton animation="wave" height={30} /></TableCell>
                    <TableCell sx={{ width: '20%' }}><Skeleton animation="wave" height={30} /></TableCell>
                    <TableCell sx={{ width: '15%' }}><Skeleton animation="wave" height={30} /></TableCell>
                    <TableCell sx={{ width: '5%' }}><Skeleton animation="wave" height={30} /></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.from(new Array(5)).map((_, index) => (
                    <TableRow key={`skeleton-row-${index}`}>
                      <TableCell><Skeleton animation="wave" /></TableCell>
                      <TableCell><Skeleton animation="wave" /></TableCell>
                      <TableCell><Skeleton animation="wave" /></TableCell>
                      <TableCell><Skeleton animation="wave" /></TableCell>
                      <TableCell><Skeleton animation="wave" /></TableCell>
                      <TableCell><Skeleton animation="wave" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      ) : filteredPasswords.length === 0 ? (
        <Box sx={{ p: { xs: 2, sm: 4 }, textAlign: 'center', width: '100%' }}>
          <InfoOutlinedIcon sx={{ fontSize: { xs: 36, sm: 48 }, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ fontFamily: 'apple gothic', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            표시할 비밀번호가 없습니다.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontFamily: 'apple gothic', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            필터 조건을 변경하거나 새 비밀번호를 추가하세요.
          </Typography>
        </Box>
      ) : isMobile ? (
        // 모바일용 카드 뷰
        <Box sx={{ 
          p: { xs: 1, sm: 1.5 }, 
          width: '100%', 
          boxSizing: 'border-box'
        }}>
          <Box sx={{ 
            display: 'grid', 
            gridGap: '0px',
            width: '100%',
            boxSizing: 'border-box',
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100],
            borderRadius: '8px'
          }}>
            {filteredPasswords.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((pw) => (
              <Card 
                key={pw.id}
                elevation={0} 
                sx={{ 
                  cursor: 'pointer',
                  width: '100%',
                  boxSizing: 'border-box',
                  backgroundColor: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  '&:last-child': { borderBottom: 'none' },
                  '&:hover': { backgroundColor: theme.palette.action.hover }
                }}
                onClick={() => { setPasswordDetail(pw); setDetailOpen(true); }}
              >
                <CardContent sx={{ p: { xs: 1.5, sm: 2 }, width: '100%', boxSizing: 'border-box' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                      {pw.category && (
                        <Chip 
                          icon={getCategoryIcon(
                            categoryIconMap[pw.category || ''], 
                            { fontSize: '0.9rem' }, 
                            categoryColorMap[pw.category || ''] || 'inherit'
                          )}
                          label={pw.category} 
                          size="small" 
                          sx={{ 
                            height: 22, 
                            fontSize: '0.7rem',
                            fontFamily: 'apple gothic',
                            mr: 1,
                            borderColor: categoryColorMap[pw.category || ''] || theme.palette.divider,
                            color: categoryColorMap[pw.category || ''] || theme.palette.text.secondary,
                            '& .MuiChip-icon': { color: categoryColorMap[pw.category || ''] || theme.palette.text.secondary },
                          }} 
                          variant="outlined" 
                        />
                      )}
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, fontFamily: 'apple gothic', fontSize: { xs: '1rem', sm: '1.1rem' }, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {pw.title}
                      </Typography>
                    </Box>
                    {pw.url && (
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          window.open(pw.url?.startsWith('http') ? pw.url : `https://${pw.url}`, '_blank');
                        }}
                        sx={{ ml: 1 }} // Ensure some space if title is long
                      >
                        <LinkIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                      <AccountCircleIcon fontSize="small" sx={{ mr: 0.8, color: theme.palette.text.secondary }} />
                      <Typography variant="body2" sx={{ fontFamily: 'apple gothic', color: theme.palette.text.secondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {pw.username || '-'}
                      </Typography>
                    </Box>
                    <Box 
                      sx={{
                        display: 'flex', 
                        alignItems: 'center', 
                        cursor: 'pointer', 
                        border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.success.dark : theme.palette.success.light}`,
                        padding: theme.spacing(0.4, 0.8),
                        borderRadius: theme.shape.borderRadius,
                        '&:hover': {
                          backgroundColor: theme.palette.action.hover
                        }
                      }}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleOpenShowPasswordDialog(pw.password, pw.title);
                      }}
                    >
                      <Typography variant="body2" sx={{ fontFamily: 'apple gothic', mr: 0.5, lineHeight: 'initial', fontSize: '0.8rem', color: theme.palette.text.secondary }}>
                        {pw.password ? `${pw.password.charAt(0)}******` : '******'}
                      </Typography>
                      <IconButton size="small" sx={{ p: 0.15 }} disableRipple>
                        <VisibilityIcon fontSize="inherit" sx={{ color: theme.palette.text.secondary }}/>
                      </IconButton>
                    </Box>
                  </Box>
                  
                  {pw.notes && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 1 }}>
                      <DescriptionIcon fontSize="small" sx={{ mr: 0.8, mt: 0.2, color: theme.palette.text.secondary }} />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontFamily: 'apple gothic',
                          color: theme.palette.text.secondary,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          lineHeight: 1.4
                        }}
                      >
                        {pw.notes}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
          {filteredPasswords.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
              component="div"
              count={filteredPasswords.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ 
                mt: 2, 
                borderTop: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
                borderRadius: '8px'
              }}
            />
          )}
        </Box>
      ) : (
        // 데스크탑용 테이블 뷰
        <>
          <TableContainer component={Paper} sx={{ boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '20%', fontFamily: 'apple gothic', fontWeight: 'bold' }}>Title</TableCell>
                  <TableCell sx={{ width: '20%', fontFamily: 'apple gothic', fontWeight: 'bold' }}>Username</TableCell>
                  <TableCell sx={{ width: '20%', fontFamily: 'apple gothic', fontWeight: 'bold' }}>Password</TableCell>
                  <TableCell sx={{ width: '20%', fontFamily: 'apple gothic', fontWeight: 'bold' }}>Site</TableCell>
                  <TableCell sx={{ width: '15%', fontFamily: 'apple gothic', fontWeight: 'bold' }}>Category</TableCell>
                  <TableCell sx={{ width: '5%', fontFamily: 'apple gothic', fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPasswords.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((pw) => (
                  <TableRow 
                    key={pw.id} 
                    hover 
                    onClick={() => { setPasswordDetail(pw); setDetailOpen(true); }}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell sx={{ fontFamily: 'apple gothic' }}>{pw.title}</TableCell>
                    <TableCell sx={{ fontFamily: 'apple gothic' }}>{pw.username}</TableCell>
                    <TableCell>
                      <Box 
                        sx={{
                          display: 'flex', 
                          alignItems: 'center', 
                          cursor: 'pointer', 
                          border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.success.dark : theme.palette.success.light}`,
                          padding: theme.spacing(0.5, 1),
                          borderRadius: theme.shape.borderRadius,
                          width: 'fit-content', 
                          '&:hover': {
                            backgroundColor: theme.palette.action.hover
                          }
                        }}
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleOpenShowPasswordDialog(pw.password, pw.title);
                        }}
                      >
                        <Typography variant="body2" sx={{ fontFamily: 'apple gothic', mr: 0.5, lineHeight: 'initial' }}>
                          {pw.password ? `${pw.password.charAt(0)}******` : '******'}
                        </Typography>
                        <IconButton size="small" sx={{ p: 0.25 }} disableRipple>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'apple gothic' }}>
                      {pw.url ? (
                        <Link href={pw.url.startsWith('http') ? pw.url : `https://${pw.url}`} target="_blank" rel="noopener noreferrer" onClick={(e: React.MouseEvent) => e.stopPropagation()} sx={{ color: theme.palette.info.main }}>
                          {pw.site || pw.url}
                        </Link>
                      ) : (
                        pw.site || '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {pw.category && (
                        <Chip 
                          icon={getCategoryIcon(
                            categoryIconMap[pw.category || ''], 
                            { fontSize: '0.9rem' }, 
                            categoryColorMap[pw.category || ''] || 'inherit'
                          )}
                          label={pw.category} 
                          size="small" 
                          sx={{ 
                            height: 24, 
                            fontSize: '0.7rem',
                            fontFamily: 'apple gothic',
                            borderColor: categoryColorMap[pw.category || ''] || theme.palette.divider,
                            color: categoryColorMap[pw.category || ''] || theme.palette.text.secondary,
                            '& .MuiChip-icon': { color: categoryColorMap[pw.category || ''] || theme.palette.text.secondary },
                          }} 
                          variant="outlined" 
                        />
                      )}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <IconButton 
                        size="small" 
                        onClick={(e: React.MouseEvent) => { 
                          e.stopPropagation(); 
                          setPasswordDetail(pw); 
                          setDetailOpen(true); 
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {filteredPasswords.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
              component="div"
              count={filteredPasswords.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ mt: 2, borderTop: `1px solid ${theme.palette.divider}` }}
            />
          )}
        </>
      )}

      {passwordDetail && (
        <PasswordDetailDialog
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          password={passwordDetail}
          onUpdated={onRefresh} // onRefresh 전달
          categoryIconMap={categoryIconMap}
          categoryColorMap={categoryColorMap}
        />
      )}
      <ShowPasswordDialog
        open={showPasswordDialogOpen}
        onClose={handleCloseShowPasswordDialog}
        passwordValue={currentPasswordForDialog}
        title={currentPasswordTitleForDialog}
      />
    </Box>
  );
};

export default PasswordTable;