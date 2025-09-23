'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Plus,
  Filter,
  Download,
  Upload,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Users,
  Building2,
  User,
  FileText,
  Shield,
  TrendingUp
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import DataTable from '../ui/DataTable'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  type: 'individual' | 'business'
  kycStatus: 'pending' | 'verified' | 'rejected' | 'expired'
  riskLevel: 'low' | 'medium' | 'high'
  createdAt: Date
  lastActivity: Date
  accountBalance: number
  transactionCount: number
  complianceScore: number
  documents: {
    type: string
    status: 'pending' | 'approved' | 'rejected'
  }[]
}

const mockCustomers: Customer[] = [
  {
    id: 'CUS001',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 555-0123',
    type: 'individual',
    kycStatus: 'verified',
    riskLevel: 'low',
    createdAt: new Date('2024-01-15'),
    lastActivity: new Date('2024-03-20'),
    accountBalance: 45000,
    transactionCount: 124,
    complianceScore: 98,
    documents: [
      { type: 'ID', status: 'approved' },
      { type: 'Proof of Address', status: 'approved' }
    ]
  },
  {
    id: 'CUS002',
    name: 'Acme Corporation',
    email: 'finance@acmecorp.com',
    phone: '+1 555-0456',
    type: 'business',
    kycStatus: 'pending',
    riskLevel: 'medium',
    createdAt: new Date('2024-02-10'),
    lastActivity: new Date('2024-03-19'),
    accountBalance: 250000,
    transactionCount: 456,
    complianceScore: 85,
    documents: [
      { type: 'Business License', status: 'approved' },
      { type: 'Tax ID', status: 'pending' }
    ]
  },
  {
    id: 'CUS003',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '+1 555-0789',
    type: 'individual',
    kycStatus: 'rejected',
    riskLevel: 'high',
    createdAt: new Date('2024-03-01'),
    lastActivity: new Date('2024-03-18'),
    accountBalance: 0,
    transactionCount: 0,
    complianceScore: 45,
    documents: [
      { type: 'ID', status: 'rejected' },
      { type: 'Proof of Address', status: 'pending' }
    ]
  },
]

export default function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])

  const getKycStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      default:
        return null
    }
  }

  const getRiskLevelBadge = (level: string) => {
    switch (level) {
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low Risk</Badge>
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High Risk</Badge>
      default:
        return null
    }
  }

  const columns = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedCustomers(customers.map(c => c.id))
            } else {
              setSelectedCustomers([])
            }
          }}
        />
      ),
      cell: (customer: Customer) => (
        <input
          type="checkbox"
          checked={selectedCustomers.includes(customer.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedCustomers([...selectedCustomers, customer.id])
            } else {
              setSelectedCustomers(selectedCustomers.filter(id => id !== customer.id))
            }
          }}
        />
      )
    },
    {
      key: 'customer',
      header: 'Customer',
      cell: (customer: Customer) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
            {customer.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{customer.name}</span>
              {customer.type === 'business' ? (
                <Building2 className="h-4 w-4 text-gray-400" />
              ) : (
                <User className="h-4 w-4 text-gray-400" />
              )}
            </div>
            <span className="text-sm text-muted-foreground">{customer.email}</span>
          </div>
        </div>
      )
    },
    {
      key: 'kycStatus',
      header: 'KYC Status',
      cell: (customer: Customer) => (
        <div className="flex items-center gap-2">
          {getKycStatusIcon(customer.kycStatus)}
          <span className="capitalize">{customer.kycStatus}</span>
        </div>
      )
    },
    {
      key: 'riskLevel',
      header: 'Risk Level',
      cell: (customer: Customer) => getRiskLevelBadge(customer.riskLevel)
    },
    {
      key: 'balance',
      header: 'Balance',
      cell: (customer: Customer) => (
        <span className="font-medium">${customer.accountBalance.toLocaleString()}</span>
      )
    },
    {
      key: 'compliance',
      header: 'Compliance',
      cell: (customer: Customer) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                customer.complianceScore >= 90 ? 'bg-green-500' :
                customer.complianceScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${customer.complianceScore}%` }}
            />
          </div>
          <span className="text-sm">{customer.complianceScore}%</span>
        </div>
      )
    },
    {
      key: 'actions',
      header: '',
      cell: (customer: Customer) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit Customer
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="mr-2 h-4 w-4" />
              View Documents
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Shield className="mr-2 h-4 w-4" />
              Run Compliance Check
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Customer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || customer.kycStatus === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <Users className="h-8 w-8 text-blue-600" />
              <Badge variant="outline">Total</Badge>
            </div>
            <p className="text-2xl font-bold mt-2">{customers.length}</p>
            <p className="text-sm text-muted-foreground">Total Customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <Badge variant="outline">Verified</Badge>
            </div>
            <p className="text-2xl font-bold mt-2">
              {customers.filter(c => c.kycStatus === 'verified').length}
            </p>
            <p className="text-sm text-muted-foreground">KYC Verified</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <Clock className="h-8 w-8 text-yellow-600" />
              <Badge variant="outline">Pending</Badge>
            </div>
            <p className="text-2xl font-bold mt-2">
              {customers.filter(c => c.kycStatus === 'pending').length}
            </p>
            <p className="text-sm text-muted-foreground">Pending KYC</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <Badge variant="outline">Growth</Badge>
            </div>
            <p className="text-2xl font-bold mt-2">+23%</p>
            <p className="text-sm text-muted-foreground">This Month</p>
          </CardContent>
        </Card>
      </div>

      {/* Customer List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Customers</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter: {filterStatus === 'all' ? 'All' : filterStatus}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('verified')}>
                  Verified
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('pending')}>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('rejected')}>
                  Rejected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Selected Actions */}
          {selectedCustomers.length > 0 && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium">
                {selectedCustomers.length} customer{selectedCustomers.length > 1 ? 's' : ''} selected
              </span>
              <Button size="sm" variant="outline">
                <Shield className="h-4 w-4 mr-2" />
                Bulk KYC Check
              </Button>
              <Button size="sm" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Export Selected
              </Button>
            </div>
          )}

          {/* Data Table */}
          <DataTable
            columns={columns}
            data={filteredCustomers}
            pageSize={10}
          />
        </CardContent>
      </Card>
    </div>
  )
}