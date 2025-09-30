'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CreditCard,
  ShoppingCart,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  FileText,
  Shield,
  Activity,
  Clock,
  ShoppingBag,
  Home,
  Heart
} from 'lucide-react'
import { format } from 'date-fns'

interface Beneficiary {
  id: string
  name: string
  ssn: string
  householdSize: number
  monthlyIncome: number
  snapBalance: number
  tanfBalance: number
  enrollmentDate: Date
  recertificationDate: Date
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'EXPIRED'
  eligibility: {
    snap: boolean
    tanf: boolean
    wic: boolean
  }
}

interface Transaction {
  id: string
  beneficiaryId: string
  type: 'PURCHASE' | 'BENEFIT_ISSUE' | 'REFUND' | 'ADJUSTMENT'
  amount: number
  merchantName: string
  merchantCategory: string
  mccCode: string
  status: 'APPROVED' | 'DECLINED' | 'PENDING'
  declineReason?: string
  timestamp: Date
}

interface IssuanceSchedule {
  programType: 'SNAP' | 'TANF'
  nextIssuanceDate: Date
  amount: number
  frequency: 'MONTHLY' | 'BIWEEKLY' | 'WEEKLY'
  status: 'SCHEDULED' | 'PROCESSING' | 'COMPLETED'
}

export default function BenefitsManagement() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [issuanceSchedules, setIssuanceSchedules] = useState<IssuanceSchedule[]>([])
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null)
  const [eligibilityCheck, setEligibilityCheck] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Simulated data
  useEffect(() => {
    // Mock beneficiaries
    setBeneficiaries([
      {
        id: 'BEN001',
        name: 'Jane Smith',
        ssn: '***-**-1234',
        householdSize: 4,
        monthlyIncome: 1850,
        snapBalance: 450.00,
        tanfBalance: 320.00,
        enrollmentDate: new Date('2024-01-15'),
        recertificationDate: new Date('2025-01-15'),
        status: 'ACTIVE',
        eligibility: { snap: true, tanf: true, wic: false }
      },
      {
        id: 'BEN002',
        name: 'John Doe',
        ssn: '***-**-5678',
        householdSize: 2,
        monthlyIncome: 1200,
        snapBalance: 280.00,
        tanfBalance: 0,
        enrollmentDate: new Date('2024-03-10'),
        recertificationDate: new Date('2025-03-10'),
        status: 'ACTIVE',
        eligibility: { snap: true, tanf: false, wic: false }
      }
    ])

    // Mock transactions
    setTransactions([
      {
        id: 'TXN001',
        beneficiaryId: 'BEN001',
        type: 'PURCHASE',
        amount: 45.67,
        merchantName: 'Walmart',
        merchantCategory: 'Grocery Store',
        mccCode: '5411',
        status: 'APPROVED',
        timestamp: new Date()
      },
      {
        id: 'TXN002',
        beneficiaryId: 'BEN001',
        type: 'PURCHASE',
        amount: 15.99,
        merchantName: 'Liquor Store',
        merchantCategory: 'Prohibited',
        mccCode: '5921',
        status: 'DECLINED',
        declineReason: 'Prohibited merchant category',
        timestamp: new Date()
      }
    ])

    // Mock issuance schedules
    setIssuanceSchedules([
      {
        programType: 'SNAP',
        nextIssuanceDate: new Date('2025-02-01'),
        amount: 450,
        frequency: 'MONTHLY',
        status: 'SCHEDULED'
      },
      {
        programType: 'TANF',
        nextIssuanceDate: new Date('2025-02-01'),
        amount: 320,
        frequency: 'MONTHLY',
        status: 'SCHEDULED'
      }
    ])
  }, [])

  const handleEnrollment = async (data: any) => {
    setIsProcessing(true)
    try {
      const response = await fetch('http://localhost:3001/api/benefits/snap/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()
      if (result.success) {
        setBeneficiaries(prev => [...prev, result.data])
      }
    } catch (error) {
      console.error('Enrollment failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const checkEligibility = async (data: any) => {
    setIsProcessing(true)
    try {
      const response = await fetch('http://localhost:3001/api/benefits/eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()
      setEligibilityCheck(result.data)
    } catch (error) {
      console.error('Eligibility check failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const processTransaction = async (purchase: any) => {
    try {
      const response = await fetch('http://localhost:3001/api/benefits/transaction/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchase)
      })

      const result = await response.json()
      if (result.success) {
        setTransactions(prev => [...prev, result.data])
      }
    } catch (error) {
      console.error('Transaction processing failed:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'SUSPENDED': return 'bg-red-100 text-red-800'
      case 'EXPIRED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Program Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <ShoppingBag className="h-8 w-8 text-green-600" />
              <Badge variant="outline">SNAP</Badge>
            </div>
            <p className="text-2xl font-bold mt-4">8,432</p>
            <p className="text-sm text-muted-foreground">Active Recipients</p>
            <p className="text-xs text-green-600 mt-2">↑ 12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <Home className="h-8 w-8 text-blue-600" />
              <Badge variant="outline">TANF</Badge>
            </div>
            <p className="text-2xl font-bold mt-4">3,156</p>
            <p className="text-sm text-muted-foreground">Active Recipients</p>
            <p className="text-xs text-blue-600 mt-2">↑ 8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <Heart className="h-8 w-8 text-pink-600" />
              <Badge variant="outline">WIC</Badge>
            </div>
            <p className="text-2xl font-bold mt-4">1,892</p>
            <p className="text-sm text-muted-foreground">Active Recipients</p>
            <p className="text-xs text-pink-600 mt-2">↑ 5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <Badge variant="outline">Monthly</Badge>
            </div>
            <p className="text-2xl font-bold mt-4">$4.2M</p>
            <p className="text-sm text-muted-foreground">Total Disbursed</p>
            <p className="text-xs text-purple-600 mt-2">On target</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Benefits Interface */}
      <Tabs defaultValue="enrollment" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
          <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
          <TabsTrigger value="balances">Balances</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="issuance">Issuance</TabsTrigger>
        </TabsList>

        <TabsContent value="enrollment">
          <Card>
            <CardHeader>
              <CardTitle>Benefits Enrollment</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                handleEnrollment({
                  ssn: formData.get('ssn'),
                  householdSize: parseInt(formData.get('householdSize') as string),
                  monthlyIncome: parseFloat(formData.get('monthlyIncome') as string),
                  programType: formData.get('programType')
                })
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ssn">Social Security Number</Label>
                    <Input id="ssn" name="ssn" placeholder="XXX-XX-XXXX" required />
                  </div>
                  <div>
                    <Label htmlFor="programType">Program Type</Label>
                    <select id="programType" name="programType" className="w-full p-2 border rounded-md">
                      <option value="SNAP">SNAP (Food Assistance)</option>
                      <option value="TANF">TANF (Cash Assistance)</option>
                      <option value="WIC">WIC (Women, Infants, Children)</option>
                      <option value="BOTH">SNAP + TANF</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="householdSize">Household Size</Label>
                    <Input id="householdSize" name="householdSize" type="number" placeholder="1" required />
                  </div>
                  <div>
                    <Label htmlFor="monthlyIncome">Monthly Income</Label>
                    <Input id="monthlyIncome" name="monthlyIncome" type="number" placeholder="0.00" required />
                  </div>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Enrollment requires identity verification and eligibility determination based on federal guidelines.
                  </AlertDescription>
                </Alert>

                <Button type="submit" disabled={isProcessing} className="w-full">
                  {isProcessing ? 'Processing...' : 'Submit Enrollment'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eligibility">
          <Card>
            <CardHeader>
              <CardTitle>Eligibility Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="checkSsn">SSN or Case Number</Label>
                    <Input id="checkSsn" placeholder="Enter SSN or Case #" />
                  </div>
                  <div>
                    <Label htmlFor="checkIncome">Current Monthly Income</Label>
                    <Input id="checkIncome" type="number" placeholder="0.00" />
                  </div>
                </div>

                <Button
                  onClick={() => checkEligibility({
                    ssn: (document.getElementById('checkSsn') as HTMLInputElement)?.value,
                    income: (document.getElementById('checkIncome') as HTMLInputElement)?.value
                  })}
                  disabled={isProcessing}
                  className="w-full"
                >
                  Check Eligibility
                </Button>

                {eligibilityCheck && (
                  <div className="mt-4 space-y-3">
                    <Alert className={eligibilityCheck.eligible ? 'border-green-500' : 'border-red-500'}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>
                        {eligibilityCheck.eligible ? 'Eligible for Benefits' : 'Not Eligible'}
                      </AlertTitle>
                      <AlertDescription>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2">
                            {eligibilityCheck.snap ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                            <span>SNAP: ${eligibilityCheck.snapAmount}/month</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {eligibilityCheck.tanf ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                            <span>TANF: ${eligibilityCheck.tanfAmount}/month</span>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balances">
          <Card>
            <CardHeader>
              <CardTitle>Beneficiary Balances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {beneficiaries.map(beneficiary => (
                  <div key={beneficiary.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium">{beneficiary.name}</p>
                        <p className="text-sm text-muted-foreground">ID: {beneficiary.id}</p>
                      </div>
                      <Badge className={getStatusColor(beneficiary.status)}>
                        {beneficiary.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <ShoppingBag className="h-4 w-4 text-green-600" />
                          <span className="text-xs text-green-600">SNAP</span>
                        </div>
                        <p className="text-xl font-bold mt-1">${beneficiary.snapBalance.toFixed(2)}</p>
                      </div>

                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <Home className="h-4 w-4 text-blue-600" />
                          <span className="text-xs text-blue-600">TANF</span>
                        </div>
                        <p className="text-xl font-bold mt-1">${beneficiary.tanfBalance.toFixed(2)}</p>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <Calendar className="h-4 w-4 text-gray-600" />
                          <span className="text-xs text-gray-600">Recert</span>
                        </div>
                        <p className="text-sm font-medium mt-1">
                          {format(beneficiary.recertificationDate, 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {transactions.map(transaction => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {transaction.status === 'APPROVED' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium">{transaction.merchantName}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.merchantCategory} • MCC: {transaction.mccCode}
                        </p>
                        {transaction.declineReason && (
                          <p className="text-xs text-red-600">{transaction.declineReason}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${transaction.amount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(transaction.timestamp, 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issuance">
          <Card>
            <CardHeader>
              <CardTitle>Benefit Issuance Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {issuanceSchedules.map((schedule, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{schedule.programType}</Badge>
                        <span className="text-sm font-medium">{schedule.frequency}</span>
                      </div>
                      <Badge className={
                        schedule.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        schedule.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {schedule.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Next Issuance</p>
                        <p className="font-medium">{format(schedule.nextIssuanceDate, 'MMMM d, yyyy')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="font-medium">${schedule.amount.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}

                <Button className="w-full">
                  <Clock className="h-4 w-4 mr-2" />
                  Process Scheduled Issuances
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MCC Restriction Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Transaction Restrictions Active</AlertTitle>
        <AlertDescription>
          All SNAP transactions are automatically validated against approved Merchant Category Codes (MCCs).
          Prohibited categories include: alcohol (5921), tobacco (5993), gambling (7995), and adult entertainment (5967).
        </AlertDescription>
      </Alert>
    </div>
  )
}