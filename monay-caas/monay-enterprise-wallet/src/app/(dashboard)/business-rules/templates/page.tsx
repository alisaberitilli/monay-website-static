'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Building, Landmark, TrendingUp, Heart, GraduationCap,
  Shield, DollarSign, Users, Clock, FileText,
  CreditCard, AlertCircle, CheckCircle, ArrowRight,
  Search, Filter, Copy, Eye, Download, Star
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface RuleTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  industry: string;
  complexity: 'simple' | 'moderate' | 'complex';
  popularity: number;
  rules: number;
  conditions: string[];
  actions: string[];
  requiredApprovals?: number;
  icon: any;
  featured?: boolean;
}

const industryIcons = {
  enterprise: Building,
  government: Landmark,
  'financial-institution': TrendingUp,
  healthcare: Heart,
  education: GraduationCap
};

export default function BusinessRulesTemplatesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<RuleTemplate | null>(null);

  // Industry-specific templates
  const templates: RuleTemplate[] = [
    // Enterprise Templates
    {
      id: 'ent-1',
      name: 'Multi-Level Expense Approval',
      description: 'Hierarchical approval workflow based on expense amount and category',
      category: 'Expense Management',
      industry: 'enterprise',
      complexity: 'moderate',
      popularity: 95,
      rules: 8,
      conditions: [
        'Amount > $5,000 requires manager approval',
        'Amount > $25,000 requires director approval',
        'Amount > $100,000 requires C-level approval',
        'International expenses require compliance review'
      ],
      actions: ['Route to approver', 'Send notifications', 'Log in audit trail'],
      requiredApprovals: 3,
      icon: DollarSign,
      featured: true
    },
    {
      id: 'ent-2',
      name: 'Vendor Payment Controls',
      description: 'Automated vendor verification and payment scheduling rules',
      category: 'Vendor Management',
      industry: 'enterprise',
      complexity: 'complex',
      popularity: 88,
      rules: 12,
      conditions: [
        'Vendor must be verified',
        'Invoice must match PO',
        'Payment terms validation',
        'Duplicate payment prevention'
      ],
      actions: ['Schedule payment', 'Apply early payment discount', 'Generate remittance'],
      icon: Users
    },
    {
      id: 'ent-3',
      name: 'Travel & Entertainment Policy',
      description: 'Enforce company T&E policies with automated compliance checks',
      category: 'Expense Management',
      industry: 'enterprise',
      complexity: 'moderate',
      popularity: 82,
      rules: 10,
      conditions: [
        'Daily meal limits by location',
        'Hotel rate caps by city',
        'Preferred vendor requirements',
        'Receipt requirements by amount'
      ],
      actions: ['Auto-approve compliant expenses', 'Flag violations', 'Request documentation'],
      icon: CreditCard
    },

    // Government Templates
    {
      id: 'gov-1',
      name: 'Public Procurement Compliance',
      description: 'Ensure compliance with government procurement regulations',
      category: 'Procurement',
      industry: 'government',
      complexity: 'complex',
      popularity: 92,
      rules: 15,
      conditions: [
        'Competitive bidding for purchases > $25,000',
        'Small business set-aside requirements',
        'Buy American Act compliance',
        'Davis-Bacon wage requirements'
      ],
      actions: ['Initiate RFP process', 'Verify vendor certifications', 'Generate compliance reports'],
      requiredApprovals: 4,
      icon: Landmark,
      featured: true
    },
    {
      id: 'gov-2',
      name: 'Budget Control Framework',
      description: 'Prevent overspending and ensure budget compliance',
      category: 'Budget Management',
      industry: 'government',
      complexity: 'moderate',
      popularity: 89,
      rules: 9,
      conditions: [
        'Check available budget before approval',
        'Fiscal year constraints',
        'Fund type restrictions',
        'Appropriation limits'
      ],
      actions: ['Block over-budget transactions', 'Alert budget officers', 'Suggest alternatives'],
      icon: Shield
    },
    {
      id: 'gov-3',
      name: 'Grant Management Rules',
      description: 'Automated grant disbursement and compliance monitoring',
      category: 'Grants',
      industry: 'government',
      complexity: 'complex',
      popularity: 78,
      rules: 14,
      conditions: [
        'Milestone completion verification',
        'Matching fund requirements',
        'Allowable cost validation',
        'Performance metric thresholds'
      ],
      actions: ['Release funds', 'Request progress reports', 'Initiate audits'],
      icon: FileText
    },

    // Financial Institution Templates
    {
      id: 'fin-1',
      name: 'AML Transaction Monitoring',
      description: 'Anti-money laundering detection and reporting rules',
      category: 'Compliance',
      industry: 'financial-institution',
      complexity: 'complex',
      popularity: 97,
      rules: 20,
      conditions: [
        'Unusual transaction patterns',
        'High-risk jurisdictions',
        'Structuring detection',
        'PEP involvement'
      ],
      actions: ['File SAR', 'Freeze account', 'Enhanced due diligence', 'Alert compliance'],
      requiredApprovals: 2,
      icon: AlertCircle,
      featured: true
    },
    {
      id: 'fin-2',
      name: 'Trading Limits & Controls',
      description: 'Position limits and risk management for trading desks',
      category: 'Risk Management',
      industry: 'financial-institution',
      complexity: 'complex',
      popularity: 91,
      rules: 18,
      conditions: [
        'Position size limits',
        'Concentration limits',
        'VaR thresholds',
        'Stop-loss triggers'
      ],
      actions: ['Block trade', 'Force position reduction', 'Alert risk management'],
      icon: TrendingUp
    },
    {
      id: 'fin-3',
      name: 'Credit Approval Workflow',
      description: 'Automated credit decisioning based on risk scoring',
      category: 'Credit',
      industry: 'financial-institution',
      complexity: 'moderate',
      popularity: 86,
      rules: 11,
      conditions: [
        'Credit score thresholds',
        'Debt-to-income ratios',
        'Collateral requirements',
        'Industry exposure limits'
      ],
      actions: ['Approve loan', 'Request additional docs', 'Refer to underwriting'],
      icon: CheckCircle
    },

    // Healthcare Templates
    {
      id: 'health-1',
      name: 'HIPAA Compliance Rules',
      description: 'Ensure protected health information access controls',
      category: 'Compliance',
      industry: 'healthcare',
      complexity: 'complex',
      popularity: 94,
      rules: 16,
      conditions: [
        'Role-based access verification',
        'Minimum necessary standard',
        'Audit log requirements',
        'Encryption requirements'
      ],
      actions: ['Grant access', 'Log access attempt', 'Alert privacy officer'],
      requiredApprovals: 2,
      icon: Shield,
      featured: true
    },
    {
      id: 'health-2',
      name: 'Prior Authorization Workflow',
      description: 'Automated insurance prior authorization processing',
      category: 'Revenue Cycle',
      industry: 'healthcare',
      complexity: 'moderate',
      popularity: 87,
      rules: 13,
      conditions: [
        'CPT code requirements',
        'Medical necessity criteria',
        'Network status',
        'Benefit eligibility'
      ],
      actions: ['Auto-approve', 'Request medical records', 'Peer-to-peer review'],
      icon: Heart
    },

    // Education Templates
    {
      id: 'edu-1',
      name: 'Student Financial Aid Rules',
      description: 'Automated financial aid eligibility and disbursement',
      category: 'Financial Aid',
      industry: 'education',
      complexity: 'moderate',
      popularity: 90,
      rules: 12,
      conditions: [
        'SAP requirements',
        'Enrollment status',
        'EFC calculations',
        'Award limits'
      ],
      actions: ['Disburse aid', 'Place hold', 'Request verification'],
      requiredApprovals: 2,
      icon: GraduationCap,
      featured: true
    },
    {
      id: 'edu-2',
      name: 'Research Grant Management',
      description: 'Control and monitor research grant spending',
      category: 'Research',
      industry: 'education',
      complexity: 'complex',
      popularity: 83,
      rules: 14,
      conditions: [
        'Allowable cost categories',
        'Effort certification',
        'Cost sharing requirements',
        'Indirect cost rates'
      ],
      actions: ['Approve expense', 'Request PI approval', 'Generate reports'],
      icon: FileText
    }
  ];

  // Filter templates based on search and industry
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = selectedIndustry === 'all' || template.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  const handleUseTemplate = async (template: RuleTemplate) => {
    setSelectedTemplate(template);
    toast.success(`Loading ${template.name} template...`);
    // Navigate to create page with template pre-filled
    setTimeout(() => {
      router.push(`/business-rules/create?template=${template.id}`);
    }, 1000);
  };

  const handlePreviewTemplate = (template: RuleTemplate) => {
    setSelectedTemplate(template);
    toast.success(`Previewing ${template.name}`);
  };

  const handleDownloadTemplate = async (template: RuleTemplate) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Downloaded ${template.name} template`);
    } catch (error) {
      toast.error('Failed to download template');
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'text-green-600 bg-green-50';
      case 'moderate': return 'text-yellow-600 bg-yellow-50';
      case 'complex': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Business Rule Templates</h1>
          <p className="text-gray-600">Industry-specific templates for programmable money rules</p>
        </div>
        <Button
          className="bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
          onClick={() => router.push('/business-rules/create')}
        >
          Create Custom Rule
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Search Templates</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-64">
              <Label>Industry</Label>
              <Tabs value={selectedIndustry} onValueChange={setSelectedIndustry} className="mt-1">
                <TabsList className="grid grid-cols-3 h-auto">
                  <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                  <TabsTrigger value="enterprise" className="text-xs">Enterprise</TabsTrigger>
                  <TabsTrigger value="government" className="text-xs">Government</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <Button
              variant={selectedIndustry === 'financial-institution' ? 'default' : 'outline'}
              size="sm"
              className={selectedIndustry === 'financial-institution'
                ? 'bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500'
                : 'border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700'}
              onClick={() => setSelectedIndustry('financial-institution')}
            >
              Financial
            </Button>
            <Button
              variant={selectedIndustry === 'healthcare' ? 'default' : 'outline'}
              size="sm"
              className={selectedIndustry === 'healthcare'
                ? 'bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500'
                : 'border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700'}
              onClick={() => setSelectedIndustry('healthcare')}
            >
              Healthcare
            </Button>
            <Button
              variant={selectedIndustry === 'education' ? 'default' : 'outline'}
              size="sm"
              className={selectedIndustry === 'education'
                ? 'bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500'
                : 'border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700'}
              onClick={() => setSelectedIndustry('education')}
            >
              Education
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Featured Templates */}
      {selectedIndustry === 'all' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Featured Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.filter(t => t.featured).map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow border-2 border-blue-100">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <template.icon className="w-8 h-8 text-blue-500" />
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-semibold">{template.popularity}%</span>
                    </div>
                  </div>
                  <CardTitle className="mt-2">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">{template.industry}</Badge>
                    <Badge className={getComplexityColor(template.complexity)}>
                      {template.complexity}
                    </Badge>
                    <Badge variant="secondary">{template.rules} rules</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
                      onClick={() => handleUseTemplate(template)}
                    >
                      Use Template
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                      onClick={() => handlePreviewTemplate(template)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Templates Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          {selectedIndustry === 'all' ? 'All Templates' : `${selectedIndustry.charAt(0).toUpperCase() + selectedIndustry.slice(1)} Templates`}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => {
            const IndustryIcon = industryIcons[template.industry as keyof typeof industryIcons];
            return (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <IndustryIcon className="w-6 h-6 text-gray-500" />
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">Key Conditions:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {template.conditions.slice(0, 2).map((condition, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="mr-1">•</span>
                            <span className="line-clamp-1">{condition}</span>
                          </li>
                        ))}
                        {template.conditions.length > 2 && (
                          <li className="text-blue-500">+{template.conditions.length - 2} more</li>
                        )}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Badge className={getComplexityColor(template.complexity) + ' text-xs'}>
                          {template.complexity}
                        </Badge>
                        <span className="text-gray-500">{template.rules} rules</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-500">{template.popularity}% use</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
                        onClick={() => handleUseTemplate(template)}
                      >
                        Use Template
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                        onClick={() => handlePreviewTemplate(template)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                        onClick={() => handleDownloadTemplate(template)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <Card className="p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No templates found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
          <Button
            className="bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
            onClick={() => { setSearchTerm(''); setSelectedIndustry('all'); }}
          >
            Clear Filters
          </Button>
        </Card>
      )}
    </div>
  );
}