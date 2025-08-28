'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  X, Download, ExternalLink, RefreshCcw, AlertCircle, 
  CheckCircle, Clock, XCircle, Copy, Share2, FileText,
  ArrowUpRight, ArrowDownRight, ArrowRightLeft, Coins,
  Flame, Plus, Minus
} from 'lucide-react'
import { Transaction } from '@/lib/mock-data/transactions'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface TransactionDetailModalProps {
  transaction: Transaction
  isOpen: boolean
  onClose: () => void
}

export default function TransactionDetailModal({ transaction, isOpen, onClose }: TransactionDetailModalProps) {
  const [isRefunding, setIsRefunding] = useState(false)
  
  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'reversed':
        return <RefreshCcw className="h-5 w-5 text-orange-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getTypeIcon = () => {
    switch (transaction.type) {
      case 'payment':
        return <ArrowUpRight className="h-5 w-5" />
      case 'transfer':
        return <ArrowRightLeft className="h-5 w-5" />
      case 'deposit':
        return <ArrowDownRight className="h-5 w-5" />
      case 'withdrawal':
        return <ArrowUpRight className="h-5 w-5" />
      case 'swap':
        return <RefreshCcw className="h-5 w-5" />
      case 'mint':
        return <Plus className="h-5 w-5" />
      case 'burn':
        return <Flame className="h-5 w-5" />
      default:
        return <Coins className="h-5 w-5" />
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const handleRefund = async () => {
    setIsRefunding(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    toast.success('Refund initiated successfully')
    setIsRefunding(false)
  }

  const handleDownloadReceipt = () => {
    toast.success('Receipt downloaded')
  }

  const openExplorer = () => {
    const explorerUrl = transaction.network === 'solana' 
      ? `https://explorer.solana.com/tx/${transaction.hash}`
      : `https://basescan.org/tx/${transaction.hash}`
    window.open(explorerUrl, '_blank')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Transaction Details
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {transaction.id}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-xl"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <div className={`
                  px-4 py-2 rounded-xl flex items-center gap-2 font-medium
                  ${transaction.status === 'completed' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                    transaction.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' :
                    transaction.status === 'failed' ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' :
                    'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'}
                `}>
                  {getStatusIcon()}
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </div>
                <div className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center gap-2">
                  {getTypeIcon()}
                  <span className="font-medium capitalize">{transaction.type}</span>
                </div>
              </div>

              {/* Amount Section */}
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Amount</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-xl text-gray-600 dark:text-gray-400">
                    {transaction.currency}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Network Fee: ${transaction.fee.toFixed(2)} {transaction.currency}
                </p>
              </Card>

              {/* Transaction Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">From</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
                        {transaction.from.length > 20 
                          ? `${transaction.from.slice(0, 8)}...${transaction.from.slice(-8)}`
                          : transaction.from}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(transaction.from)}
                        className="h-8 w-8"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">To</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
                        {transaction.to.length > 20 
                          ? `${transaction.to.slice(0, 8)}...${transaction.to.slice(-8)}`
                          : transaction.to}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(transaction.to)}
                        className="h-8 w-8"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Network</p>
                    <p className="capitalize bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg inline-block">
                      {transaction.network}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Timestamp</p>
                    <p className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg inline-block">
                      {new Date(transaction.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                {transaction.hash && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Transaction Hash</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg flex-1">
                        {transaction.hash}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(transaction.hash!)}
                        className="h-8 w-8"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={openExplorer}
                        className="h-8 w-8"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Description</p>
                  <p className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
                    {transaction.description}
                  </p>
                </div>

                {transaction.metadata && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Additional Information</p>
                    <div className="space-y-2">
                      {transaction.metadata.invoiceId && (
                        <div className="flex justify-between bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Invoice ID</span>
                          <span className="font-mono text-sm">{transaction.metadata.invoiceId}</span>
                        </div>
                      )}
                      {transaction.metadata.blockNumber && (
                        <div className="flex justify-between bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Block Number</span>
                          <span className="font-mono text-sm">{transaction.metadata.blockNumber}</span>
                        </div>
                      )}
                      {transaction.metadata.gasUsed && (
                        <div className="flex justify-between bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Gas Used</span>
                          <span className="font-mono text-sm">{transaction.metadata.gasUsed}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={handleDownloadReceipt}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Receipt
                </Button>
                
                {transaction.status === 'completed' && transaction.type === 'payment' && (
                  <Button
                    onClick={handleRefund}
                    variant="outline"
                    className="flex-1"
                    disabled={isRefunding}
                  >
                    <RefreshCcw className={`h-4 w-4 mr-2 ${isRefunding ? 'animate-spin' : ''}`} />
                    {isRefunding ? 'Processing...' : 'Initiate Refund'}
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => toast.success('Shared transaction details')}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}