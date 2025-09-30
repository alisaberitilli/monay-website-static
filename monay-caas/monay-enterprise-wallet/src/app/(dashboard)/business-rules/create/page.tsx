'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus, Trash2, Save, ArrowLeft, ArrowRight,
  AlertCircle, CheckCircle, Settings, Play,
  GitBranch, Zap, Shield, Clock, Users, DollarSign,
  FileText, ChevronDown, ChevronUp, Copy, X
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Condition {
  id: string;
  field: string;
  operator: string;
  value: string;
  dataType: 'string' | 'number' | 'boolean' | 'date';
  logicalOperator?: 'AND' | 'OR';
}

interface Action {
  id: string;
  type: string;
  parameters: Record<string, any>;
  sequence: number;
}

interface Trigger {
  id: string;
  type: string;
  parameters: Record<string, any>;
}

export default function CreateBusinessRulePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [ruleName, setRuleName] = useState('');
  const [ruleDescription, setRuleDescription] = useState('');
  const [industry, setIndustry] = useState('enterprise');
  const [category, setCategory] = useState('payment-approval');
  const [priority, setPriority] = useState('medium');
  const [conditions, setConditions] = useState<Condition[]>([
    {
      id: '1',
      field: '',
      operator: 'equals',
      value: '',
      dataType: 'string',
      logicalOperator: 'AND'
    }
  ]);
  const [actions, setActions] = useState<Action[]>([
    {
      id: '1',
      type: 'approve',
      parameters: {},
      sequence: 1
    }
  ]);
  const [triggers, setTriggers] = useState<Trigger[]>([
    {
      id: '1',
      type: 'transaction',
      parameters: { event: 'payment_initiated' }
    }
  ]);
  const [isTestMode, setIsTestMode] = useState(false);

  // Industry-specific categories
  const categoryOptions = {
    enterprise: [
      'payment-approval',
      'expense-management',
      'vendor-management',
      'compliance-checks',
      'budget-controls'
    ],
    government: [
      'budget-controls',
      'procurement-rules',
      'grant-management',
      'regulatory-compliance',
      'audit-requirements'
    ],
    'financial-institution': [
      'trading-limits',
      'risk-management',
      'aml-compliance',
      'credit-approval',
      'regulatory-reporting'
    ],
    healthcare: [
      'hipaa-compliance',
      'prior-authorization',
      'billing-rules',
      'clinical-protocols',
      'insurance-verification'
    ],
    education: [
      'financial-aid',
      'enrollment-rules',
      'research-grants',
      'student-accounts',
      'academic-policies'
    ]
  };

  // Field options based on industry
  const fieldOptions = {
    enterprise: [
      'amount',
      'department',
      'vendor_id',
      'expense_category',
      'approval_level',
      'cost_center'
    ],
    government: [
      'amount',
      'fund_code',
      'appropriation',
      'fiscal_year',
      'vendor_type',
      'contract_id'
    ],
    'financial-institution': [
      'amount',
      'risk_score',
      'account_type',
      'transaction_type',
      'jurisdiction',
      'instrument_type'
    ],
    healthcare: [
      'amount',
      'cpt_code',
      'diagnosis_code',
      'provider_id',
      'insurance_plan',
      'authorization_status'
    ],
    education: [
      'amount',
      'student_id',
      'course_code',
      'grant_id',
      'semester',
      'gpa'
    ]
  };

  // Action types based on category
  const actionTypes = [
    { value: 'approve', label: 'Auto-Approve', icon: CheckCircle },
    { value: 'reject', label: 'Reject', icon: X },
    { value: 'escalate', label: 'Escalate for Approval', icon: Users },
    { value: 'notify', label: 'Send Notification', icon: AlertCircle },
    { value: 'hold', label: 'Place on Hold', icon: Clock },
    { value: 'route', label: 'Route to Department', icon: GitBranch },
    { value: 'flag', label: 'Flag for Review', icon: Shield },
    { value: 'log', label: 'Log to Audit Trail', icon: FileText },
    { value: 'calculate', label: 'Calculate Value', icon: DollarSign },
    { value: 'webhook', label: 'Call Webhook', icon: Zap }
  ];

  useEffect(() => {
    // Load template if specified
    if (templateId) {
      loadTemplate(templateId);
    }
  }, [templateId]);

  const loadTemplate = async (id: string) => {
    // Simulate loading template
    toast.success('Template loaded successfully');
    setRuleName('Multi-Level Expense Approval');
    setRuleDescription('Hierarchical approval workflow based on expense amount');
    setIndustry('enterprise');
    setCategory('expense-management');
    setPriority('high');
    setConditions([
      {
        id: '1',
        field: 'amount',
        operator: 'greater-than',
        value: '5000',
        dataType: 'number',
        logicalOperator: 'AND'
      },
      {
        id: '2',
        field: 'expense_category',
        operator: 'equals',
        value: 'travel',
        dataType: 'string',
        logicalOperator: 'OR'
      }
    ]);
  };

  const addCondition = () => {
    const newCondition: Condition = {
      id: Date.now().toString(),
      field: '',
      operator: 'equals',
      value: '',
      dataType: 'string',
      logicalOperator: 'AND'
    };
    setConditions([...conditions, newCondition]);
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  const updateCondition = (id: string, updates: Partial<Condition>) => {
    setConditions(conditions.map(c =>
      c.id === id ? { ...c, ...updates } : c
    ));
  };

  const addAction = () => {
    const newAction: Action = {
      id: Date.now().toString(),
      type: 'notify',
      parameters: {},
      sequence: actions.length + 1
    };
    setActions([...actions, newAction]);
  };

  const removeAction = (id: string) => {
    setActions(actions.filter(a => a.id !== id));
  };

  const updateAction = (id: string, updates: Partial<Action>) => {
    setActions(actions.map(a =>
      a.id === id ? { ...a, ...updates } : a
    ));
  };

  const handleSave = async () => {
    if (!ruleName || !ruleDescription) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Business rule created successfully');
      router.push('/business-rules');
    } catch (error) {
      toast.error('Failed to create business rule');
    }
  };

  const handleTest = () => {
    setIsTestMode(true);
    toast.success('Test mode activated. Configure test parameters.');
  };

  const handleDeploy = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Business rule deployed to production');
      router.push('/business-rules');
    } catch (error) {
      toast.error('Failed to deploy business rule');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/business-rules')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Business Rule</h1>
            <p className="text-gray-600">Define conditions and actions for programmable money</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleTest}>
            <Play className="w-4 h-4 mr-2" />
            Test
          </Button>
          <Button variant="outline" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={handleDeploy}>
            Deploy Rule
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {[
              { step: 1, label: 'Basic Info' },
              { step: 2, label: 'Conditions' },
              { step: 3, label: 'Actions' },
              { step: 4, label: 'Review' }
            ].map((item, index) => (
              <div key={item.step} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= item.step
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'border-gray-300 text-gray-500'
                  }`}
                >
                  {currentStep > item.step ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    item.step
                  )}
                </div>
                <span className={`ml-2 ${currentStep >= item.step ? 'text-black' : 'text-gray-500'}`}>
                  {item.label}
                </span>
                {index < 3 && (
                  <div
                    className={`w-20 h-1 mx-4 ${
                      currentStep > item.step ? 'bg-blue-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Tabs value={currentStep.toString()} onValueChange={(v) => setCurrentStep(parseInt(v))}>
        {/* Step 1: Basic Information */}
        <TabsContent value="1">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Define the rule name, description, and classification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>Rule Name *</Label>
                  <Input
                    placeholder="e.g., Multi-Level Expense Approval"
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Industry</Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                      <SelectItem value="government">Government</SelectItem>
                      <SelectItem value="financial-institution">Financial Institution</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Description *</Label>
                <Textarea
                  placeholder="Describe what this rule does and when it should trigger..."
                  value={ruleDescription}
                  onChange={(e) => setRuleDescription(e.target.value)}
                  className="mt-1 h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions[industry as keyof typeof categoryOptions]?.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.split('-').map(word =>
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setCurrentStep(2)}>
                  Next: Conditions
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 2: Conditions */}
        <TabsContent value="2">
          <Card>
            <CardHeader>
              <CardTitle>Define Conditions</CardTitle>
              <CardDescription>Set the conditions that must be met for this rule to trigger</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {conditions.map((condition, index) => (
                  <div key={condition.id} className="p-4 border rounded-lg space-y-4">
                    {index > 0 && (
                      <div className="flex items-center gap-2 mb-2">
                        <Select
                          value={condition.logicalOperator}
                          onValueChange={(value) =>
                            updateCondition(condition.id, { logicalOperator: value as 'AND' | 'OR' })
                          }
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AND">AND</SelectItem>
                            <SelectItem value="OR">OR</SelectItem>
                          </SelectContent>
                        </Select>
                        <Separator className="flex-1" />
                      </div>
                    )}
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <Label>Field</Label>
                        <Select
                          value={condition.field}
                          onValueChange={(value) =>
                            updateCondition(condition.id, { field: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            {fieldOptions[industry as keyof typeof fieldOptions]?.map((field) => (
                              <SelectItem key={field} value={field}>
                                {field.split('_').map(word =>
                                  word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Operator</Label>
                        <Select
                          value={condition.operator}
                          onValueChange={(value) =>
                            updateCondition(condition.id, { operator: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">Equals</SelectItem>
                            <SelectItem value="not-equals">Not Equals</SelectItem>
                            <SelectItem value="greater-than">Greater Than</SelectItem>
                            <SelectItem value="less-than">Less Than</SelectItem>
                            <SelectItem value="contains">Contains</SelectItem>
                            <SelectItem value="starts-with">Starts With</SelectItem>
                            <SelectItem value="in-list">In List</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Value</Label>
                        <Input
                          placeholder="Enter value"
                          value={condition.value}
                          onChange={(e) =>
                            updateCondition(condition.id, { value: e.target.value })
                          }
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCondition(condition.id)}
                          disabled={conditions.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" onClick={addCondition}>
                <Plus className="w-4 h-4 mr-2" />
                Add Condition
              </Button>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button onClick={() => setCurrentStep(3)}>
                  Next: Actions
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 3: Actions */}
        <TabsContent value="3">
          <Card>
            <CardHeader>
              <CardTitle>Define Actions</CardTitle>
              <CardDescription>Specify what happens when conditions are met</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {actions.map((action, index) => (
                  <div key={action.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline">Action {index + 1}</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAction(action.id)}
                        disabled={actions.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Action Type</Label>
                        <Select
                          value={action.type}
                          onValueChange={(value) =>
                            updateAction(action.id, { type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {actionTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  <type.icon className="w-4 h-4" />
                                  {type.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {action.type === 'escalate' && (
                        <div>
                          <Label>Approval Levels</Label>
                          <Input
                            type="number"
                            placeholder="e.g., 2"
                            value={action.parameters.approvalLevels || ''}
                            onChange={(e) =>
                              updateAction(action.id, {
                                parameters: { ...action.parameters, approvalLevels: e.target.value }
                              })
                            }
                          />
                        </div>
                      )}
                      {action.type === 'notify' && (
                        <div>
                          <Label>Recipients</Label>
                          <Input
                            placeholder="email@example.com"
                            value={action.parameters.recipients || ''}
                            onChange={(e) =>
                              updateAction(action.id, {
                                parameters: { ...action.parameters, recipients: e.target.value }
                              })
                            }
                          />
                        </div>
                      )}
                      {action.type === 'webhook' && (
                        <div>
                          <Label>Webhook URL</Label>
                          <Input
                            placeholder="https://api.example.com/webhook"
                            value={action.parameters.url || ''}
                            onChange={(e) =>
                              updateAction(action.id, {
                                parameters: { ...action.parameters, url: e.target.value }
                              })
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" onClick={addAction}>
                <Plus className="w-4 h-4 mr-2" />
                Add Action
              </Button>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button onClick={() => setCurrentStep(4)}>
                  Next: Review
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 4: Review */}
        <TabsContent value="4">
          <Card>
            <CardHeader>
              <CardTitle>Review Business Rule</CardTitle>
              <CardDescription>Review your rule configuration before deployment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Basic Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{ruleName || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Industry:</span>
                      <Badge variant="outline">{industry}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span>{category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Priority:</span>
                      <Badge
                        variant={priority === 'critical' ? 'destructive' : 'default'}
                      >
                        {priority}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Conditions ({conditions.length})</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    {conditions.map((condition, index) => (
                      <div key={condition.id} className="text-sm">
                        {index > 0 && (
                          <span className="font-medium text-blue-600">
                            {condition.logicalOperator}{' '}
                          </span>
                        )}
                        <span>
                          {condition.field} {condition.operator} "{condition.value}"
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Actions ({actions.length})</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    {actions.map((action, index) => {
                      const actionType = actionTypes.find(t => t.value === action.type);
                      return (
                        <div key={action.id} className="flex items-center gap-2">
                          <Badge variant="outline">{index + 1}</Badge>
                          {actionType && <actionType.icon className="w-4 h-4" />}
                          <span className="text-sm">{actionType?.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-800">Ready to Deploy</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      This rule will be active immediately upon deployment. You can test it first or deploy directly to production.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleTest}>
                    <Play className="w-4 h-4 mr-2" />
                    Test Rule
                  </Button>
                  <Button onClick={handleDeploy}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Deploy to Production
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}