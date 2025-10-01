import { Subject } from 'rxjs';

export interface ModalData {
  id: string;
  title: string;
  content?: React.ReactNode;
  actions?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  closable?: boolean;
}

export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

class SubjectManager {
  private modalSubject = new Subject<{ action: 'open' | 'close'; data?: ModalData }>();
  private notificationSubject = new Subject<{ action: 'show' | 'hide'; data?: NotificationData }>();
  private navigationSubject = new Subject<{ action: 'navigate'; data: { view: string; params?: Record<string, unknown> } }>();

  // Modal management
  openModal(modalData: ModalData) {
    this.modalSubject.next({ action: 'open', data: modalData });
  }

  closeModal(modalId?: string) {
    this.modalSubject.next({ action: 'close', data: modalId ? { id: modalId } as ModalData : undefined });
  }

  getModalObservable() {
    return this.modalSubject.asObservable();
  }

  // Notification management
  showNotification(notificationData: NotificationData) {
    this.notificationSubject.next({ action: 'show', data: notificationData });
  }

  hideNotification(notificationId?: string) {
    this.notificationSubject.next({ 
      action: 'hide', 
      data: notificationId ? { id: notificationId } as NotificationData : undefined 
    });
  }

  getNotificationObservable() {
    return this.notificationSubject.asObservable();
  }

  // Navigation management
  navigate(view: string, params?: Record<string, unknown>) {
    this.navigationSubject.next({ action: 'navigate', data: { view, params } });
  }

  getNavigationObservable() {
    return this.navigationSubject.asObservable();
  }

  // Utility methods
  showSuccess(title: string, message: string) {
    this.showNotification({
      id: Date.now().toString(),
      type: 'success',
      title,
      message,
      duration: 3000,
    });
  }

  showError(title: string, message: string) {
    this.showNotification({
      id: Date.now().toString(),
      type: 'error',
      title,
      message,
      duration: 5000,
    });
  }

  showWarning(title: string, message: string) {
    this.showNotification({
      id: Date.now().toString(),
      type: 'warning',
      title,
      message,
      duration: 4000,
    });
  }

  showInfo(title: string, message: string) {
    this.showNotification({
      id: Date.now().toString(),
      type: 'info',
      title,
      message,
      duration: 3000,
    });
  }
}

export const subjectManager = new SubjectManager();