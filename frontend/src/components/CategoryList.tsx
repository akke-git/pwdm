import React, { useState, useEffect } from 'react';
import {
  Box, Typography, List, ListItem, ListItemIcon, ListItemText, ListItemButton,
  IconButton, Divider, Chip, Menu, MenuItem, Tooltip, CircularProgress,
  Button, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import type { Category } from '../types/category';
import { getAllCategories, deleteCategory } from '../api/categoryApi';
import { useSnackbar } from './SnackbarContext';
import CategoryDialog from './CategoryDialog';

// Material UI 아이콘
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import CloseIcon from '@mui/icons-material/Close';

// 카테고리 아이콘 유틸리티 가져오기
import { getCategoryIcon } from '../utils/categoryIcons';

interface CategoryListProps {
  onSelectCategory?: (category: string | null) => void;
  selectedCategory?: string | null;
  open?: boolean;
  onClose?: () => void;
  onCategoryUpdated?: () => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ 
  onSelectCategory, 
  selectedCategory, 
  open = false, 
  onClose, 
  onCategoryUpdated 
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<Category | undefined>(undefined);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuCategory, setMenuCategory] = useState<Category | null>(null);
  const { showMessage } = useSnackbar();

  // 카테고리 목록 불러오기
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (err: any) {
      showMessage('카테고리를 불러오는 중 오류가 발생했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 다이얼로그 모드일 때는 열릴 때만 데이터 로드
    if (open) {
      fetchCategories();
    } 
    // 일반 컴포넌트 모드일 때는 마운트 시 데이터 로드
    else if (!onClose) {
      fetchCategories();
    }
  }, [open]);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, category: Category) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuCategory(category);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setMenuCategory(null);
  };

  const handleAddCategory = () => {
    setSelectedCategoryForEdit(undefined);
    setOpenDialog(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategoryForEdit(category);
    setOpenDialog(true);
    handleCloseMenu();
  };

  const handleDeleteCategory = async (category: Category) => {
    try {
      await deleteCategory(category.id);
      showMessage(`"${category.name}" 카테고리가 삭제되었습니다.`, 'success');
      fetchCategories();
      if (selectedCategory === category.name && onSelectCategory) {
        onSelectCategory(null);
      }
      if (onCategoryUpdated) {
        onCategoryUpdated();
      }
    } catch (err: any) {
      showMessage('카테고리 삭제 중 오류가 발생했습니다.', 'error');
    }
    handleCloseMenu();
  };

  const handleDialogSaved = () => {
    setOpenDialog(false);
    fetchCategories();
    if (onCategoryUpdated) {
      onCategoryUpdated();
    }
  };

  const handleCategoryClick = (category: string | null) => {
    if (onSelectCategory) {
      onSelectCategory(category);
    }
  };

  // 카테고리 목록 렌더링
  const renderCategoryList = () => {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6" fontWeight="600">카테고리</Typography>
          <Tooltip title="새 카테고리 추가">
            <IconButton 
              size="small" 
              onClick={handleAddCategory}
              sx={{ 
                bgcolor: 'primary.main', 
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Divider />
        
        <List sx={{ flexGrow: 1, overflow: 'auto', py: 0 }}>
          <ListItemButton 
            selected={selectedCategory === null}
            onClick={() => handleCategoryClick(null)}
            sx={{ 
              borderRadius: 0,
              '&.Mui-selected': {
                bgcolor: 'action.selected',
                '&:hover': {
                  bgcolor: 'action.selected',
                }
              }
            }}
          >
            <ListItemIcon>
              <AllInclusiveIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="모든 비밀번호" 
              primaryTypographyProps={{ fontWeight: selectedCategory === null ? 600 : 400 }}
            />
            <Chip 
              label={categories.reduce((total, cat) => total + (cat.itemCount || 0), 0)} 
              size="small" 
              color="primary" 
              variant="outlined"
              sx={{ height: 24 }}
            />
          </ListItemButton>
          
          <ListItemButton 
            selected={selectedCategory === 'favorites'}
            onClick={() => handleCategoryClick('favorites')}
            sx={{ 
              borderRadius: 0,
              '&.Mui-selected': {
                bgcolor: 'action.selected',
                '&:hover': {
                  bgcolor: 'action.selected',
                }
              }
            }}
          >
            <ListItemIcon>
              <FolderSpecialIcon sx={{ color: '#f39c12' }} />
            </ListItemIcon>
            <ListItemText 
              primary="즐겨찾기" 
              primaryTypographyProps={{ fontWeight: selectedCategory === 'favorites' ? 600 : 400 }}
            />
          </ListItemButton>
          
          <Divider sx={{ my: 1 }} />
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : categories.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary" variant="body2">
                카테고리가 없습니다.
              </Typography>
              <Button 
                startIcon={<AddIcon />} 
                onClick={handleAddCategory}
                sx={{ mt: 1 }}
                size="small"
              >
                카테고리 추가
              </Button>
            </Box>
          ) : (
            categories.map(category => (
              <ListItem 
                key={category.id}
                disablePadding
                secondaryAction={
                  <IconButton 
                    edge="end" 
                    size="small" 
                    onClick={(e) => handleOpenMenu(e, category)}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                }
                sx={{ 
                  '& .MuiListItemSecondaryAction-root': {
                    visibility: 'hidden'
                  },
                  '&:hover .MuiListItemSecondaryAction-root': {
                    visibility: 'visible'
                  }
                }}
              >
                <ListItemButton
                  selected={selectedCategory === category.name}
                  onClick={() => handleCategoryClick(category.name)}
                  sx={{ 
                    borderRadius: 0,
                    '&.Mui-selected': {
                      bgcolor: 'action.selected',
                      '&:hover': {
                        bgcolor: 'action.selected',
                      }
                    }
                  }}
                >
                  <ListItemIcon>
                    {getCategoryIcon(category.icon, { sx: { color: category.color || 'primary.main' } })}
                  </ListItemIcon>
                  <ListItemText 
                    primary={category.name} 
                    primaryTypographyProps={{ 
                      fontWeight: selectedCategory === category.name ? 600 : 400 
                    }}
                  />
                  {category.itemCount !== undefined && (
                    <Chip 
                      label={category.itemCount} 
                      size="small"
                      color={selectedCategory === category.name ? "primary" : "default"}
                      variant="outlined"
                      sx={{ height: 24 }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            ))
          )}
        </List>
      </Box>
    );
  };

  // 메뉴 렌더링
  const renderMenu = () => (
    <Menu
      anchorEl={menuAnchorEl}
      open={Boolean(menuAnchorEl)}
      onClose={handleCloseMenu}
      PaperProps={{
        sx: { 
          minWidth: 120,
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          borderRadius: 2
        }
      }}
    >
      <MenuItem 
        onClick={() => {
          if (menuCategory) {
            handleEditCategory(menuCategory);
          }
        }}
        dense
      >
        <ListItemIcon>
          <EditIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>수정</ListItemText>
      </MenuItem>
      <MenuItem 
        onClick={() => {
          if (menuCategory) {
            handleDeleteCategory(menuCategory);
          }
        }}
        dense
      >
        <ListItemIcon>
          <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
        </ListItemIcon>
        <ListItemText sx={{ color: 'error.main' }}>삭제</ListItemText>
      </MenuItem>
    </Menu>
  );

  // 다이얼로그 모드일 때의 렌더링
  if (open && onClose) {
    return (
      <>
        <Dialog
          open={open}
          onClose={onClose}
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
              카테고리 관리
            </Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          
          <Divider />
          
          <DialogContent sx={{ pt: 2 }}>
            {renderCategoryList()}
          </DialogContent>
          
          <Divider />
          
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>
              닫기
            </Button>
          </DialogActions>
        </Dialog>
        
        {renderMenu()}
        
        <CategoryDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          category={selectedCategoryForEdit}
          onSaved={handleDialogSaved}
        />
      </>
    );
  }
  
  // 일반 컴포넌트로 사용되지 않도록 변경 - 비어있는 다이얼로그만 반환
  return (
    <>
      <Dialog
        open={false}
        onClose={() => {}}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <Typography>카테고리 관리</Typography>
        </DialogContent>
      </Dialog>
      
      <CategoryDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        category={selectedCategoryForEdit}
        onSaved={handleDialogSaved}
      />
    </>
  );
};

export default CategoryList;
