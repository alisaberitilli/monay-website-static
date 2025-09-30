'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  FileText, Plus, Edit2, Trash2, Copy, Star, StarOff,
  Calendar, DollarSign, RefreshCw, Search, Filter,
  ArrowLeft, Settings, CheckCircle, Clock, MoreVertical
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { InvoiceTemplate, Currency, PaymentMethod } from '@/types/invoice'

export default function InvoiceTemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showRecurring, setShowRecurring] = useState<boolean | null>(null)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    setLoading(true)
    // Mock template data
    const mockTemplates: InvoiceTemplate[] = [
      {
        id: '1',
        name: 'Monthly Subscription',
        description: 'Standard monthly subscription invoice',
        isDefault: true,
        lineItems: [
          { description: 'Monthly Subscription Fee', quantity: 1, unitPrice: 99, amount: 99 }
        ],
        paymentTerms: 'Due on Receipt',
        currency: 'USDC',
        paymentMethod: 'usdc',
        isRecurring: true,
        recurrencePattern: 'monthly',
        recurrenceDay: 1,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-15')
      },
      {
        id: '2',
        name: 'Consulting Services',
        description: 'Hourly consulting services invoice',
        isDefault: false,
        lineItems: [
          { description: 'Consulting Services', quantity: 10, unitPrice: 150, amount: 1500 },
          { description: 'Travel Expenses', quantity: 1, unitPrice: 0, amount: 0 }
        ],
        paymentTerms: 'Net 30',
        currency: 'USD',
        paymentMethod: 'ach',
        isRecurring: false,
        createdAt: new Date('2025-01-05'),
        updatedAt: new Date('2025-01-20')
      },
      {
        id: '3',
        name: 'SaaS Annual Plan',
        description: 'Annual enterprise SaaS subscription',
        isDefault: false,
        lineItems: [
          { description: 'Enterprise Plan - Annual', quantity: 1, unitPrice: 12000, amount: 12000 },
          { description: 'Implementation Fee', quantity: 1, unitPrice: 2000, amount: 2000 },
          { description: 'Training (per seat)', quantity: 10, unitPrice: 100, amount: 1000 }
        ],
        paymentTerms: 'Net 45',
        currency: 'USDC',
        paymentMethod: 'usdc',
        isRecurring: true,
        recurrencePattern: 'yearly',
        createdAt: new Date('2025-01-10'),
        updatedAt: new Date('2025-01-10')
      },
      {
        id: '4',
        name: 'Product Sale',
        description: 'Standard product sale invoice',
        isDefault: false,
        lineItems: [
          { description: 'Product Item', quantity: 1, unitPrice: 0, amount: 0 }
        ],
        paymentTerms: 'Net 15',
        currency: 'USDT',
        paymentMethod: 'usdt',
        isRecurring: false,
        createdAt: new Date('2025-01-12'),
        updatedAt: new Date('2025-01-12')
      },
      {
        id: '5',
        name: 'Quarterly Maintenance',
        description: 'Quarterly maintenance and support',
        isDefault: false,
        lineItems: [
          { description: 'Quarterly Maintenance', quantity: 1, unitPrice: 500, amount: 500 },
          { description: 'Support Hours', quantity: 5, unitPrice: 100, amount: 500 }
        ],
        paymentTerms: 'Due on Receipt',
        currency: 'PYUSD',
        paymentMethod: 'pyusd',
        isRecurring: true,
        recurrencePattern: 'quarterly',
        createdAt: new Date('2025-01-15'),
        updatedAt: new Date('2025-01-15')
      }
    ]
    setTemplates(mockTemplates)
    setLoading(false)
  }

  const handleSetDefault = async (templateId: string) => {
    const updatedTemplates = templates.map(t => ({
      ...t,
      isDefault: t.id === templateId
    }))
    setTemplates(updatedTemplates)
    toast.success('Default template updated')
  }

  const handleDuplicate = async (template: InvoiceTemplate) => {
    const newTemplate: InvoiceTemplate = {
      ...template,
      id: `${Date.now()}`,
      name: `${template.name} (Copy)`,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setTemplates([...templates, newTemplate])
    toast.success('Template duplicated')
  }

  const handleDelete = async (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter(t => t.id !== templateId))
      toast.success('Template deleted')
    }
  }

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = !searchTerm ||
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRecurring = showRecurring === null ||
      template.isRecurring === showRecurring

    return matchesSearch && matchesRecurring
  })

  const calculateTemplateTotal = (template: InvoiceTemplate) => {
    return template.lineItems.reduce((sum, item) => sum + item.amount, 0)
  }

  const formatCurrency = (amount: number, currency: Currency) => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount)
    }
    return `${amount.toLocaleString()} ${currency}`
  }

  const getRecurrenceLabel = (template: InvoiceTemplate) => {
    if (!template.isRecurring) return null

    const labels = {
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      yearly: 'Yearly',
      custom: 'Custom'
    }

    return labels[template.recurrencePattern || 'custom']
  }

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
            <h1 className="text-3xl font-bold">Invoice Templates</h1>
            <p className="text-gray-600 mt-1">
              Manage reusable invoice templates for faster creation
            </p>
          </div>
        </div>
        <Button
          variant="gradient"
          onClick={() => router.push('/invoices/templates/create')}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Templates</p>
                <p className="text-2xl font-bold">{templates.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Recurring</p>
                <p className="text-2xl font-bold">
                  {templates.filter(t => t.isRecurring).length}
                </p>
              </div>
              <RefreshCw className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">One-Time</p>
                <p className="text-2xl font-bold">
                  {templates.filter(t => !t.isRecurring).length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Default</p>
                <p className="text-lg font-medium">
                  {templates.find(t => t.isDefault)?.name || 'None'}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={showRecurring === null ? 'gradient' : 'outline'}
                onClick={() => setShowRecurring(null)}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={showRecurring === true ? 'gradient' : 'outline'}
                onClick={() => setShowRecurring(true)}
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Recurring
              </Button>
              <Button
                variant={showRecurring === false ? 'gradient' : 'outline'}
                onClick={() => setShowRecurring(false)}
                size="sm"
              >
                <FileText className="h-4 w-4 mr-1" />
                One-Time
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading templates...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Templates Found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || showRecurring !== null
                ? 'No templates match your criteria'
                : 'Create your first invoice template'}
            </p>
            <Button variant="gradient" onClick={() => router.push('/invoices/templates/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTemplates.map((template) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        {template.isDefault && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Star className="h-3 w-3 mr-1" />
                            Default
                          </Badge>
                        )}
                        {template.isRecurring && (
                          <Badge className="bg-green-100 text-green-800">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            {getRecurrenceLabel(template)}
                          </Badge>
                        )}
                      </div>
                      {template.description && (
                        <CardDescription className="mt-1">
                          {template.description}
                        </CardDescription>
                      )}
                    </div>
                    <Button variant="outline" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Line Items Preview */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-500 mb-2">LINE ITEMS</p>
                    {template.lineItems.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex justify-between text-sm py-1">
                        <span className="text-gray-600">{item.description}</span>
                        <span className="font-medium">
                          {formatCurrency(item.amount, template.currency)}
                        </span>
                      </div>
                    ))}
                    {template.lineItems.length > 3 && (
                      <p className="text-xs text-gray-500 mt-1">
                        +{template.lineItems.length - 3} more items
                      </p>
                    )}
                    <div className="flex justify-between text-sm font-bold pt-2 mt-2 border-t">
                      <span>Total</span>
                      <span>{formatCurrency(calculateTemplateTotal(template), template.currency)}</span>
                    </div>
                  </div>

                  {/* Template Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Payment Terms</p>
                      <p className="font-medium">{template.paymentTerms}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Currency</p>
                      <p className="font-medium">{template.currency}</p>
                    </div>
                    {template.isRecurring && template.recurrenceDay && (
                      <div className="col-span-2">
                        <p className="text-gray-500">Recurrence</p>
                        <p className="font-medium">
                          {getRecurrenceLabel(template)} on day {template.recurrenceDay}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="gradient"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/invoices/create?templateId=${template.id}`)}
                    >
                      Use Template
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDuplicate(template)}
                      title="Duplicate"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleSetDefault(template.id)}
                      title={template.isDefault ? 'Remove default' : 'Set as default'}
                    >
                      {template.isDefault ? (
                        <StarOff className="h-4 w-4" />
                      ) : (
                        <Star className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => router.push(`/invoices/templates/${template.id}/edit`)}
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(template.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between text-xs text-gray-500 pt-2">
                    <span>Created {template.createdAt.toLocaleDateString()}</span>
                    <span>Updated {template.updatedAt.toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}