import { useEffect, useState, useCallback, useRef } from 'react';
import wsService from '@/services/websocket';

interface UseWebSocketOptions {
  autoConnect?: boolean;
  userId?: string;
  onConnected?: () => void;
  onDisconnected?: (event: any) => void;
  onError?: (error: any) => void;
  onReconnecting?: (data: { attempt: number; delay: number }) => void;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const {
    autoConnect = true,
    userId,
    onConnected,
    onDisconnected,
    onError,
    onReconnecting
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const listenersRef = useRef<Map<string, (data: any) => void>>(new Map());

  useEffect(() => {
    const handleConnected = () => {
      setIsConnected(true);
      setConnectionState('connected');
      onConnected?.();
    };

    const handleDisconnected = (event: any) => {
      setIsConnected(false);
      setConnectionState('disconnected');
      onDisconnected?.(event);
    };

    const handleError = (error: any) => {
      setConnectionState('error');
      onError?.(error);
    };

    const handleReconnecting = (data: { attempt: number; delay: number }) => {
      setConnectionState('connecting');
      onReconnecting?.(data);
    };

    // Setup WebSocket event listeners
    wsService.on('connected', handleConnected);
    wsService.on('disconnected', handleDisconnected);
    wsService.on('error', handleError);
    wsService.on('reconnecting', handleReconnecting);

    // Auto-connect if enabled
    if (autoConnect) {
      wsService.connect(userId);
    }

    // Cleanup
    return () => {
      wsService.off('connected', handleConnected);
      wsService.off('disconnected', handleDisconnected);
      wsService.off('error', handleError);
      wsService.off('reconnecting', handleReconnecting);

      // Clean up all subscriptions
      listenersRef.current.forEach((listener, eventType) => {
        wsService.off(eventType, listener);
      });
      listenersRef.current.clear();

      if (autoConnect) {
        wsService.disconnect();
      }
    };
  }, [autoConnect, userId, onConnected, onDisconnected, onError, onReconnecting]);

  const connect = useCallback(() => {
    wsService.connect(userId);
  }, [userId]);

  const disconnect = useCallback(() => {
    wsService.disconnect();
  }, []);

  const send = useCallback((type: string, data: any) => {
    wsService.send(type, data);
  }, []);

  const subscribe = useCallback((eventType: string, callback: (data: any) => void) => {
    // Store reference to listener for cleanup
    listenersRef.current.set(eventType, callback);
    wsService.subscribe(eventType, callback);

    // Return unsubscribe function
    return () => {
      wsService.unsubscribe(eventType, callback);
      listenersRef.current.delete(eventType);
    };
  }, []);

  const unsubscribe = useCallback((eventType: string) => {
    const listener = listenersRef.current.get(eventType);
    if (listener) {
      wsService.unsubscribe(eventType, listener);
      listenersRef.current.delete(eventType);
    }
  }, []);

  return {
    isConnected,
    connectionState,
    connect,
    disconnect,
    send,
    subscribe,
    unsubscribe
  };
};

// Specific hooks for different data types
export const useTransactionUpdates = (callback: (data: any) => void) => {
  const { subscribe } = useWebSocket();

  useEffect(() => {
    const unsubscribe = subscribe('transaction', callback);
    return unsubscribe;
  }, [subscribe, callback]);
};

export const useWalletUpdates = (callback: (data: any) => void) => {
  const { subscribe } = useWebSocket();

  useEffect(() => {
    const unsubscribe = subscribe('wallet_update', callback);
    return unsubscribe;
  }, [subscribe, callback]);
};

export const useComplianceAlerts = (callback: (data: any) => void) => {
  const { subscribe } = useWebSocket();

  useEffect(() => {
    const unsubscribe = subscribe('compliance_alert', callback);
    return unsubscribe;
  }, [subscribe, callback]);
};

export const useMarketData = (callback: (data: any) => void) => {
  const { subscribe } = useWebSocket();

  useEffect(() => {
    const unsubscribe = subscribe('market_data', callback);
    return unsubscribe;
  }, [subscribe, callback]);
};

export const useEmergencyAlerts = (callback: (data: any) => void) => {
  const { subscribe } = useWebSocket();

  useEffect(() => {
    const unsubscribe = subscribe('emergency_disbursement', callback);
    return unsubscribe;
  }, [subscribe, callback]);
};

export const useNotifications = (callback: (data: any) => void) => {
  const { subscribe } = useWebSocket();

  useEffect(() => {
    const unsubscribe = subscribe('notification', callback);
    return unsubscribe;
  }, [subscribe, callback]);
};