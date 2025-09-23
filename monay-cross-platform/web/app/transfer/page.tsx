'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatCurrency, formatPhoneNumber } from '@/lib/utils'
import {
  Send,
  QrCode,
  Smartphone,
  Mail,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Users,
  ChevronRight,
  Wallet,
  Shield,
  Zap
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import apiClient from '@/lib/api-client'

interface Contact {
  id: string
  name: string
  identifier: string
  type: 'phone' | 'email' | 'username'
  avatar?: string
  isMonayUser: boolean
  lastTransaction?: Date
}

interface TransferMethod {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  fee: number
  speed: 'instant' | 'minutes' | 'days'
  limit: number
}

export default function TransferPage() {
  const router = useRouter()
  const [step, setStep] = useState<'recipient' | 'amount' | 'review' | 'processing' | 'success'>('recipient')
  const [transferMethod, setTransferMethod] = useState<'monay' | 'phone' | 'email' | 'bank'>('monay')
  const [recipient, setRecipient] = useState('')
  const [recipientDetails, setRecipientDetails] = useState<Contact | null>(null)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [schedule, setSchedule] = useState<'now' | 'later'>('now')
  const [scheduleDate, setScheduleDate] = useState('')
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [recentContacts, setRecentContacts] = useState<Contact[]>([])
  const [searchResults, setSearchResults] = useState<Contact[]>([])
  const [balance, setBalance] = useState(2543.75)
  const [isSearching, setIsSearching] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const transferMethods: TransferMethod[] = [
    {
      id: 'monay',
      name: 'Monay User',
      icon: Wallet,
      description: 'Free & Instant',
      fee: 0,
      speed: 'instant',
      limit: 50000
    },
    {
      id: 'phone',
      name: 'Phone Number',
      icon: Smartphone,
      description: 'SMS invite if not on Monay',
      fee: 0,
      speed: 'instant',
      limit: 10000
    },
    {
      id: 'email',
      name: 'Email Address',
      icon: Mail,
      description: 'Email invite if not on Monay',
      fee: 0,
      speed: 'instant',
      limit: 10000
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: Shield,
      description: '1-3 business days',
      fee: 2.50,
      speed: 'days',
      limit: 100000
    }
  ]

  useEffect(() => {
    // Load recent contacts
    fetchRecentContacts()
  }, [])

  const fetchRecentContacts = async () => {
    try {
      const response = await apiClient.getRecentContacts()
      if (response.success && response.data) {
        setRecentContacts(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch recent contacts:', error)
      // Fallback to empty array
      setRecentContacts([])
    }
  }

  const searchRecipient = async (query: string) => {
    setIsSearching(true)
    try {
      const response = await apiClient.searchUsers(query, transferMethod)
      if (response.success && response.data) {
        setSearchResults(response.data)
      }
    } catch (error) {
      console.error('Failed to search recipients:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const validateAmount = () => {
    const numAmount = parseFloat(amount)
    if (!amount || numAmount <= 0) {
      setErrors({ amount: 'Please enter a valid amount' })
      return false
    }
    if (numAmount > balance) {
      setErrors({ amount: 'Insufficient balance' })
      return false
    }
    const method = transferMethods.find(m => m.id === transferMethod)
    if (method && numAmount > method.limit) {
      setErrors({ amount: `Maximum limit is ${formatCurrency(method.limit)}` })
      return false
    }
    setErrors({})
    return true
  }

  const handleContinue = () => {
    if (step === 'recipient') {
      if (!recipient || !recipientDetails) {
        setErrors({ recipient: 'Please select a recipient' })
        return
      }
      setErrors({})
      setStep('amount')
    } else if (step === 'amount') {
      if (validateAmount()) {
        setStep('review')
      }
    } else if (step === 'review') {
      processTransfer()
    }
  }

  const processTransfer = async () => {
    setStep('processing')
    try {
      const response = await apiClient.initiateTransfer({
        recipientId: recipientDetails?.id,
        recipientIdentifier: recipientDetails?.identifier,
        amount: parseFloat(amount),
        currency: 'USD',
        note,
        transferMethod,
        schedule,
        scheduleDate
      })

      if (response.success) {
        setStep('success')
      } else {
        setErrors({ transfer: response.error || 'Transfer failed' })
        setStep('review')
      }
    } catch (error) {
      console.error('Failed to process transfer:', error)
      setErrors({ transfer: 'Network error. Please try again.' })
      setStep('review')
    }
  }

  const method = transferMethods.find(m => m.id === transferMethod)
  const transferFee = method?.fee || 0
  const totalAmount = parseFloat(amount || '0') + transferFee

  if (step === 'success') {
    return (
      <div className="container max-w-2xl mx-auto p-6">
        <Card className="text-center">
          <CardContent className="py-12">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Transfer Successful!</h2>
              <p className="text-muted-foreground">
                {formatCurrency(parseFloat(amount))} sent to {recipientDetails?.name}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="font-medium">{formatCurrency(parseFloat(amount))}</span>
                </div>
                {transferFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Fee</span>
                    <span className="font-medium">{formatCurrency(transferFee)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-sm font-medium">Total</span>
                  <span className="font-bold">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setStep('recipient')
                  setRecipient('')
                  setRecipientDetails(null)
                  setAmount('')
                  setNote('')
                }}
              >
                Send Again
              </Button>
              <Button
                className="flex-1"
                onClick={() => router.push('/dashboard')}
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 'processing') {
    return (
      <div className="container max-w-2xl mx-auto p-6">
        <Card className="text-center">
          <CardContent className="py-12">
            <div className="mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Zap className="h-12 w-12 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Processing Transfer...</h2>
              <p className="text-muted-foreground">
                This will only take a moment
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Send Money</h1>
        <p className="text-muted-foreground">Transfer funds instantly to anyone</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <div className={`flex items-center space-x-2 ${
          step === 'recipient' ? 'text-primary' : 'text-gray-400'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'recipient' ? 'bg-primary text-white' : 'bg-gray-200'
          }`}>1</div>
          <span className="font-medium">Recipient</span>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-400" />
        <div className={`flex items-center space-x-2 ${
          step === 'amount' || step === 'review' ? 'text-primary' : 'text-gray-400'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'amount' || step === 'review' ? 'bg-primary text-white' : 'bg-gray-200'
          }`}>2</div>
          <span className="font-medium">Amount</span>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-400" />
        <div className={`flex items-center space-x-2 ${
          step === 'review' ? 'text-primary' : 'text-gray-400'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'review' ? 'bg-primary text-white' : 'bg-gray-200'
          }`}>3</div>
          <span className="font-medium">Review</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {step === 'recipient' && (
            <Card>
              <CardHeader>
                <CardTitle>Select Recipient</CardTitle>
                <CardDescription>
                  Choose how you want to send money
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Transfer Method Selection */}
                <div className="grid grid-cols-2 gap-4">
                  {transferMethods.map((method) => {
                    const Icon = method.icon
                    return (
                      <button
                        key={method.id}
                        onClick={() => setTransferMethod(method.id as any)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          transferMethod === method.id
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="h-6 w-6 mb-2" />
                        <p className="font-medium">{method.name}</p>
                        <p className="text-xs text-muted-foreground">{method.description}</p>
                      </button>
                    )
                  })}
                </div>

                {/* Recipient Input */}
                <div>
                  <Label>Enter {transferMethod === 'phone' ? 'Phone Number' : transferMethod === 'email' ? 'Email' : 'Username or Phone'}</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder={
                        transferMethod === 'phone' ? '(555) 123-4567' :
                        transferMethod === 'email' ? 'user@example.com' :
                        '@username or phone'
                      }
                      value={recipient}
                      onChange={(e) => {
                        setRecipient(e.target.value)
                        if (e.target.value.length > 3) {
                          searchRecipient(e.target.value)
                        }
                      }}
                      className={errors.recipient ? 'border-red-500' : ''}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowQRScanner(true)}
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </div>
                  {errors.recipient && (
                    <p className="text-sm text-red-500 mt-1">{errors.recipient}</p>
                  )}
                </div>

                {/* Search Results */}
                {isSearching && (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Searching...</p>
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Search Results</p>
                    <div className="space-y-2">
                      {searchResults.map((contact) => (
                        <button
                          key={contact.id}
                          onClick={() => {
                            setRecipientDetails(contact)
                            setRecipient(contact.identifier)
                          }}
                          className="w-full p-3 rounded-lg border hover:bg-gray-50 text-left transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{contact.name}</p>
                              <p className="text-sm text-muted-foreground">{contact.identifier}</p>
                            </div>
                            {contact.isMonayUser && (
                              <Badge variant="success">Monay User</Badge>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Contacts */}
                {recentContacts.length > 0 && !recipient && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Recent Contacts</p>
                    <div className="space-y-2">
                      {recentContacts.map((contact) => (
                        <button
                          key={contact.id}
                          onClick={() => {
                            setRecipientDetails(contact)
                            setRecipient(contact.identifier)
                          }}
                          className="w-full p-3 rounded-lg border hover:bg-gray-50 text-left transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{contact.name}</p>
                              <p className="text-sm text-muted-foreground">{contact.identifier}</p>
                            </div>
                            <Badge>Recent</Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {step === 'amount' && (
            <Card>
              <CardHeader>
                <CardTitle>Enter Amount</CardTitle>
                <CardDescription>
                  How much do you want to send to {recipientDetails?.name}?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Amount</Label>
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg font-medium">$</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className={`pl-8 text-2xl font-bold ${errors.amount ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-sm text-red-500 mt-1">{errors.amount}</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    Available balance: {formatCurrency(balance)}
                  </p>
                </div>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {[10, 25, 50, 100].map((value) => (
                    <Button
                      key={value}
                      variant="outline"
                      onClick={() => setAmount(value.toString())}
                    >
                      ${value}
                    </Button>
                  ))}
                </div>

                <div>
                  <Label>Note (Optional)</Label>
                  <Input
                    placeholder="What's this for?"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>When to Send</Label>
                  <Select value={schedule} onValueChange={(value: 'now' | 'later') => setSchedule(value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="now">Send Now</SelectItem>
                      <SelectItem value="later">Schedule for Later</SelectItem>
                    </SelectContent>
                  </Select>

                  {schedule === 'later' && (
                    <Input
                      type="datetime-local"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="mt-2"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'review' && (
            <Card>
              <CardHeader>
                <CardTitle>Review Transfer</CardTitle>
                <CardDescription>
                  Please confirm the details below
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Recipient</span>
                    <div className="text-right">
                      <p className="font-medium">{recipientDetails?.name}</p>
                      <p className="text-sm text-muted-foreground">{recipientDetails?.identifier}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="text-2xl font-bold">{formatCurrency(parseFloat(amount))}</span>
                  </div>

                  {transferFee > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Transfer Fee</span>
                      <span className="font-medium">{formatCurrency(transferFee)}</span>
                    </div>
                  )}

                  {note && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Note</span>
                      <span className="font-medium">{note}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="font-medium">Total Amount</span>
                    <span className="text-2xl font-bold text-primary">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900">Transfer Details</p>
                      <p className="text-blue-700 mt-1">
                        {method?.speed === 'instant' ? 'This transfer will be completed instantly.' :
                         method?.speed === 'minutes' ? 'This transfer will be completed within minutes.' :
                         'This transfer will be completed in 1-3 business days.'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            {step !== 'recipient' && (
              <Button
                variant="outline"
                onClick={() => {
                  if (step === 'amount') setStep('recipient')
                  else if (step === 'review') setStep('amount')
                }}
              >
                Back
              </Button>
            )}
            <Button
              className="flex-1"
              onClick={handleContinue}
            >
              {step === 'review' ? 'Confirm & Send' : 'Continue'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Balance Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Available Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(balance)}</p>
            </CardContent>
          </Card>

          {/* Transfer Limits */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Transfer Limits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Daily Limit</span>
                <span className="font-medium">$10,000</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Used Today</span>
                <span className="font-medium">$0</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
            </CardContent>
          </Card>

          {/* Security Note */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Secure Transfer</p>
                  <p className="text-sm text-blue-700 mt-1">
                    All transfers are encrypted and protected by our fraud detection system.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* QR Scanner Dialog */}
      <Dialog open={showQRScanner} onOpenChange={setShowQRScanner}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan QR Code</DialogTitle>
            <DialogDescription>
              Point your camera at a Monay QR code to send money
            </DialogDescription>
          </DialogHeader>
          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
            <QrCode className="h-32 w-32 text-gray-400" />
            <p className="text-muted-foreground">Camera view would appear here</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQRScanner(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}