import { create } from 'zustand';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  timestamp: number;
}

interface NotificationStore {
  // State
  notifications: Notification[];
  maxNotifications: number;

  // Actions
  addNotification: (
    type: NotificationType,
    title: string,
    message?: string,
    duration?: number
  ) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  // Convenience methods
  success: (title: string, message?: string, duration?: number) => string;
  error: (title: string, message?: string, duration?: number) => string;
  info: (title: string, message?: string, duration?: number) => string;
  warning: (title: string, message?: string, duration?: number) => string;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  // Initial State
  notifications: [],
  maxNotifications: 5,

  // Add Notification
  addNotification: (type, title, message, duration = 5000) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const notification: Notification = {
      id,
      type,
      title,
      message,
      duration,
      timestamp: Date.now()
    };

    set((state) => {
      const newNotifications = [...state.notifications, notification];

      // Limit the number of notifications
      if (newNotifications.length > state.maxNotifications) {
        return {
          notifications: newNotifications.slice(-state.maxNotifications)
        };
      }

      return { notifications: newNotifications };
    });

    // Auto-remove after duration if specified
    if (duration && duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, duration);
    }

    return id;
  },

  // Remove Notification
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    }));
  },

  // Clear All Notifications
  clearNotifications: () => {
    set({ notifications: [] });
  },

  // Convenience Methods
  success: (title, message, duration) => {
    return get().addNotification('success', title, message, duration);
  },

  error: (title, message, duration) => {
    return get().addNotification('error', title, message, duration || 8000); // Errors stay longer
  },

  info: (title, message, duration) => {
    return get().addNotification('info', title, message, duration);
  },

  warning: (title, message, duration) => {
    return get().addNotification('warning', title, message, duration || 6000);
  }
}));

// Helper hooks
export const useNotifications = () => useNotificationStore((state) => state.notifications);
export const useNotificationActions = () => {
  const { success, error, info, warning, removeNotification, clearNotifications } =
    useNotificationStore();

  return { success, error, info, warning, removeNotification, clearNotifications };
};

// Global notification handler for API responses
export const handleApiNotification = (
  response: { success?: boolean; message?: string; error?: string },
  defaultSuccessMessage = 'Operation completed successfully',
  defaultErrorMessage = 'Operation failed'
) => {
  const { success, error } = useNotificationStore.getState();

  if (response.success) {
    success('Success', response.message || defaultSuccessMessage);
  } else if (response.error) {
    error('Error', response.error || response.message || defaultErrorMessage);
  }
};