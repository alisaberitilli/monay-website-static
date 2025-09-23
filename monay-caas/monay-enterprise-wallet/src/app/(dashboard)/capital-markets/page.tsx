'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Plus,
  Layers,
  Package,
  TrendingUp,
  Shield,
  Zap,
  Lock,
  Eye,
  Edit,
  Trash2,
  Rocket,
  Download,
  Copy,
  ExternalLink,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function CapitalMarketsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('ruleSets')
  const [ruleSets, setRuleSets] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Load rule sets
      const ruleSetsResponse = await fetch('/api/capital-markets/rule-sets', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      })
      if (ruleSetsResponse.ok) {
        const data = await ruleSetsResponse.json()
        setRuleSets(data.data || [])
      }

      // Load templates
      const templatesResponse = await fetch('/api/capital-markets/templates', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      })
      if (templatesResponse.ok) {
        const data = await templatesResponse.json()
        setTemplates(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('Failed to load capital markets data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteRuleSet = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rule set?')) return

    try {
      const response = await fetch(`/api/capital-markets/rule-sets/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      })
      if (response.ok) {
        toast.success('Rule set deleted successfully')
        loadData()
      } else {
        toast.error('Failed to delete rule set')
      }
    } catch (error) {
      toast.error('Failed to delete rule set')
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'EQUITY': return TrendingUp
      case 'FIXED_INCOME': return Shield
      case 'DERIVATIVES': return Zap
      case 'PRIVATE_SECURITIES': return Lock
      case 'HYBRID': return Layers
      default: return Package
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'text-green-600'
      case 'validated': return 'text-blue-600'
      case 'failed': return 'text-red-600'
      case 'draft': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  }

  return (
    <motion.div
      className="container mx-auto px-4 py-8 space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Capital Markets Rule Management
          </h1>
          <p className="text-gray-600 mt-2">
            Deploy hybrid rule sets for capital markets compliance and operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/business-rules')}
          >
            <Layers className="h-4 w-4 mr-2" />
            Back to Rules
          </Button>
          <Button
            variant="gradient"
            onClick={() => router.push('/capital-markets/create')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Rule Set
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Rule Sets',
            value: ruleSets.length,
            icon: Package,
            color: 'from-blue-500 to-indigo-600'
          },
          {
            label: 'Deployed',
            value: ruleSets.filter(r => r.status === 'deployed').length,
            icon: Rocket,
            color: 'from-green-500 to-emerald-600'
          },
          {
            label: 'Templates',
            value: templates.length,
            icon: Layers,
            color: 'from-purple-500 to-indigo-600'
          },
          {
            label: 'Categories',
            value: 5,
            icon: TrendingUp,
            color: 'from-orange-500 to-red-600'
          }
        ].map((stat) => (
          <motion.div key={stat.label} whileHover={{ scale: 1.02 }}>
            <Card className="glass-card relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ruleSets">Rule Sets</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="deployed">Deployed Contracts</TabsTrigger>
          </TabsList>

          {/* Rule Sets Tab */}
          <TabsContent value="ruleSets">
            <Card>
              <CardHeader>
                <CardTitle>Capital Markets Rule Sets</CardTitle>
                <CardDescription>
                  Manage and deploy rule sets for different asset classes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading rule sets...</div>
                ) : ruleSets.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No rule sets created yet</p>
                    <Button onClick={() => router.push('/capital-markets/create')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Rule Set
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Rules</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ruleSets.map((ruleSet) => {
                        const Icon = getCategoryIcon(ruleSet.category)
                        return (
                          <TableRow key={ruleSet.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4 text-gray-500" />
                                <div>
                                  <p className="font-medium">{ruleSet.name}</p>
                                  <p className="text-xs text-gray-600">{ruleSet.description}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{ruleSet.category}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {ruleSet.rules?.length || 0} rules
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className={`flex items-center gap-1 ${getStatusColor(ruleSet.status)}`}>
                                {ruleSet.status === 'deployed' && <CheckCircle2 className="h-4 w-4" />}
                                {ruleSet.status === 'failed' && <AlertTriangle className="h-4 w-4" />}
                                <span className="capitalize">{ruleSet.status}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(ruleSet.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => router.push(`/capital-markets/${ruleSet.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => router.push(`/capital-markets/${ruleSet.id}/edit`)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {ruleSet.status !== 'deployed' && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleDeleteRuleSet(ruleSet.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                                {ruleSet.status === 'validated' && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => router.push(`/capital-markets/${ruleSet.id}/deploy`)}
                                  >
                                    <Rocket className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Available Templates</CardTitle>
                <CardDescription>
                  Pre-configured rule sets for common capital markets scenarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => {
                    const Icon = getCategoryIcon(template.category)
                    return (
                      <Card key={template.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <Icon className="h-5 w-5 text-gray-500" />
                            <Badge variant="outline">{template.category}</Badge>
                          </div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {template.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Rules</span>
                              <span className="font-medium">{template.rules?.length || 0}</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {template.compliance_standards?.slice(0, 3).map((std: string, idx: number) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {std}
                                </Badge>
                              ))}
                            </div>
                            <Button
                              className="w-full mt-4"
                              variant="outline"
                              onClick={() => router.push(`/capital-markets/create?template=${template.id}`)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Use Template
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deployed Contracts Tab */}
          <TabsContent value="deployed">
            <Card>
              <CardHeader>
                <CardTitle>Deployed Smart Contracts</CardTitle>
                <CardDescription>
                  Active rule sets deployed on blockchain
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ruleSets.filter(r => r.status === 'deployed').length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No deployed contracts yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rule Set</TableHead>
                        <TableHead>Chain</TableHead>
                        <TableHead>Contract Address</TableHead>
                        <TableHead>Deployed</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ruleSets
                        .filter(r => r.status === 'deployed')
                        .map((ruleSet) => (
                          <TableRow key={ruleSet.id}>
                            <TableCell>
                              <p className="font-medium">{ruleSet.name}</p>
                              <p className="text-xs text-gray-600">{ruleSet.category}</p>
                            </TableCell>
                            <TableCell>
                              <Badge>{ruleSet.chain || 'Base L2'}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {ruleSet.contract_address?.substring(0, 10)}...
                                </code>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => {
                                    navigator.clipboard.writeText(ruleSet.contract_address)
                                    toast.success('Address copied!')
                                  }}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(ruleSet.deployed_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(`https://basescan.org/address/${ruleSet.contract_address}`, '_blank')}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Explorer
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}