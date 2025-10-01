import React, { useEffect, useState } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  Box,
} from '@mui/material';
import { subjectManager, type NotificationData } from '../../utils/SubjectManager';

const NotificationProvider: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  useEffect(() => {
    const subscription = subjectManager.getNotificationObservable().subscribe(({ action, data }) => {
      if (action === 'show' && data) {
        setNotifications(prev => [...prev, data]);

        // Auto-hide notification after duration
        if (data.duration) {
          setTimeout(() => {
            setNotifications(prev => prev.filter(notification => notification.id !== data.id));
          }, data.duration);
        }
      } else if (action === 'hide') {
        if (data?.id) {
          setNotifications(prev => prev.filter(notification => notification.id !== data.id));
        } else {
          // Hide all notifications if no specific ID provided
          setNotifications([]);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleClose = (notificationId: string) => {
    subjectManager.hideNotification(notificationId);
  };

  return (
    <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 9999 }}>
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open={true}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{
            position: 'relative',
            top: index * 80,
            right: 0,
            transform: 'none',
          }}
        >
          <Alert
            onClose={() => handleClose(notification.id)}
            severity={notification.type}
            variant="filled"
            sx={{
              minWidth: 300,
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
              '& .MuiAlert-message': {
                width: '100%',
              },
            }}
          >
            <AlertTitle sx={{ fontWeight: 600, mb: 0.5 }}>
              {notification.title}
            </AlertTitle>
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </Box>
  );
};

export default NotificationProvider;