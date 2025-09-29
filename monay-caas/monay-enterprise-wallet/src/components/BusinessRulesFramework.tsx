'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Globe,
  Building2,
  Users,
  FileText,
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
  Lock,
  Unlock,
  Eye,
  EyeOff,
  TrendingUp,
  Activity,
  BarChart3,
  PieChart,
  Zap,
  Clock,
  Calendar,
  DollarSign,
  Euro,
  PoundSterling,
  Coins,
  CreditCard,
  Banknote,
  Receipt,
  FileCheck,
  UserCheck,
  ShieldCheck,
  AlertOctagon,
  Info,
  ChevronRight,
  ChevronDown,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  Save,
  Search,
  SlidersHorizontal,
  GitBranch,
  Layers,
  Package,
  Cpu,
  Server,
  Cloud,
  Workflow,
  Target,
  Flag,
  MapPin,
  Navigation,
  Compass,
  Map,
  ShoppingCart,
  Store,
  Factory,
  Droplet,
  LineChart,
  Star,
  TrendingDown
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
// Switch component not available - using checkbox instead
import { Textarea } from '@/components/ui/textarea';
// Accordion component not available - using collapsible sections instead
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

// Comprehensive Business Rules Data
const businessRulesData = {
  industries: {
    finance: {
      name: 'Financial Services',
      icon: Building2,
      color: 'blue',
      regulations: ['Basel III', 'MiFID II', 'Dodd-Frank', 'PSD2', 'GDPR'],
      rules: [
        {
          id: 'fin-001',
          name: 'AML Transaction Monitoring',
          category: 'Compliance',
          severity: 'critical',
          description: 'Monitor transactions for money laundering patterns',
          conditions: [
            'Transaction amount > $10,000',
            'Multiple transactions < $10,000 within 24 hours',
            'Cross-border transactions to high-risk jurisdictions',
            'Unusual transaction patterns'
          ],
          actions: ['Flag transaction', 'Generate SAR', 'Block if confidence > 90%'],
          status: 'active'
        },
        {
          id: 'fin-002',
          name: 'KYC Verification',
          category: 'Identity',
          severity: 'high',
          description: 'Know Your Customer verification requirements',
          conditions: [
            'New account opening',
            'Transaction > $50,000',
            'International wire transfers',
            'Account dormancy > 12 months'
          ],
          actions: ['Request documentation', 'Verify identity', 'Update risk score'],
          status: 'active'
        },
        {
          id: 'fin-003',
          name: 'Capital Adequacy',
          category: 'Risk',
          severity: 'high',
          description: 'Maintain minimum capital requirements',
          conditions: [
            'Tier 1 capital ratio < 6%',
            'Total capital ratio < 8%',
            'Leverage ratio < 3%'
          ],
          actions: ['Alert treasury', 'Restrict lending', 'Report to regulator'],
          status: 'active'
        }
      ]
    },
    healthcare: {
      name: 'Healthcare',
      icon: Activity,
      color: 'green',
      regulations: ['HIPAA', 'HITECH', 'FDA', 'CMS', 'GDPR'],
      rules: [
        {
          id: 'health-001',
          name: 'Patient Data Privacy',
          category: 'Privacy',
          severity: 'critical',
          description: 'Protect patient health information',
          conditions: [
            'PHI access request',
            'Data transfer to third party',
            'Cross-border data transfer',
            'Research data usage'
          ],
          actions: ['Encrypt data', 'Log access', 'Obtain consent', 'Audit trail'],
          status: 'active'
        },
        {
          id: 'health-002',
          name: 'Medical Device Compliance',
          category: 'Safety',
          severity: 'critical',
          description: 'Ensure medical device safety and efficacy',
          conditions: [
            'Device malfunction report',
            'Adverse event occurrence',
            'Software update deployment',
            'Recall notification'
          ],
          actions: ['Report to FDA', 'Notify patients', 'Implement corrective action'],
          status: 'active'
        }
      ]
    },
    retail: {
      name: 'Retail & E-commerce',
      icon: ShoppingCart,
      color: 'purple',
      regulations: ['PCI-DSS', 'CCPA', 'GDPR', 'FTC', 'SOX'],
      rules: [
        {
          id: 'retail-001',
          name: 'Payment Card Security',
          category: 'Security',
          severity: 'high',
          description: 'Protect payment card data',
          conditions: [
            'Card payment processing',
            'Card data storage',
            'Tokenization request',
            'Refund processing'
          ],
          actions: ['Encrypt card data', 'Tokenize PAN', 'Secure transmission'],
          status: 'active'
        },
        {
          id: 'retail-002',
          name: 'Consumer Protection',
          category: 'Compliance',
          severity: 'medium',
          description: 'Ensure fair consumer practices',
          conditions: [
            'Return request > 30 days',
            'Price adjustment claim',
            'Product defect report',
            'False advertising claim'
          ],
          actions: ['Process refund', 'Update pricing', 'Issue recall'],
          status: 'active'
        }
      ]
    },
    manufacturing: {
      name: 'Manufacturing',
      icon: Factory,
      color: 'orange',
      regulations: ['ISO 9001', 'OSHA', 'EPA', 'REACH', 'RoHS'],
      rules: [
        {
          id: 'mfg-001',
          name: 'Quality Control',
          category: 'Quality',
          severity: 'high',
          description: 'Maintain product quality standards',
          conditions: [
            'Defect rate > 0.1%',
            'Customer complaint received',
            'Audit non-conformance',
            'Supplier quality issue'
          ],
          actions: ['Stop production', 'Investigate root cause', 'Implement CAPA'],
          status: 'active'
        }
      ]
    },
    technology: {
      name: 'Technology',
      icon: Cpu,
      color: 'cyan',
      regulations: ['SOC 2', 'ISO 27001', 'GDPR', 'CCPA', 'NIST'],
      rules: [
        {
          id: 'tech-001',
          name: 'Data Security',
          category: 'Security',
          severity: 'critical',
          description: 'Protect sensitive data and systems',
          conditions: [
            'Unauthorized access attempt',
            'Data breach detected',
            'Vulnerability discovered',
            'Compliance audit failure'
          ],
          actions: ['Block access', 'Notify CISO', 'Patch vulnerability', 'Report breach'],
          status: 'active'
        }
      ]
    },
    capitalMarkets: {
      name: 'Capital Markets',
      icon: TrendingUp,
      color: 'indigo',
      regulations: ['MiFID II', 'SEC Rules', 'Dodd-Frank', 'Volcker Rule', 'EMIR', 'MAR', 'CSDR'],
      rules: [
        {
          id: 'cap-001',
          name: 'Market Manipulation Detection',
          category: 'Market Integrity',
          severity: 'critical',
          description: 'Detect and prevent market manipulation activities',
          conditions: [
            'Spoofing pattern detected',
            'Layering activity identified',
            'Wash trading suspected',
            'Front-running indicators',
            'Pump and dump scheme detected'
          ],
          actions: ['Freeze trading', 'Alert compliance', 'Report to SEC/ESMA', 'Block orders'],
          status: 'active'
        },
        {
          id: 'cap-002',
          name: 'Best Execution',
          category: 'Trading',
          severity: 'high',
          description: 'Ensure best execution for client orders',
          conditions: [
            'Order execution quality < threshold',
            'Price improvement opportunity missed',
            'Excessive slippage detected',
            'Venue selection suboptimal'
          ],
          actions: ['Re-route order', 'Price improvement', 'TCA report', 'Notify trader'],
          status: 'active'
        },
        {
          id: 'cap-003',
          name: 'Position Limits',
          category: 'Risk',
          severity: 'high',
          description: 'Monitor and enforce position limits',
          conditions: [
            'Position approaching regulatory limit',
            'Concentration risk threshold exceeded',
            'Aggregate exposure > limit',
            'Derivative position breach'
          ],
          actions: ['Block new positions', 'Force reduction', 'Report to regulator', 'Risk alert'],
          status: 'active'
        },
        {
          id: 'cap-004',
          name: 'Settlement Risk Management',
          category: 'Operations',
          severity: 'high',
          description: 'Manage T+1/T+2 settlement obligations',
          conditions: [
            'Settlement failure predicted',
            'Insufficient securities for delivery',
            'Cash shortfall for settlement',
            'Counterparty default risk high'
          ],
          actions: ['Securities lending', 'Cash management', 'Fail management', 'Buy-in process'],
          status: 'active'
        },
        {
          id: 'cap-005',
          name: 'Insider Trading Prevention',
          category: 'Compliance',
          severity: 'critical',
          description: 'Prevent insider trading violations',
          conditions: [
            'Trading during blackout period',
            'Material non-public information access',
            'Suspicious trading pattern before announcement',
            'Related party transaction detected'
          ],
          actions: ['Block trade', 'Compliance review', 'Report suspicious activity', 'Freeze account'],
          status: 'active'
        },
        {
          id: 'cap-006',
          name: 'Algorithmic Trading Controls',
          category: 'Technology',
          severity: 'high',
          description: 'Monitor algorithmic and high-frequency trading',
          conditions: [
            'Algorithm malfunction detected',
            'Order-to-trade ratio exceeded',
            'Message rate limit breach',
            'Fat finger error suspected'
          ],
          actions: ['Kill switch activation', 'Cancel all orders', 'Throttle algorithm', 'Manual review'],
          status: 'active'
        },
        {
          id: 'cap-007',
          name: 'Market Abuse Regulation (MAR)',
          category: 'Regulatory',
          severity: 'critical',
          description: 'Ensure MAR compliance for EU markets',
          conditions: [
            'Suspicious order pattern',
            'Cross-market manipulation',
            'Benchmark manipulation attempt',
            'False dissemination of information'
          ],
          actions: ['STOR filing', 'Trading halt', 'Internal investigation', 'Regulatory notification'],
          status: 'active'
        },
        {
          id: 'cap-008',
          name: 'Short Selling Compliance',
          category: 'Trading',
          severity: 'high',
          description: 'Monitor short selling regulations',
          conditions: [
            'Naked short selling detected',
            'Short position reporting threshold',
            'Locate requirement not met',
            'Short sale restriction triggered'
          ],
          actions: ['Block short sale', 'Position disclosure', 'Locate confirmation', 'Regulatory filing'],
          status: 'active'
        },
        {
          id: 'cap-009',
          name: 'Dark Pool Monitoring',
          category: 'Trading',
          severity: 'medium',
          description: 'Monitor dark pool trading activities',
          conditions: [
            'Information leakage detected',
            'Price discovery impact',
            'Volume threshold exceeded',
            'Regulatory cap reached'
          ],
          actions: ['Venue rotation', 'Transparency report', 'Limit dark pool usage', 'Best execution review'],
          status: 'active'
        },
        {
          id: 'cap-010',
          name: 'Collateral Management',
          category: 'Risk',
          severity: 'high',
          description: 'Optimize collateral usage and management',
          conditions: [
            'Margin call received',
            'Collateral shortfall',
            'Concentration limit breach',
            'Haircut adjustment'
          ],
          actions: ['Collateral substitution', 'Securities recall', 'Margin optimization', 'Liquidity management'],
          status: 'active'
        }
      ]
    }
  },

  governments: {
    usa: {
      name: 'United States',
      icon: Flag,
      regulations: {
        federal: ['FinCEN', 'SEC', 'OFAC', 'FATCA', 'BSA', 'USA PATRIOT Act'],
        states: {
          NY: ['BitLicense', 'NYDFS', 'SHIELD Act'],
          CA: ['CCPA', 'CPRA', 'SB 1001'],
          TX: ['HB 4474', 'SB 2038'],
          FL: ['FIPA', 'HB 969']
        }
      },
      requirements: [
        'MSB Registration with FinCEN',
        'State money transmitter licenses',
        'SAR/CTR reporting',
        'OFAC sanctions screening',
        'Customer identification program (CIP)'
      ]
    },
    eu: {
      name: 'European Union',
      icon: Globe,
      regulations: {
        union: ['MiCA', 'GDPR', 'PSD2', 'AMLD5', 'DORA'],
        members: {
          DE: ['BaFin regulations', 'GwG'],
          FR: ['AMF regulations', 'PACTE'],
          NL: ['DNB supervision', 'Wwft'],
          IE: ['CBI regulations', 'CJA 2010']
        }
      },
      requirements: [
        'VASP registration',
        'GDPR compliance',
        'Strong customer authentication (SCA)',
        'Transaction monitoring',
        'Travel rule compliance'
      ]
    },
    uk: {
      name: 'United Kingdom',
      icon: PoundSterling,
      regulations: {
        national: ['FCA', 'PRA', 'MLR 2017', 'UK GDPR', 'PSR 2017'],
        requirements: [
          'FCA registration/authorization',
          'Anti-money laundering compliance',
          'Consumer duty requirements',
          'Operational resilience',
          'Financial promotions regime'
        ]
      }
    },
    apac: {
      name: 'Asia-Pacific',
      icon: MapPin,
      regions: {
        singapore: ['MAS', 'PSA', 'PDPA'],
        hongkong: ['HKMA', 'SFC', 'AMLO'],
        japan: ['FSA', 'PSA', 'APPI'],
        australia: ['AUSTRAC', 'ASIC', 'Privacy Act']
      }
    }
  },

  useCases: {
    crossBorder: {
      name: 'Cross-Border Payments',
      icon: Globe,
      rules: [
        {
          name: 'SWIFT Compliance',
          conditions: ['International wire transfer', 'Amount > $1,000'],
          requirements: ['Beneficiary information', 'Purpose code', 'Supporting documents']
        },
        {
          name: 'FX Controls',
          conditions: ['Currency conversion required', 'Restricted currency'],
          requirements: ['Exchange rate disclosure', 'Regulatory approval', 'Reporting']
        },
        {
          name: 'Sanctions Screening',
          conditions: ['Any cross-border transaction'],
          requirements: ['OFAC check', 'UN sanctions list', 'EU consolidated list']
        }
      ]
    },
    lending: {
      name: 'Lending & Credit',
      icon: CreditCard,
      rules: [
        {
          name: 'Credit Assessment',
          conditions: ['Loan application', 'Credit line request'],
          requirements: ['Credit score check', 'Income verification', 'Debt-to-income ratio']
        },
        {
          name: 'Usury Laws',
          conditions: ['Interest rate determination'],
          requirements: ['State maximum rates', 'APR disclosure', 'Fee limitations']
        },
        {
          name: 'Fair Lending',
          conditions: ['All lending decisions'],
          requirements: ['Non-discrimination', 'Equal opportunity', 'Adverse action notices']
        }
      ]
    },
    tokenization: {
      name: 'Asset Tokenization',
      icon: Coins,
      rules: [
        {
          name: 'Securities Compliance',
          conditions: ['Security token issuance', 'Investment contract'],
          requirements: ['SEC registration/exemption', 'Accredited investor verification', 'Transfer restrictions']
        },
        {
          name: 'Stablecoin Regulation',
          conditions: ['Stablecoin issuance', 'Reserve management'],
          requirements: ['Reserve attestation', 'Redemption rights', 'Transparency reports']
        }
      ]
    },
    payroll: {
      name: 'Payroll & Benefits',
      icon: Users,
      rules: [
        {
          name: 'Wage Payment',
          conditions: ['Salary disbursement', 'Contractor payment'],
          requirements: ['Tax withholding', 'Minimum wage compliance', 'Payment frequency']
        },
        {
          name: 'Benefits Administration',
          conditions: ['Benefits enrollment', 'Claims processing'],
          requirements: ['ERISA compliance', 'HIPAA privacy', 'ACA requirements']
        }
      ]
    },
    merchantServices: {
      name: 'Merchant Services',
      icon: Store,
      rules: [
        {
          name: 'Card Acceptance',
          conditions: ['Card payment processing'],
          requirements: ['PCI-DSS compliance', 'Chargeback management', 'Fraud prevention']
        },
        {
          name: 'Settlement',
          conditions: ['Daily settlement', 'Refund processing'],
          requirements: ['T+1 settlement', 'Reserve requirements', 'Reconciliation']
        }
      ]
    }
  },

  riskCategories: {
    credit: {
      name: 'Credit Risk',
      icon: TrendingDown,
      metrics: ['Default rate', 'LTV ratio', 'Credit exposure', 'Recovery rate'],
      thresholds: {
        low: { color: 'green', max: 2 },
        medium: { color: 'yellow', range: [2, 5] },
        high: { color: 'orange', range: [5, 10] },
        critical: { color: 'red', min: 10 }
      }
    },
    operational: {
      name: 'Operational Risk',
      icon: AlertTriangle,
      metrics: ['System uptime', 'Error rate', 'Processing time', 'Manual interventions'],
      thresholds: {
        low: { uptime: 99.9, errors: 0.1 },
        medium: { uptime: 99.5, errors: 0.5 },
        high: { uptime: 99, errors: 1 },
        critical: { uptime: 95, errors: 5 }
      }
    },
    compliance: {
      name: 'Compliance Risk',
      icon: Shield,
      metrics: ['Violations', 'Audit findings', 'Training completion', 'Policy updates'],
      thresholds: {
        low: { violations: 0, findings: 2 },
        medium: { violations: 1, findings: 5 },
        high: { violations: 3, findings: 10 },
        critical: { violations: 5, findings: 20 }
      }
    },
    liquidity: {
      name: 'Liquidity Risk',
      icon: Droplet,
      metrics: ['Cash ratio', 'Quick ratio', 'Current ratio', 'Operating cash flow'],
      thresholds: {
        healthy: { cash: 0.2, quick: 1.0, current: 1.5 },
        adequate: { cash: 0.15, quick: 0.8, current: 1.2 },
        concerning: { cash: 0.1, quick: 0.6, current: 1.0 },
        critical: { cash: 0.05, quick: 0.4, current: 0.8 }
      }
    },
    market: {
      name: 'Market Risk',
      icon: LineChart,
      metrics: ['VaR', 'Volatility', 'Beta', 'Correlation'],
      thresholds: {
        low: { var: 1, volatility: 10 },
        medium: { var: 2.5, volatility: 20 },
        high: { var: 5, volatility: 30 },
        extreme: { var: 10, volatility: 50 }
      }
    },
    reputation: {
      name: 'Reputation Risk',
      icon: Star,
      metrics: ['Customer complaints', 'Media sentiment', 'NPS score', 'Social mentions'],
      thresholds: {
        excellent: { nps: 70, complaints: 0.1 },
        good: { nps: 50, complaints: 0.5 },
        fair: { nps: 30, complaints: 1 },
        poor: { nps: 0, complaints: 5 }
      }
    }
  },

  complianceFrameworks: {
    kyc: {
      name: 'Know Your Customer (KYC)',
      levels: [
        {
          level: 1,
          name: 'Basic',
          requirements: ['Name', 'Email', 'Phone'],
          limits: { daily: 1000, monthly: 10000 }
        },
        {
          level: 2,
          name: 'Intermediate',
          requirements: ['Government ID', 'Selfie', 'Address proof'],
          limits: { daily: 10000, monthly: 100000 }
        },
        {
          level: 3,
          name: 'Enhanced',
          requirements: ['Source of funds', 'Bank statement', 'Employment verification'],
          limits: { daily: 100000, monthly: 1000000 }
        },
        {
          level: 4,
          name: 'Institutional',
          requirements: ['Business registration', 'Financial statements', 'Beneficial ownership'],
          limits: { daily: 10000000, monthly: 100000000 }
        }
      ]
    },
    aml: {
      name: 'Anti-Money Laundering (AML)',
      components: [
        'Customer Due Diligence (CDD)',
        'Enhanced Due Diligence (EDD)',
        'Transaction Monitoring',
        'Sanctions Screening',
        'Suspicious Activity Reporting',
        'Record Keeping',
        'Training Program',
        'Independent Testing'
      ]
    },
    dataPrivacy: {
      name: 'Data Privacy',
      requirements: {
        gdpr: ['Lawful basis', 'Consent', 'Data minimization', 'Right to erasure', 'Data portability'],
        ccpa: ['Notice at collection', 'Opt-out rights', 'Non-discrimination', 'Verifiable requests'],
        common: ['Encryption', 'Access controls', 'Audit logs', 'Breach notification', 'Privacy policy']
      }
    }
  }
};

// Additional icon imports

export default function BusinessRulesFramework() {
  const [selectedIndustry, setSelectedIndustry] = useState('finance');
  const [selectedGovernment, setSelectedGovernment] = useState('usa');
  const [selectedUseCase, setSelectedUseCase] = useState('crossBorder');
  const [activeRules, setActiveRules] = useState([]);
  const [ruleEngine, setRuleEngine] = useState({
    status: 'running',
    rulesProcessed: 1247853,
    avgProcessingTime: 12,
    violations: 23,
    lastUpdated: new Date()
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  // Simulate real-time rule processing
  useEffect(() => {
    const interval = setInterval(() => {
      setRuleEngine(prev => ({
        ...prev,
        rulesProcessed: prev.rulesProcessed + Math.floor(Math.random() * 100),
        avgProcessingTime: 10 + Math.random() * 5,
        violations: prev.violations + (Math.random() > 0.95 ? 1 : 0),
        lastUpdated: new Date()
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="h-4 w-4 text-green-600" />;
      case 'paused': return <Pause className="h-4 w-4 text-yellow-600" />;
      case 'disabled': return <XCircle className="h-4 w-4 text-gray-400" />;
      default: return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Business Rules Framework</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive compliance and regulatory rule management across industries, governments, and use cases
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import Rules
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Config
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Rule
          </Button>
        </div>
      </div>

      {/* Real-time Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Rule Engine Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                <span className="font-semibold">Active</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Rules Processed</p>
              <p className="text-2xl font-bold">{ruleEngine.rulesProcessed.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Processing Time</p>
              <p className="text-2xl font-bold">{ruleEngine.avgProcessingTime.toFixed(1)}ms</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Violations Today</p>
              <p className="text-2xl font-bold text-orange-600">{ruleEngine.violations}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="text-sm font-medium">
                {ruleEngine.lastUpdated.toLocaleTimeString()}
              </p>
            </div>
          </div>
          <Progress value={85} className="mt-4" />
          <p className="text-xs text-gray-600 mt-1">System Health: 85%</p>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="industries" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="industries">Industries</TabsTrigger>
          <TabsTrigger value="governments">Governments</TabsTrigger>
          <TabsTrigger value="usecases">Use Cases</TabsTrigger>
          <TabsTrigger value="risk">Risk Management</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* Industries Tab */}
        <TabsContent value="industries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Industry-Specific Rules</CardTitle>
              <CardDescription>
                Regulatory compliance and business rules by industry vertical
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(businessRulesData.industries).map(([key, industry]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <industry.icon className="h-4 w-4" />
                          {industry.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Search rules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-xs"
                />

                <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showActiveOnly}
                    onChange={(e) => setShowActiveOnly(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label>Active Only</Label>
                </div>
              </div>

              {selectedIndustry && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    {(() => {
                      const Icon = businessRulesData.industries[selectedIndustry].icon;
                      return <Icon className="h-8 w-8 text-blue-600" />;
                    })()}
                    <div>
                      <h3 className="font-semibold text-lg">
                        {businessRulesData.industries[selectedIndustry].name}
                      </h3>
                      <div className="flex gap-2 mt-1">
                        {businessRulesData.industries[selectedIndustry].regulations.map((reg) => (
                          <Badge key={reg} variant="secondary">
                            {reg}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {businessRulesData.industries[selectedIndustry].rules
                      .filter(rule =>
                        (filterSeverity === 'all' || rule.severity === filterSeverity) &&
                        (!showActiveOnly || rule.status === 'active') &&
                        (searchTerm === '' ||
                          rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rule.description.toLowerCase().includes(searchTerm.toLowerCase()))
                      )
                      .map((rule) => (
                        <Card key={rule.id} className="shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  {getStatusIcon(rule.status)}
                                  <h4 className="font-semibold">{rule.name}</h4>
                                  <Badge className={getSeverityColor(rule.severity)}>
                                    {rule.severity}
                                  </Badge>
                                  <Badge variant="outline">{rule.category}</Badge>
                                  <span className="text-xs text-gray-500">#{rule.id}</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-2">{rule.description}</p>

                                <details className="mt-3">
                                  <summary className="cursor-pointer text-sm font-medium py-2">
                                    View Details
                                  </summary>
                                  <div className="mt-2 grid grid-cols-2 gap-4">
                                    <div>
                                      <h5 className="font-medium text-sm mb-2">Conditions</h5>
                                      <ul className="space-y-1">
                                        {rule.conditions.map((condition: string, idx: number) => (
                                          <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                            <ChevronRight className="h-3 w-3 mt-0.5" />
                                            {condition}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                    <div>
                                      <h5 className="font-medium text-sm mb-2">Actions</h5>
                                      <ul className="space-y-1">
                                        {rule.actions.map((action: string, idx: number) => (
                                          <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                            <Zap className="h-3 w-3 mt-0.5 text-blue-600" />
                                            {action}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                </details>
                              </div>
                              <div className="flex gap-1">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Edit Rule</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <Copy className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Duplicate Rule</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        {rule.status === 'active' ?
                                          <Pause className="h-4 w-4" /> :
                                          <Play className="h-4 w-4" />
                                        }
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {rule.status === 'active' ? 'Pause' : 'Activate'} Rule
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Governments Tab */}
        <TabsContent value="governments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Government & Regulatory Requirements</CardTitle>
              <CardDescription>
                Jurisdiction-specific compliance requirements and regulations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {Object.entries(businessRulesData.governments).map(([key, govt]) => (
                  <Card
                    key={key}
                    className={`cursor-pointer transition-all ${
                      selectedGovernment === key ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedGovernment(key)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <govt.icon className="h-6 w-6 text-blue-600" />
                        <h3 className="font-semibold">{govt.name}</h3>
                      </div>

                      {govt.regulations && (
                        <div className="space-y-2">
                          {govt.regulations.federal && (
                            <div>
                              <p className="text-xs font-medium text-gray-600">Federal</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {govt.regulations.federal.slice(0, 3).map((reg) => (
                                  <Badge key={reg} variant="outline" className="text-xs">
                                    {reg}
                                  </Badge>
                                ))}
                                {govt.regulations.federal.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{govt.regulations.federal.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {govt.requirements && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-gray-600">Requirements</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {govt.requirements.length} compliance requirements
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedGovernment && (
                <div className="mt-6 space-y-4">
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertTitle>Compliance Requirements</AlertTitle>
                    <AlertDescription>
                      {businessRulesData.governments[selectedGovernment].requirements?.length || 0} active requirements for {businessRulesData.governments[selectedGovernment].name}
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    {businessRulesData.governments[selectedGovernment].requirements?.map((req, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="text-sm">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Use Cases Tab */}
        <TabsContent value="usecases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Use Case Specific Rules</CardTitle>
              <CardDescription>
                Business rules tailored for specific payment and financial use cases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  {Object.entries(businessRulesData.useCases).map(([key, useCase]) => (
                    <Card
                      key={key}
                      className={`cursor-pointer transition-all ${
                        selectedUseCase === key ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedUseCase(key)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <useCase.icon className="h-5 w-5 text-blue-600" />
                          <div>
                            <h4 className="font-semibold">{useCase.name}</h4>
                            <p className="text-xs text-gray-600">
                              {useCase.rules.length} active rules
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="space-y-3">
                  {selectedUseCase && businessRulesData.useCases[selectedUseCase].rules.map((rule, idx) => (
                    <Card key={idx}>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-3">{rule.name}</h4>

                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-medium text-gray-600 mb-1">Conditions</p>
                            <div className="space-y-1">
                              {rule.conditions.map((condition, cidx) => (
                                <div key={cidx} className="text-sm text-gray-600 flex items-center gap-2">
                                  <Filter className="h-3 w-3" />
                                  {condition}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-xs font-medium text-gray-600 mb-1">Requirements</p>
                            <div className="space-y-1">
                              {rule.requirements.map((req, ridx) => (
                                <div key={ridx} className="text-sm text-gray-600 flex items-center gap-2">
                                  <FileCheck className="h-3 w-3" />
                                  {req}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Management Tab */}
        <TabsContent value="risk" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(businessRulesData.riskCategories).map(([key, category]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <category.icon className="h-5 w-5" />
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Key Metrics</p>
                      <div className="space-y-1">
                        {category.metrics.map((metric) => (
                          <div key={metric} className="flex justify-between text-sm">
                            <span className="text-gray-600">{metric}</span>
                            <span className="font-medium">
                              {Math.floor(Math.random() * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Risk Level</p>
                      <div className="flex items-center gap-2">
                        <Progress value={Math.random() * 100} className="flex-1" />
                        <Badge variant={Math.random() > 0.5 ? 'default' : 'destructive'}>
                          {Math.random() > 0.5 ? 'Low' : 'High'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(businessRulesData.complianceFrameworks).map(([key, framework]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle>{framework.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {'levels' in framework && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Level</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Requirements</TableHead>
                          <TableHead>Daily Limit</TableHead>
                          <TableHead>Monthly Limit</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {framework.levels.map((level) => (
                          <TableRow key={level.level}>
                            <TableCell>{level.level}</TableCell>
                            <TableCell className="font-medium">{level.name}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {level.requirements.map((req) => (
                                  <Badge key={req} variant="outline" className="text-xs">
                                    {req}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>${level.limits.daily.toLocaleString()}</TableCell>
                            <TableCell>${level.limits.monthly.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}

                  {'components' in framework && (
                    <div className="grid grid-cols-2 gap-3">
                      {framework.components.map((component) => (
                        <div key={component} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <ShieldCheck className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{component}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {'requirements' in framework && (
                    <div className="space-y-3">
                      {Object.entries(framework.requirements).map(([reqKey, reqList]) => (
                        <div key={reqKey}>
                          <h4 className="font-medium text-sm mb-2 uppercase">{reqKey}</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {reqList.map((req) => (
                              <div key={req} className="flex items-center gap-2 text-sm text-gray-600">
                                <CheckCircle2 className="h-3 w-3 text-green-600" />
                                {req}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Rule Testing Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Rule Testing & Simulation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Test Transaction</Label>
              <Textarea
                placeholder="Enter test transaction JSON..."
                className="mt-2 font-mono text-sm"
                rows={6}
                defaultValue={JSON.stringify({
                  amount: 10000,
                  currency: 'USD',
                  type: 'wire',
                  from: 'US',
                  to: 'EU',
                  purpose: 'business'
                }, null, 2)}
              />
            </div>
            <div>
              <Label>Test Results</Label>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-2 min-h-[150px]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">AML screening: Passed</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Transaction limit: Review required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Sanctions check: Clear</span>
                </div>
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Regulatory reporting: Required</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button>
              <Play className="h-4 w-4 mr-2" />
              Run Test
            </Button>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear Results
            </Button>
            <Button variant="outline">
              <Save className="h-4 w-4 mr-2" />
              Save Test Case
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}