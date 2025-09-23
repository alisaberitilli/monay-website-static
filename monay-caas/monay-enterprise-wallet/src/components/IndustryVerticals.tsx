'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Activity,
  Building,
  Car,
  CreditCard,
  DollarSign,
  FileText,
  Globe,
  Heart,
  Home,
  Landmark,
  Package,
  Plane,
  Settings,
  Shield,
  ShoppingBag,
  Truck,
  Users,
  Zap,
  Briefcase,
  GraduationCap,
  Gamepad2,
  Stethoscope,
  Factory,
  TreePine,
  Hammer,
  Coffee
} from 'lucide-react'

interface IndustryVertical {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  description: string
  features: string[]
  compliance: string[]
  volume: number
  revenue: number
  active: boolean
  config: {
    paymentMethods: string[]
    settlementTime: number
    maxTransactionLimit: number
    requiresEscrow: boolean
    customRules: any[]
  }
}

interface VerticalTransaction {
  id: string
  verticalId: string
  amount: number
  status: string
  timestamp: Date
  metadata: any
}

export default function IndustryVerticals() {
  const [selectedVertical, setSelectedVertical] = useState<IndustryVertical | null>(null)
  const [verticals, setVerticals] = useState<IndustryVertical[]>([])
  const [transactions, setTransactions] = useState<VerticalTransaction[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  // Initialize all 15 industry verticals
  useEffect(() => {
    setVerticals([
      {
        id: 'healthcare',
        name: 'Healthcare & Medical',
        icon: <Stethoscope className="h-5 w-5" />,
        color: 'bg-red-500',
        description: 'HIPAA-compliant payment processing for healthcare providers',
        features: ['HIPAA Compliance', 'Patient Payment Plans', 'Insurance Claims', 'HSA/FSA Integration'],
        compliance: ['HIPAA', 'PCI-DSS', 'HITECH'],
        volume: 45000,
        revenue: 2340000,
        active: true,
        config: {
          paymentMethods: ['ACH', 'Card', 'HSA', 'FSA'],
          settlementTime: 48,
          maxTransactionLimit: 50000,
          requiresEscrow: false,
          customRules: ['patient_data_encryption', 'insurance_verification']
        }
      },
      {
        id: 'ecommerce',
        name: 'E-commerce & Retail',
        icon: <ShoppingBag className="h-5 w-5" />,
        color: 'bg-blue-500',
        description: 'High-volume payment processing for online and retail stores',
        features: ['Shopping Cart Integration', 'Inventory Management', 'Multi-currency', 'Fraud Detection'],
        compliance: ['PCI-DSS', 'GDPR'],
        volume: 120000,
        revenue: 5600000,
        active: true,
        config: {
          paymentMethods: ['Card', 'PayPal', 'BNPL', 'Crypto'],
          settlementTime: 24,
          maxTransactionLimit: 10000,
          requiresEscrow: false,
          customRules: ['fraud_scoring', 'chargeback_protection']
        }
      },
      {
        id: 'realestate',
        name: 'Real Estate',
        icon: <Home className="h-5 w-5" />,
        color: 'bg-green-500',
        description: 'Escrow and closing payment solutions for real estate transactions',
        features: ['Escrow Services', 'Title Company Integration', 'Commission Splitting', 'Earnest Money'],
        compliance: ['RESPA', 'TRID', 'AML'],
        volume: 3400,
        revenue: 12000000,
        active: true,
        config: {
          paymentMethods: ['Wire', 'ACH', 'Check'],
          settlementTime: 72,
          maxTransactionLimit: 5000000,
          requiresEscrow: true,
          customRules: ['title_verification', 'dual_approval']
        }
      },
      {
        id: 'gaming',
        name: 'Gaming & Entertainment',
        icon: <Gamepad2 className="h-5 w-5" />,
        color: 'bg-purple-500',
        description: 'In-game purchases and digital content payments',
        features: ['Microtransactions', 'Virtual Currency', 'Subscription Management', 'Parental Controls'],
        compliance: ['COPPA', 'ESRB'],
        volume: 230000,
        revenue: 3400000,
        active: true,
        config: {
          paymentMethods: ['Card', 'Digital Wallet', 'Prepaid', 'Crypto'],
          settlementTime: 24,
          maxTransactionLimit: 500,
          requiresEscrow: false,
          customRules: ['age_verification', 'spending_limits']
        }
      },
      {
        id: 'transportation',
        name: 'Transportation & Logistics',
        icon: <Truck className="h-5 w-5" />,
        color: 'bg-yellow-500',
        description: 'Fleet management and freight payment solutions',
        features: ['Fuel Cards', 'Fleet Tracking', 'Cross-border Payments', 'Driver Settlements'],
        compliance: ['DOT', 'FMCSA'],
        volume: 18000,
        revenue: 4500000,
        active: true,
        config: {
          paymentMethods: ['Fleet Card', 'ACH', 'Fuel Card'],
          settlementTime: 48,
          maxTransactionLimit: 25000,
          requiresEscrow: false,
          customRules: ['route_verification', 'fuel_purchase_limits']
        }
      },
      {
        id: 'education',
        name: 'Education & EdTech',
        icon: <GraduationCap className="h-5 w-5" />,
        color: 'bg-indigo-500',
        description: 'Tuition processing and educational payment plans',
        features: ['Tuition Plans', '529 Integration', 'Financial Aid', 'Student Billing'],
        compliance: ['FERPA', 'Title IV'],
        volume: 8900,
        revenue: 6700000,
        active: true,
        config: {
          paymentMethods: ['ACH', 'Card', '529 Plan', 'Financial Aid'],
          settlementTime: 24,
          maxTransactionLimit: 100000,
          requiresEscrow: false,
          customRules: ['enrollment_verification', 'payment_plan_management']
        }
      },
      {
        id: 'government',
        name: 'Government & Public Sector',
        icon: <Landmark className="h-5 w-5" />,
        color: 'bg-gray-500',
        description: 'Government payment processing and disbursements',
        features: ['Tax Payments', 'Permit Fees', 'Fine Collection', 'Benefits Distribution'],
        compliance: ['FedRAMP', 'FISMA', 'StateRAMP'],
        volume: 34000,
        revenue: 8900000,
        active: true,
        config: {
          paymentMethods: ['ACH', 'Check', 'Card'],
          settlementTime: 72,
          maxTransactionLimit: 1000000,
          requiresEscrow: false,
          customRules: ['identity_verification', 'audit_trail']
        }
      },
      {
        id: 'nonprofit',
        name: 'Non-Profit & Charitable',
        icon: <Heart className="h-5 w-5" />,
        color: 'bg-pink-500',
        description: 'Donation processing and grant management',
        features: ['Recurring Donations', 'Grant Management', 'Donor CRM', 'Tax Receipts'],
        compliance: ['501(c)(3)', 'IRS'],
        volume: 45000,
        revenue: 2100000,
        active: true,
        config: {
          paymentMethods: ['Card', 'ACH', 'PayPal', 'Crypto'],
          settlementTime: 24,
          maxTransactionLimit: 50000,
          requiresEscrow: false,
          customRules: ['tax_receipt_generation', 'donor_privacy']
        }
      },
      {
        id: 'insurance',
        name: 'Insurance & Financial Services',
        icon: <Shield className="h-5 w-5" />,
        color: 'bg-teal-500',
        description: 'Premium collection and claims disbursement',
        features: ['Premium Collection', 'Claims Processing', 'Reinsurance', 'Commission Management'],
        compliance: ['SOX', 'NAIC', 'State Insurance'],
        volume: 12000,
        revenue: 15000000,
        active: true,
        config: {
          paymentMethods: ['ACH', 'Wire', 'Check'],
          settlementTime: 48,
          maxTransactionLimit: 500000,
          requiresEscrow: false,
          customRules: ['underwriting_approval', 'claims_verification']
        }
      },
      {
        id: 'manufacturing',
        name: 'Manufacturing & Supply Chain',
        icon: <Factory className="h-5 w-5" />,
        color: 'bg-orange-500',
        description: 'B2B payments and supply chain financing',
        features: ['Purchase Orders', 'Invoice Financing', 'Supply Chain Finance', 'Vendor Management'],
        compliance: ['ISO 9001', 'SOC 2'],
        volume: 5600,
        revenue: 23000000,
        active: true,
        config: {
          paymentMethods: ['Wire', 'ACH', 'Letter of Credit'],
          settlementTime: 120,
          maxTransactionLimit: 10000000,
          requiresEscrow: true,
          customRules: ['po_matching', 'quality_inspection']
        }
      },
      {
        id: 'agriculture',
        name: 'Agriculture & Food',
        icon: <TreePine className="h-5 w-5" />,
        color: 'bg-lime-500',
        description: 'Agricultural commodity and farm payment solutions',
        features: ['Commodity Trading', 'Farm Loans', 'Crop Insurance', 'Equipment Financing'],
        compliance: ['USDA', 'FDA'],
        volume: 7800,
        revenue: 9800000,
        active: true,
        config: {
          paymentMethods: ['ACH', 'Wire', 'Commodity Exchange'],
          settlementTime: 96,
          maxTransactionLimit: 2000000,
          requiresEscrow: true,
          customRules: ['weather_contingency', 'crop_verification']
        }
      },
      {
        id: 'professional',
        name: 'Professional Services',
        icon: <Briefcase className="h-5 w-5" />,
        color: 'bg-slate-500',
        description: 'Legal, consulting, and professional service billing',
        features: ['Trust Accounting', 'Retainer Management', 'Time Billing', 'Expense Tracking'],
        compliance: ['IOLTA', 'Bar Association'],
        volume: 23000,
        revenue: 7600000,
        active: true,
        config: {
          paymentMethods: ['ACH', 'Wire', 'Check', 'Card'],
          settlementTime: 24,
          maxTransactionLimit: 250000,
          requiresEscrow: true,
          customRules: ['trust_accounting', 'retainer_management']
        }
      },
      {
        id: 'energy',
        name: 'Energy & Utilities',
        icon: <Zap className="h-5 w-5" />,
        color: 'bg-amber-500',
        description: 'Utility billing and energy trading payments',
        features: ['Utility Billing', 'Energy Trading', 'Smart Meter Integration', 'Budget Billing'],
        compliance: ['NERC', 'FERC'],
        volume: 89000,
        revenue: 34000000,
        active: true,
        config: {
          paymentMethods: ['ACH', 'Card', 'AutoPay'],
          settlementTime: 24,
          maxTransactionLimit: 50000,
          requiresEscrow: false,
          customRules: ['usage_verification', 'shutoff_protection']
        }
      },
      {
        id: 'construction',
        name: 'Construction & Development',
        icon: <Hammer className="h-5 w-5" />,
        color: 'bg-stone-500',
        description: 'Construction project payments and lien waivers',
        features: ['Progress Payments', 'Lien Waivers', 'Retainage', 'Subcontractor Payments'],
        compliance: ['Davis-Bacon', 'Miller Act'],
        volume: 4500,
        revenue: 18000000,
        active: true,
        config: {
          paymentMethods: ['Wire', 'ACH', 'Check'],
          settlementTime: 120,
          maxTransactionLimit: 5000000,
          requiresEscrow: true,
          customRules: ['lien_waiver', 'progress_verification']
        }
      },
      {
        id: 'hospitality',
        name: 'Hospitality & Travel',
        icon: <Coffee className="h-5 w-5" />,
        color: 'bg-cyan-500',
        description: 'Hotel, restaurant, and travel payment processing',
        features: ['Room Charges', 'Restaurant POS', 'Travel Booking', 'Loyalty Programs'],
        compliance: ['PCI-DSS', 'ADA'],
        volume: 67000,
        revenue: 12000000,
        active: true,
        config: {
          paymentMethods: ['Card', 'Room Charge', 'Mobile Pay'],
          settlementTime: 24,
          maxTransactionLimit: 10000,
          requiresEscrow: false,
          customRules: ['tip_processing', 'split_billing']
        }
      }
    ])
  }, [])

  const handleVerticalActivation = async (verticalId: string) => {
    setIsProcessing(true)
    try {
      const response = await fetch('http://localhost:3001/api/verticals/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verticalId,
          organizationId: 'ORG001',
          config: verticals.find(v => v.id === verticalId)?.config
        })
      })

      const result = await response.json()
      if (result.success) {
        setVerticals(prev => prev.map(v =>
          v.id === verticalId ? { ...v, active: true } : v
        ))
      }
    } catch (error) {
      console.error('Failed to activate vertical:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const processTransaction = async (verticalId: string, data: any) => {
    setIsProcessing(true)
    try {
      const response = await fetch('http://localhost:3001/api/verticals/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verticalId,
          ...data
        })
      })

      const result = await response.json()
      if (result.success) {
        setTransactions(prev => [...prev, result.data])
      }
    } catch (error) {
      console.error('Transaction failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Industry Overview Grid */}
      <div className="grid grid-cols-4 gap-3">
        {verticals.map(vertical => (
          <Card
            key={vertical.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedVertical?.id === vertical.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedVertical(vertical)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className={`p-2 rounded-lg ${vertical.color} text-white`}>
                  {vertical.icon}
                </div>
                {vertical.active && (
                  <Badge variant="default" className="bg-green-500">Active</Badge>
                )}
              </div>
              <h3 className="font-medium text-sm mb-1">{vertical.name}</h3>
              <p className="text-xs text-muted-foreground mb-2">{vertical.description}</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Volume</span>
                  <span className="font-medium">{vertical.volume.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Revenue</span>
                  <span className="font-medium">${(vertical.revenue / 1000000).toFixed(1)}M</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Vertical Details */}
      {selectedVertical && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${selectedVertical.color} text-white`}>
                {selectedVertical.icon}
              </div>
              {selectedVertical.name} Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="features" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
                <TabsTrigger value="config">Configuration</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
              </TabsList>

              <TabsContent value="features" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {selectedVertical.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {!selectedVertical.active && (
                  <Button
                    onClick={() => handleVerticalActivation(selectedVertical.id)}
                    disabled={isProcessing}
                    className="w-full"
                  >
                    Activate {selectedVertical.name}
                  </Button>
                )}
              </TabsContent>

              <TabsContent value="compliance" className="space-y-4">
                <div className="space-y-2">
                  {selectedVertical.compliance.map((comp, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{comp}</span>
                      </div>
                      <Badge variant="outline">Compliant</Badge>
                    </div>
                  ))}
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    All transactions are automatically validated against {selectedVertical.name} compliance requirements.
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="config" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Payment Methods</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedVertical.config.paymentMethods.map((method, index) => (
                        <Badge key={index} variant="secondary">{method}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Settlement Time</Label>
                    <p className="text-lg font-medium">{selectedVertical.config.settlementTime} hours</p>
                  </div>
                  <div>
                    <Label>Transaction Limit</Label>
                    <p className="text-lg font-medium">${selectedVertical.config.maxTransactionLimit.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label>Escrow Required</Label>
                    <p className="text-lg font-medium">{selectedVertical.config.requiresEscrow ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                <div>
                  <Label>Custom Business Rules</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedVertical.config.customRules.map((rule, index) => (
                      <Badge key={index} variant="outline">{rule.replace('_', ' ')}</Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="transactions" className="space-y-4">
                <form onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  processTransaction(selectedVertical.id, {
                    amount: parseFloat(formData.get('amount') as string),
                    description: formData.get('description'),
                    paymentMethod: formData.get('paymentMethod')
                  })
                }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        name="amount"
                        type="number"
                        placeholder="0.00"
                        max={selectedVertical.config.maxTransactionLimit}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="paymentMethod">Payment Method</Label>
                      <select id="paymentMethod" name="paymentMethod" className="w-full p-2 border rounded-md">
                        {selectedVertical.config.paymentMethods.map(method => (
                          <option key={method} value={method}>{method}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" name="description" placeholder="Transaction description" required />
                  </div>

                  <Button type="submit" disabled={isProcessing || !selectedVertical.active} className="w-full">
                    Process {selectedVertical.name} Transaction
                  </Button>
                </form>

                {transactions.filter(t => t.verticalId === selectedVertical.id).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Recent Transactions</h4>
                    {transactions
                      .filter(t => t.verticalId === selectedVertical.id)
                      .slice(0, 5)
                      .map(transaction => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">${transaction.amount.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <Badge>{transaction.status}</Badge>
                        </div>
                      ))
                    }
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Industry Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Industry Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold">{verticals.filter(v => v.active).length}/15</p>
              <p className="text-sm text-muted-foreground">Active Industries</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{verticals.reduce((sum, v) => sum + v.volume, 0).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Transactions</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">${(verticals.reduce((sum, v) => sum + v.revenue, 0) / 1000000).toFixed(1)}M</p>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}