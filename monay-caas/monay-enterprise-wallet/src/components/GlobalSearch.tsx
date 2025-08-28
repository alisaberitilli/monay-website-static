'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Fuse from 'fuse.js'
import { useRouter } from 'next/navigation'

const API_URL = 'http://localhost:3001/api'

interface SearchResult {
  id: string
  type: 'transaction' | 'invoice' | 'user' | 'token' | 'wallet' | 'rule'
  title: string
  subtitle: string
  metadata: any
  score?: number
}

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Mock data for demonstration - in production, this would come from API
  const mockData: SearchResult[] = [
    // Transactions
    { id: '1', type: 'transaction', title: 'Payment to Acme Corp', subtitle: '$125,000 • USDM • 2 hours ago', metadata: { amount: 125000, currency: 'USDM', date: '2024-01-30' } },
    { id: '2', type: 'transaction', title: 'Cross-Rail Transfer', subtitle: 'Base → Solana • $50,000 • Yesterday', metadata: { amount: 50000, from: 'Base', to: 'Solana' } },
    { id: '3', type: 'transaction', title: 'Token Mint Operation', subtitle: '100,000 USDM • Base L2 • Jan 28', metadata: { amount: 100000, operation: 'mint' } },
    
    // Invoices
    { id: '4', type: 'invoice', title: 'INV-2024-001', subtitle: 'Acme Corporation • $7,085 • Due Feb 15', metadata: { amount: 7085, status: 'sent' } },
    { id: '5', type: 'invoice', title: 'INV-2024-002', subtitle: 'CloudTech • $3,270 • Paid', metadata: { amount: 3270, status: 'paid' } },
    
    // Users
    { id: '6', type: 'user', title: 'John Smith', subtitle: 'john@acme.com • Enterprise Admin', metadata: { role: 'enterprise_admin' } },
    { id: '7', type: 'user', title: 'Sarah Johnson', subtitle: 'sarah@cloudtech.com • Verified', metadata: { role: 'verified_consumer' } },
    
    // Tokens
    { id: '8', type: 'token', title: 'USDM Token', subtitle: 'Base L2 • ERC-3643 • $10M Supply', metadata: { chain: 'Base', supply: 10000000 } },
    { id: '9', type: 'token', title: 'USDM-SOL', subtitle: 'Solana • Token-2022 • $5M Supply', metadata: { chain: 'Solana', supply: 5000000 } },
    
    // Wallets
    { id: '10', type: 'wallet', title: 'Treasury Wallet', subtitle: '0x1234...abcd • $1.25M Balance', metadata: { address: '0x1234...abcd', balance: 1250000 } },
    { id: '11', type: 'wallet', title: 'Operations Wallet', subtitle: '0x5678...efgh • $500K Balance', metadata: { address: '0x5678...efgh', balance: 500000 } },
    
    // Rules
    { id: '12', type: 'rule', title: 'Daily Transaction Limit', subtitle: 'Active • Enterprise • $10M limit', metadata: { status: 'active', limit: 10000000 } },
    { id: '13', type: 'rule', title: 'KYC Verification Required', subtitle: 'Active • Compliance • >$10K', metadata: { status: 'active', threshold: 10000 } }
  ]

  // Fuse.js configuration for fuzzy search
  const fuseOptions = {
    keys: ['title', 'subtitle', 'metadata.amount', 'metadata.currency'],
    threshold: 0.3,
    includeScore: true
  }

  const fuse = new Fuse(mockData, fuseOptions)

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
        setTimeout(() => inputRef.current?.focus(), 100)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  const performSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    
    // Simulate API delay
    setTimeout(() => {
      const searchResults = fuse.search(searchQuery).map(result => ({
        ...result.item,
        score: result.score
      }))
      
      setResults(searchResults.slice(0, 10)) // Limit to 10 results
      setLoading(false)
    }, 300)
  }, [])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [query, performSearch])

  const handleResultClick = (result: SearchResult) => {
    // Save to recent searches
    const newRecent = [result.title, ...recentSearches.filter(s => s !== result.title)].slice(0, 5)
    setRecentSearches(newRecent)
    localStorage.setItem('recentSearches', JSON.stringify(newRecent))

    // Navigate based on type
    switch (result.type) {
      case 'transaction':
        router.push(`/transactions/${result.id}`)
        break
      case 'invoice':
        router.push(`/invoices/${result.id}`)
        break
      case 'user':
        router.push(`/users/${result.id}`)
        break
      case 'token':
        router.push(`/tokens/${result.id}`)
        break
      case 'wallet':
        router.push(`/wallets/${result.id}`)
        break
      case 'rule':
        router.push(`/rules/${result.id}`)
        break
    }

    setIsOpen(false)
    setQuery('')
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'transaction': return '💳'
      case 'invoice': return '📄'
      case 'user': return '👤'
      case 'token': return '🪙'
      case 'wallet': return '👛'
      case 'rule': return '⚡'
      default: return '📍'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'transaction': return 'bg-blue-100 text-blue-700'
      case 'invoice': return 'bg-green-100 text-green-700'
      case 'user': return 'bg-purple-100 text-purple-700'
      case 'token': return 'bg-yellow-100 text-yellow-700'
      case 'wallet': return 'bg-indigo-100 text-indigo-700'
      case 'rule': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-lg hover:bg-white transition-all group"
      >
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="text-sm text-gray-600">Search everything...</span>
        <kbd className="px-2 py-0.5 text-xs bg-gray-100 rounded border border-gray-300 font-mono">⌘K</kbd>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
          <div ref={searchRef} className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
            {/* Search Input */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search transactions, invoices, users, tokens, wallets, rules..."
                  className="flex-1 text-lg outline-none placeholder-gray-400"
                  autoFocus
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Search Filters */}
            <div className="px-4 py-2 border-b border-gray-100 flex gap-2">
              <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">All</button>
              <button className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200">Transactions</button>
              <button className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200">Invoices</button>
              <button className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200">Users</button>
              <button className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200">Tokens</button>
            </div>

            {/* Search Results */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-sm text-gray-500">Searching...</p>
                </div>
              ) : query && results.length > 0 ? (
                <div className="py-2">
                  {results.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full px-4 py-3 hover:bg-gray-50 flex items-start gap-3 transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                        <span className="text-lg">{getTypeIcon(result.type)}</span>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{result.title}</p>
                          {result.score && result.score < 0.2 && (
                            <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">Best Match</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{result.subtitle}</p>
                      </div>
                      <svg className="w-4 h-4 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              ) : query ? (
                <div className="p-8 text-center">
                  <svg className="w-12 h-12 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-2 text-gray-500">No results found for "{query}"</p>
                  <p className="mt-1 text-sm text-gray-400">Try searching with different keywords</p>
                </div>
              ) : (
                <div className="p-4">
                  {recentSearches.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Recent Searches</p>
                      <div className="space-y-1">
                        {recentSearches.map((search, index) => (
                          <button
                            key={index}
                            onClick={() => setQuery(search)}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2"
                          >
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Quick Actions</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                        <p className="font-medium text-sm">View All Transactions</p>
                        <p className="text-xs text-gray-500">Browse recent activity</p>
                      </button>
                      <button className="p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                        <p className="font-medium text-sm">Pending Invoices</p>
                        <p className="text-xs text-gray-500">5 awaiting payment</p>
                      </button>
                      <button className="p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                        <p className="font-medium text-sm">Active Rules</p>
                        <p className="text-xs text-gray-500">47 rules enabled</p>
                      </button>
                      <button className="p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                        <p className="font-medium text-sm">Token Analytics</p>
                        <p className="text-xs text-gray-500">Performance metrics</p>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Search Tips */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="flex gap-4 text-xs text-gray-500">
                <span><kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300">↑↓</kbd> Navigate</span>
                <span><kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300">Enter</kbd> Select</span>
                <span><kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300">Esc</kbd> Close</span>
              </div>
              <div className="text-xs text-gray-500">
                Powered by AI Search
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}