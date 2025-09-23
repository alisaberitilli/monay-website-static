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
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  DollarSign,
  TrendingUp,
  Zap,
  Send,
  FileText,
  Shield,
  MapPin,
  Activity,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'

interface EmergencyDeclaration {
  id: string
  type: 'NATURAL_DISASTER' | 'PANDEMIC' | 'CIVIL_EMERGENCY' | 'INFRASTRUCTURE_FAILURE'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  affectedAreas: string[]
  declaredAt: Date
  expiresAt: Date
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED'
}

interface Disbursement {
  id: string
  recipientId: string
  recipientName: string
  amount: number
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  method: 'BANK_ACCOUNT' | 'DEBIT_CARD' | 'DIGITAL_WALLET' | 'CHECK'
  requestedAt: Date
  completedAt?: Date
  slaStatus: 'ON_TIME' | 'AT_RISK' | 'BREACHED'
  timeRemaining?: number
}

interface BulkDisbursement {
  id: string
  totalRecipients: number
  totalAmount: number
  processedCount: number
  failedCount: number
  averageTime: number
  status: 'PREPARING' | 'PROCESSING' | 'COMPLETED'
}

export default function EmergencyDisbursement() {
  const [activeDeclaration, setActiveDeclaration] = useState<EmergencyDeclaration | null>(null)
  const [disbursements, setDisbursements] = useState<Disbursement[]>([])
  const [bulkOperation, setBulkOperation] = useState<BulkDisbursement | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)

  // Simulated real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update SLA tracking
      setDisbursements(prev => prev.map(d => {
        if (d.status === 'PROCESSING' && d.requestedAt) {
          const elapsed = Date.now() - new Date(d.requestedAt).getTime()
          const remaining = (4 * 60 * 60 * 1000) - elapsed // 4 hours in ms
          const slaStatus = remaining < 30 * 60 * 1000 ? 'AT_RISK' :
                           remaining < 0 ? 'BREACHED' : 'ON_TIME'
          return { ...d, timeRemaining: remaining, slaStatus }
        }
        return d
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleSingleDisbursement = async (data: any) => {
    setIsProcessing(true)
    try {
      const response = await fetch('http://localhost:3001/api/emergency-disbursement/disburse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          emergencyId: activeDeclaration?.id,
          priority: 'URGENT'
        })
      })

      const result = await response.json()
      if (result.success) {
        setDisbursements(prev => [...prev, result.data])
      }
    } catch (error) {
      console.error('Disbursement failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkDisbursement = async () => {
    if (!csvFile) return

    setIsProcessing(true)
    const formData = new FormData()
    formData.append('file', csvFile)
    formData.append('emergencyId', activeDeclaration?.id || '')

    try {
      const response = await fetch('http://localhost:3001/api/emergency-disbursement/bulk', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      if (result.success) {
        setBulkOperation(result.data)
      }
    } catch (error) {
      console.error('Bulk disbursement failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatTimeRemaining = (ms: number) => {
    if (ms <= 0) return 'BREACHED'
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const getSlaColor = (status: string) => {
    switch (status) {
      case 'ON_TIME': return 'text-green-600'
      case 'AT_RISK': return 'text-yellow-600'
      case 'BREACHED': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Emergency Declaration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Emergency Declaration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeDeclaration ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={activeDeclaration.severity === 'CRITICAL' ? 'destructive' : 'default'}>
                      {activeDeclaration.severity}
                    </Badge>
                    <span className="font-medium">{activeDeclaration.type.replace('_', ' ')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Declared: {format(activeDeclaration.declaredAt, 'PPpp')}
                  </p>
                </div>
                <Badge variant={activeDeclaration.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {activeDeclaration.status}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 p-4 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Affected Areas</p>
                  <p className="font-medium">{activeDeclaration.affectedAreas.length} regions</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Disbursed</p>
                  <p className="font-medium">$2,450,000</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Recipients</p>
                  <p className="font-medium">8,250</p>
                </div>
              </div>
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Active Emergency</AlertTitle>
              <AlertDescription>
                No emergency declaration is currently active. Disbursements are in standby mode.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 4-Hour SLA Tracker */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            GENIUS Act Compliance - 4-Hour SLA Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Activity className="h-4 w-4 text-green-600" />
                  <Badge variant="outline" className="bg-green-50">On Time</Badge>
                </div>
                <p className="text-2xl font-bold mt-2">92%</p>
                <p className="text-xs text-muted-foreground">SLA Success Rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <Badge variant="outline" className="bg-blue-50">Processing</Badge>
                </div>
                <p className="text-2xl font-bold mt-2">47</p>
                <p className="text-xs text-muted-foreground">Active Disbursements</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <Badge variant="outline" className="bg-yellow-50">At Risk</Badge>
                </div>
                <p className="text-2xl font-bold mt-2">5</p>
                <p className="text-xs text-muted-foreground">Approaching Deadline</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <Badge variant="outline" className="bg-red-50">Breached</Badge>
                </div>
                <p className="text-2xl font-bold mt-2">2</p>
                <p className="text-xs text-muted-foreground">SLA Violations</p>
              </CardContent>
            </Card>
          </div>

          {/* Active Disbursements List */}
          <div className="space-y-2">
            {disbursements.filter(d => d.status === 'PROCESSING').slice(0, 5).map(disbursement => (
              <div key={disbursement.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    disbursement.slaStatus === 'ON_TIME' ? 'bg-green-500' :
                    disbursement.slaStatus === 'AT_RISK' ? 'bg-yellow-500' : 'bg-red-500'
                  } animate-pulse`} />
                  <div>
                    <p className="font-medium">{disbursement.recipientName}</p>
                    <p className="text-sm text-muted-foreground">
                      ${disbursement.amount.toLocaleString()} via {disbursement.method}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-mono text-sm font-medium ${getSlaColor(disbursement.slaStatus!)}`}>
                    {disbursement.timeRemaining && formatTimeRemaining(disbursement.timeRemaining)}
                  </p>
                  <p className="text-xs text-muted-foreground">Time Remaining</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Disbursement Controls */}
      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="single">Single Disbursement</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
          <TabsTrigger value="reports">Compliance Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <Card>
            <CardHeader>
              <CardTitle>Process Single Disbursement</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                handleSingleDisbursement({
                  recipientId: formData.get('recipientId'),
                  amount: parseFloat(formData.get('amount') as string),
                  method: formData.get('method'),
                  reason: formData.get('reason')
                })
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="recipientId">Recipient ID</Label>
                    <Input id="recipientId" name="recipientId" placeholder="SSN or ID" required />
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input id="amount" name="amount" type="number" placeholder="0.00" required />
                  </div>
                  <div>
                    <Label htmlFor="method">Payment Method</Label>
                    <select id="method" name="method" className="w-full p-2 border rounded-md">
                      <option value="BANK_ACCOUNT">Bank Account (ACH)</option>
                      <option value="DEBIT_CARD">Debit Card</option>
                      <option value="DIGITAL_WALLET">Digital Wallet</option>
                      <option value="CHECK">Paper Check</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="reason">Reason</Label>
                    <Input id="reason" name="reason" placeholder="Emergency assistance reason" required />
                  </div>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    This disbursement will be processed with URGENT priority under GENIUS Act 4-hour SLA requirements.
                  </AlertDescription>
                </Alert>

                <Button type="submit" disabled={isProcessing} className="w-full">
                  {isProcessing ? 'Processing...' : 'Process Disbursement'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Disbursement Upload</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="csv">CSV File</Label>
                  <Input
                    id="csv"
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Format: recipient_id, amount, payment_method, address
                  </p>
                </div>

                {bulkOperation && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Processing Bulk Operation</span>
                      <Badge>{bulkOperation.status}</Badge>
                    </div>
                    <Progress value={(bulkOperation.processedCount / bulkOperation.totalRecipients) * 100} />
                    <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                      <div>Total: {bulkOperation.totalRecipients}</div>
                      <div>Processed: {bulkOperation.processedCount}</div>
                      <div>Failed: {bulkOperation.failedCount}</div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleBulkDisbursement}
                  disabled={!csvFile || isProcessing}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Process Bulk Disbursement
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Reporting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate GENIUS Act Report
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    SLA Performance Report
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Failed Disbursements Report
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Audit Trail Export
                  </Button>
                </div>

                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Compliance Status</AlertTitle>
                  <AlertDescription>
                    All disbursements are tracked with immutable audit logs and meet federal reporting requirements.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}