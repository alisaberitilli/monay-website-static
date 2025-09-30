'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft, Save, Copy, Trash2, History,
  AlertCircle, CheckCircle, Settings, GitBranch,
  Clock, Users, Shield, Activity, RefreshCw
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface RuleVersion {
  version: number;
  modifiedBy: string;
  modifiedAt: string;
  changes: string;
  status: 'active' | 'draft' | 'archived';
}

export default function EditBusinessRulePage() {
  const router = useRouter();
  const params = useParams();
  const ruleId = params.id as string;
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  // Rule data
  const [ruleName, setRuleName] = useState('Multi-Level Payment Approval');
  const [ruleDescription, setRuleDescription] = useState('Require multiple approvals for high-value transactions based on amount and department');
  const [isActive, setIsActive] = useState(true);
  const [priority, setPriority] = useState('high');
  const [category, setCategory] = useState('payment-approval');
  const [tags, setTags] = useState(['finance', 'compliance', 'approval-workflow']);
  const [newTag, setNewTag] = useState('');

  // Version history
  const [versions] = useState<RuleVersion[]>([
    {
      version: 3,
      modifiedBy: 'John Smith',
      modifiedAt: '2024-01-20 14:30',
      changes: 'Updated threshold amounts',
      status: 'active'
    },
    {
      version: 2,
      modifiedBy: 'Sarah Johnson',
      modifiedAt: '2024-01-15 10:15',
      changes: 'Added international payment conditions',
      status: 'archived'
    },
    {
      version: 1,
      modifiedBy: 'Admin User',
      modifiedAt: '2024-01-10 09:00',
      changes: 'Initial creation',
      status: 'archived'
    }
  ]);

  // Conditions
  const [conditions, setConditions] = useState([
    { field: 'amount', operator: 'greater-than', value: '100000' },
    { field: 'department', operator: 'equals', value: 'engineering' },
    { field: 'vendor_verified', operator: 'equals', value: 'true' }
  ]);

  // Actions
  const [actions, setActions] = useState([
    { type: 'escalate', target: 'cfo@company.com', level: 2 },
    { type: 'notify', recipients: ['finance@company.com'], template: 'high-value-approval' },
    { type: 'log', destination: 'audit-trail' }
  ]);

  // Performance metrics
  const [metrics] = useState({
    totalExecutions: 1543,
    avgExecutionTime: '245ms',
    successRate: 99.2,
    lastTriggered: '2 hours ago'
  });

  useEffect(() => {
    loadRuleData();
  }, [ruleId]);

  const loadRuleData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Rule loaded successfully');
    } catch (error) {
      toast.error('Failed to load rule');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Changes saved successfully');
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to save changes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicateRule = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Rule duplicated successfully');
      router.push('/business-rules/create?duplicate=' + ruleId);
    } catch (error) {
      toast.error('Failed to duplicate rule');
    }
  };

  const handleDeleteRule = async () => {
    if (!confirm('Are you sure you want to delete this rule? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Rule deleted successfully');
      router.push('/business-rules');
    } catch (error) {
      toast.error('Failed to delete rule');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevertVersion = async (version: number) => {
    if (!confirm(`Revert to version ${version}? Current changes will be lost.`)) {
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Reverted to version ${version}`);
      setShowVersionHistory(false);
    } catch (error) {
      toast.error('Failed to revert version');
    }
  };

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
      setHasChanges(true);
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
    setHasChanges(true);
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
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Edit Business Rule</h1>
              <Badge variant={isActive ? 'default' : 'secondary'}>
                {isActive ? 'Active' : 'Inactive'}
              </Badge>
              <Badge variant="outline">v{versions[0].version}</Badge>
            </div>
            <p className="text-gray-600">Rule ID: {ruleId}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowVersionHistory(!showVersionHistory)}
          >
            <History className="w-4 h-4 mr-2" />
            Version History
          </Button>
          <Button
            variant="outline"
            onClick={handleDuplicateRule}
          >
            <Copy className="w-4 h-4 mr-2" />
            Duplicate
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/business-rules/${ruleId}/test`)}
          >
            Test Rule
          </Button>
          <Button
            onClick={handleSaveChanges}
            disabled={!hasChanges || isLoading}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Alert for unsaved changes */}
      {hasChanges && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800">You have unsaved changes</span>
          </CardContent>
        </Card>
      )}

      {/* Version History Panel */}
      {showVersionHistory && (
        <Card>
          <CardHeader>
            <CardTitle>Version History</CardTitle>
            <CardDescription>View and restore previous versions of this rule</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {versions.map((version) => (
                <div
                  key={version.version}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={version.status === 'active' ? 'default' : 'secondary'}
                    >
                      v{version.version}
                    </Badge>
                    <div>
                      <p className="font-medium">{version.changes}</p>
                      <p className="text-sm text-gray-600">
                        {version.modifiedBy} • {version.modifiedAt}
                      </p>
                    </div>
                  </div>
                  {version.status !== 'active' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevertVersion(version.version)}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Revert
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Rule Details</CardTitle>
              <CardDescription>Basic information and configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>Rule Name</Label>
                  <Input
                    value={ruleName}
                    onChange={(e) => {
                      setRuleName(e.target.value);
                      setHasChanges(true);
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={category}
                    onValueChange={(value) => {
                      setCategory(value);
                      setHasChanges(true);
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="payment-approval">Payment Approval</SelectItem>
                      <SelectItem value="expense-management">Expense Management</SelectItem>
                      <SelectItem value="vendor-management">Vendor Management</SelectItem>
                      <SelectItem value="compliance-checks">Compliance Checks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={ruleDescription}
                  onChange={(e) => {
                    setRuleDescription(e.target.value);
                    setHasChanges(true);
                  }}
                  className="mt-1 h-24"
                />
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      className="w-32 h-7 text-sm"
                    />
                    <Button size="sm" onClick={addTag}>Add</Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label>Rule Status</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {isActive ? 'Rule is currently processing transactions' : 'Rule is paused and not processing'}
                  </p>
                </div>
                <Switch
                  checked={isActive}
                  onCheckedChange={(checked) => {
                    setIsActive(checked);
                    setHasChanges(true);
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conditions Tab */}
        <TabsContent value="conditions">
          <Card>
            <CardHeader>
              <CardTitle>Conditions</CardTitle>
              <CardDescription>Define when this rule should trigger</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {conditions.map((condition, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Badge variant="outline">{index + 1}</Badge>
                  <Select value={condition.field}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amount">Amount</SelectItem>
                      <SelectItem value="department">Department</SelectItem>
                      <SelectItem value="vendor_verified">Vendor Verified</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={condition.operator}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="greater-than">Greater Than</SelectItem>
                      <SelectItem value="less-than">Less Than</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input value={condition.value} className="flex-1" />
                  <Button variant="ghost" size="icon">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline">Add Condition</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Define what happens when conditions are met</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {actions.map((action, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline">Action {index + 1}</Badge>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Action Type</Label>
                      <Select value={action.type}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="escalate">Escalate</SelectItem>
                          <SelectItem value="notify">Notify</SelectItem>
                          <SelectItem value="log">Log</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {action.type === 'escalate' && (
                      <div>
                        <Label>Approval Levels</Label>
                        <Input type="number" value={action.level} className="mt-1" />
                      </div>
                    )}
                    {action.type === 'notify' && (
                      <div>
                        <Label>Recipients</Label>
                        <Input value={action.recipients?.join(', ')} className="mt-1" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <Button variant="outline">Add Action</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Monitor rule execution and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Total Executions</p>
                  <p className="text-2xl font-bold">{metrics.totalExecutions.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Execution Time</p>
                  <p className="text-2xl font-bold">{metrics.avgExecutionTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold">{metrics.successRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Triggered</p>
                  <p className="text-2xl font-bold">{metrics.lastTriggered}</p>
                </div>
              </div>

              <div className="mt-6">
                <Button onClick={() => router.push(`/business-rules/${ruleId}/analytics`)}>
                  View Detailed Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Configure advanced rule behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>Priority</Label>
                  <Select
                    value={priority}
                    onValueChange={(value) => {
                      setPriority(value);
                      setHasChanges(true);
                    }}
                  >
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
                <div>
                  <Label>Execution Timeout (ms)</Label>
                  <Input type="number" defaultValue="5000" className="mt-1" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Enable Logging</p>
                  <p className="text-sm text-gray-600">Log all rule executions for audit</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Dry Run Mode</p>
                  <p className="text-sm text-gray-600">Test without executing actions</p>
                </div>
                <Switch />
              </div>

              <div className="pt-6 border-t">
                <p className="text-sm text-gray-600 mb-4">
                  Danger Zone - These actions are irreversible
                </p>
                <Button
                  variant="destructive"
                  onClick={handleDeleteRule}
                  disabled={isLoading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Rule
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}