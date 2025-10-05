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
  Plane,
  HandHeart
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
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingOrgId, setEditingOrgId] = useState<string | null>(null)

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

  // Fetch real organizations from API
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('authToken')

        const response = await fetch('http://localhost:3001/api/organizations', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'x-admin-bypass': 'true'
          }
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            // Transform API data to match our Organization interface
            const orgs: Organization[] = result.data.map((org: any) => ({
              id: org.id || `org-${org.organization_id}`,
              name: org.name || org.organization_name || 'Unknown Organization',
              type: org.type || org.organization_type || 'General',
              industry: org.industry || 'Not specified',
              status: org.status || 'active',
              kycStatus: org.kyc_status || 'pending',
              complianceScore: org.compliance_score || 75,
              wallets: org.wallets || 0,
              transactions: org.transactions || 0,
              volume: org.volume || 0,
              createdAt: org.created_at || org.createdAt || new Date().toISOString(),
              lastActivity: org.updated_at || org.lastActivity || new Date().toISOString(),
              primaryContact: org.primary_contact || org.primaryContact || 'N/A',
              email: org.email || org.contact_email || 'N/A',
              phone: org.phone || org.contact_phone || 'N/A',
              address: org.address || 'N/A',
              website: org.website || '',
              taxId: org.tax_id || org.taxId || '',
              description: org.description || '',
              limits: {
                dailyTransaction: org.daily_limit || org.limits?.dailyTransaction || 100000,
                monthlyTransaction: org.monthly_limit || org.limits?.monthlyTransaction || 1000000,
                perTransactionMax: org.per_transaction_max || org.limits?.perTransactionMax || 50000
              }
            }))

            setOrganizations(orgs)
            setFilteredOrgs(orgs)
          } else {
            console.error('API returned unsuccessful response:', result)
            toast.error('Failed to load organizations')
          }
        } else {
          console.error('Failed to fetch organizations:', response.status, response.statusText)
          toast.error('Failed to load organizations')
        }
      } catch (error) {
        console.error('Error fetching organizations:', error)
        toast.error('Error loading organizations')
      } finally {
        setLoading(false)
      }
    }

    fetchOrganizations()
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

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!newOrgData.name || !newOrgData.type || !newOrgData.industry || !newOrgData.email) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const token = localStorage.getItem('authToken')

      const orgData = {
        name: newOrgData.name,
        type: newOrgData.type,
        industry: newOrgData.industry,
        description: newOrgData.description,
        primary_contact: newOrgData.primaryContact,
        contact_email: newOrgData.email,
        contact_phone: newOrgData.phone,
        address: newOrgData.address,
        website: newOrgData.website,
        tax_id: newOrgData.taxId,
        daily_limit: parseInt(newOrgData.dailyLimit),
        monthly_limit: parseInt(newOrgData.monthlyLimit),
        per_transaction_max: parseInt(newOrgData.perTransactionMax)
      }

      const url = isEditMode
        ? `http://localhost:3001/api/organizations/${editingOrgId}`
        : 'http://localhost:3001/api/organizations'

      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-admin-bypass': 'true'
        },
        body: JSON.stringify(orgData)
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success(`Organization "${newOrgData.name}" ${isEditMode ? 'updated' : 'created'} successfully!`)

        // Reset form
        resetForm()
        setIsCreateDialogOpen(false)

        // Refresh the organizations list
        const refreshResponse = await fetch('http://localhost:3001/api/organizations', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'x-admin-bypass': 'true'
          }
        })

        if (refreshResponse.ok) {
          const refreshResult = await refreshResponse.json()
          if (refreshResult.success && refreshResult.data) {
            const orgs: Organization[] = refreshResult.data.map((org: any) => ({
              id: org.id || `org-${org.organization_id}`,
              name: org.name || org.organization_name || 'Unknown Organization',
              type: org.type || org.organization_type || 'General',
              industry: org.industry || 'Not specified',
              status: org.status || 'active',
              kycStatus: org.kyc_status || 'pending',
              complianceScore: org.compliance_score || 75,
              wallets: org.wallets || 0,
              transactions: org.transactions || 0,
              volume: org.volume || 0,
              createdAt: org.created_at || org.createdAt || new Date().toISOString(),
              lastActivity: org.updated_at || org.lastActivity || new Date().toISOString(),
              primaryContact: org.primary_contact || org.primaryContact || 'N/A',
              email: org.email || org.contact_email || 'N/A',
              phone: org.phone || org.contact_phone || 'N/A',
              address: org.address || 'N/A',
              website: org.website || '',
              taxId: org.tax_id || org.taxId || '',
              description: org.description || '',
              limits: {
                dailyTransaction: org.daily_limit || org.limits?.dailyTransaction || 100000,
                monthlyTransaction: org.monthly_limit || org.limits?.monthlyTransaction || 1000000,
                perTransactionMax: org.per_transaction_max || org.limits?.perTransactionMax || 50000
              }
            }))

            setOrganizations(orgs)
            setFilteredOrgs(orgs)
          }
        }
      } else {
        toast.error(result.error || 'Failed to create organization')
      }
    } catch (error) {
      console.error('Error creating organization:', error)
      toast.error('Error creating organization')
    }
  }

  const handleViewDetails = (org: Organization) => {
    setSelectedOrg(org)
    setIsDetailsDialogOpen(true)
  }

  const handleEditOrganization = (org: Organization) => {
    // Pre-populate form with existing organization data
    setNewOrgData({
      name: org.name,
      type: org.type as OrganizationType,
      industry: org.industry,
      description: org.description || '',
      primaryContact: org.primaryContact || '',
      email: org.email,
      phone: org.phone || '',
      address: org.address || '',
      website: org.website || '',
      taxId: org.taxId || '',
      dailyLimit: org.limits.dailyTransaction.toString(),
      monthlyLimit: org.limits.monthlyTransaction.toString(),
      perTransactionMax: org.limits.perTransactionMax.toString()
    })
    setEditingOrgId(org.id)
    setIsEditMode(true)
    setIsCreateDialogOpen(true)
  }

  const resetForm = () => {
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
    setIsEditMode(false)
    setEditingOrgId(null)
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
      case 'Non-Profit & NGO': return HandHeart
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

        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open)
          if (!open) {
            resetForm()
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm()
              setIsCreateDialogOpen(true)
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Organization
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditMode ? 'Edit Organization' : 'Create New Organization'}</DialogTitle>
              <DialogDescription>
                {isEditMode ? 'Update organization details' : 'Add a new organization to your enterprise network'}
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
                        disabled={false}
                      >
                        <SelectTrigger
                          id="org-industry"
                          aria-required="true"
                          aria-label="Organization industry"
                          className="w-full"
                          tabIndex={3}
                          disabled={false}
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
                  aria-label={isEditMode ? "Cancel editing organization" : "Cancel creating organization"}
                  onClick={() => {
                    setIsCreateDialogOpen(false)
                    resetForm()
                  }}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  aria-label={isEditMode ? "Update organization" : "Create new organization"}
                >
                  {isEditMode ? 'Update Organization' : 'Create Organization'}
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
                        <DropdownMenuItem onClick={async (e) => {
                          e.stopPropagation()

                          try {
                            // Generate dev login token for this organization user
                            const token = localStorage.getItem('authToken')
                            const response = await fetch('http://localhost:3001/api/auth/dev-login-token', {
                              method: 'POST',
                              headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({
                                email: 'enterprise@monay.com', // Default enterprise test user
                                organizationId: org.id
                              })
                            })

                            const result = await response.json()

                            if (result.success && result.data.token) {
                              // Open Enterprise Wallet with auto-login token
                              const loginUrl = `http://localhost:3007/auth/login?token=${encodeURIComponent(result.data.token)}&org=${encodeURIComponent(org.id)}`
                              window.open(loginUrl, '_blank')
                              toast.success(`Opening Enterprise Wallet as ${org.name}`)
                            } else {
                              toast.error(result.message || 'Failed to generate login token')
                            }
                          } catch (error) {
                            console.error('Dev login error:', error)
                            toast.error('Failed to generate dev login token')
                          }
                        }}>
                          <LogIn className="h-4 w-4 mr-2" />
                          Test in Enterprise Wallet
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          // Copy testing credentials to clipboard
                          const credentials = `Enterprise Wallet Testing:
Login URL: http://localhost:3007/auth/login
Email: enterprise@monay.com
Password: password123
Organization ID: ${org.id}
Organization: ${org.name}`;
                          navigator.clipboard.writeText(credentials)
                          toast.success('Testing credentials copied to clipboard!')
                        }}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Test Credentials
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
                          handleEditOrganization(org)
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
                {/* Testing Credentials Section */}
                <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-3 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Testing Credentials - Enterprise Wallet Access
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-yellow-700 font-medium">Login URL:</label>
                        <div className="flex items-center gap-2">
                          <code className="bg-yellow-100 px-2 py-1 rounded text-yellow-800">
                            http://localhost:3007/auth/login
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              navigator.clipboard.writeText('http://localhost:3007/auth/login')
                              toast.success('URL copied to clipboard')
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-yellow-700 font-medium">Organization ID:</label>
                        <div className="flex items-center gap-2">
                          <code className="bg-yellow-100 px-2 py-1 rounded text-yellow-800 break-all">
                            {selectedOrg?.id}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              navigator.clipboard.writeText(selectedOrg?.id || '')
                              toast.success('Organization ID copied to clipboard')
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-yellow-700 font-medium">Test Email:</label>
                        <div className="flex items-center gap-2">
                          <code className="bg-yellow-100 px-2 py-1 rounded text-yellow-800">
                            enterprise@monay.com
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              navigator.clipboard.writeText('enterprise@monay.com')
                              toast.success('Email copied to clipboard')
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-yellow-700 font-medium">Test Password:</label>
                        <div className="flex items-center gap-2">
                          <code className="bg-yellow-100 px-2 py-1 rounded text-yellow-800">
                            password123
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              navigator.clipboard.writeText('password123')
                              toast.success('Password copied to clipboard')
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-yellow-200">
                      <Button
                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                        onClick={() => {
                          window.open('http://localhost:3007/auth/login', '_blank')
                        }}
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Open Enterprise Wallet Login
                      </Button>
                    </div>
                    <p className="text-xs text-yellow-600 mt-2">
                      Note: This enterprise admin user has owner access to all organizations for testing purposes.
                    </p>
                  </div>
                </div>

                {/* Regular Settings */}
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