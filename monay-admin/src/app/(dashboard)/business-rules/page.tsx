'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Shield, Plus, Search, Settings, Users, DollarSign, 
  AlertTriangle, CheckCircle, Clock, X,
  Code, Zap, Globe, BarChart3, FileText, Gavel
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { businessRulesService } from '@/services/business-rules.service';

interface BusinessRule {
  id: string;
  name: string;
  description: string;
  category: BusinessRuleCategory;
  priority: number;
  isActive: boolean;
  conditions: RuleCondition[];
  actions: RuleAction[];
  assignedUsers: number;
  violations: number;
  createdAt: string;
  lastModified: string;
}

interface RuleCondition {
  id: string;
  field: string;
  operator: 'equals' | 'greaterThan' | 'lessThan' | 'contains' | 'in' | 'between';
  value: any;
  logicOperator?: 'AND' | 'OR';
}

interface RuleAction {
  id: string;
  type: 'block' | 'flag' | 'approve' | 'escalate' | 'notify' | 'setLimit';
  parameters: Record<string, any>;
}

type BusinessRuleCategory = 
  | 'KYC_ELIGIBILITY' 
  | 'SPEND_MANAGEMENT' 
  | 'TRANSACTION_MONITORING' 
  | 'COMPLIANCE'
  | 'RISK_MANAGEMENT' 
  | 'GEOGRAPHIC_RESTRICTIONS';

interface SpendLimit {
  userId: string;
  userName: string;
  dailyLimit: number;
  monthlyLimit: number;
  transactionLimit: number;
  currentDailySpent: number;
  currentMonthlySpent: number;
  isActive: boolean;
}

export default function BusinessRulesPage() {
  const [rules, setRules] = useState<BusinessRule[]>([]);
  const [spendLimits, setSpendLimits] = useState<SpendLimit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    category: 'KYC_ELIGIBILITY' as BusinessRuleCategory,
    priority: 100,
    conditions: [] as RuleCondition[],
    actions: [] as RuleAction[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const rulesData = await businessRulesService.getAllBusinessRules();
      setRules(Array.isArray(rulesData) ? rulesData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setRules([]);
    }

    setSpendLimits([
      { userId: '1', userName: 'John Doe', dailyLimit: 5000, monthlyLimit: 50000, transactionLimit: 10000, currentDailySpent: 2300, currentMonthlySpent: 15600, isActive: true },
      { userId: '2', userName: 'Jane Smith', dailyLimit: 1000, monthlyLimit: 10000, transactionLimit: 2500, currentDailySpent: 750, currentMonthlySpent: 4200, isActive: true },
      { userId: '3', userName: 'Sarah Wilson', dailyLimit: 25000, monthlyLimit: 250000, transactionLimit: 50000, currentDailySpent: 12000, currentMonthlySpent: 89000, isActive: true },
    ]);
    
    setLoading(false);
  };

  const getCategoryIcon = (category: BusinessRuleCategory) => {
    switch (category) {
      case 'KYC_ELIGIBILITY': return <Shield className="w-4 h-4" />;
      case 'SPEND_MANAGEMENT': return <DollarSign className="w-4 h-4" />;
      case 'TRANSACTION_MONITORING': return <BarChart3 className="w-4 h-4" />;
      case 'COMPLIANCE': return <Gavel className="w-4 h-4" />;
      case 'RISK_MANAGEMENT': return <AlertTriangle className="w-4 h-4" />;
      case 'GEOGRAPHIC_RESTRICTIONS': return <Globe className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: BusinessRuleCategory) => {
    switch (category) {
      case 'KYC_ELIGIBILITY': return 'bg-blue-500 text-white';
      case 'SPEND_MANAGEMENT': return 'bg-green-500 text-white';
      case 'TRANSACTION_MONITORING': return 'bg-purple-500 text-white';
      case 'COMPLIANCE': return 'bg-red-500 text-white';
      case 'RISK_MANAGEMENT': return 'bg-orange-500 text-white';
      case 'GEOGRAPHIC_RESTRICTIONS': return 'bg-gray-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const getPriorityBadge = (priority: number) => {
    if (priority >= 150) return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
    if (priority >= 100) return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
    if (priority >= 50) return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
    return <Badge className="bg-green-100 text-green-800">Low</Badge>;
  };

  const addCondition = () => {
    const newCondition: RuleCondition = {
      id: Date.now().toString(),
      field: '',
      operator: 'equals',
      value: '',
    };
    setNewRule({ ...newRule, conditions: [...newRule.conditions, newCondition] });
  };

  const addAction = () => {
    const newAction: RuleAction = {
      id: Date.now().toString(),
      type: 'block',
      parameters: {},
    };
    setNewRule({ ...newRule, actions: [...newRule.actions, newAction] });
  };

  const createRule = async () => {
    // Basic validation
    if (!newRule.name?.trim()) {
      toast.error('Rule name is required');
      return;
    }

    if (!newRule.description?.trim()) {
      toast.error('Rule description is required');
      return;
    }

    if (newRule.conditions.length === 0) {
      toast.error('Please add at least one condition');
      return;
    }

    if (newRule.actions.length === 0) {
      toast.error('Please add at least one action');
      return;
    }

    // Validate conditions
    for (const condition of newRule.conditions) {
      if (!condition.field || !condition.operator || condition.value === undefined || condition.value === '') {
        toast.error('All condition fields must be filled');
        return;
      }
    }

    // Validate actions
    for (const action of newRule.actions) {
      if (!action.type) {
        toast.error('All action types must be selected');
        return;
      }
    }

    try {
      const result = await businessRulesService.createBusinessRule(newRule);
      
      if (result.success) {
        toast.success('Business rule created successfully');
        setShowCreateModal(false);
        setNewRule({
          name: '',
          description: '',
          category: 'KYC_ELIGIBILITY',
          priority: 100,
          conditions: [],
          actions: [],
        });
        fetchData();
      } else {
        toast.error('Failed to create business rule');
      }
    } catch (error) {
      toast.error('Failed to create business rule');
      console.error('Error creating rule:', error);
    }
  };

  const toggleRuleStatus = (ruleId: string) => {
    setRules(rules.map(rule => 
      rule.id === ruleId 
        ? { ...rule, isActive: !rule.isActive }
        : rule
    ));
    toast.success('Rule status updated');
  };

  const filteredRules = Array.isArray(rules) ? rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || rule.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) : [];

  const stats = {
    totalRules: Array.isArray(rules) ? rules.length : 0,
    activeRules: Array.isArray(rules) ? rules.filter(r => r.isActive).length : 0,
    totalViolations: Array.isArray(rules) ? rules.reduce((sum, r) => sum + r.violations, 0) : 0,
    usersWithRules: Array.isArray(rules) ? Array.from(new Set(rules.map(r => r.assignedUsers))).length : 0,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading business rules...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Business Rules Framework</h1>
          <p className="text-muted-foreground mt-1">Manage KYC eligibility, spend limits, and compliance rules</p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Business Rule</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Rule Name *</Label>
                  <Input
                    id="name"
                    value={newRule.name}
                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                    placeholder="Enter rule name"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={newRule.description}
                    onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                    placeholder="Describe what this rule does"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newRule.category} onValueChange={(value) => setNewRule({ ...newRule, category: value as BusinessRuleCategory })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="KYC_ELIGIBILITY">KYC Eligibility</SelectItem>
                        <SelectItem value="SPEND_MANAGEMENT">Spend Management</SelectItem>
                        <SelectItem value="TRANSACTION_MONITORING">Transaction Monitoring</SelectItem>
                        <SelectItem value="COMPLIANCE">Compliance</SelectItem>
                        <SelectItem value="RISK_MANAGEMENT">Risk Management</SelectItem>
                        <SelectItem value="GEOGRAPHIC_RESTRICTIONS">Geographic Restrictions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority (0-200)</Label>
                    <Input
                      id="priority"
                      type="number"
                      value={newRule.priority}
                      onChange={(e) => setNewRule({ ...newRule, priority: parseInt(e.target.value) || 100 })}
                    />
                  </div>
                </div>
              </div>

              {/* Conditions */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>Conditions</Label>
                  <Button onClick={addCondition} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Condition
                  </Button>
                </div>
                <div className="space-y-2">
                  {newRule.conditions.map((condition, index) => (
                    <div key={condition.id} className="flex items-center gap-2 p-3 border rounded">
                      <Select value={condition.field} onValueChange={(value) => {
                        const updatedConditions = [...newRule.conditions];
                        updatedConditions[index].field = value;
                        setNewRule({ ...newRule, conditions: updatedConditions });
                      }}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Field" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="transaction_amount">Transaction Amount</SelectItem>
                          <SelectItem value="kyc_level">KYC Level</SelectItem>
                          <SelectItem value="user_tier">User Tier</SelectItem>
                          <SelectItem value="daily_spent">Daily Spent</SelectItem>
                          <SelectItem value="user_country">User Country</SelectItem>
                          <SelectItem value="risk_score">Risk Score</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={condition.operator} onValueChange={(value) => {
                        const updatedConditions = [...newRule.conditions];
                        updatedConditions[index].operator = value as any;
                        setNewRule({ ...newRule, conditions: updatedConditions });
                      }}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="greaterThan">Greater Than</SelectItem>
                          <SelectItem value="lessThan">Less Than</SelectItem>
                          <SelectItem value="contains">Contains</SelectItem>
                          <SelectItem value="in">In List</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Value"
                        value={condition.value}
                        onChange={(e) => {
                          const updatedConditions = [...newRule.conditions];
                          updatedConditions[index].value = e.target.value;
                          setNewRule({ ...newRule, conditions: updatedConditions });
                        }}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => {
                          const updatedConditions = newRule.conditions.filter(c => c.id !== condition.id);
                          setNewRule({ ...newRule, conditions: updatedConditions });
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>Actions</Label>
                  <Button onClick={addAction} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Action
                  </Button>
                </div>
                <div className="space-y-2">
                  {newRule.actions.map((action, index) => (
                    <div key={action.id} className="flex items-center gap-2 p-3 border rounded">
                      <Select value={action.type} onValueChange={(value) => {
                        const updatedActions = [...newRule.actions];
                        updatedActions[index].type = value as any;
                        setNewRule({ ...newRule, actions: updatedActions });
                      }}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="block">Block Transaction</SelectItem>
                          <SelectItem value="flag">Flag for Review</SelectItem>
                          <SelectItem value="approve">Auto Approve</SelectItem>
                          <SelectItem value="escalate">Escalate</SelectItem>
                          <SelectItem value="notify">Send Notification</SelectItem>
                          <SelectItem value="setLimit">Set Limit</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Parameters (JSON)"
                        className="flex-1"
                        onChange={(e) => {
                          const updatedActions = [...newRule.actions];
                          try {
                            updatedActions[index].parameters = JSON.parse(e.target.value || '{}');
                          } catch {
                            // Invalid JSON
                          }
                          setNewRule({ ...newRule, actions: updatedActions });
                        }}
                      />
                      <Button
                        onClick={() => {
                          const updatedActions = newRule.actions.filter(a => a.id !== action.id);
                          setNewRule({ ...newRule, actions: updatedActions });
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={createRule}>
                Create Rule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Rules</p>
                <p className="text-2xl font-bold">{stats.totalRules}</p>
              </div>
              <Settings className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Rules</p>
                <p className="text-2xl font-bold">{stats.activeRules}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Violations</p>
                <p className="text-2xl font-bold">{stats.totalViolations}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Users with Rules</p>
                <p className="text-2xl font-bold">{stats.usersWithRules}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Business Rules</TabsTrigger>
          <TabsTrigger value="spend-limits">Spend Limits</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="assignments">User Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="rules">
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search rules..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="KYC_ELIGIBILITY">KYC Eligibility</SelectItem>
                    <SelectItem value="SPEND_MANAGEMENT">Spend Management</SelectItem>
                    <SelectItem value="TRANSACTION_MONITORING">Transaction Monitoring</SelectItem>
                    <SelectItem value="COMPLIANCE">Compliance</SelectItem>
                    <SelectItem value="RISK_MANAGEMENT">Risk Management</SelectItem>
                    <SelectItem value="GEOGRAPHIC_RESTRICTIONS">Geographic Restrictions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Rules Table */}
          <Card>
            <CardHeader>
              <CardTitle>Business Rules ({filteredRules.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rule</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned Users</TableHead>
                    <TableHead>Violations</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{rule.name}</div>
                          <div className="text-sm text-muted-foreground">{rule.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(rule.category)}>
                          {getCategoryIcon(rule.category)}
                          <span className="ml-1">{rule.category.replace('_', ' ')}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getPriorityBadge(rule.priority)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={rule.isActive}
                            onCheckedChange={() => toggleRuleStatus(rule.id)}
                          />
                          <span className="text-sm">
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center font-medium">{rule.assignedUsers}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {rule.violations > 0 && (
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                          )}
                          <span className={rule.violations > 0 ? 'text-orange-600 font-medium' : ''}>
                            {rule.violations}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spend-limits">
          <Card>
            <CardHeader>
              <CardTitle>User Spend Limits</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Daily Limit</TableHead>
                    <TableHead>Monthly Limit</TableHead>
                    <TableHead>Transaction Limit</TableHead>
                    <TableHead>Usage Today</TableHead>
                    <TableHead>Usage This Month</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {spendLimits.map((limit) => (
                    <TableRow key={limit.userId}>
                      <TableCell>
                        <div className="font-medium">{limit.userName}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">${limit.dailyLimit.toLocaleString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">${limit.monthlyLimit.toLocaleString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">${limit.transactionLimit.toLocaleString()}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">
                            ${limit.currentDailySpent.toLocaleString()} / ${limit.dailyLimit.toLocaleString()}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${Math.min((limit.currentDailySpent / limit.dailyLimit) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">
                            ${limit.currentMonthlySpent.toLocaleString()} / ${limit.monthlyLimit.toLocaleString()}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${Math.min((limit.currentMonthlySpent / limit.monthlyLimit) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={limit.isActive ? 'default' : 'secondary'}>
                          {limit.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="violations">
          <Card>
            <CardHeader>
              <CardTitle>Recent Violations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Violation tracking interface coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Rule Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                User assignment interface coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}