'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Users,
  DollarSign,
  Activity,
  Settings,
  ChevronRight,
  Globe,
  Shield,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Edit,
  Trash2,
  Eye,
  LogIn,
  Copy,
  Briefcase,
  Heart,
  GraduationCap,
  Truck,
  ShoppingCart,
  Banknote,
  Zap,
  Home,
  Factory,
  Tv,
  Plane
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { organizationTypes, industryByType, type OrganizationType, type Organization } from '@/lib/organizations-data'
import { Textarea } from '@/components/ui/textarea'

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Form state for creating new organization
  const [newOrgData, setNewOrgData] = useState({
    name: '',
    type: '' as OrganizationType | '',
    industry: '',
    description: '',
    primaryContact: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    taxId: '',
    dailyLimit: '100000',
    monthlyLimit: '1000000',
    perTransactionMax: '50000'
  })

  // Mock data with new types
  useEffect(() => {
    const mockOrgs: Organization[] = [
      {
        id: 'org-001',
        name: 'City of New York',
        type: 'Government & Public Sector',
        industry: 'Municipal services payments',
        status: 'active',
        kycStatus: 'approved',
        complianceScore: 98,
        wallets: 25,
        transactions: 12500,
        volume: 45000000,
        createdAt: '2024-01-15T10:00:00Z',
        lastActivity: '2024-01-23T14:30:00Z',
        primaryContact: 'John Smith',
        email: 'john.smith@nyc.gov',
        phone: '+1 (212) 555-0100',
        address: '1 City Hall, New York, NY 10007',
        website: 'https://www.nyc.gov',
        taxId: 'GOV-123456789',
        description: 'Municipal government services and benefit payments',
        limits: {
          dailyTransaction: 500000,
          monthlyTransaction: 10000000,
          perTransactionMax: 100000
        }
      },
      {
        id: 'org-002',
        name: 'Chase Digital Banking',
        type: 'Banking & Financial Services',
        industry: 'Digital banking',
        status: 'active',
        kycStatus: 'approved',
        complianceScore: 95,
        wallets: 150,
        transactions: 45000,
        volume: 120000000,
        createdAt: '2024-01-10T08:00:00Z',
        lastActivity: '2024-01-23T15:45:00Z',
        primaryContact: 'Sarah Johnson',
        email: 'sarah.johnson@chase.com',
        phone: '+1 (917) 555-0200',
        address: '383 Madison Ave, New York, NY 10179',
        website: 'https://www.chase.com',
        taxId: 'FIN-987654321',
        description: 'Leading digital banking and financial services',
        limits: {
          dailyTransaction: 1000000,
          monthlyTransaction: 50000000,
          perTransactionMax: 250000
        }
      },
      {
        id: 'org-003',
        name: 'United Healthcare',
        type: 'Insurance',
        industry: 'Health insurance',
        status: 'active',
        kycStatus: 'approved',
        complianceScore: 92,
        wallets: 75,
        transactions: 8500,
        volume: 35000000,
        createdAt: '2024-01-20T11:00:00Z',
        lastActivity: '2024-01-23T12:00:00Z',
        primaryContact: 'Michael Chen',
        email: 'mchen@uhc.com',
        phone: '+1 (952) 555-0300',
        address: '9900 Bren Rd E, Minnetonka, MN 55343',
        website: 'https://www.uhc.com',
        taxId: 'INS-456789123',
        description: 'Health insurance and benefits management',
        limits: {
          dailyTransaction: 750000,
          monthlyTransaction: 20000000,
          perTransactionMax: 150000
        }
      },
      {
        id: 'org-004',
        name: 'Amazon Marketplace',
        type: 'Retail & E-commerce',
        industry: 'Online marketplaces',
        status: 'active',
        kycStatus: 'approved',
        complianceScore: 96,
        wallets: 500,
        transactions: 125000,
        volume: 250000000,
        createdAt: '2024-01-05T09:00:00Z',
        lastActivity: '2024-01-23T16:20:00Z',
        primaryContact: 'Lisa Wang',
        email: 'lwang@amazon.com',
        phone: '+1 (206) 555-0400',
        address: '410 Terry Ave N, Seattle, WA 98109',
        website: 'https://www.amazon.com',
        taxId: 'RET-789123456',
        description: 'Global e-commerce and marketplace platform',
        limits: {
          dailyTransaction: 5000000,
          monthlyTransaction: 100000000,
          perTransactionMax: 500000
        }
      },
      {
        id: 'org-005',
        name: 'Uber Technologies',
        type: 'Gig Economy & Marketplaces',
        industry: 'Ride-sharing (Uber, Lyft)',
        status: 'active',
        kycStatus: 'approved',
        complianceScore: 88,
        wallets: 10000,
        transactions: 500000,
        volume: 180000000,
        createdAt: '2024-01-08T10:30:00Z',
        lastActivity: '2024-01-23T17:00:00Z',
        primaryContact: 'David Martinez',
        email: 'dmartinez@uber.com',
        phone: '+1 (415) 555-0500',
        address: '1455 Market St, San Francisco, CA 94103',
        website: 'https://www.uber.com',
        taxId: 'GIG-321654987',
        description: 'Ride-sharing and gig economy platform',
        limits: {
          dailyTransaction: 3000000,
          monthlyTransaction: 75000000,
          perTransactionMax: 5000
        }
      }
    ]

    setTimeout(() => {
      setOrganizations(mockOrgs)
      setFilteredOrgs(mockOrgs)
      setLoading(false)
    }, 1000)
  }, [])

  // Filter organizations
  useEffect(() => {
    let filtered = organizations

    if (searchTerm) {
      filtered = filtered.filter(org =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(org => org.status === filterStatus)
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(org => org.type === filterType)
    }

    setFilteredOrgs(filtered)
  }, [searchTerm, filterStatus, filterType, organizations])

  const handleCreateOrganization = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!newOrgData.name || !newOrgData.type || !newOrgData.industry || !newOrgData.email) {
      toast.error('Please fill in all required fields')
      return
    }

    // Create new organization
    const newOrg: Organization = {
      id: `org-${Date.now()}`,
      name: newOrgData.name,
      type: newOrgData.type as OrganizationType,
      industry: newOrgData.industry,
      status: 'active',
      kycStatus: 'pending',
      complianceScore: 75,
      wallets: 0,
      transactions: 0,
      volume: 0,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      primaryContact: newOrgData.primaryContact,
      email: newOrgData.email,
      phone: newOrgData.phone,
      address: newOrgData.address,
      website: newOrgData.website,
      taxId: newOrgData.taxId,
      description: newOrgData.description,
      limits: {
        dailyTransaction: parseInt(newOrgData.dailyLimit),
        monthlyTransaction: parseInt(newOrgData.monthlyLimit),
        perTransactionMax: parseInt(newOrgData.perTransactionMax)
      }
    }

    // Add to organizations list
    setOrganizations(prev => [newOrg, ...prev])
    setFilteredOrgs(prev => [newOrg, ...prev])

    // Reset form
    setNewOrgData({
      name: '',
      type: '',
      industry: '',
      description: '',
      primaryContact: '',
      email: '',
      phone: '',
      address: '',
      website: '',
      taxId: '',
      dailyLimit: '100000',
      monthlyLimit: '1000000',
      perTransactionMax: '50000'
    })

    setIsCreateDialogOpen(false)
    toast.success(`Organization "${newOrg.name}" created successfully!`)
  }

  const handleViewDetails = (org: Organization) => {
    setSelectedOrg(org)
    setIsDetailsDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'not_started': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Government & Public Sector': return Shield
      case 'Banking & Financial Services': return Banknote
      case 'Insurance': return Shield
      case 'Healthcare': return Heart
      case 'Retail & E-commerce': return ShoppingCart
      case 'Gig Economy & Marketplaces': return Users
      case 'Transportation & Logistics': return Truck
      case 'Telecommunications': return Phone
      case 'Utilities & Energy': return Zap
      case 'Real Estate & Property': return Home
      case 'Education': return GraduationCap
      case 'Manufacturing & Supply Chain': return Factory
      case 'Entertainment & Media': return Tv
      case 'Travel & Hospitality': return Plane
      case 'Non-Profit & NGO': return Heart
      default: return Building2
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Organizations</h1>
        <p className="text-gray-600 mt-2">Manage your organizations and multi-tenant configurations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{organizations.length}</span>
              <Badge variant="secondary" className="text-xs">+12% from last month</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{organizations.filter(o => o.status === 'active').length}</span>
              <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Monthly Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">$830M</span>
              <Badge variant="secondary" className="text-xs">+8.3%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Compliance Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                {organizations.length > 0
                  ? Math.round(organizations.reduce((acc, org) => acc + org.complianceScore, 0) / organizations.length)
                  : 0}%
              </span>
              <Badge className="bg-blue-100 text-blue-800 text-xs">Excellent</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {organizationTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Organization
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Organization</DialogTitle>
              <DialogDescription>
                Add a new organization to your enterprise network
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateOrganization} role="form" aria-label="Create new organization form">
              <div className="space-y-6 py-4">
                {/* Basic Information Section */}
                <fieldset className="space-y-4">
                  <legend className="text-base font-semibold text-gray-900">Basic Information</legend>

                  {/* Row 1: Name and Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="org-name">
                        Organization Name <span className="text-red-500" aria-label="required">*</span>
                      </Label>
                      <Input
                        id="org-name"
                        name="name"
                        placeholder="Enter organization name"
                        value={newOrgData.name}
                        onChange={(e) => setNewOrgData({...newOrgData, name: e.target.value})}
                        required
                        aria-required="true"
                        aria-describedby="org-name-error"
                        autoComplete="organization"
                        tabIndex={1}
                      />
                      <span id="org-name-error" className="sr-only">Organization name is required</span>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="org-type">
                        Type <span className="text-red-500" aria-label="required">*</span>
                      </Label>
                      <Select
                        value={newOrgData.type}
                        onValueChange={(value) => {
                          setNewOrgData({...newOrgData, type: value as OrganizationType, industry: ''})
                        }}
                        required
                      >
                        <SelectTrigger
                          id="org-type"
                          aria-required="true"
                          aria-label="Organization type"
                          className="w-full"
                          tabIndex={2}
                        >
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {organizationTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Row 2: Industry (full width when visible) */}
                  {newOrgData.type && (
                    <div className="space-y-2">
                      <Label htmlFor="org-industry">
                        Industry <span className="text-red-500" aria-label="required">*</span>
                      </Label>
                      <Select
                        value={newOrgData.industry}
                        onValueChange={(value) => setNewOrgData({...newOrgData, industry: value})}
                        required
                      >
                        <SelectTrigger
                          id="org-industry"
                          aria-required="true"
                          aria-label="Organization industry"
                          className="w-full"
                          tabIndex={3}
                        >
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {industryByType[newOrgData.type as OrganizationType]?.map(industry => (
                            <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Row 3: Description (full width) */}
                  <div className="space-y-2">
                    <Label htmlFor="org-description">
                      Description
                      <span className="text-gray-500 text-sm ml-2">(optional)</span>
                    </Label>
                    <Textarea
                      id="org-description"
                      name="description"
                      placeholder="Brief description of the organization"
                      value={newOrgData.description}
                      onChange={(e) => setNewOrgData({...newOrgData, description: e.target.value})}
                      rows={3}
                      aria-describedby="description-hint"
                      tabIndex={4}
                    />
                    <span id="description-hint" className="sr-only">Provide a brief description of your organization</span>
                  </div>
                </fieldset>

                {/* Contact Information Section */}
                <fieldset className="space-y-4">
                  <legend className="text-base font-semibold text-gray-900">Contact Information</legend>

                  {/* Row 1: Primary Contact and Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="org-contact">
                        Primary Contact
                        <span className="text-gray-500 text-sm ml-2">(optional)</span>
                      </Label>
                      <Input
                        id="org-contact"
                        name="primaryContact"
                        placeholder="Contact name"
                        value={newOrgData.primaryContact}
                        onChange={(e) => setNewOrgData({...newOrgData, primaryContact: e.target.value})}
                        autoComplete="name"
                        tabIndex={5}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="org-email">
                        Contact Email <span className="text-red-500" aria-label="required">*</span>
                      </Label>
                      <Input
                        id="org-email"
                        name="email"
                        type="email"
                        placeholder="admin@company.com"
                        value={newOrgData.email}
                        onChange={(e) => setNewOrgData({...newOrgData, email: e.target.value})}
                        required
                        aria-required="true"
                        aria-describedby="email-error"
                        autoComplete="email"
                        tabIndex={6}
                      />
                      <span id="email-error" className="sr-only">A valid email address is required</span>
                    </div>
                  </div>

                  {/* Row 2: Phone and Website */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="org-phone">
                        Contact Phone
                        <span className="text-gray-500 text-sm ml-2">(optional)</span>
                      </Label>
                      <Input
                        id="org-phone"
                        name="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={newOrgData.phone}
                        onChange={(e) => setNewOrgData({...newOrgData, phone: e.target.value})}
                        autoComplete="tel"
                        aria-describedby="phone-hint"
                        tabIndex={7}
                      />
                      <span id="phone-hint" className="sr-only">Enter phone number with country code</span>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="org-website">
                        Website
                        <span className="text-gray-500 text-sm ml-2">(optional)</span>
                      </Label>
                      <Input
                        id="org-website"
                        name="website"
                        type="url"
                        placeholder="https://www.company.com"
                        value={newOrgData.website}
                        onChange={(e) => setNewOrgData({...newOrgData, website: e.target.value})}
                        autoComplete="url"
                        aria-describedby="website-hint"
                        tabIndex={8}
                      />
                      <span id="website-hint" className="sr-only">Enter the full website URL including https://</span>
                    </div>
                  </div>
                </fieldset>

                {/* Organization Details Section */}
                <fieldset className="space-y-4">
                  <legend className="text-base font-semibold text-gray-900">Organization Details</legend>

                  {/* Row 1: Address (full width) */}
                  <div className="space-y-2">
                    <Label htmlFor="org-address">
                      Address
                      <span className="text-gray-500 text-sm ml-2">(optional)</span>
                    </Label>
                    <Input
                      id="org-address"
                      name="address"
                      placeholder="Street address, City, State ZIP"
                      value={newOrgData.address}
                      onChange={(e) => setNewOrgData({...newOrgData, address: e.target.value})}
                      autoComplete="street-address"
                      tabIndex={9}
                    />
                  </div>

                  {/* Row 2: Tax ID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="org-tax-id">
                        Tax ID / EIN
                        <span className="text-gray-500 text-sm ml-2">(optional)</span>
                      </Label>
                      <Input
                        id="org-tax-id"
                        name="taxId"
                        placeholder="XX-XXXXXXX"
                        value={newOrgData.taxId}
                        onChange={(e) => setNewOrgData({...newOrgData, taxId: e.target.value})}
                        aria-describedby="tax-id-hint"
                        tabIndex={10}
                      />
                      <span id="tax-id-hint" className="sr-only">Enter your organization's tax identification number</span>
                    </div>
                    <div>{/* Empty column for layout balance */}</div>
                  </div>
                </fieldset>

                {/* Transaction Limits Section */}
                <fieldset className="space-y-4">
                  <legend className="text-base font-semibold text-gray-900">
                    Transaction Limits
                    <span className="text-gray-500 text-sm ml-2">(optional)</span>
                  </legend>

                  {/* Row 1: Daily and Monthly Limits */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="org-daily-limit">Daily Limit ($)</Label>
                      <Input
                        id="org-daily-limit"
                        name="dailyLimit"
                        type="number"
                        min="0"
                        step="1000"
                        placeholder="100000"
                        value={newOrgData.dailyLimit}
                        onChange={(e) => setNewOrgData({...newOrgData, dailyLimit: e.target.value})}
                        aria-describedby="daily-limit-hint"
                        tabIndex={11}
                      />
                      <span id="daily-limit-hint" className="text-xs text-gray-500">Maximum daily transaction amount</span>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="org-monthly-limit">Monthly Limit ($)</Label>
                      <Input
                        id="org-monthly-limit"
                        name="monthlyLimit"
                        type="number"
                        min="0"
                        step="10000"
                        placeholder="1000000"
                        value={newOrgData.monthlyLimit}
                        onChange={(e) => setNewOrgData({...newOrgData, monthlyLimit: e.target.value})}
                        aria-describedby="monthly-limit-hint"
                        tabIndex={12}
                      />
                      <span id="monthly-limit-hint" className="text-xs text-gray-500">Maximum monthly transaction amount</span>
                    </div>
                  </div>

                  {/* Row 2: Per Transaction Limit */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="org-per-transaction">Per Transaction Maximum ($)</Label>
                      <Input
                        id="org-per-transaction"
                        name="perTransactionMax"
                        type="number"
                        min="0"
                        step="100"
                        placeholder="50000"
                        value={newOrgData.perTransactionMax}
                        onChange={(e) => setNewOrgData({...newOrgData, perTransactionMax: e.target.value})}
                        aria-describedby="per-transaction-hint"
                        tabIndex={13}
                      />
                      <span id="per-transaction-hint" className="text-xs text-gray-500">Maximum amount per single transaction</span>
                    </div>
                    <div>{/* Empty column for layout balance */}</div>
                  </div>
                </fieldset>
              </div>
              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  aria-label="Cancel creating organization"
                  onClick={() => {
                  setIsCreateDialogOpen(false)
                  setNewOrgData({
                    name: '',
                    type: '',
                    industry: '',
                    description: '',
                    primaryContact: '',
                    email: '',
                    phone: '',
                    address: '',
                    website: '',
                    taxId: '',
                    dailyLimit: '100000',
                    monthlyLimit: '1000000',
                    perTransactionMax: '50000'
                  })
                }}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  aria-label="Create new organization"
                >
                  Create Organization
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Organizations List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : filteredOrgs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64">
              <Building2 className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No organizations found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or create a new organization</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrgs.map((org) => {
            const TypeIcon = getTypeIcon(org.type)
            return (
              <Card key={org.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewDetails(org)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="p-3 bg-gray-100 rounded-lg">
                        <TypeIcon className="h-6 w-6 text-gray-600" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{org.name}</h3>
                          <Badge className={getStatusColor(org.status)}>{org.status}</Badge>
                          <Badge className={getKycStatusColor(org.kycStatus)}>KYC: {org.kycStatus}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {org.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            {org.industry}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Last active: {new Date(org.lastActivity).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 mt-2">
                          <div>
                            <p className="text-xs text-gray-500">Monthly Volume</p>
                            <p className="font-semibold">${(org.volume / 1000000).toFixed(1)}M</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Wallets</p>
                            <p className="font-semibold">{org.wallets.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Transactions</p>
                            <p className="font-semibold">{org.transactions.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Compliance Score</p>
                            <p className="font-semibold">{org.complianceScore}%</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          handleViewDetails(org)
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          // Store org info for login context
                          sessionStorage.setItem('org_login_context', JSON.stringify({
                            id: org.id,
                            name: org.name,
                            type: org.type,
                            email: org.email
                          }))
                          // Open org login in new tab
                          window.open('/auth/organization/login', '_blank')
                        }}>
                          <LogIn className="h-4 w-4 mr-2" />
                          Login as Organization
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          navigator.clipboard.writeText(org.id)
                          toast.success('Organization ID copied to clipboard')
                        }}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Org ID
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          toast.success('Edit mode activated')
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          toast.success('Opening settings...')
                        }}>
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={(e) => {
                          e.stopPropagation()
                          setOrganizations(prev => prev.filter(o => o.id !== org.id))
                          setFilteredOrgs(prev => prev.filter(o => o.id !== org.id))
                          toast.success(`Organization "${org.name}" suspended`)
                        }}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Suspend
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Organization Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedOrg?.name}</DialogTitle>
            <DialogDescription>
              Organization details and configuration
            </DialogDescription>
          </DialogHeader>

          {selectedOrg && (
            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="wallets">Wallets</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Organization Type</p>
                    <p className="font-medium">{selectedOrg.type}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Industry</p>
                    <p className="font-medium">{selectedOrg.industry}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge className={getStatusColor(selectedOrg.status)}>{selectedOrg.status}</Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">KYC Status</p>
                    <Badge className={getKycStatusColor(selectedOrg.kycStatus)}>{selectedOrg.kycStatus}</Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Primary Contact</p>
                    <p className="font-medium">{selectedOrg.primaryContact}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedOrg.email}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{selectedOrg.phone || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Tax ID</p>
                    <p className="font-medium">{selectedOrg.taxId || 'N/A'}</p>
                  </div>
                </div>

                {selectedOrg.description && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="text-sm">{selectedOrg.description}</p>
                  </div>
                )}

                {selectedOrg.address && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-sm">{selectedOrg.address}</p>
                  </div>
                )}

                {selectedOrg.website && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Website</p>
                    <a href={selectedOrg.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                      {selectedOrg.website}
                    </a>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="wallets" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Total Wallets</p>
                    <p className="text-2xl font-bold">{selectedOrg.wallets.toLocaleString()}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Total Transactions</p>
                    <p className="text-2xl font-bold">{selectedOrg.transactions.toLocaleString()}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Monthly Volume</p>
                    <p className="text-2xl font-bold">${(selectedOrg.volume / 1000000).toFixed(1)}M</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Transaction Limits</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Daily Limit</p>
                      <p className="font-medium">${selectedOrg.limits.dailyTransaction.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Monthly Limit</p>
                      <p className="font-medium">${selectedOrg.limits.monthlyTransaction.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Per Transaction Max</p>
                      <p className="font-medium">${selectedOrg.limits.perTransactionMax.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="compliance" className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">Compliance Score</p>
                    <p className="text-2xl font-bold">{selectedOrg.complianceScore}%</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${selectedOrg.complianceScore}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-500">KYC Verification</p>
                  <Badge className={getKycStatusColor(selectedOrg.kycStatus)}>
                    {selectedOrg.kycStatus.toUpperCase()}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium">{new Date(selectedOrg.createdAt).toLocaleString()}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Last Activity</p>
                  <p className="font-medium">{new Date(selectedOrg.lastActivity).toLocaleString()}</p>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="space-y-4">
                  <Button className="w-full" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Settings
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Manage Permissions
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                  <Button className="w-full" variant="outline" disabled>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Organization
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}