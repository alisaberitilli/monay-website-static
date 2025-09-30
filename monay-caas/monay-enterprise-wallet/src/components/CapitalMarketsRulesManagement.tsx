'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Settings,
  Filter,
  Download,
  Upload,
  Play,
  Pause,
  RefreshCw,
  Database,
  Activity,
  BarChart3,
  Clock,
  Calendar,
  DollarSign,
  Euro,
  Edit,
  Trash2,
  Plus,
  Copy,
  Save,
  Search,
  FileText,
  Users,
  Building2,
  Globe,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  Info,
  Zap,
  Target,
  Flag,
  GitBranch,
  Layers,
  Package,
  Server,
  Cloud,
  MapPin,
  Navigation,
  Compass,
  Map,
  LineChart,
  PieChart,
  TrendingDown,
  Banknote,
  CreditCard,
  Receipt,
  Briefcase,
  FileCheck,
  UserCheck,
  ShieldCheck,
  AlertOctagon,
  Coins,
  Workflow,
  SlidersHorizontal
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';

// Seeded Capital Markets Rules Data
const capitalMarketsRulesData = {
  regulations: {
    'mifid2': {
      name: 'MiFID II',
      description: 'Markets in Financial Instruments Directive II',
      jurisdiction: 'EU',
      effectiveDate: '2018-01-03',
      lastUpdated: '2024-06-15',
      requirements: [
        'Best execution reporting',
        'Transaction reporting (T+1)',
        'Pre/post trade transparency',
        'Algorithmic trading controls',
        'Position limits',
        'Product governance'
      ]
    },
    'doddFrank': {
      name: 'Dodd-Frank Act',
      description: 'Wall Street Reform and Consumer Protection Act',
      jurisdiction: 'USA',
      effectiveDate: '2010-07-21',
      lastUpdated: '2024-03-20',
      requirements: [
        'Volcker Rule compliance',
        'Swap execution facility reporting',
        'Systematic risk monitoring',
        'Living wills submission',
        'Stress testing',
        'Executive compensation disclosure'
      ]
    },
    'emir': {
      name: 'EMIR',
      description: 'European Market Infrastructure Regulation',
      jurisdiction: 'EU',
      effectiveDate: '2012-08-16',
      lastUpdated: '2024-07-01',
      requirements: [
        'Derivative reporting',
        'Central clearing obligation',
        'Risk mitigation techniques',
        'Portfolio reconciliation',
        'Dispute resolution',
        'Collateral exchange'
      ]
    },
    'mar': {
      name: 'MAR',
      description: 'Market Abuse Regulation',
      jurisdiction: 'EU',
      effectiveDate: '2016-07-03',
      lastUpdated: '2024-05-10',
      requirements: [
        'Insider list maintenance',
        'STOR reporting',
        'Market soundings',
        'Investment recommendations',
        'PDMR transactions',
        'Buyback programmes'
      ]
    },
    'csdr': {
      name: 'CSDR',
      description: 'Central Securities Depositories Regulation',
      jurisdiction: 'EU',
      effectiveDate: '2014-09-17',
      lastUpdated: '2024-02-01',
      requirements: [
        'Settlement discipline',
        'Buy-in process',
        'Cash penalties',
        'Settlement fails reporting',
        'Allocation confirmation',
        'Matching requirements'
      ]
    }
  },

  rules: [
    {
      id: 'CMR-001',
      name: 'Pre-Trade Risk Controls',
      category: 'Risk Management',
      regulation: 'MiFID II',
      type: 'Preventive',
      severity: 'critical',
      status: 'active',
      description: 'Implement pre-trade risk controls for all algorithmic trading',
      conditions: {
        orderSize: '> $1M',
        orderType: ['Market', 'Limit', 'Stop'],
        venue: 'All exchanges',
        assetClass: ['Equities', 'Bonds', 'Derivatives']
      },
      thresholds: {
        maxOrderValue: 5000000,
        maxDailyVolume: 100000000,
        maxPositionSize: 50000000,
        priceDeviation: 0.05
      },
      actions: [
        'Block order if exceeds limits',
        'Alert risk management',
        'Log for compliance',
        'Trigger circuit breaker'
      ],
      monitoring: {
        frequency: 'Real-time',
        lookback: '5 minutes',
        dataPoints: ['Order size', 'Price', 'Volume', 'Volatility']
      }
    },
    {
      id: 'CMR-002',
      name: 'Best Execution Monitoring',
      category: 'Trading',
      regulation: 'MiFID II',
      type: 'Detective',
      severity: 'high',
      status: 'active',
      description: 'Monitor and ensure best execution for client orders',
      conditions: {
        clientType: ['Retail', 'Professional'],
        orderFlow: 'Client orders',
        executionVenue: ['Exchange', 'MTF', 'OTF', 'SI']
      },
      thresholds: {
        slippageTolerance: 0.001,
        priceImprovement: 0.0005,
        executionSpeed: 100,
        fillRate: 0.98
      },
      actions: [
        'Generate TCA report',
        'Flag suboptimal execution',
        'Adjust routing logic',
        'Client notification'
      ],
      monitoring: {
        frequency: 'Per order',
        lookback: 'T+1',
        dataPoints: ['Execution price', 'Market price', 'Time', 'Venue']
      }
    },
    {
      id: 'CMR-003',
      name: 'Market Manipulation Detection',
      category: 'Surveillance',
      regulation: 'MAR',
      type: 'Detective',
      severity: 'critical',
      status: 'active',
      description: 'Detect potential market manipulation patterns',
      conditions: {
        pattern: ['Spoofing', 'Layering', 'Wash trading', 'Ramping'],
        timeframe: 'Intraday',
        marketImpact: '> 0.5%'
      },
      thresholds: {
        orderCancellationRate: 0.9,
        orderToTradeRatio: 10,
        priceMovement: 0.02,
        volumeSpike: 3
      },
      actions: [
        'Freeze account',
        'Cancel orders',
        'STOR report',
        'Internal investigation'
      ],
      monitoring: {
        frequency: 'Real-time',
        lookback: '30 minutes',
        dataPoints: ['Order book', 'Trades', 'Cancellations', 'Price']
      }
    },
    {
      id: 'CMR-004',
      name: 'Settlement Failure Prevention',
      category: 'Operations',
      regulation: 'CSDR',
      type: 'Preventive',
      severity: 'high',
      status: 'active',
      description: 'Prevent settlement failures through pre-settlement checks',
      conditions: {
        settlementDate: 'T+2',
        assetType: ['Securities', 'Cash'],
        clearingHouse: 'All CCPs'
      },
      thresholds: {
        availableSecurities: 1,
        availableCash: 1,
        failureRate: 0.001,
        penaltyThreshold: 10000
      },
      actions: [
        'Securities borrowing',
        'Cash injection',
        'Partial settlement',
        'Buy-in initiation'
      ],
      monitoring: {
        frequency: 'T-1',
        lookback: '5 days',
        dataPoints: ['Inventory', 'Cash position', 'Pending trades']
      }
    },
    {
      id: 'CMR-005',
      name: 'Insider Trading Surveillance',
      category: 'Compliance',
      regulation: 'MAR',
      type: 'Detective',
      severity: 'critical',
      status: 'active',
      description: 'Monitor for potential insider trading activities',
      conditions: {
        tradeTiming: 'Before announcement',
        priceMovement: '> 3%',
        volumeIncrease: '> 200%',
        traderType: 'All'
      },
      thresholds: {
        unusualProfit: 50000,
        timingWindow: 48,
        correlationScore: 0.8,
        confidenceLevel: 0.9
      },
      actions: [
        'Trade suspension',
        'Account freeze',
        'Regulatory report',
        'Legal referral'
      ],
      monitoring: {
        frequency: 'Daily',
        lookback: '30 days',
        dataPoints: ['Trades', 'News', 'Corporate events', 'Communications']
      }
    },
    {
      id: 'CMR-006',
      name: 'Position Limit Monitoring',
      category: 'Risk Management',
      regulation: 'MiFID II',
      type: 'Preventive',
      severity: 'high',
      status: 'active',
      description: 'Monitor and enforce position limits for commodity derivatives',
      conditions: {
        assetClass: 'Commodity derivatives',
        contractType: ['Futures', 'Options'],
        deliveryMonth: 'All'
      },
      thresholds: {
        spotMonthLimit: 25000,
        otherMonthsLimit: 50000,
        allMonthsLimit: 75000,
        warningLevel: 0.8
      },
      actions: [
        'Block new positions',
        'Force reduction',
        'Regulatory notification',
        'Position netting'
      ],
      monitoring: {
        frequency: 'Real-time',
        lookback: 'End of day',
        dataPoints: ['Open positions', 'Contract expiry', 'Deliverable supply']
      }
    },
    {
      id: 'CMR-007',
      name: 'Algorithmic Trading Controls',
      category: 'Technology',
      regulation: 'MiFID II',
      type: 'Preventive',
      severity: 'critical',
      status: 'active',
      description: 'Controls for algorithmic and high-frequency trading systems',
      conditions: {
        systemType: ['Algo', 'HFT', 'DMA'],
        messageRate: '> 1000/sec',
        orderToTrade: '> 5:1'
      },
      thresholds: {
        maxMessageRate: 5000,
        maxOrderRate: 1000,
        killSwitchTrigger: 0.02,
        throttleLimit: 100
      },
      actions: [
        'Kill switch activation',
        'Throttle orders',
        'Cancel all orders',
        'System shutdown'
      ],
      monitoring: {
        frequency: 'Microseconds',
        lookback: '1 second',
        dataPoints: ['Message rate', 'Error rate', 'Latency', 'PnL']
      }
    },
    {
      id: 'CMR-008',
      name: 'Short Selling Disclosure',
      category: 'Regulatory Reporting',
      regulation: 'EU Short Selling Regulation',
      type: 'Corrective',
      severity: 'medium',
      status: 'active',
      description: 'Monitor and report significant short positions',
      conditions: {
        positionSize: '> 0.2% of issued capital',
        assetType: 'Shares',
        market: 'EU regulated markets'
      },
      thresholds: {
        privateDisclosure: 0.002,
        publicDisclosure: 0.005,
        incrementalReporting: 0.001,
        exemptionThreshold: 0.001
      },
      actions: [
        'Calculate net short position',
        'Submit regulatory filing',
        'Public disclosure',
        'Update position register'
      ],
      monitoring: {
        frequency: 'End of day',
        lookback: 'T-1',
        dataPoints: ['Short positions', 'Issued shares', 'Derivatives']
      }
    },
    {
      id: 'CMR-009',
      name: 'Transaction Reporting',
      category: 'Regulatory Reporting',
      regulation: 'MiFID II',
      type: 'Corrective',
      severity: 'high',
      status: 'active',
      description: 'Report transactions to competent authorities',
      conditions: {
        instrumentType: 'Financial instruments',
        executionVenue: 'All',
        reportingDeadline: 'T+1'
      },
      thresholds: {
        reportingDeadline: 24,
        errorRate: 0.001,
        completenessRate: 0.999,
        timeliness: 23
      },
      actions: [
        'Generate RTS 22 report',
        'Submit to ARM',
        'Error correction',
        'Reconciliation'
      ],
      monitoring: {
        frequency: 'Daily',
        lookback: 'T+1',
        dataPoints: ['Trades', 'Client data', 'Instrument data', 'Timestamps']
      }
    },
    {
      id: 'CMR-010',
      name: 'Derivative Reporting',
      category: 'Regulatory Reporting',
      regulation: 'EMIR',
      type: 'Corrective',
      severity: 'high',
      status: 'active',
      description: 'Report derivative contracts to trade repositories',
      conditions: {
        contractType: ['OTC', 'ETD'],
        reportingObligation: 'Both counterparties',
        reportingDeadline: 'T+1'
      },
      thresholds: {
        reportingDeadline: 24,
        matchingRate: 0.95,
        reconciliationRate: 0.98,
        backloadingComplete: 1
      },
      actions: [
        'Generate UTI',
        'Submit to TR',
        'Reconciliation',
        'Backloading'
      ],
      monitoring: {
        frequency: 'Daily',
        lookback: 'T+1',
        dataPoints: ['Derivative contracts', 'Valuations', 'Collateral', 'Lifecycle events']
      }
    }
  ],

  riskMetrics: {
    var: {
      name: 'Value at Risk',
      current: 2450000,
      limit: 5000000,
      confidence: 0.99,
      horizon: '1 day',
      status: 'within_limits'
    },
    stressTest: {
      name: 'Stress Testing',
      scenarios: 15,
      passed: 13,
      failed: 2,
      lastRun: '2024-09-24',
      nextRun: '2024-09-25'
    },
    concentration: {
      name: 'Concentration Risk',
      topExposure: 0.15,
      limit: 0.20,
      topCounterparty: 'Goldman Sachs',
      status: 'acceptable'
    },
    liquidity: {
      name: 'Liquidity Coverage',
      ratio: 1.35,
      requirement: 1.0,
      buffer: 350000000,
      status: 'healthy'
    }
  },

  auditTrail: [
    {
      timestamp: '2024-09-24T14:30:00Z',
      user: 'john.smith@monay.com',
      action: 'Rule Modified',
      ruleId: 'CMR-001',
      changes: 'Updated threshold from $1M to $5M',
      approved: true,
      approver: 'jane.doe@monay.com'
    },
    {
      timestamp: '2024-09-24T10:15:00Z',
      user: 'alice.johnson@monay.com',
      action: 'Rule Created',
      ruleId: 'CMR-010',
      changes: 'Added EMIR derivative reporting rule',
      approved: true,
      approver: 'bob.wilson@monay.com'
    },
    {
      timestamp: '2024-09-23T16:45:00Z',
      user: 'mike.brown@monay.com',
      action: 'Rule Disabled',
      ruleId: 'CMR-004',
      changes: 'Temporarily disabled for maintenance',
      approved: true,
      approver: 'sarah.davis@monay.com'
    }
  ]
};

export default function CapitalMarketsRulesManagement() {
  const [rules, setRules] = useState(capitalMarketsRulesData.rules);
  const [selectedRule, setSelectedRule] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    category: 'Trading',
    regulation: 'MiFID II',
    type: 'Preventive',
    severity: 'high',
    description: '',
    conditions: {},
    thresholds: {},
    actions: []
  });

  const filteredRules = rules.filter(rule => {
    const matchesCategory = filterCategory === 'all' || rule.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || rule.status === filterStatus;
    const matchesSearch = searchTerm === '' ||
      rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.id.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesStatus && matchesSearch;
  });

  const categories = [...new Set(rules.map(r => r.category))];
  const regulations = Object.values(capitalMarketsRulesData.regulations);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Capital Markets Rules Management</h2>
        <p className="text-muted-foreground">
          Configure and monitor compliance rules for capital markets trading
        </p>
      </div>

      {/* Risk Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(capitalMarketsRulesData.riskMetrics).map(([key, metric]) => (
          <Card key={key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  {key === 'var' && 'current' in metric && 'limit' in metric && (
                    <>
                      <p className="text-2xl font-bold">
                        ${(metric.current / 1000000).toFixed(1)}M
                      </p>
                      <Progress
                        value={(metric.current / metric.limit) * 100}
                        className="mt-2 h-2"
                      />
                    </>
                  )}
                  {key === 'stressTest' && 'passed' in metric && 'scenarios' in metric && (
                    <>
                      <p className="text-2xl font-bold">
                        {metric.passed}/{metric.scenarios}
                      </p>
                      <p className="text-xs text-muted-foreground">Scenarios passed</p>
                    </>
                  )}
                  {key === 'concentration' && 'topExposure' in metric && 'topCounterparty' in metric && (
                    <>
                      <p className="text-2xl font-bold">
                        {(metric.topExposure * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-muted-foreground">{metric.topCounterparty}</p>
                    </>
                  )}
                  {key === 'liquidity' && 'ratio' in metric && (
                    <>
                      <p className="text-2xl font-bold">{metric.ratio.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Coverage ratio</p>
                    </>
                  )}
                </div>
                <Badge
                  className={
                    ('status' in metric && (metric.status === 'healthy' || metric.status === 'within_limits' || metric.status === 'acceptable'))
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }
                >
                  {'status' in metric ? metric.status : 'failed' in metric ? `${metric.failed} failed` : 'Unknown'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Active Rules</TabsTrigger>
          <TabsTrigger value="regulations">Regulations</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        {/* Active Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Rule Configuration</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Rule
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Create New Compliance Rule</DialogTitle>
                        <DialogDescription>
                          Define a new capital markets compliance rule for automated monitoring and enforcement
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        // Add the new rule to the rules array
                        const newRuleWithId = {
                          ...newRule,
                          id: `CMR-${String(rules.length + 1).padStart(3, '0')}`,
                          status: 'active',
                          monitoring: {
                            frequency: 'Real-time',
                            lookback: '5 minutes',
                            dataPoints: []
                          }
                        };
                        setRules([...rules, newRuleWithId as any]);
                        setShowCreateModal(false);
                        // Reset form
                        setNewRule({
                          name: '',
                          category: 'Trading',
                          regulation: 'MiFID II',
                          type: 'Preventive',
                          severity: 'high',
                          description: '',
                          conditions: {},
                          thresholds: {},
                          actions: []
                        });
                      }}>
                        <div className="space-y-6 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="rule-name">Rule Name</Label>
                              <Input
                                id="rule-name"
                                value={newRule.name}
                                onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                                placeholder="e.g., Pre-Trade Risk Control"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="rule-category">Category</Label>
                              <Select
                                value={newRule.category}
                                onValueChange={(value) => setNewRule({...newRule, category: value})}
                              >
                                <SelectTrigger id="rule-category">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Trading">Trading</SelectItem>
                                  <SelectItem value="Risk">Risk Management</SelectItem>
                                  <SelectItem value="Compliance">Compliance</SelectItem>
                                  <SelectItem value="Market Surveillance">Market Surveillance</SelectItem>
                                  <SelectItem value="Settlement">Settlement</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="rule-regulation">Regulation</Label>
                              <Select
                                value={newRule.regulation}
                                onValueChange={(value) => setNewRule({...newRule, regulation: value})}
                              >
                                <SelectTrigger id="rule-regulation">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="MiFID II">MiFID II</SelectItem>
                                  <SelectItem value="Dodd-Frank">Dodd-Frank</SelectItem>
                                  <SelectItem value="EMIR">EMIR</SelectItem>
                                  <SelectItem value="MAR">MAR</SelectItem>
                                  <SelectItem value="CSDR">CSDR</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="rule-type">Rule Type</Label>
                              <Select
                                value={newRule.type}
                                onValueChange={(value) => setNewRule({...newRule, type: value})}
                              >
                                <SelectTrigger id="rule-type">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Preventive">Preventive</SelectItem>
                                  <SelectItem value="Detective">Detective</SelectItem>
                                  <SelectItem value="Corrective">Corrective</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="rule-severity">Severity</Label>
                            <Select
                              value={newRule.severity}
                              onValueChange={(value) => setNewRule({...newRule, severity: value})}
                            >
                              <SelectTrigger id="rule-severity">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="critical">Critical</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="rule-description">Description</Label>
                            <Textarea
                              id="rule-description"
                              value={newRule.description}
                              onChange={(e) => setNewRule({...newRule, description: e.target.value})}
                              placeholder="Describe the purpose and logic of this compliance rule"
                              rows={4}
                              required
                            />
                          </div>
                        </div>
                        <DialogFooter className="gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowCreateModal(false);
                              setNewRule({
                                name: '',
                                category: 'Trading',
                                regulation: 'MiFID II',
                                type: 'Preventive',
                                severity: 'high',
                                description: '',
                                conditions: {},
                                thresholds: {},
                                actions: []
                              });
                            }}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">
                            Create Rule
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search rules..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Rules Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rule ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Regulation</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-mono text-sm">{rule.id}</TableCell>
                        <TableCell className="font-medium">{rule.name}</TableCell>
                        <TableCell>{rule.category}</TableCell>
                        <TableCell>{rule.regulation}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              rule.severity === 'critical' ? 'bg-red-500 text-white hover:bg-red-600' :
                              rule.severity === 'high' ? 'bg-orange-500 text-white hover:bg-orange-600' :
                              'bg-gray-500 text-white hover:bg-gray-600'
                            }
                          >
                            {rule.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              rule.status === 'active' ? 'bg-amber-600 text-white hover:bg-amber-700' :
                              'bg-gray-500 text-white hover:bg-gray-600'
                            }
                          >
                            {rule.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedRule(rule.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedRule(rule.id);
                                setIsEditMode(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Selected Rule Details */}
          {selectedRule && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    Rule Details: {capitalMarketsRulesData.rules.find(r => r.id === selectedRule)?.name}
                  </CardTitle>
                  <div className="flex gap-2">
                    {isEditMode ? (
                      <>
                        <Button size="sm" variant="outline" onClick={() => setIsEditMode(false)}>
                          Cancel
                        </Button>
                        <Button size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setIsEditMode(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {capitalMarketsRulesData.rules
                  .filter(r => r.id === selectedRule)
                  .map(rule => (
                    <div key={rule.id} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Description</Label>
                          {isEditMode ? (
                            <Textarea defaultValue={rule.description} />
                          ) : (
                            <p className="text-sm text-muted-foreground mt-1">{rule.description}</p>
                          )}
                        </div>
                        <div>
                          <Label>Type</Label>
                          {isEditMode ? (
                            <Select defaultValue={rule.type}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Preventive">Preventive</SelectItem>
                                <SelectItem value="Detective">Detective</SelectItem>
                                <SelectItem value="Corrective">Corrective</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <p className="text-sm text-muted-foreground mt-1">{rule.type}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label>Conditions</Label>
                        <div className="mt-2 p-3 bg-muted rounded-lg">
                          <pre className="text-xs">{JSON.stringify(rule.conditions, null, 2)}</pre>
                        </div>
                      </div>

                      <div>
                        <Label>Thresholds</Label>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {Object.entries(rule.thresholds).map(([key, value]) => (
                            <div key={key} className="flex justify-between p-2 bg-muted rounded">
                              <span className="text-sm">{key}:</span>
                              {isEditMode ? (
                                <Input
                                  type="text"
                                  defaultValue={value}
                                  className="w-24 h-6 text-right"
                                />
                              ) : (
                                <span className="text-sm font-mono">{value}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label>Actions</Label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {rule.actions.map((action, idx) => (
                            <Badge key={idx} variant="outline">
                              {action}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label>Monitoring Configuration</Label>
                        <div className="mt-2 grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Frequency</p>
                            <p className="text-sm font-medium">{rule.monitoring.frequency}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Lookback</p>
                            <p className="text-sm font-medium">{rule.monitoring.lookback}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Data Points</p>
                            <p className="text-sm font-medium">{rule.monitoring.dataPoints.length} fields</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Regulations Tab */}
        <TabsContent value="regulations" className="space-y-4">
          <div className="grid gap-4">
            {regulations.map((reg) => (
              <Card key={reg.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{reg.name}</CardTitle>
                      <CardDescription>{reg.description}</CardDescription>
                    </div>
                    <Badge>{reg.jurisdiction}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Effective Date:</span>
                      <span>{reg.effectiveDate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span>{reg.lastUpdated}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Key Requirements:</p>
                      <div className="flex flex-wrap gap-2">
                        {reg.requirements.map((req, idx) => (
                          <Badge key={idx} variant="secondary">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Rule Monitoring</CardTitle>
              <CardDescription>
                Monitor rule triggers and compliance metrics in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Monitoring Stats */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Rules Active</p>
                    <p className="text-2xl font-bold">
                      {capitalMarketsRulesData.rules.filter(r => r.status === 'active').length}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Triggered Today</p>
                    <p className="text-2xl font-bold">247</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Alerts Generated</p>
                    <p className="text-2xl font-bold">18</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Compliance Rate</p>
                    <p className="text-2xl font-bold">99.7%</p>
                  </div>
                </div>

                {/* Recent Triggers */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Recent Rule Triggers</h4>
                  <div className="space-y-2">
                    {[
                      { time: '14:32:15', rule: 'CMR-001', action: 'Order blocked - exceeded position limit', severity: 'high' },
                      { time: '14:28:43', rule: 'CMR-003', action: 'Suspicious pattern detected - spoofing', severity: 'critical' },
                      { time: '14:25:11', rule: 'CMR-007', action: 'Algorithm throttled - high message rate', severity: 'medium' },
                      { time: '14:20:02', rule: 'CMR-002', action: 'Best execution alert - slippage exceeded', severity: 'low' },
                    ].map((trigger, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-muted-foreground">{trigger.time}</span>
                          <Badge variant="outline">{trigger.rule}</Badge>
                          <span className="text-sm">{trigger.action}</span>
                        </div>
                        <Badge
                          variant={
                            trigger.severity === 'critical' ? 'destructive' :
                            trigger.severity === 'high' ? 'default' :
                            'secondary'
                          }
                        >
                          {trigger.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Trail Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>
                Complete history of rule changes and approvals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Rule</TableHead>
                    <TableHead>Changes</TableHead>
                    <TableHead>Approval</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {capitalMarketsRulesData.auditTrail.map((audit, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono text-xs">
                        {new Date(audit.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm">{audit.user}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{audit.action}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{audit.ruleId}</TableCell>
                      <TableCell className="text-sm">{audit.changes}</TableCell>
                      <TableCell>
                        {audit.approved ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-xs text-muted-foreground">{audit.approver}</span>
                          </div>
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}