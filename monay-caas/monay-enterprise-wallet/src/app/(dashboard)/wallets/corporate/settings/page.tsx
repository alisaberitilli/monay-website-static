'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Settings,
  Shield,
  Key,
  Users,
  DollarSign,
  Bell,
  AlertTriangle,
  Save,
  RefreshCcw,
  Trash2,
  Plus,
  Edit,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Copy,
  Download,
  Upload,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface WalletSettings {
  basic: {
    name: string;
    description: string;
    department: string;
    tags: string[];
  };
  security: {
    requireMfa: boolean;
    ipWhitelist: string[];
    sessionTimeout: number;
    autoLock: boolean;
    allowApiAccess: boolean;
  };
  limits: {
    dailyLimit: number;
    monthlyLimit: number;
    transactionLimit: number;
    velocityLimit: number;
  };
  notifications: {
    transactionAlerts: boolean;
    securityAlerts: boolean;
    limitAlerts: boolean;
    emailNotifications: boolean;
    slackNotifications: boolean;
    webhookUrl: string;
  };
  compliance: {
    requireApprovals: boolean;
    autoFreeze: boolean;
    auditTrail: boolean;
    reportingEnabled: boolean;
  };
}

export default function CorporateSettingsPage() {
  const [activeTab, setActiveTab] = useState('basic');
  const [settings, setSettings] = useState<WalletSettings>({
    basic: {
      name: 'Treasury Operations',
      description: 'Primary treasury wallet for corporate operations',
      department: 'finance',
      tags: ['treasury', 'primary', 'corporate']
    },
    security: {
      requireMfa: true,
      ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
      sessionTimeout: 30,
      autoLock: true,
      allowApiAccess: false
    },
    limits: {
      dailyLimit: 500000,
      monthlyLimit: 10000000,
      transactionLimit: 100000,
      velocityLimit: 5
    },
    notifications: {
      transactionAlerts: true,
      securityAlerts: true,
      limitAlerts: true,
      emailNotifications: true,
      slackNotifications: false,
      webhookUrl: ''
    },
    compliance: {
      requireApprovals: true,
      autoFreeze: false,
      auditTrail: true,
      reportingEnabled: true
    }
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [newIpAddress, setNewIpAddress] = useState('');
  const [newTag, setNewTag] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const addIpAddress = () => {
    if (newIpAddress && !settings.security.ipWhitelist.includes(newIpAddress)) {
      setSettings(prev => ({
        ...prev,
        security: {
          ...prev.security,
          ipWhitelist: [...prev.security.ipWhitelist, newIpAddress]
        }
      }));
      setNewIpAddress('');
    }
  };

  const removeIpAddress = (ip: string) => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        ipWhitelist: prev.security.ipWhitelist.filter(item => item !== ip)
      }
    }));
  };

  const addTag = () => {
    if (newTag && !settings.basic.tags.includes(newTag)) {
      setSettings(prev => ({
        ...prev,
        basic: {
          ...prev.basic,
          tags: [...prev.basic.tags, newTag]
        }
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setSettings(prev => ({
      ...prev,
      basic: {
        ...prev.basic,
        tags: prev.basic.tags.filter(item => item !== tag)
      }
    }));
  };

  const handleSaveSettings = () => {
    console.log('Saving wallet settings:', settings);
    // Handle save logic here
  };

  const renderBasicSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="wallet-name">Wallet Name</Label>
            <Input
              id="wallet-name"
              value={settings.basic.name}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                basic: { ...prev.basic, name: e.target.value }
              }))}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="department">Department</Label>
            <Select
              value={settings.basic.department}
              onValueChange={(value) => setSettings(prev => ({
                ...prev,
                basic: { ...prev.basic, department: value }
              }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="procurement">Procurement</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
                <SelectItem value="treasury">Treasury</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={settings.basic.description}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                basic: { ...prev.basic, description: e.target.value }
              }))}
              className="mt-1"
              rows={3}
            />
          </div>
        </div>
      </div>
      <div>
        <Label>Wallet Tags</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {settings.basic.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-red-600"
              >
                <XCircle className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="Add tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTag()}
            className="max-w-xs"
          />
          <Button
            onClick={addTag}
            variant="outline"
            size="sm"
            className="border-orange-300 text-orange-600 hover:bg-orange-50"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Authentication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Require MFA</div>
                <div className="text-sm text-gray-500">Multi-factor authentication required</div>
              </div>
              <Switch
                checked={settings.security.requireMfa}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  security: { ...prev.security, requireMfa: checked }
                }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Auto-lock</div>
                <div className="text-sm text-gray-500">Lock wallet after inactivity</div>
              </div>
              <Switch
                checked={settings.security.autoLock}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  security: { ...prev.security, autoLock: checked }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Input
                id="session-timeout"
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
                }))}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">API Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Allow API Access</div>
                <div className="text-sm text-gray-500">Enable programmatic access</div>
              </div>
              <Switch
                checked={settings.security.allowApiAccess}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  security: { ...prev.security, allowApiAccess: checked }
                }))}
              />
            </div>
            {settings.security.allowApiAccess && (
              <div>
                <Label>API Key</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    value="sk_live_abcd1234567890..."
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText('sk_live_abcd1234567890...')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 text-red-600 border-red-300 hover:bg-red-50"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Regenerate Key
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">IP Whitelist</CardTitle>
          <CardDescription>Restrict access to specific IP addresses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {settings.security.ipWhitelist.map((ip) => (
              <div key={ip} className="flex items-center justify-between p-2 border rounded">
                <span className="font-mono text-sm">{ip}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeIpAddress(ip)}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <Input
              placeholder="192.168.1.0/24"
              value={newIpAddress}
              onChange={(e) => setNewIpAddress(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addIpAddress()}
            />
            <Button
              onClick={addIpAddress}
              className="bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add IP
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderLimitsSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="daily-limit">Daily Spending Limit</Label>
            <Input
              id="daily-limit"
              type="number"
              value={settings.limits.dailyLimit}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                limits: { ...prev.limits, dailyLimit: parseInt(e.target.value) }
              }))}
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Current: {formatCurrency(settings.limits.dailyLimit)}
            </p>
          </div>
          <div>
            <Label htmlFor="monthly-limit">Monthly Spending Limit</Label>
            <Input
              id="monthly-limit"
              type="number"
              value={settings.limits.monthlyLimit}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                limits: { ...prev.limits, monthlyLimit: parseInt(e.target.value) }
              }))}
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Current: {formatCurrency(settings.limits.monthlyLimit)}
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="transaction-limit">Single Transaction Limit</Label>
            <Input
              id="transaction-limit"
              type="number"
              value={settings.limits.transactionLimit}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                limits: { ...prev.limits, transactionLimit: parseInt(e.target.value) }
              }))}
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Current: {formatCurrency(settings.limits.transactionLimit)}
            </p>
          </div>
          <div>
            <Label htmlFor="velocity-limit">Transaction Velocity Limit</Label>
            <Input
              id="velocity-limit"
              type="number"
              value={settings.limits.velocityLimit}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                limits: { ...prev.limits, velocityLimit: parseInt(e.target.value) }
              }))}
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Maximum transactions per hour: {settings.limits.velocityLimit}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Alert Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Transaction Alerts</div>
                <div className="text-sm text-gray-500">Notify on all transactions</div>
              </div>
              <Switch
                checked={settings.notifications.transactionAlerts}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, transactionAlerts: checked }
                }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Security Alerts</div>
                <div className="text-sm text-gray-500">Notify on security events</div>
              </div>
              <Switch
                checked={settings.notifications.securityAlerts}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, securityAlerts: checked }
                }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Limit Alerts</div>
                <div className="text-sm text-gray-500">Notify when approaching limits</div>
              </div>
              <Switch
                checked={settings.notifications.limitAlerts}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, limitAlerts: checked }
                }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Delivery Methods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Email Notifications</div>
                <div className="text-sm text-gray-500">Send alerts via email</div>
              </div>
              <Switch
                checked={settings.notifications.emailNotifications}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, emailNotifications: checked }
                }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Slack Notifications</div>
                <div className="text-sm text-gray-500">Send alerts to Slack</div>
              </div>
              <Switch
                checked={settings.notifications.slackNotifications}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, slackNotifications: checked }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                placeholder="https://api.company.com/webhooks/wallet"
                value={settings.notifications.webhookUrl}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, webhookUrl: e.target.value }
                }))}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderComplianceSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Compliance Controls</CardTitle>
          <CardDescription>Configure regulatory and compliance features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Require Approvals</div>
                  <div className="text-sm text-gray-500">Multi-signature approval required</div>
                </div>
                <Switch
                  checked={settings.compliance.requireApprovals}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    compliance: { ...prev.compliance, requireApprovals: checked }
                  }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Enhanced Audit Trail</div>
                  <div className="text-sm text-gray-500">Detailed transaction logging</div>
                </div>
                <Switch
                  checked={settings.compliance.auditTrail}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    compliance: { ...prev.compliance, auditTrail: checked }
                  }))}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Auto-freeze Suspicious Activity</div>
                  <div className="text-sm text-gray-500">Automatically freeze on alerts</div>
                </div>
                <Switch
                  checked={settings.compliance.autoFreeze}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    compliance: { ...prev.compliance, autoFreeze: checked }
                  }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Regulatory Reporting</div>
                  <div className="text-sm text-gray-500">Generate compliance reports</div>
                </div>
                <Switch
                  checked={settings.compliance.reportingEnabled}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    compliance: { ...prev.compliance, reportingEnabled: checked }
                  }))}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Corporate Wallet Settings</h1>
          <p className="text-gray-600 mt-1">Configure security, limits, and compliance settings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Config
          </Button>
          <Button
            onClick={handleSaveSettings}
            size="sm"
            className="bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="limits">Limits</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update wallet name, description, and organization details</CardDescription>
            </CardHeader>
            <CardContent>
              {renderBasicSettings()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          {renderSecuritySettings()}
        </TabsContent>

        <TabsContent value="limits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Spending Limits</CardTitle>
              <CardDescription>Configure daily, monthly, and transaction limits</CardDescription>
            </CardHeader>
            <CardContent>
              {renderLimitsSettings()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          {renderNotificationSettings()}
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          {renderComplianceSettings()}
        </TabsContent>
      </Tabs>
    </div>
  );
}