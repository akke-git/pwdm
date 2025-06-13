import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from './SnackbarContext';

interface ShowPasswordDialogProps {
  open: boolean;
  onClose: () => void;
  passwordValue: string;
  title?: string; // Optional title for context, e.g., site name
}

const ShowPasswordDialog: React.FC<ShowPasswordDialogProps> = ({ open, onClose, passwordValue, title }) => {
  const { showMessage } = useSnackbar();

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(passwordValue)
      .then(() => {
        showMessage('Password copied to clipboard!', 'success');
      })
      .catch(err => {
        showMessage('Failed to copy password.', 'error');
        console.error('Failed to copy password: ', err);
      });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{
      sx: {
        borderRadius: 2,
        backgroundColor: 'background.paper', // Ensure dialog background fits theme
      }
    }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, pt: 1.5, fontFamily: 'apple gothic' }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: 'text.primary', fontFamily: 'apple gothic' }}>
          {title || 'View Password'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 2, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1, backgroundColor: 'action.hover' }}>
          <Typography 
            variant="body1" 
            component="span" 
            sx={{ 
              wordBreak: 'break-all', 
              mr: 1, 
              flexGrow: 1, 
              fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace', // Monospaced font for password
              fontSize: '1.1rem',
              color: 'text.primary'
            }}
          >
            {passwordValue}
          </Typography>
          <IconButton onClick={handleCopyPassword} size="small" aria-label="Copy password">
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogContent>
      <DialogActions sx={{ pr: 2, pb: 1.5, pt: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ fontFamily: 'apple gothic' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShowPasswordDialog;
