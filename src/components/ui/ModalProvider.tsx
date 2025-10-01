import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { subjectManager, type ModalData } from '../../utils/SubjectManager';

const ModalProvider: React.FC = () => {
  const [openModals, setOpenModals] = useState<ModalData[]>([]);

  useEffect(() => {
    const subscription = subjectManager.getModalObservable().subscribe(({ action, data }) => {
      if (action === 'open' && data) {
        setOpenModals(prev => [...prev, data]);
      } else if (action === 'close') {
        if (data?.id) {
          setOpenModals(prev => prev.filter(modal => modal.id !== data.id));
        } else {
          // Close all modals if no specific ID provided
          setOpenModals([]);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleClose = (modalId: string) => {
    subjectManager.closeModal(modalId);
  };

  const getMaxWidth = (size?: string) => {
    switch (size) {
      case 'small': return 'sm';
      case 'large': return 'lg';
      default: return 'md';
    }
  };

  return (
    <>
      {openModals.map((modal) => (
        <Dialog
          key={modal.id}
          open={true}
          onClose={() => modal.closable !== false && handleClose(modal.id)}
          maxWidth={getMaxWidth(modal.size)}
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            }
          }}
        >
          <DialogTitle
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pb: 1,
            }}
          >
            <Box component="span" sx={{ fontWeight: 600 }}>
              {modal.title}
            </Box>
            {modal.closable !== false && (
              <IconButton
                onClick={() => handleClose(modal.id)}
                size="small"
                sx={{
                  color: 'grey.500',
                  '&:hover': {
                    backgroundColor: 'grey.100',
                  },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </DialogTitle>

          {modal.content && (
            <DialogContent dividers>
              {modal.content}
            </DialogContent>
          )}

          {modal.actions && (
            <DialogActions sx={{ px: 3, py: 2 }}>
              {modal.actions}
            </DialogActions>
          )}
        </Dialog>
      ))}
    </>
  );
};

export default ModalProvider;