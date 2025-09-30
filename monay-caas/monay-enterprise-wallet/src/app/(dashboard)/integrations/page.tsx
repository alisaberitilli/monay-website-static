'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Settings,
  Plus,
  ExternalLink,
  Check,
  AlertCircle,
  Clock,
  Shield,
  Zap,
  Database,
  Globe,
  Key,
  Link,
  Webhook,
  Code,
  Terminal,
  Download,
  Upload,
  RefreshCcw,
  Eye,
  Edit,
  Trash2,
  Search
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'payment' | 'blockchain' | 'compliance' | 'analytics' | 'developer';
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  provider: string;
  lastSync: Date;
  apiVersion: string;
  endpoints: number;
  webhooks: number;
}

interface APIKey {
  id: string;
  name: string;
  environment: 'production' | 'sandbox' | 'development';
  permissions: string[];
  lastUsed: Date;
  created: Date;
  status: 'active' | 'revoked' | 'expired';
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'int-001',
      name: 'Circle Pay',
      description: 'USDC payment processing and treasury management',
      category: 'payment',
      status: 'connected',
      provider: 'Circle',
      lastSync: new Date(Date.now() - 1000 * 60 * 5),
      apiVersion: 'v1.2',
      endpoints: 8,
      webhooks: 3
    },
    {
      id: 'int-002',
      name: 'Solana RPC',
      description: 'Direct blockchain interaction for consumer rail',
      category: 'blockchain',
      status: 'connected',
      provider: 'Helius',
      lastSync: new Date(Date.now() - 1000 * 60 * 2),
      apiVersion: 'v1.0',
      endpoints: 12,
      webhooks: 0
    },
    {
      id: 'int-003',
      name: 'Base L2 RPC',
      description: 'Enterprise blockchain operations',
      category: 'blockchain',
      status: 'connected',
      provider: 'Alchemy',
      lastSync: new Date(Date.now() - 1000 * 60 * 1),
      apiVersion: 'v2.0',
      endpoints: 15,
      webhooks: 2
    },
    {
      id: 'int-004',
      name: 'Persona KYC',
      description: 'Identity verification and compliance',
      category: 'compliance',
      status: 'connected',
      provider: 'Persona',
      lastSync: new Date(Date.now() - 1000 * 60 * 30),
      apiVersion: 'v1.0',
      endpoints: 6,
      webhooks: 4
    },
    {
      id: 'int-005',
      name: 'TilliPay Gateway',
      description: 'Card processing and ACH payments',
      category: 'payment',
      status: 'pending',
      provider: 'TilliPay',
      lastSync: new Date(Date.now() - 1000 * 60 * 60 * 2),
      apiVersion: 'v1.1',
      endpoints: 10,
      webhooks: 5
    },
    {
      id: 'int-006',
      name: 'Alloy Risk Engine',
      description: 'Transaction monitoring and fraud detection',
      category: 'compliance',
      status: 'error',
      provider: 'Alloy',
      lastSync: new Date(Date.now() - 1000 * 60 * 60 * 6),
      apiVersion: 'v2.1',
      endpoints: 4,
      webhooks: 2
    },
    {
      id: 'int-007',
      name: 'DataDog Analytics',
      description: 'Application performance monitoring',
      category: 'analytics',
      status: 'connected',
      provider: 'DataDog',
      lastSync: new Date(Date.now() - 1000 * 60 * 10),
      apiVersion: 'v1.0',
      endpoints: 5,
      webhooks: 1
    }
  ]);

  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: 'key-001',
      name: 'Production API Key',
      environment: 'production',
      permissions: ['read:transactions', 'write:wallets', 'admin:users'],
      lastUsed: new Date(Date.now() - 1000 * 60 * 30),
      created: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      status: 'active'
    },
    {
      id: 'key-002',
      name: 'Sandbox Testing Key',
      environment: 'sandbox',
      permissions: ['read:all', 'write:all'],
      lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 2),
      created: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      status: 'active'
    },
    {
      id: 'key-003',
      name: 'Development Key',
      environment: 'development',
      permissions: ['read:transactions', 'read:users'],
      lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 24),
      created: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      status: 'expired'
    }
  ]);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-700">Connected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-700">Error</Badge>;
      case 'disconnected':
        return <Badge className="bg-gray-100 text-gray-700">Disconnected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'disconnected':
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'payment':
        return <Zap className="w-5 h-5 text-blue-600" />;
      case 'blockchain':
        return <Database className="w-5 h-5 text-purple-600" />;
      case 'compliance':
        return <Shield className="w-5 h-5 text-green-600" />;
      case 'analytics':
        return <Globe className="w-5 h-5 text-orange-600" />;
      case 'developer':
        return <Code className="w-5 h-5 text-gray-600" />;
      default:
        return <Settings className="w-5 h-5 text-gray-600" />;
    }
  };

  const getEnvironmentBadge = (environment: string) => {
    switch (environment) {
      case 'production':
        return <Badge className="bg-red-100 text-red-700">Production</Badge>;
      case 'sandbox':
        return <Badge className="bg-yellow-100 text-yellow-700">Sandbox</Badge>;
      case 'development':
        return <Badge className="bg-blue-100 text-blue-700">Development</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getKeyStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case 'revoked':
        return <Badge className="bg-red-100 text-red-700">Revoked</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-700">Expired</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Integrations & APIs</h1>
          <p className="text-gray-600 mt-1">Manage external integrations, API keys, and webhooks</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Config
          </Button>
          <Button
            size="sm"
            className="bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Integration
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Integrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrations.filter(i => i.status === 'connected').length}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              of {integrations.length} total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              API Endpoints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrations.reduce((sum, i) => sum + i.endpoints, 0)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Total available
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Webhooks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrations.reduce((sum, i) => sum + i.webhooks, 0)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Real-time events
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              API Keys
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {apiKeys.filter(k => k.status === 'active').length}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Active keys
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="integrations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="developer">Developer Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>External Integrations</CardTitle>
              <CardDescription>
                Manage connections to payment processors, blockchain providers, and compliance services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getCategoryIcon(integration.category)}
                      </div>
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          {integration.name}
                          {getStatusIcon(integration.status)}
                        </div>
                        <div className="text-sm text-gray-500">{integration.description}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {integration.provider} • API {integration.apiVersion} • Last sync: {formatTimeAgo(integration.lastSync)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <div className="text-gray-600">{integration.endpoints} endpoints</div>
                        <div className="text-gray-400">{integration.webhooks} webhooks</div>
                      </div>
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(integration.status)}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
                        >
                          <RefreshCcw className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Key Management</CardTitle>
              <CardDescription>
                Create and manage API keys for programmatic access to Monay services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Key className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold">{apiKey.name}</div>
                        <div className="text-sm text-gray-500">
                          Created: {formatTimeAgo(apiKey.created)} • Last used: {formatTimeAgo(apiKey.lastUsed)}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Permissions: {apiKey.permissions.join(', ')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-1">
                        {getEnvironmentBadge(apiKey.environment)}
                        {getKeyStatusBadge(apiKey.status)}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Button
                  className="bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Generate New API Key
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Configuration</CardTitle>
              <CardDescription>
                Configure real-time event notifications and callback URLs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                    <Webhook className="w-4 h-4" />
                    Webhook Configuration
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Configure endpoints to receive real-time notifications for transactions, compliance events, and system status changes.
                  </p>
                  <Button
                    size="sm"
                    className="mt-3 bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
                  >
                    Configure Webhooks
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold">Transaction Events</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Real-time notifications for payments, transfers, and transaction status changes
                    </p>
                    <div className="mt-2">
                      <Badge className="bg-green-100 text-green-700">17 events configured</Badge>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold">Compliance Events</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      KYC updates, risk scoring changes, and regulatory alerts
                    </p>
                    <div className="mt-2">
                      <Badge className="bg-yellow-100 text-yellow-700">8 events configured</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="developer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Developer Tools</CardTitle>
              <CardDescription>
                API documentation, testing tools, and development resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    API Documentation
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Complete API reference with code examples and interactive testing
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Docs
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    SDK Downloads
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Official SDKs for JavaScript, Python, PHP, and more
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download SDKs
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    API Testing
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Interactive API explorer and testing environment
                  </p>
                  <Button
                    size="sm"
                    className="mt-3 bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
                  >
                    <Link className="w-4 h-4 mr-2" />
                    API Explorer
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Postman Collection
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Pre-configured Postman collection for rapid API testing
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Import Collection
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