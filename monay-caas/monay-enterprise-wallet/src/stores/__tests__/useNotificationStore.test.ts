import { act, renderHook } from '@testing-library/react';
import { useNotificationStore } from '../useNotificationStore';

describe('useNotificationStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useNotificationStore.setState({
      notifications: [],
      maxNotifications: 5,
    });
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('addNotification', () => {
    it('should add a notification', () => {
      const { result } = renderHook(() => useNotificationStore());

      act(() => {
        result.current.addNotification('success', 'Test Title', 'Test Message', 5000);
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0]).toMatchObject({
        type: 'success',
        title: 'Test Title',
        message: 'Test Message',
        duration: 5000,
      });
      expect(result.current.notifications[0].id).toBeDefined();
      expect(result.current.notifications[0].timestamp).toBeDefined();
    });

    it('should limit notifications to maxNotifications', () => {
      const { result } = renderHook(() => useNotificationStore());

      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.addNotification('info', `Notification ${i}`);
        }
      });

      expect(result.current.notifications).toHaveLength(5);
      expect(result.current.notifications[0].title).toBe('Notification 5');
      expect(result.current.notifications[4].title).toBe('Notification 9');
    });

    it('should auto-remove notification after duration', () => {
      const { result } = renderHook(() => useNotificationStore());

      act(() => {
        result.current.addNotification('info', 'Auto Remove', undefined, 1000);
      });

      expect(result.current.notifications).toHaveLength(1);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.notifications).toHaveLength(0);
    });

    it('should not auto-remove if duration is 0', () => {
      const { result } = renderHook(() => useNotificationStore());

      act(() => {
        result.current.addNotification('info', 'Persistent', undefined, 0);
      });

      expect(result.current.notifications).toHaveLength(1);

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(result.current.notifications).toHaveLength(1);
    });
  });

  describe('removeNotification', () => {
    it('should remove a specific notification', () => {
      const { result } = renderHook(() => useNotificationStore());
      let notificationId: string;

      act(() => {
        notificationId = result.current.addNotification('info', 'Test 1');
        result.current.addNotification('info', 'Test 2');
      });

      expect(result.current.notifications).toHaveLength(2);

      act(() => {
        result.current.removeNotification(notificationId);
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].title).toBe('Test 2');
    });

    it('should handle removing non-existent notification', () => {
      const { result } = renderHook(() => useNotificationStore());

      act(() => {
        result.current.addNotification('info', 'Test');
      });

      expect(result.current.notifications).toHaveLength(1);

      act(() => {
        result.current.removeNotification('non-existent-id');
      });

      expect(result.current.notifications).toHaveLength(1);
    });
  });

  describe('clearNotifications', () => {
    it('should clear all notifications', () => {
      const { result } = renderHook(() => useNotificationStore());

      act(() => {
        result.current.addNotification('info', 'Test 1');
        result.current.addNotification('success', 'Test 2');
        result.current.addNotification('error', 'Test 3');
      });

      expect(result.current.notifications).toHaveLength(3);

      act(() => {
        result.current.clearNotifications();
      });

      expect(result.current.notifications).toHaveLength(0);
    });
  });

  describe('convenience methods', () => {
    it('should add success notification', () => {
      const { result } = renderHook(() => useNotificationStore());

      act(() => {
        result.current.success('Success Title', 'Success Message');
      });

      expect(result.current.notifications[0]).toMatchObject({
        type: 'success',
        title: 'Success Title',
        message: 'Success Message',
      });
    });

    it('should add error notification with longer duration', () => {
      const { result } = renderHook(() => useNotificationStore());

      act(() => {
        result.current.error('Error Title', 'Error Message');
      });

      expect(result.current.notifications[0]).toMatchObject({
        type: 'error',
        title: 'Error Title',
        message: 'Error Message',
        duration: 8000, // Errors stay longer
      });
    });

    it('should add info notification', () => {
      const { result } = renderHook(() => useNotificationStore());

      act(() => {
        result.current.info('Info Title', 'Info Message');
      });

      expect(result.current.notifications[0]).toMatchObject({
        type: 'info',
        title: 'Info Title',
        message: 'Info Message',
      });
    });

    it('should add warning notification with medium duration', () => {
      const { result } = renderHook(() => useNotificationStore());

      act(() => {
        result.current.warning('Warning Title', 'Warning Message');
      });

      expect(result.current.notifications[0]).toMatchObject({
        type: 'warning',
        title: 'Warning Title',
        message: 'Warning Message',
        duration: 6000,
      });
    });
  });

  describe('helper hooks', () => {
    it('useNotifications should return notifications', () => {
      const { result: storeResult } = renderHook(() => useNotificationStore());
      const { result: notificationsResult } = renderHook(() =>
        useNotificationStore((state) => state.notifications)
      );

      act(() => {
        storeResult.current.addNotification('info', 'Test');
      });

      expect(notificationsResult.current).toHaveLength(1);
      expect(notificationsResult.current[0].title).toBe('Test');
    });
  });

  describe('handleApiNotification', () => {
    it('should show success notification for successful response', () => {
      const { result } = renderHook(() => useNotificationStore());
      const { handleApiNotification } = require('../useNotificationStore');

      act(() => {
        handleApiNotification({
          success: true,
          message: 'Custom success message',
        });
      });

      expect(result.current.notifications[0]).toMatchObject({
        type: 'success',
        title: 'Success',
        message: 'Custom success message',
      });
    });

    it('should show error notification for error response', () => {
      const { result } = renderHook(() => useNotificationStore());
      const { handleApiNotification } = require('../useNotificationStore');

      act(() => {
        handleApiNotification({
          success: false,
          error: 'Custom error message',
        });
      });

      expect(result.current.notifications[0]).toMatchObject({
        type: 'error',
        title: 'Error',
        message: 'Custom error message',
      });
    });

    it('should use default messages when not provided', () => {
      const { result } = renderHook(() => useNotificationStore());
      const { handleApiNotification } = require('../useNotificationStore');

      act(() => {
        handleApiNotification(
          { success: true },
          'Default success',
          'Default error'
        );
      });

      expect(result.current.notifications[0].message).toBe('Default success');
    });
  });
});