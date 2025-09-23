import { useEffect, useRef, useState, useCallback } from 'react'
import io, { Socket } from 'socket.io-client'
import toast from 'react-hot-toast'

interface WalletCountdown {
  walletId: string
  remaining: number
  expiresAt: string
}

interface WalletStatus {
  walletId: string
  status: string
  timestamp: string
}

interface WalletDestruction {
  walletId: string
  destroyedAt: string
  message: string
}

interface WalletMetrics {
  type: 'destruction' | 'status_change' | 'creation'
  walletId: string
  timestamp: string
  status?: string
}

export function useInvoiceWalletSocket() {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [countdowns, setCountdowns] = useState<Map<string, WalletCountdown>>(new Map())
  const [activeWalletsCount, setActiveWalletsCount] = useState(0)
  const [lastMetricUpdate, setLastMetricUpdate] = useState<WalletMetrics | null>(null)

  // Initialize socket connection
  useEffect(() => {
    console.log('🔌 Initializing WebSocket connection to http://localhost:3001')

    // Connect to backend WebSocket server
    const socket = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    })

    socketRef.current = socket

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Connected to Invoice Wallet WebSocket, ID:', socket.id)
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from Invoice Wallet WebSocket')
      setIsConnected(false)
    })

    socket.on('connect_error', (error: any) => {
      console.error('❌ WebSocket connection error:', error.message, error.type)
    })

    // Countdown updates
    socket.on('countdown-update', (data: WalletCountdown) => {
      setCountdowns(prev => {
        const updated = new Map(prev)
        updated.set(data.walletId, data)
        return updated
      })
    })

    // Wallet destroyed
    socket.on('wallet-destroyed', (data: WalletDestruction) => {
      toast.error(`Wallet ${data.walletId} has been destroyed`)
      setCountdowns(prev => {
        const updated = new Map(prev)
        updated.delete(data.walletId)
        return updated
      })
    })

    // Status changes
    socket.on('status-changed', (data: WalletStatus) => {
      console.log('Wallet status changed:', data)
    })

    // Metrics updates
    socket.on('wallet-metrics-update', (data: WalletMetrics) => {
      setLastMetricUpdate(data)
    })

    // Active wallets count
    socket.on('active-wallets-count', (data: { count: number }) => {
      setActiveWalletsCount(data.count)
    })

    // New wallet created
    socket.on('wallet-created', (data: any) => {
      toast.success(`New wallet created: ${data.wallet.id}`)
      if (data.wallet.mode === 'ephemeral') {
        joinWalletRoom(data.wallet.id)
      }
    })

    // Request active wallets count on connect
    socket.emit('get-active-wallets')

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  // Join a wallet room for updates
  const joinWalletRoom = useCallback((walletId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join-wallet-room', walletId)
      console.log(`Joined wallet room: ${walletId}`)
    }
  }, [isConnected])

  // Leave a wallet room
  const leaveWalletRoom = useCallback((walletId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leave-wallet-room', walletId)
      console.log(`Left wallet room: ${walletId}`)
    }
  }, [isConnected])

  // Start countdown for ephemeral wallet
  const startCountdown = useCallback((walletId: string, expiresAt: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('start-countdown', { walletId, expiresAt })
      joinWalletRoom(walletId)
    }
  }, [isConnected, joinWalletRoom])

  // Update wallet status
  const updateWalletStatus = useCallback((walletId: string, status: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('wallet-status-update', { walletId, status })
    }
  }, [isConnected])

  // Destroy wallet
  const destroyWallet = useCallback((walletId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('destroy-wallet', walletId)
    }
  }, [isConnected])

  // Get countdown for specific wallet
  const getWalletCountdown = useCallback((walletId: string): WalletCountdown | undefined => {
    return countdowns.get(walletId)
  }, [countdowns])

  // Format countdown time
  const formatCountdown = useCallback((seconds: number): string => {
    if (seconds <= 0) return 'Expired'

    const days = Math.floor(seconds / (24 * 60 * 60))
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60))
    const minutes = Math.floor((seconds % (60 * 60)) / 60)
    const secs = seconds % 60

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }, [])

  return {
    isConnected,
    countdowns,
    activeWalletsCount,
    lastMetricUpdate,
    joinWalletRoom,
    leaveWalletRoom,
    startCountdown,
    updateWalletStatus,
    destroyWallet,
    getWalletCountdown,
    formatCountdown
  }
}

// Context provider for global socket access
import React, { createContext, useContext } from 'react'

interface InvoiceWalletSocketContextValue {
  isConnected: boolean
  countdowns: Map<string, WalletCountdown>
  activeWalletsCount: number
  lastMetricUpdate: WalletMetrics | null
  joinWalletRoom: (walletId: string) => void
  leaveWalletRoom: (walletId: string) => void
  startCountdown: (walletId: string, expiresAt: string) => void
  updateWalletStatus: (walletId: string, status: string) => void
  destroyWallet: (walletId: string) => void
  getWalletCountdown: (walletId: string) => WalletCountdown | undefined
  formatCountdown: (seconds: number) => string
}

const InvoiceWalletSocketContext = createContext<InvoiceWalletSocketContextValue | null>(null)

export function InvoiceWalletSocketProvider({ children }: { children: React.ReactNode }) {
  const socketMethods = useInvoiceWalletSocket()

  return (
    <InvoiceWalletSocketContext.Provider value={socketMethods}>
      {children}
    </InvoiceWalletSocketContext.Provider>
  )
}

export function useInvoiceWalletSocketContext() {
  const context = useContext(InvoiceWalletSocketContext)
  if (!context) {
    throw new Error('useInvoiceWalletSocketContext must be used within InvoiceWalletSocketProvider')
  }
  return context
}