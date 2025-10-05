'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  FileText, Plus, Trash2, ArrowLeft, Send, Save,
  Wallet, Clock, Shield, Zap, Info, AlertCircle,
  ArrowDownLeft, ArrowUpRight, Calculator, Calendar,
  Building, Mail, Phone, MapPin, Globe, Hash,
  Search, Check, ChevronDown, User, X
} from 'lucide-react'
import toast from 'react-hot-toast'
import type {
  InvoiceDirection,
  InvoiceLineItem,
  CreateInvoiceRequest,
  Currency,
  PaymentMethod,
  WalletMode
} from '@/types/invoice'

interface CompanyContact {
  id: string
  type: 'organization' | 'individual'
  name: string
  email: string
  address?: string | null
  taxId?: string | null
  organizationId?: string
  phone?: string | null
  website?: string | null
  contactPerson?: string
  isVerified: boolean
  isMonayTenant: boolean // Whether they have a Monay account
  kybStatus?: 'not_started' | 'pending' | 'approved' | 'rejected' // KYB status for organizations
  kycStatus?: 'not_started' | 'pending' | 'approved' | 'rejected' // KYC status for consumers
  lastUsed?: string
  tenantId?: string | null
  uniqueCode?: string | null
}

export default function CreateInvoicePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const invoiceType = searchParams.get('type') as InvoiceDirection | null
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Form State
  const [direction, setDirection] = useState<InvoiceDirection>(invoiceType || 'inbound')
  const [selectedCompany, setSelectedCompany] = useState<CompanyContact | null>(null)
  const [companyName, setCompanyName] = useState('')
  const [companyEmail, setCompanyEmail] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')
  const [companyTaxId, setCompanyTaxId] = useState('')

  // Company search state
  const [companySearch, setCompanySearch] = useState('')
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false)
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyContact[]>([])
  const [allCompanies, setAllCompanies] = useState<CompanyContact[]>([])
  const [isManualEntry, setIsManualEntry] = useState(false)
  const [loadingContacts, setLoadingContacts] = useState(false)

  // Filter states
  const [filterType, setFilterType] = useState<'all' | 'organization' | 'individual'>('all')
  const [filterTenantStatus, setFilterTenantStatus] = useState<'all' | 'monay_tenant' | 'external'>('all')
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'unverified' | 'pending'>('all')
  const [lineItems, setLineItems] = useState<Omit<InvoiceLineItem, 'id'>[]>([
    { description: '', quantity: 1, unitPrice: 0, amount: 0 }
  ])
  const [currency, setCurrency] = useState<Currency>('USDC')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('usdc')
  const [paymentTerms, setPaymentTerms] = useState('Net 30')
  const [dueDate, setDueDate] = useState('')

  // Invoice-First Options
  const [createEphemeralWallet, setCreateEphemeralWallet] = useState(true)
  const [walletMode, setWalletMode] = useState<WalletMode>('ephemeral')
  const [walletTTL, setWalletTTL] = useState(86400) // 24 hours in seconds

  // Additional Options
  const [sendEmail, setSendEmail] = useState(true)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  // New Contact Creation Modal State
  const [showNewContactModal, setShowNewContactModal] = useState(false)
  const [newContactType, setNewContactType] = useState<'organization' | 'consumer'>('organization')
  const [newContactForm, setNewContactForm] = useState({
    name: '',
    email: '',
    address: '',
    taxId: '',
    phone: '',
    website: '',
    contactPerson: ''
  })
  const [creatingContact, setCreatingContact] = useState(false)

  // Fetch contacts from API
  useEffect(() => {
    const fetchContacts = async () => {
      setLoadingContacts(true)
      try {
        const token = localStorage.getItem('authToken')
        const params = new URLSearchParams({
          type: filterType,
          tenant_status: filterTenantStatus,
          verified: filterVerified,
          search: companySearch
        })

        const response = await fetch(`http://localhost:3001/api/contacts?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'x-admin-bypass': 'true'
          }
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            const contacts: CompanyContact[] = result.data.map((contact: any) => ({
              id: contact.id,
              type: contact.type === 'individual' ? 'individual' : 'organization',
              name: contact.name,
              email: contact.email,
              address: contact.address,
              taxId: contact.taxId,
              phone: contact.phone,
              website: contact.website,
              isVerified: contact.verified,
              isMonayTenant: contact.isMonayTenant,
              kybStatus: contact.kybStatus || 'not_started',
              kycStatus: contact.kycStatus || 'not_started',
              lastUsed: contact.lastUsed,
              tenantId: contact.tenantId,
              uniqueCode: contact.uniqueCode
            }))
            setAllCompanies(contacts)
            setFilteredCompanies(contacts.slice(0, 8)) // Show first 8 results
          }
        } else {
          console.error('Failed to fetch contacts:', response.status)
          toast.error('Failed to load contacts')
        }
      } catch (error) {
        console.error('Error fetching contacts:', error)
        toast.error('Error loading contacts')
      } finally {
        setLoadingContacts(false)
      }
    }

    fetchContacts()
  }, [filterType, filterTenantStatus, filterVerified, companySearch])

  // Calculate default due date (30 days from today)
  useEffect(() => {
    const date = new Date()
    date.setDate(date.getDate() + 30)
    setDueDate(date.toISOString().split('T')[0])
  }, [])

  // Auto-update payment method based on currency
  useEffect(() => {
    if (['USDC', 'USDT', 'PYUSD'].includes(currency)) {
      setPaymentMethod(currency.toLowerCase() as PaymentMethod)
    } else if (currency === 'USD') {
      setPaymentMethod('ach')
    } else {
      setPaymentMethod('crypto')
    }
  }, [currency])


  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCompanyDropdown(false)
      }
    }

    if (showCompanyDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCompanyDropdown])

  // Helper functions
  const formatTaxId = (taxId: string) => {
    if (!taxId) return ''
    // Show only last 4 digits for privacy
    if (taxId.length > 4) {
      return `***-****${taxId.slice(-4)}`
    }
    return taxId
  }

  const handleCompanySelect = (company: CompanyContact) => {
    setSelectedCompany(company)
    setCompanyName(company.name)
    setCompanyEmail(company.email)
    setCompanyAddress(company.address || '')
    setCompanyTaxId(company.taxId || '')
    setCompanySearch(company.name)
    setShowCompanyDropdown(false)
    setIsManualEntry(false)
  }

  const handleManualEntry = () => {
    setSelectedCompany(null)
    setCompanyName('')
    setCompanyEmail('')
    setCompanyAddress('')
    setCompanyTaxId('')
    setCompanySearch('')
    setShowCompanyDropdown(false)
    setIsManualEntry(true)
  }

  const handleEditSelectedCompany = () => {
    // Enable editing without clearing the data
    setIsManualEntry(true)
    setShowCompanyDropdown(false)
  }

  const handleNewContactClick = () => {
    setShowNewContactModal(true)
    setShowCompanyDropdown(false)
  }

  const resetNewContactForm = () => {
    setNewContactForm({
      name: '',
      email: '',
      address: '',
      taxId: '',
      phone: '',
      website: '',
      contactPerson: ''
    })
    setNewContactType('organization')
  }

  const handleCreateNewContact = async () => {
    if (!newContactForm.email) {
      toast.error('Email is required')
      return
    }

    if (newContactType === 'organization' && !newContactForm.name) {
      toast.error('Organization name is required')
      return
    }

    setCreatingContact(true)

    try {
      const token = localStorage.getItem('authToken')

      // Prepare contact data based on type
      const contactData: any = {
        type: newContactType,
        email: newContactForm.email,
        phone: newContactForm.phone || null,
        address: newContactForm.address || null
      }

      if (newContactType === 'organization') {
        contactData.name = newContactForm.name
        contactData.taxId = newContactForm.taxId || null
        contactData.website = newContactForm.website || null
        contactData.contactPerson = newContactForm.contactPerson || null
      } else {
        // For individuals, split name into firstName and lastName
        const nameParts = newContactForm.name.trim().split(' ')
        contactData.firstName = nameParts[0] || ''
        contactData.lastName = nameParts.slice(1).join(' ') || nameParts[0] || ''
      }

      const response = await fetch('http://localhost:3001/api/contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-admin-bypass': 'true'
        },
        body: JSON.stringify(contactData)
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // Create CompanyContact object from API response
        const newContact: CompanyContact = {
          id: result.data.id,
          type: newContactType,
          name: newContactType === 'organization'
            ? result.data.name
            : `${result.data.first_name} ${result.data.last_name}`,
          email: result.data.email,
          address: result.data.address_line1 || result.data.address || null,
          taxId: result.data.tax_id || null,
          phone: result.data.phone || result.data.mobile || null,
          website: result.data.website || null,
          isVerified: false,
          isMonayTenant: false, // New contacts are external by default
          kybStatus: 'not_started',
          kycStatus: 'not_started',
          tenantId: null,
          uniqueCode: result.data.org_id || result.data.unique_code || null
        }

        // Add to local state
        setAllCompanies(prev => [newContact, ...prev])
        setFilteredCompanies(prev => [newContact, ...prev].slice(0, 8))

        // Auto-select the new contact
        handleCompanySelect(newContact)

        // Close modal and reset form
        setShowNewContactModal(false)
        resetNewContactForm()

        toast.success(`${newContactType === 'organization' ? 'Organization' : 'Individual'} created successfully`)
      } else {
        toast.error(result.message || 'Failed to create contact')
      }
    } catch (error) {
      toast.error('Failed to create new contact')
      console.error('Error creating contact:', error)
    } finally {
      setCreatingContact(false)
    }
  }

  const handleCompanySearchChange = (value: string) => {
    setCompanySearch(value)
    setShowCompanyDropdown(true)
    setIsManualEntry(false)

    // If user clears the search, clear the form
    if (value.trim() === '') {
      setSelectedCompany(null)
      setCompanyName('')
      setCompanyEmail('')
      setCompanyAddress('')
      setCompanyTaxId('')
    }
  }

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unitPrice: 0, amount: 0 }])
  }

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const updateLineItem = (index: number, field: keyof InvoiceLineItem, value: any) => {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], [field]: value }

    // Recalculate amount
    if (field === 'quantity' || field === 'unitPrice') {
      updated[index].amount = updated[index].quantity * updated[index].unitPrice
    }

    setLineItems(updated)
  }

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.amount, 0)
  }

  const calculateTotal = () => {
    // For simplicity, not including tax/discount in this example
    return calculateSubtotal()
  }

  const handleSubmit = async (isDraft: boolean = false) => {
    // Validation
    if (!companyName || !companyEmail) {
      toast.error('Please fill in company details')
      return
    }

    if (lineItems.length === 0 || lineItems.every(item => !item.description)) {
      toast.error('Please add at least one line item')
      return
    }

    setSaving(true)

    try {
      const request: CreateInvoiceRequest = {
        direction,
        toCompany: {
          name: companyName,
          email: companyEmail,
          address: companyAddress,
          taxId: companyTaxId
        },
        lineItems,
        currency,
        paymentMethod,
        paymentTerms,
        dueDate: new Date(dueDate),
        createEphemeralWallet,
        walletMode,
        walletTTL,
        metadata: {
          notes,
          customerEmail: companyEmail,
          customerName: companyName
        },
        sendEmail: sendEmail && !isDraft
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Store in localStorage for demo
      const invoiceId = `INV-${Date.now()}`
      const invoice = {
        ...request,
        id: invoiceId,
        invoiceNumber: invoiceId,
        status: isDraft ? 'draft' : 'sent',
        createdAt: new Date().toISOString(),
        total: calculateTotal(),
        fromCompany: {
          id: 'company-1',
          name: 'Your Company',
          email: 'billing@yourcompany.com'
        }
      }

      const existingInvoices = JSON.parse(localStorage.getItem('invoices') || '[]')
      existingInvoices.push(invoice)
      localStorage.setItem('invoices', JSON.stringify(existingInvoices))

      // If creating ephemeral wallet, also create wallet record
      if (createEphemeralWallet && !isDraft) {
        const walletId = `wallet-${Date.now()}`
        const wallet = {
          id: walletId,
          invoiceId,
          address: `0x${Math.random().toString(16).substr(2, 40)}`,
          mode: walletMode,
          status: 'active',
          createdAt: new Date().toISOString(),
          expiresAt: walletMode === 'ephemeral'
            ? new Date(Date.now() + walletTTL * 1000).toISOString()
            : null,
          currency,
          balance: 0
        }

        const existingWallets = JSON.parse(localStorage.getItem('invoice_wallets') || '[]')
        existingWallets.push(wallet)
        localStorage.setItem('invoice_wallets', JSON.stringify(existingWallets))
      }

      toast.success(
        isDraft
          ? 'Invoice saved as draft'
          : `Invoice created ${createEphemeralWallet ? 'with ephemeral wallet' : ''}`
      )

      // Redirect back to invoices
      setTimeout(() => router.push('/invoices'), 1500)
    } catch (error) {
      console.error('Failed to create invoice:', error)
      toast.error('Failed to create invoice')
    } finally {
      setSaving(false)
    }
  }

  const getTTLOptions = () => [
    { value: 3600, label: '1 Hour' },
    { value: 21600, label: '6 Hours' },
    { value: 43200, label: '12 Hours' },
    { value: 86400, label: '24 Hours' },
    { value: 172800, label: '48 Hours' },
    { value: 604800, label: '7 Days' },
    { value: 2592000, label: '30 Days' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/invoices')}
            size="icon"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Invoice</h1>
            <p className="text-gray-600 mt-1">
              {direction === 'inbound'
                ? 'Request payment from customer'
                : 'Send payment to vendor'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => handleSubmit(true)}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button
            variant="gradient"
            onClick={() => handleSubmit(false)}
            disabled={saving}
          >
            <Send className="h-4 w-4 mr-2" />
            {saving ? 'Creating...' : 'Create & Send'}
          </Button>
        </div>
      </div>

      {/* Invoice Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Type</CardTitle>
          <CardDescription>
            Choose whether this is an inbound invoice (to receive payment) or outbound (to make payment)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={direction} onValueChange={(v) => setDirection(v as InvoiceDirection)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="inbound" className="flex items-center gap-2">
                <ArrowDownLeft className="h-4 w-4" />
                Inbound (Receivable)
              </TabsTrigger>
              <TabsTrigger value="outbound" className="flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4" />
                Outbound (Payable)
              </TabsTrigger>
            </TabsList>
            <TabsContent value={direction} className="mt-4">
              <div className={`p-4 rounded-lg ${
                direction === 'inbound'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-purple-50 border border-purple-200'
              }`}>
                <div className="flex items-start gap-3">
                  <Info className={`h-5 w-5 mt-0.5 ${
                    direction === 'inbound' ? 'text-green-600' : 'text-purple-600'
                  }`} />
                  <div>
                    <p className={`font-medium ${
                      direction === 'inbound' ? 'text-green-900' : 'text-purple-900'
                    }`}>
                      {direction === 'inbound'
                        ? 'Inbound Invoice - Request Payment'
                        : 'Outbound Invoice - Make Payment'}
                    </p>
                    <p className={`text-sm mt-1 ${
                      direction === 'inbound' ? 'text-green-700' : 'text-purple-700'
                    }`}>
                      {direction === 'inbound'
                        ? 'Create an invoice to request payment from your customer. An ephemeral wallet will be generated to receive the payment.'
                        : 'Create an invoice to pay a vendor or supplier. You can track the payment status and manage approvals.'}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Company Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {direction === 'inbound' ? 'Bill To' : 'Pay To'}
          </CardTitle>
          <CardDescription>
            Search for existing {direction === 'inbound' ? 'customer' : 'vendor'} or enter new details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter Controls */}
          <div className="flex flex-wrap gap-2 items-center pb-2 border-b border-gray-200">
            <Label className="text-sm font-medium text-gray-700">Filters:</Label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="organization">🏢 Organizations</option>
              <option value="individual">👤 Individuals</option>
            </select>

            <select
              value={filterTenantStatus}
              onChange={(e) => setFilterTenantStatus(e.target.value as any)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="monay_tenant">💼 Monay Tenants</option>
              <option value="external">🌐 External Contacts</option>
            </select>

            <select
              value={filterVerified}
              onChange={(e) => setFilterVerified(e.target.value as any)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Verification</option>
              <option value="verified">✅ Verified</option>
              <option value="pending">⏳ Pending</option>
              <option value="unverified">❌ Unverified</option>
            </select>

            {(filterType !== 'all' || filterTenantStatus !== 'all' || filterVerified !== 'all') && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterType('all')
                  setFilterTenantStatus('all')
                  setFilterVerified('all')
                }}
                className="text-xs text-gray-600 hover:text-gray-900"
              >
                <X className="h-3 w-3 mr-1" />
                Clear Filters
              </Button>
            )}

            {loadingContacts && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <div className="animate-spin h-3 w-3 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                Loading...
              </span>
            )}
          </div>

          {/* Company Search */}
          <div className="relative" ref={dropdownRef}>
            <Label htmlFor="companySearch">Company/Contact Search</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="companySearch"
                type="text"
                value={companySearch}
                onChange={(e) => handleCompanySearchChange(e.target.value)}
                onFocus={() => setShowCompanyDropdown(true)}
                placeholder="Search by company name, email, or contact person..."
                className="pl-10 pr-20"
              />
              <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex gap-1">
                {showCompanyDropdown && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowCompanyDropdown(false)}
                    title="Close dropdown"
                  >
                    <ChevronDown className="h-4 w-4 rotate-180" />
                  </Button>
                )}
                {companySearch && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                    onClick={() => {
                      setCompanySearch('')
                      setShowCompanyDropdown(false)
                      setSelectedCompany(null)
                    }}
                    title="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Search Dropdown */}
            {showCompanyDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                {filteredCompanies.length > 0 ? (
                  <>
                    {filteredCompanies.map((company) => (
                      <button
                        key={company.id}
                        type="button"
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        onClick={() => handleCompanySelect(company)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {company.type === 'organization' ? (
                                <Building className="h-4 w-4 text-blue-500" />
                              ) : (
                                <User className="h-4 w-4 text-green-500" />
                              )}
                              <span className="font-medium text-gray-900">{company.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {company.type === 'organization' ? '🏢 Org' : '👤 Individual'}
                              </Badge>
                              {company.isMonayTenant ? (
                                <Badge className="bg-blue-100 text-blue-800 text-xs">
                                  <Wallet className="h-3 w-3 mr-1" />
                                  Monay Tenant
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs text-gray-600">
                                  External
                                </Badge>
                              )}
                              {company.isVerified && (
                                <Badge className="bg-green-100 text-green-800 text-xs">✓ Verified</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{company.email}</p>
                            {company.contactPerson && (
                              <p className="text-xs text-gray-500">Contact: {company.contactPerson}</p>
                            )}
                            <div className="flex items-center gap-3 mt-1">
                              {company.lastUsed && (
                                <p className="text-xs text-gray-400">Last used: {company.lastUsed}</p>
                              )}
                              {!company.isMonayTenant && (
                                <p className="text-xs text-orange-600">
                                  • No KYB/KYC required
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <Badge variant="secondary" className="text-xs">
                              {company.type === 'organization' ? 'Org' : 'Consumer'}
                            </Badge>
                            {company.isMonayTenant && (
                              <div className="text-xs text-blue-600">
                                {company.type === 'organization' ? (
                                  company.kybStatus === 'approved' ? '✓ KYB Approved' : `KYB: ${company.kybStatus}`
                                ) : (
                                  company.kycStatus === 'approved' ? '✓ KYC Approved' : `KYC: ${company.kycStatus}`
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                    <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
                      <div className="space-y-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="w-full text-left justify-start"
                          onClick={handleNewContactClick}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add new organization/contact
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="w-full text-left justify-start text-gray-600"
                          onClick={handleManualEntry}
                        >
                          Enter details manually
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="px-4 py-6 text-center">
                    <p className="text-gray-500 mb-3">No companies found</p>
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleNewContactClick}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add new contact
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleManualEntry}
                        className="text-gray-600"
                      >
                        Or enter manually
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected Company Display */}
          {selectedCompany && !isManualEntry && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {selectedCompany.type === 'organization' ? (
                    <Building className="h-5 w-5 text-blue-600" />
                  ) : (
                    <User className="h-5 w-5 text-green-600" />
                  )}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-blue-900">{selectedCompany.name}</h3>
                      {selectedCompany.isVerified && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {selectedCompany.isMonayTenant ? (
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          <Wallet className="h-3 w-3 mr-1" />
                          Monay Tenant
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                          External Contact
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-blue-700">{selectedCompany.email}</p>
                    {selectedCompany.contactPerson && (
                      <p className="text-sm text-blue-600">Contact: {selectedCompany.contactPerson}</p>
                    )}
                    {!selectedCompany.isMonayTenant && (
                      <p className="text-xs text-orange-700 mt-1">
                        • No KYB/KYC verification required
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleEditSelectedCompany}
                >
                  Edit Details
                </Button>
              </div>
            </div>
          )}

          {/* Form Fields - Show when manual entry or company selected */}
          {(isManualEntry || selectedCompany) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Corporation"
                  required
                  disabled={selectedCompany && !isManualEntry}
                  className={selectedCompany && !isManualEntry ? 'bg-gray-50' : ''}
                />
              </div>
              <div>
                <Label htmlFor="companyEmail">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="companyEmail"
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    placeholder="billing@company.com"
                    className={`pl-10 ${selectedCompany && !isManualEntry ? 'bg-gray-50' : ''}`}
                    disabled={selectedCompany && !isManualEntry}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="companyAddress">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="companyAddress"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    placeholder="123 Main St, City, State"
                    className={`pl-10 ${selectedCompany && !isManualEntry ? 'bg-gray-50' : ''}`}
                    disabled={selectedCompany && !isManualEntry}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="companyTaxId">
                  Tax ID
                  {selectedCompany && selectedCompany.taxId && (
                    <span className="text-xs text-gray-500 ml-2">
                      (showing last 4 digits only)
                    </span>
                  )}
                </Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="companyTaxId"
                    value={selectedCompany && !isManualEntry ? formatTaxId(companyTaxId) : companyTaxId}
                    onChange={(e) => setCompanyTaxId(e.target.value)}
                    placeholder="XX-XXXXXXX"
                    className={`pl-10 ${selectedCompany && !isManualEntry ? 'bg-gray-50' : ''}`}
                    disabled={selectedCompany && !isManualEntry}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Call to action when no selection */}
          {!selectedCompany && !isManualEntry && (
            <div className="text-center py-8 text-gray-500">
              <Building className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="mb-2">Search for an existing company or contact above</p>
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleNewContactClick}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add new organization/contact
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleManualEntry}
                  className="text-gray-600"
                >
                  Or enter details manually
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Line Items</span>
            <Button variant="outline" size="sm" onClick={addLineItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lineItems.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-5">
                  <Label>Description</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                    placeholder="Product or service description"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="1"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Unit Price</Label>
                  <Input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Amount</Label>
                  <Input
                    value={item.amount.toFixed(2)}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div className="col-span-1">
                  {lineItems.length > 1 && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeLineItem(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium">
                    {calculateSubtotal().toFixed(2)} {currency}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{calculateTotal().toFixed(2)} {currency}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Details */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="currency">Currency</Label>
              <select
                id="currency"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
              >
                <option value="USD">USD - US Dollar</option>
                <option value="USDC">USDC - USD Coin</option>
                <option value="USDT">USDT - Tether</option>
                <option value="PYUSD">PYUSD - PayPal USD</option>
              </select>
            </div>
            <div>
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <select
                id="paymentTerms"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
              >
                <option value="Due on Receipt">Due on Receipt</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 45">Net 45</option>
                <option value="Net 60">Net 60</option>
              </select>
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice-First Wallet Options */}
      {direction === 'inbound' && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-orange-600" />
              Invoice-First Wallet Generation
            </CardTitle>
            <CardDescription>
              Configure ephemeral wallet for secure payment collection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Label htmlFor="ephemeralWallet" className="cursor-pointer">
                  Generate Ephemeral Wallet
                </Label>
                <Badge className="bg-orange-100 text-orange-800">Recommended</Badge>
              </div>
              <Switch
                id="ephemeralWallet"
                checked={createEphemeralWallet}
                onCheckedChange={setCreateEphemeralWallet}
              />
            </div>

            {createEphemeralWallet && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 pt-4 border-t"
              >
                <div>
                  <Label>Wallet Mode</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setWalletMode('ephemeral')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        walletMode === 'ephemeral'
                          ? 'border-orange-500 bg-orange-100'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Clock className="h-5 w-5 mx-auto mb-1 text-orange-600" />
                      <p className="text-sm font-medium">Ephemeral</p>
                      <p className="text-xs text-gray-600 mt-1">Auto-expires</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setWalletMode('persistent')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        walletMode === 'persistent'
                          ? 'border-blue-500 bg-blue-100'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Shield className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                      <p className="text-sm font-medium">Persistent</p>
                      <p className="text-xs text-gray-600 mt-1">Never expires</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setWalletMode('adaptive')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        walletMode === 'adaptive'
                          ? 'border-purple-500 bg-purple-100'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Zap className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                      <p className="text-sm font-medium">Adaptive</p>
                      <p className="text-xs text-gray-600 mt-1">Smart mode</p>
                    </button>
                  </div>
                </div>

                {walletMode === 'ephemeral' && (
                  <div>
                    <Label htmlFor="walletTTL">Wallet Expiry (TTL)</Label>
                    <select
                      id="walletTTL"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white mt-2"
                      value={walletTTL}
                      onChange={(e) => setWalletTTL(parseInt(e.target.value))}
                    >
                      {getTTLOptions().map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-gray-600 mt-2">
                      The wallet will automatically expire after this period if payment is not received
                    </p>
                  </div>
                )}

                <div className="p-4 bg-orange-100 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-orange-900">How it works</p>
                      <ul className="text-sm text-orange-700 mt-2 space-y-1">
                        <li>• A unique wallet address is generated for this invoice</li>
                        <li>• Customer can only pay to this specific wallet</li>
                        <li>• Funds are automatically reconciled with the invoice</li>
                        {walletMode === 'ephemeral' && (
                          <li>• Wallet expires after {getTTLOptions().find(o => o.value === walletTTL)?.label}</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Additional Options */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes or payment instructions..."
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sendEmail" className="cursor-pointer">
              Send email notification to {direction === 'inbound' ? 'customer' : 'vendor'}
            </Label>
            <Switch
              id="sendEmail"
              checked={sendEmail}
              onCheckedChange={setSendEmail}
            />
          </div>
        </CardContent>
      </Card>

      {/* New Contact Creation Modal */}
      <Dialog open={showNewContactModal} onOpenChange={setShowNewContactModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
            <DialogDescription>
              Create a new {newContactType === 'organization' ? 'organization' : 'consumer'} contact.
              This contact will not be a Monay tenant and won't require KYB/KYC until they sign up.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Contact Type Selection */}
            <div>
              <Label>Contact Type</Label>
              <Tabs value={newContactType} onValueChange={(v) => setNewContactType(v as 'organization' | 'consumer')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="organization" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Organization
                  </TabsTrigger>
                  <TabsTrigger value="consumer" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Consumer
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="newContactName">
                  {newContactType === 'organization' ? 'Organization Name' : 'Full Name'} *
                </Label>
                <Input
                  id="newContactName"
                  value={newContactForm.name}
                  onChange={(e) => setNewContactForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={newContactType === 'organization' ? 'Acme Corporation' : 'John Doe'}
                  required
                />
              </div>

              <div>
                <Label htmlFor="newContactEmail">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="newContactEmail"
                    type="email"
                    value={newContactForm.email}
                    onChange={(e) => setNewContactForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="contact@example.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="newContactPhone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="newContactPhone"
                    value={newContactForm.phone}
                    onChange={(e) => setNewContactForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="newContactAddress">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="newContactAddress"
                    value={newContactForm.address}
                    onChange={(e) => setNewContactForm(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="123 Main St, City, State, ZIP"
                    className="pl-10"
                  />
                </div>
              </div>

              {newContactType === 'organization' && (
                <>
                  <div>
                    <Label htmlFor="newContactTaxId">Tax ID</Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="newContactTaxId"
                        value={newContactForm.taxId}
                        onChange={(e) => setNewContactForm(prev => ({ ...prev, taxId: e.target.value }))}
                        placeholder="XX-XXXXXXX"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="newContactWebsite">Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="newContactWebsite"
                        value={newContactForm.website}
                        onChange={(e) => setNewContactForm(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://example.com"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="newContactPerson">Primary Contact Person</Label>
                    <Input
                      id="newContactPerson"
                      value={newContactForm.contactPerson}
                      onChange={(e) => setNewContactForm(prev => ({ ...prev, contactPerson: e.target.value }))}
                      placeholder="John Smith, CFO"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Information Notice */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">External Contact</p>
                  <p className="text-sm text-blue-700 mt-1">
                    This contact will be marked as an external contact (not a Monay tenant).
                    They won't require KYB/KYC verification unless they later sign up for
                    Monay Enterprise Wallet or Consumer Wallet services.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowNewContactModal(false)
                resetNewContactForm()
              }}
              disabled={creatingContact}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateNewContact}
              disabled={creatingContact || !newContactForm.name || !newContactForm.email}
            >
              {creatingContact ? 'Creating...' : `Create ${newContactType === 'organization' ? 'Organization' : 'Contact'}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}