'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  FileText,
  User,
  Building,
  Search,
  Download,
  Upload,
  Eye,
  ChevronRight,
  Loader2,
  Filter,
  Calendar
} from 'lucide-react'

interface KYCVerification {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  type: 'individual' | 'business'
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'expired'
  level: 'basic' | 'enhanced' | 'full'
  submittedAt: string
  reviewedAt?: string
  expiresAt: string
  documents: {
    type: string
    status: 'pending' | 'verified' | 'rejected'
    uploadedAt: string
  }[]
  verificationSteps: {
    name: string
    status: 'complete' | 'incomplete' | 'failed'
    message?: string
  }[]
  riskScore?: number
  reviewer?: string
  notes?: string
}

const mockKYCData: KYCVerification[] = [
  {
    id: 'kyc-001',
    customerId: 'cust-001',
    customerName: 'John Doe',
    customerEmail: 'john.doe@example.com',
    type: 'individual',
    status: 'approved',
    level: 'full',
    submittedAt: '2024-01-15T10:30:00Z',
    reviewedAt: '2024-01-15T14:45:00Z',
    expiresAt: '2025-01-15T00:00:00Z',
    documents: [
      { type: 'Passport', status: 'verified', uploadedAt: '2024-01-15T10:30:00Z' },
      { type: 'Utility Bill', status: 'verified', uploadedAt: '2024-01-15T10:32:00Z' },
      { type: 'Bank Statement', status: 'verified', uploadedAt: '2024-01-15T10:35:00Z' }
    ],
    verificationSteps: [
      { name: 'Identity Verification', status: 'complete' },
      { name: 'Address Verification', status: 'complete' },
      { name: 'PEP Screening', status: 'complete' },
      { name: 'Sanctions Check', status: 'complete' },
      { name: 'Adverse Media', status: 'complete' }
    ],
    riskScore: 15,
    reviewer: 'Compliance Team',
    notes: 'All checks passed successfully'
  },
  {
    id: 'kyc-002',
    customerId: 'cust-002',
    customerName: 'Acme Corporation',
    customerEmail: 'compliance@acme.com',
    type: 'business',
    status: 'in_review',
    level: 'enhanced',
    submittedAt: '2024-01-20T09:15:00Z',
    expiresAt: '2025-01-20T00:00:00Z',
    documents: [
      { type: 'Certificate of Incorporation', status: 'verified', uploadedAt: '2024-01-20T09:15:00Z' },
      { type: 'Articles of Association', status: 'verified', uploadedAt: '2024-01-20T09:18:00Z' },
      { type: 'Director ID', status: 'pending', uploadedAt: '2024-01-20T09:20:00Z' },
      { type: 'UBO Declaration', status: 'pending', uploadedAt: '2024-01-20T09:25:00Z' }
    ],
    verificationSteps: [
      { name: 'Business Verification', status: 'complete' },
      { name: 'Director Verification', status: 'incomplete', message: 'Awaiting director ID verification' },
      { name: 'UBO Verification', status: 'incomplete', message: 'UBO declaration under review' },
      { name: 'PEP Screening', status: 'complete' },
      { name: 'Sanctions Check', status: 'complete' }
    ],
    riskScore: 45
  },
  {
    id: 'kyc-003',
    customerId: 'cust-003',
    customerName: 'Jane Smith',
    customerEmail: 'jane.smith@email.com',
    type: 'individual',
    status: 'pending',
    level: 'basic',
    submittedAt: '2024-01-22T11:00:00Z',
    expiresAt: '2025-01-22T00:00:00Z',
    documents: [
      { type: 'Drivers License', status: 'pending', uploadedAt: '2024-01-22T11:00:00Z' }
    ],
    verificationSteps: [
      { name: 'Identity Verification', status: 'incomplete' },
      { name: 'Address Verification', status: 'incomplete' },
      { name: 'PEP Screening', status: 'incomplete' },
      { name: 'Sanctions Check', status: 'incomplete' }
    ]
  }
]

export default function KYCPage() {
  const [verifications, setVerifications] = useState(mockKYCData)
  const [selectedVerification, setSelectedVerification] = useState<KYCVerification | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('overview')

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: Clock },
      in_review: { variant: 'default' as const, icon: RefreshCw },
      approved: { variant: 'success' as const, icon: CheckCircle },
      rejected: { variant: 'destructive' as const, icon: XCircle },
      expired: { variant: 'outline' as const, icon: AlertCircle }
    }
    const config = statusConfig[status as keyof typeof statusConfig]
    const Icon = config?.icon || AlertCircle

    return (
      <Badge variant={config?.variant || 'default'} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const handleApprove = (id: string) => {
    setVerifications(prev =>
      prev.map(v =>
        v.id === id
          ? { ...v, status: 'approved' as const, reviewedAt: new Date().toISOString(), reviewer: 'Current User' }
          : v
      )
    )
    toast.success('KYC verification approved')
  }

  const handleReject = (id: string) => {
    setVerifications(prev =>
      prev.map(v =>
        v.id === id
          ? { ...v, status: 'rejected' as const, reviewedAt: new Date().toISOString(), reviewer: 'Current User' }
          : v
      )
    )
    toast.error('KYC verification rejected')
  }

  const filteredVerifications = verifications.filter(v => {
    const matchesSearch = v.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         v.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter
    const matchesType = typeFilter === 'all' || v.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">KYC Verification</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage customer identity verification and compliance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Documents
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Verifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifications.length}</div>
            <p className="text-xs text-gray-600">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {verifications.filter(v => v.status === 'pending' || v.status === 'in_review').length}
            </div>
            <p className="text-xs text-gray-600">Requires action</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {verifications.filter(v => v.status === 'approved').length}
            </div>
            <p className="text-xs text-gray-600">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((verifications.filter(v => v.status === 'approved').length / verifications.length) * 100)}%
            </div>
            <Progress
              value={(verifications.filter(v => v.status === 'approved').length / verifications.length) * 100}
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <CardTitle>KYC Queue</CardTitle>
          <CardDescription>Review and manage KYC verifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVerifications.map((verification) => (
                <TableRow key={verification.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{verification.customerName}</div>
                      <div className="text-sm text-gray-500">{verification.customerEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {verification.type === 'individual' ? (
                        <User className="h-3 w-3 mr-1" />
                      ) : (
                        <Building className="h-3 w-3 mr-1" />
                      )}
                      {verification.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {verification.level.charAt(0).toUpperCase() + verification.level.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(verification.status)}</TableCell>
                  <TableCell>
                    {verification.riskScore && (
                      <Badge variant={verification.riskScore > 60 ? 'destructive' : verification.riskScore > 30 ? 'default' : 'success'}>
                        Risk: {verification.riskScore}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(verification.submittedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedVerification(verification)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {(verification.status === 'pending' || verification.status === 'in_review') && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleApprove(verification.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleReject(verification.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}