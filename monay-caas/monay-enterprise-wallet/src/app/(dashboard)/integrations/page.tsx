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
  Search,
  Building2,
  Receipt
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'payment' | 'blockchain' | 'compliance' | 'analytics' | 'developer' | 'erp' | 'accounting';
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configForm, setConfigForm] = useState({
    apiKey: '',
    apiSecret: '',
    endpoint: '',
    clientId: '',
    clientSecret: '',
    tenantId: '',
    environment: 'production',
    syncFrequency: '15',
    enableWebhooks: true,
    autoSync: true,
    deploymentType: 'cloud', // 'cloud' or 'on-premise'
    connectionMethod: 'direct', // 'direct', 'vpn', 'cloud-connector', 'site-to-site'
    sapRouter: '',
    cloudConnectorHost: '',
    cloudConnectorPort: '8443',
    useSSL: true,
    systemNumber: '00',
    rfcEnabled: false
  });
  const [testingConnection, setTestingConnection] = useState(false);
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
    },
    // ERP & Accounting Integrations
    {
      id: 'int-008',
      name: 'SAP S/4HANA',
      description: 'Enterprise resource planning and invoice automation',
      category: 'erp',
      status: 'connected',
      provider: 'SAP',
      lastSync: new Date(Date.now() - 1000 * 60 * 15),
      apiVersion: 'v2.0',
      endpoints: 18,
      webhooks: 6
    },
    {
      id: 'int-009',
      name: 'Oracle NetSuite',
      description: 'Cloud ERP and financial management',
      category: 'erp',
      status: 'connected',
      provider: 'Oracle',
      lastSync: new Date(Date.now() - 1000 * 60 * 8),
      apiVersion: 'v2023.1',
      endpoints: 22,
      webhooks: 8
    },
    {
      id: 'int-010',
      name: 'QuickBooks Online',
      description: 'Accounting software for invoicing and payments',
      category: 'accounting',
      status: 'connected',
      provider: 'Intuit',
      lastSync: new Date(Date.now() - 1000 * 60 * 5),
      apiVersion: 'v3.0',
      endpoints: 14,
      webhooks: 4
    },
    {
      id: 'int-011',
      name: 'Xero',
      description: 'Cloud accounting and invoice management',
      category: 'accounting',
      status: 'connected',
      provider: 'Xero',
      lastSync: new Date(Date.now() - 1000 * 60 * 12),
      apiVersion: 'v2.0',
      endpoints: 12,
      webhooks: 3
    },
    {
      id: 'int-012',
      name: 'Microsoft Dynamics 365',
      description: 'ERP and business applications suite',
      category: 'erp',
      status: 'pending',
      provider: 'Microsoft',
      lastSync: new Date(Date.now() - 1000 * 60 * 60 * 4),
      apiVersion: 'v9.2',
      endpoints: 20,
      webhooks: 7
    },
    {
      id: 'int-013',
      name: 'Sage Intacct',
      description: 'Cloud financial management and accounting',
      category: 'accounting',
      status: 'connected',
      provider: 'Sage',
      lastSync: new Date(Date.now() - 1000 * 60 * 20),
      apiVersion: 'v3.0',
      endpoints: 10,
      webhooks: 2
    },
    {
      id: 'int-014',
      name: 'Oracle Fusion',
      description: 'Enterprise cloud applications and ERP',
      category: 'erp',
      status: 'disconnected',
      provider: 'Oracle',
      lastSync: new Date(Date.now() - 1000 * 60 * 60 * 24),
      apiVersion: 'v22.0',
      endpoints: 25,
      webhooks: 9
    },
    {
      id: 'int-015',
      name: 'FreshBooks',
      description: 'Invoicing and accounting for small businesses',
      category: 'accounting',
      status: 'connected',
      provider: 'FreshBooks',
      lastSync: new Date(Date.now() - 1000 * 60 * 7),
      apiVersion: 'v3.1',
      endpoints: 8,
      webhooks: 2
    },
    {
      id: 'int-016',
      name: 'Zoho Books',
      description: 'Online accounting and invoice management',
      category: 'accounting',
      status: 'pending',
      provider: 'Zoho',
      lastSync: new Date(Date.now() - 1000 * 60 * 60 * 2),
      apiVersion: 'v2.0',
      endpoints: 9,
      webhooks: 3
    },
    {
      id: 'int-017',
      name: 'Workday Financials',
      description: 'Cloud-based financial management system',
      category: 'erp',
      status: 'connected',
      provider: 'Workday',
      lastSync: new Date(Date.now() - 1000 * 60 * 25),
      apiVersion: 'v39.0',
      endpoints: 16,
      webhooks: 5
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
      case 'erp':
        return <Building2 className="w-5 h-5 text-indigo-600" />;
      case 'accounting':
        return <Receipt className="w-5 h-5 text-teal-600" />;
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

  // Handler functions for integration actions
  const handleViewIntegration = (integration: Integration) => {
    setSelectedIntegration(integration);
    setShowDetailsModal(true);
    console.log('View integration:', integration.name);
  };

  const handleConfigureIntegration = (integration: Integration) => {
    console.log('Configure integration:', integration.name);
    setSelectedIntegration(integration);

    // Pre-populate form based on integration type
    if (integration.status === 'connected') {
      setConfigForm({
        apiKey: '••••••••••••••••',
        apiSecret: '••••••••••••••••',
        endpoint: getDefaultEndpoint(integration),
        clientId: '••••••••••••••••',
        clientSecret: '••••••••••••••••',
        tenantId: integration.id,
        environment: 'production',
        syncFrequency: '15',
        enableWebhooks: true,
        autoSync: true,
        deploymentType: 'cloud',
        connectionMethod: 'direct',
        sapRouter: '',
        cloudConnectorHost: '',
        cloudConnectorPort: '8443',
        useSSL: true,
        systemNumber: '00',
        rfcEnabled: false
      });
    } else {
      setConfigForm({
        apiKey: '',
        apiSecret: '',
        endpoint: getDefaultEndpoint(integration),
        clientId: '',
        clientSecret: '',
        tenantId: '',
        environment: 'production',
        syncFrequency: '15',
        enableWebhooks: true,
        autoSync: true,
        deploymentType: 'cloud',
        connectionMethod: 'direct',
        sapRouter: '',
        cloudConnectorHost: '',
        cloudConnectorPort: '8443',
        useSSL: true,
        systemNumber: '00',
        rfcEnabled: false
      });
    }

    setShowDetailsModal(false);
    setShowConfigModal(true);
  };

  const getDefaultEndpoint = (integration: Integration, deploymentType: string = 'cloud') => {
    if (integration.name === 'SAP S/4HANA') {
      return deploymentType === 'on-premise'
        ? 'https://10.0.0.100:44300/sap/opu/odata/sap'
        : 'https://your-company.s4hana.ondemand.com/sap/opu/odata/sap';
    }

    const endpoints: Record<string, string> = {
      'Oracle NetSuite': 'https://your-account.suitetalk.api.netsuite.com',
      'QuickBooks Online': 'https://quickbooks.api.intuit.com/v3',
      'Xero': 'https://api.xero.com/api.xro/2.0',
      'Microsoft Dynamics 365': 'https://your-org.api.crm.dynamics.com',
      'Sage Intacct': 'https://api.intacct.com/ia/xml/xmlgw.phtml',
      'Oracle Fusion': 'https://your-host.oraclecloud.com/fscmRestApi',
      'FreshBooks': 'https://api.freshbooks.com',
      'Zoho Books': 'https://books.zoho.com/api/v3',
      'Workday Financials': 'https://wd2-impl-services1.workday.com'
    };
    return endpoints[integration.name] || 'https://api.example.com';
  };

  const handleTestConnection = async () => {
    if (!selectedIntegration) return;

    setTestingConnection(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    setTestingConnection(false);

    // Update integration status
    setIntegrations(prev => prev.map(int =>
      int.id === selectedIntegration.id
        ? { ...int, status: 'connected' as const, lastSync: new Date() }
        : int
    ));

    alert(`✅ Connection Successful!\n\nConnected to ${selectedIntegration.name}\nEndpoint: ${configForm.endpoint}\nStatus: Active`);
  };

  const handleSaveConfiguration = () => {
    if (!selectedIntegration) return;

    // Validate required fields based on integration type
    const isOAuth = ['QuickBooks Online', 'Xero', 'Zoho Books', 'FreshBooks'].includes(selectedIntegration.name);
    const isAPIKey = ['SAP S/4HANA', 'Oracle NetSuite', 'Oracle Fusion', 'Microsoft Dynamics 365', 'Sage Intacct', 'Workday Financials'].includes(selectedIntegration.name);

    if (!configForm.endpoint) {
      alert('❌ Please enter the API Endpoint URL');
      return;
    }

    if (isOAuth && (!configForm.clientId || !configForm.clientSecret)) {
      alert('❌ Please fill in all OAuth credentials:\n- Client ID\n- Client Secret');
      return;
    }

    if (isAPIKey && (!configForm.apiKey || !configForm.apiSecret)) {
      alert('❌ Please fill in all API credentials:\n- API Key/Username\n- API Secret/Password');
      return;
    }

    // Update integration
    setIntegrations(prev => prev.map(int =>
      int.id === selectedIntegration.id
        ? { ...int, status: 'connected' as const, lastSync: new Date() }
        : int
    ));

    setShowConfigModal(false);

    const successMsg = isOAuth
      ? `✅ Configuration Saved!\n\n${selectedIntegration.name} is now configured.\n\nNext step: Click "Test Connection" to authorize Monay to access your ${selectedIntegration.provider} account.`
      : `✅ Configuration Saved!\n\n${selectedIntegration.name} is now configured and connected.\n\nSync frequency: Every ${configForm.syncFrequency} minutes\nWebhooks: ${configForm.enableWebhooks ? 'Enabled' : 'Disabled'}\nAuto-sync: ${configForm.autoSync ? 'Enabled' : 'Disabled'}`;

    alert(successMsg);
  };

  const handleRefreshIntegration = (integration: Integration) => {
    console.log('Refresh integration:', integration.name);

    // Update the integration's lastSync time
    setIntegrations(prev => prev.map(int =>
      int.id === integration.id
        ? { ...int, lastSync: new Date(), status: 'connected' as const }
        : int
    ));

    alert(`Syncing ${integration.name}...\n\n✅ Last sync: Just now\n✅ Status: Connected`);
  };

  const handleAddIntegration = () => {
    console.log('Add new integration');
    alert('Add New Integration\n\nAvailable integrations:\n• Bill.com\n• Coupa\n• Concur\n• ADP Workforce\n• And more...');
  };

  const handleExportConfig = () => {
    console.log('Export configuration');
    const config = {
      integrations: integrations.map(int => ({
        name: int.name,
        provider: int.provider,
        category: int.category,
        status: int.status,
        apiVersion: int.apiVersion
      })),
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'monay-integrations-config.json';
    a.click();
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
          <Button variant="outline" size="sm" onClick={handleExportConfig}>
            <Download className="w-4 h-4 mr-2" />
            Export Config
          </Button>
          <Button
            size="sm"
            onClick={handleAddIntegration}
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
                Manage connections to payment processors, blockchain providers, ERP systems, and compliance services
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Category Filter */}
              <div className="mb-6 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('all')}
                  className={selectedCategory === 'all' ? 'bg-orange-400 hover:bg-orange-500 text-white' : 'border-gray-300'}
                >
                  All Integrations
                </Button>
                <Button
                  size="sm"
                  variant={selectedCategory === 'erp' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('erp')}
                  className={selectedCategory === 'erp' ? 'bg-indigo-500 hover:bg-indigo-600 text-white' : 'border-gray-300'}
                >
                  <Building2 className="w-4 h-4 mr-1" />
                  ERP Systems
                </Button>
                <Button
                  size="sm"
                  variant={selectedCategory === 'accounting' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('accounting')}
                  className={selectedCategory === 'accounting' ? 'bg-teal-500 hover:bg-teal-600 text-white' : 'border-gray-300'}
                >
                  <Receipt className="w-4 h-4 mr-1" />
                  Accounting
                </Button>
                <Button
                  size="sm"
                  variant={selectedCategory === 'payment' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('payment')}
                  className={selectedCategory === 'payment' ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'border-gray-300'}
                >
                  <Zap className="w-4 h-4 mr-1" />
                  Payment
                </Button>
                <Button
                  size="sm"
                  variant={selectedCategory === 'blockchain' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('blockchain')}
                  className={selectedCategory === 'blockchain' ? 'bg-purple-500 hover:bg-purple-600 text-white' : 'border-gray-300'}
                >
                  <Database className="w-4 h-4 mr-1" />
                  Blockchain
                </Button>
                <Button
                  size="sm"
                  variant={selectedCategory === 'compliance' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('compliance')}
                  className={selectedCategory === 'compliance' ? 'bg-green-500 hover:bg-green-600 text-white' : 'border-gray-300'}
                >
                  <Shield className="w-4 h-4 mr-1" />
                  Compliance
                </Button>
                <Button
                  size="sm"
                  variant={selectedCategory === 'analytics' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('analytics')}
                  className={selectedCategory === 'analytics' ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border-gray-300'}
                >
                  <Globe className="w-4 h-4 mr-1" />
                  Analytics
                </Button>
              </div>

              <div className="space-y-4">
                {integrations
                  .filter(integration => selectedCategory === 'all' || integration.category === selectedCategory)
                  .map((integration) => (
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
                          onClick={() => handleViewIntegration(integration)}
                          className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleConfigureIntegration(integration)}
                          className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                          title="Configure"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleRefreshIntegration(integration)}
                          className="bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
                          title="Sync now"
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

      {/* Integration Details Modal */}
      {showDetailsModal && selectedIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    {getCategoryIcon(selectedIntegration.category)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedIntegration.name}</h2>
                    <p className="text-gray-600">{selectedIntegration.description}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetailsModal(false)}
                  className="border-gray-300"
                >
                  ✕
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Section */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Status & Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Status</div>
                    <div>{getStatusBadge(selectedIntegration.status)}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Provider</div>
                    <div className="font-semibold">{selectedIntegration.provider}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">API Version</div>
                    <div className="font-semibold">{selectedIntegration.apiVersion}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Last Sync</div>
                    <div className="font-semibold">{formatTimeAgo(selectedIntegration.lastSync)}</div>
                  </div>
                </div>
              </div>

              {/* Endpoints & Webhooks */}
              <div>
                <h3 className="text-lg font-semibold mb-3">API Configuration</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Link className="w-4 h-4 text-blue-600" />
                      <div className="font-semibold">Endpoints</div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{selectedIntegration.endpoints}</div>
                    <div className="text-sm text-gray-600 mt-1">Available API endpoints</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Webhook className="w-4 h-4 text-green-600" />
                      <div className="font-semibold">Webhooks</div>
                    </div>
                    <div className="text-2xl font-bold text-green-600">{selectedIntegration.webhooks}</div>
                    <div className="text-sm text-gray-600 mt-1">Active event listeners</div>
                  </div>
                </div>
              </div>

              {/* Sample Capabilities */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Key Capabilities</h3>
                <div className="space-y-2">
                  {selectedIntegration.category === 'erp' && (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>Invoice creation and management</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>Purchase order processing</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>Payment automation</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>Real-time financial reporting</span>
                      </div>
                    </>
                  )}
                  {selectedIntegration.category === 'accounting' && (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>Invoice and expense tracking</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>Automated payment reconciliation</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>Tax calculation and reporting</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>Multi-currency support</span>
                      </div>
                    </>
                  )}
                  {selectedIntegration.category === 'payment' && (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>USDC and stablecoin processing</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>Instant settlement</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>Batch payment processing</span>
                      </div>
                    </>
                  )}
                  {selectedIntegration.category === 'blockchain' && (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>On-chain transaction tracking</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>Smart contract interaction</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>Real-time block confirmations</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => handleConfigureIntegration(selectedIntegration)}
                  className="bg-orange-400 hover:bg-orange-500 text-white flex-1"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configure Integration
                </Button>
                <Button
                  onClick={() => handleRefreshIntegration(selectedIntegration)}
                  variant="outline"
                  className="border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Sync Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Modal */}
      {showConfigModal && selectedIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    {getCategoryIcon(selectedIntegration.category)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Configure {selectedIntegration.name}</h2>
                    <p className="text-gray-600">Connect your {selectedIntegration.provider} account</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConfigModal(false)}
                  className="border-gray-300"
                >
                  ✕
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* SAP Deployment Type (only for SAP) */}
              {selectedIntegration.name.includes('SAP') && (
                <>
                  {/* SAP API Business Hub Quick Demo Option */}
                  <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-300 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-yellow-900 mb-1">⚡ Quick Demo: SAP API Business Hub</h4>
                        <p className="text-sm text-yellow-800 mb-2">
                          No registration required! Use SAP's public sandbox with instant access to S/4HANA APIs.
                        </p>
                        <div className="flex items-center gap-3">
                          <a
                            href="https://api.sap.com/package/SAPS4HANACloud/rest"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm font-medium text-yellow-700 hover:text-yellow-800"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Open API Business Hub
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              setConfigForm({
                                ...configForm,
                                deploymentType: 'cloud',
                                endpoint: 'https://sandbox.api.sap.com/s4hanacloud',
                                apiKey: 'API_HUB_SANDBOX',
                                apiSecret: 'public_access'
                              });
                            }}
                            className="text-sm font-medium text-yellow-700 hover:text-yellow-800 underline"
                          >
                            Use Sandbox Credentials
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                    <label className="block text-sm font-semibold mb-3">SAP Deployment Type</label>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={configForm.deploymentType === 'cloud' ? 'default' : 'outline'}
                        onClick={() => setConfigForm({
                          ...configForm,
                          deploymentType: 'cloud',
                          endpoint: getDefaultEndpoint(selectedIntegration, 'cloud')
                        })}
                        className={configForm.deploymentType === 'cloud' ? 'bg-blue-500 hover:bg-blue-600' : 'border-blue-300'}
                      >
                        ☁️ SAP S/4HANA Cloud
                      </Button>
                      <Button
                        size="sm"
                        variant={configForm.deploymentType === 'on-premise' ? 'default' : 'outline'}
                        onClick={() => setConfigForm({
                          ...configForm,
                          deploymentType: 'on-premise',
                          endpoint: getDefaultEndpoint(selectedIntegration, 'on-premise')
                        })}
                        className={configForm.deploymentType === 'on-premise' ? 'bg-indigo-500 hover:bg-indigo-600' : 'border-indigo-300'}
                      >
                        🏢 On-Premise S/4HANA
                      </Button>
                    </div>
                    {configForm.deploymentType === 'on-premise' && (
                      <div className="mt-3 p-3 bg-white border border-blue-200 rounded text-sm text-blue-800">
                        <strong>Note:</strong> On-premise systems require additional network configuration. Select your connection method below.
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* On-Premise Connection Method (only for SAP on-premise) */}
              {selectedIntegration.name.includes('SAP') && configForm.deploymentType === 'on-premise' && (
                <div>
                  <label className="block text-sm font-semibold mb-3">Connection Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setConfigForm({ ...configForm, connectionMethod: 'cloud-connector' })}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        configForm.connectionMethod === 'cloud-connector'
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="font-semibold text-indigo-700">SAP Cloud Connector</div>
                      <div className="text-xs text-gray-600 mt-1">Secure tunnel via SAP BTP (Recommended)</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfigForm({ ...configForm, connectionMethod: 'vpn' })}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        configForm.connectionMethod === 'vpn'
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="font-semibold text-indigo-700">VPN Tunnel</div>
                      <div className="text-xs text-gray-600 mt-1">IPSec or OpenVPN connection</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfigForm({ ...configForm, connectionMethod: 'site-to-site' })}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        configForm.connectionMethod === 'site-to-site'
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="font-semibold text-indigo-700">AWS Direct Connect / Azure ExpressRoute</div>
                      <div className="text-xs text-gray-600 mt-1">Dedicated private connection</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfigForm({ ...configForm, connectionMethod: 'direct' })}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        configForm.connectionMethod === 'direct'
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="font-semibold text-indigo-700">Direct Access</div>
                      <div className="text-xs text-gray-600 mt-1">Public IP with firewall rules</div>
                    </button>
                  </div>
                </div>
              )}

              {/* SAP Cloud Connector Configuration */}
              {selectedIntegration.name.includes('SAP') && configForm.deploymentType === 'on-premise' && configForm.connectionMethod === 'cloud-connector' && (
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg space-y-4">
                  <h4 className="font-semibold text-indigo-900">SAP Cloud Connector Settings</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Cloud Connector Host</label>
                      <input
                        type="text"
                        value={configForm.cloudConnectorHost}
                        onChange={(e) => setConfigForm({ ...configForm, cloudConnectorHost: e.target.value })}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="scc.your-company.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Port</label>
                      <input
                        type="text"
                        value={configForm.cloudConnectorPort}
                        onChange={(e) => setConfigForm({ ...configForm, cloudConnectorPort: e.target.value })}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="8443"
                      />
                    </div>
                  </div>
                  <div className="text-xs text-indigo-700 bg-white p-3 rounded border border-indigo-200">
                    <strong>Setup Guide:</strong>
                    <ol className="list-decimal ml-4 mt-1 space-y-1">
                      <li>Install SAP Cloud Connector on your network</li>
                      <li>Configure connection to SAP BTP subaccount</li>
                      <li>Add your S/4HANA system as backend</li>
                      <li>Expose required services (OData, RFC)</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* VPN Configuration */}
              {selectedIntegration.name.includes('SAP') && configForm.deploymentType === 'on-premise' && configForm.connectionMethod === 'vpn' && (
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg space-y-4">
                  <h4 className="font-semibold text-indigo-900">VPN Tunnel Configuration</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">VPN Gateway Address</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="vpn.your-company.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">VPN Type</label>
                      <select className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400">
                        <option>IPSec</option>
                        <option>OpenVPN</option>
                        <option>WireGuard</option>
                        <option>SSL VPN</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Pre-Shared Key (PSK)</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="Enter PSK"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Local Subnet</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="10.0.0.0/24"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Remote Subnet (SAP Network)</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="192.168.1.0/24"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">SAP Server IP</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="192.168.1.100"
                      />
                    </div>
                  </div>
                  <div className="text-xs text-indigo-700 bg-white p-3 rounded border border-indigo-200">
                    <strong>VPN Requirements:</strong>
                    <ul className="list-disc ml-4 mt-1 space-y-1">
                      <li>Configure VPN tunnel between Monay infrastructure and your network</li>
                      <li>Ensure SAP ports (3200, 8000, 44300) are accessible through VPN</li>
                      <li>Add Monay IP ranges to your firewall whitelist</li>
                      <li>Test connectivity with SAP ABAP RFC or OData endpoints</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* AWS Direct Connect / Azure ExpressRoute Configuration */}
              {selectedIntegration.name.includes('SAP') && configForm.deploymentType === 'on-premise' && configForm.connectionMethod === 'site-to-site' && (
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg space-y-4">
                  <h4 className="font-semibold text-indigo-900">Direct Connect / ExpressRoute Configuration</h4>
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-2">Connection Provider</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="px-4 py-2 border-2 border-indigo-300 rounded-lg text-sm font-medium hover:bg-indigo-50"
                      >
                        AWS Direct Connect
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
                      >
                        Azure ExpressRoute
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
                      >
                        GCP Dedicated Interconnect
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Virtual Interface ID</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="vif-123456789"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">BGP ASN</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="65000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">VLAN ID</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Peer IP Address</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="169.254.1.1/30"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">SAP System IP/Hostname</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="sap-prod.internal.company.com"
                      />
                    </div>
                  </div>
                  <div className="text-xs text-indigo-700 bg-white p-3 rounded border border-indigo-200">
                    <strong>Direct Connect Setup:</strong>
                    <ol className="list-decimal ml-4 mt-1 space-y-1">
                      <li>Provision Direct Connect circuit with your cloud provider</li>
                      <li>Configure virtual interface (VIF) for private connectivity</li>
                      <li>Set up BGP peering with Monay's cloud infrastructure</li>
                      <li>Advertise SAP network routes via BGP</li>
                      <li>Test connectivity with traceroute and SAP logon</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Direct Access Configuration */}
              {selectedIntegration.name.includes('SAP') && configForm.deploymentType === 'on-premise' && configForm.connectionMethod === 'direct' && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg space-y-4">
                  <div className="flex items-start gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-900">Direct Public Access Configuration</h4>
                      <p className="text-xs text-amber-700 mt-1">⚠️ Not recommended for production. Use with strong security controls.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">SAP Public IP/Hostname</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-400"
                        placeholder="sap.your-company.com or 203.0.113.10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">OData Port</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-400"
                        placeholder="44300 (HTTPS)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">RFC Port</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-400"
                        placeholder="3300"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">Allowed IP Ranges (CIDR)</label>
                      <textarea
                        rows={2}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-400"
                        placeholder="52.1.2.0/24, 34.5.6.0/24 (Monay infrastructure IPs)"
                      />
                    </div>
                  </div>
                  <div className="text-xs text-amber-800 bg-white p-3 rounded border border-amber-300">
                    <strong>⚠️ Security Requirements:</strong>
                    <ul className="list-disc ml-4 mt-1 space-y-1">
                      <li><strong>Mandatory SSL/TLS:</strong> All traffic must use HTTPS (port 44300)</li>
                      <li><strong>IP Whitelisting:</strong> Restrict access to Monay infrastructure IPs only</li>
                      <li><strong>Strong Authentication:</strong> Use complex passwords and rotate regularly</li>
                      <li><strong>Firewall Rules:</strong> Block all ports except required SAP services</li>
                      <li><strong>DDoS Protection:</strong> Enable DDoS mitigation on your gateway</li>
                      <li><strong>Audit Logging:</strong> Enable SAP Security Audit Log (SM20)</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-xs text-red-800">
                      <strong>⛔ Production Warning:</strong> Direct public access exposes your SAP system to the internet.
                      For production, use SAP Cloud Connector, VPN, or Direct Connect instead.
                    </p>
                  </div>
                </div>
              )}

              {/* Environment Selection */}
              <div>
                <label className="block text-sm font-semibold mb-2">Environment</label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={configForm.environment === 'production' ? 'default' : 'outline'}
                    onClick={() => setConfigForm({ ...configForm, environment: 'production' })}
                    className={configForm.environment === 'production' ? 'bg-orange-400 hover:bg-orange-500' : ''}
                  >
                    Production
                  </Button>
                  <Button
                    size="sm"
                    variant={configForm.environment === 'sandbox' ? 'default' : 'outline'}
                    onClick={() => setConfigForm({ ...configForm, environment: 'sandbox' })}
                    className={configForm.environment === 'sandbox' ? 'bg-orange-400 hover:bg-orange-500' : ''}
                  >
                    Sandbox
                  </Button>
                  <Button
                    size="sm"
                    variant={configForm.environment === 'development' ? 'default' : 'outline'}
                    onClick={() => setConfigForm({ ...configForm, environment: 'development' })}
                    className={configForm.environment === 'development' ? 'bg-orange-400 hover:bg-orange-500' : ''}
                  >
                    Development
                  </Button>
                </div>
              </div>

              {/* API Endpoint */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  API Endpoint URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={configForm.endpoint}
                  onChange={(e) => setConfigForm({ ...configForm, endpoint: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="https://api.example.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The base URL for {selectedIntegration.name} API
                </p>
              </div>

              {/* OAuth Configuration (for OAuth-based integrations) */}
              {['QuickBooks Online', 'Xero', 'Zoho Books', 'FreshBooks'].includes(selectedIntegration.name) && (
                <>
                  {/* Developer Sandbox Info */}
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Terminal className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-green-900 mb-1">FREE Sandbox Available</h4>
                        <p className="text-sm text-green-700 mb-2">
                          {selectedIntegration.name === 'QuickBooks Online' && 'Get FREE sandbox access via Intuit Developer Portal'}
                          {selectedIntegration.name === 'Xero' && 'Get FREE 28-day developer trial (renewable)'}
                          {selectedIntegration.name === 'Zoho Books' && 'Get FREE developer sandbox account'}
                          {selectedIntegration.name === 'FreshBooks' && 'Get FREE developer sandbox access'}
                        </p>
                        <a
                          href={
                            selectedIntegration.name === 'QuickBooks Online' ? 'https://developer.intuit.com/' :
                            selectedIntegration.name === 'Xero' ? 'https://developer.xero.com/' :
                            selectedIntegration.name === 'Zoho Books' ? 'https://www.zoho.com/books/developer/' :
                            'https://www.freshbooks.com/api'
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Register for Developer Access
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Client ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={configForm.clientId}
                        onChange={(e) => setConfigForm({ ...configForm, clientId: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                        placeholder="Enter OAuth Client ID"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Client Secret <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={configForm.clientSecret}
                        onChange={(e) => setConfigForm({ ...configForm, clientSecret: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                        placeholder="Enter OAuth Client Secret"
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>OAuth Setup:</strong> After saving, you'll be redirected to {selectedIntegration.provider} to authorize Monay access to your account.
                    </p>
                  </div>
                </>
              )}

              {/* API Key Configuration (for API key-based integrations) */}
              {['SAP S/4HANA', 'Oracle NetSuite', 'Oracle Fusion', 'Microsoft Dynamics 365', 'Sage Intacct', 'Workday Financials'].includes(selectedIntegration.name) && (
                <>
                  {/* Trial/Sandbox Info for Enterprise Systems */}
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-purple-900 mb-1">
                          {selectedIntegration.name === 'SAP S/4HANA' && 'Trial Environment Available'}
                          {selectedIntegration.name === 'Oracle NetSuite' && 'Sandbox Account Available'}
                          {selectedIntegration.name === 'Oracle Fusion' && 'Free Tier Available'}
                          {selectedIntegration.name === 'Microsoft Dynamics 365' && 'FREE 30-Day Trial'}
                          {selectedIntegration.name === 'Sage Intacct' && 'Developer Sandbox'}
                          {selectedIntegration.name === 'Workday Financials' && 'Partner Sandbox Required'}
                        </h4>
                        <p className="text-sm text-purple-700 mb-2">
                          {selectedIntegration.name === 'SAP S/4HANA' && '90-day FREE trial via SAP Cloud Platform or use API Business Hub sandbox'}
                          {selectedIntegration.name === 'Oracle NetSuite' && 'Sandbox available with NetSuite account (contact sales for trial)'}
                          {selectedIntegration.name === 'Oracle Fusion' && 'Limited free tier or partner sandbox access'}
                          {selectedIntegration.name === 'Microsoft Dynamics 365' && 'Full-featured trial with Dataverse API access'}
                          {selectedIntegration.name === 'Sage Intacct' && 'FREE developer sandbox with registration'}
                          {selectedIntegration.name === 'Workday Financials' && 'Requires partnership or customer account'}
                        </p>
                        <a
                          href={
                            selectedIntegration.name === 'SAP S/4HANA' ? 'https://www.sap.com/products/technology-platform/trial.html' :
                            selectedIntegration.name === 'Oracle NetSuite' ? 'https://www.netsuite.com/portal/home.shtml' :
                            selectedIntegration.name === 'Oracle Fusion' ? 'https://www.oracle.com/cloud/free/' :
                            selectedIntegration.name === 'Microsoft Dynamics 365' ? 'https://dynamics.microsoft.com/en-us/dynamics-365-free-trial/' :
                            selectedIntegration.name === 'Sage Intacct' ? 'https://developer.intacct.com/' :
                            'https://www.workday.com/'
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700"
                        >
                          <ExternalLink className="w-4 h-4" />
                          {selectedIntegration.name === 'Workday Financials' ? 'Contact for Access' : 'Get Trial/Sandbox Access'}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        API Key / Username <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={configForm.apiKey}
                        onChange={(e) => setConfigForm({ ...configForm, apiKey: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                        placeholder="Enter API Key or Username"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        API Secret / Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={configForm.apiSecret}
                        onChange={(e) => setConfigForm({ ...configForm, apiSecret: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                        placeholder="Enter API Secret or Password"
                      />
                    </div>
                  </div>

                  {selectedIntegration.name.includes('SAP') && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            SAP Client ID <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={configForm.tenantId}
                            onChange={(e) => setConfigForm({ ...configForm, tenantId: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                            placeholder="e.g., 100, 200, 800"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            3-digit SAP client (MANDT)
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            System Number
                          </label>
                          <input
                            type="text"
                            value={configForm.systemNumber}
                            onChange={(e) => setConfigForm({ ...configForm, systemNumber: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                            placeholder="00"
                            maxLength={2}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            2-digit instance number
                          </p>
                        </div>
                      </div>

                      {/* RFC Configuration for On-Premise */}
                      {configForm.deploymentType === 'on-premise' && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="font-semibold text-yellow-900">Enable RFC Connections</div>
                              <div className="text-xs text-yellow-700 mt-1">
                                For real-time BAPI calls and direct table access (requires SAProuter configuration)
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={configForm.rfcEnabled}
                              onChange={(e) => setConfigForm({ ...configForm, rfcEnabled: e.target.checked })}
                              className="w-5 h-5 text-orange-400 rounded focus:ring-orange-400"
                            />
                          </div>
                          {configForm.rfcEnabled && (
                            <div className="mt-3">
                              <label className="block text-xs font-medium mb-1">SAProuter String</label>
                              <input
                                type="text"
                                value={configForm.sapRouter}
                                onChange={(e) => setConfigForm({ ...configForm, sapRouter: e.target.value })}
                                className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
                                placeholder="/H/saprouter.company.com/S/3299/H/sap-server/S/3300"
                              />
                              <p className="text-xs text-yellow-700 mt-1">
                                Full SAProuter connection string
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Network Security Options */}
                      {configForm.deploymentType === 'on-premise' && (
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-semibold">Use SSL/TLS Encryption</div>
                            <div className="text-sm text-gray-600">Encrypt all communication with SAP server</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={configForm.useSSL}
                            onChange={(e) => setConfigForm({ ...configForm, useSSL: e.target.checked })}
                            className="w-5 h-5 text-orange-400 rounded focus:ring-orange-400"
                          />
                        </div>
                      )}
                    </>
                  )}

                  {selectedIntegration.name.includes('NetSuite') && (
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Account ID
                      </label>
                      <input
                        type="text"
                        value={configForm.tenantId}
                        onChange={(e) => setConfigForm({ ...configForm, tenantId: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                        placeholder="e.g., 1234567"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Your NetSuite account ID
                      </p>
                    </div>
                  )}

                  {selectedIntegration.name.includes('Dynamics') && (
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Tenant ID
                      </label>
                      <input
                        type="text"
                        value={configForm.tenantId}
                        onChange={(e) => setConfigForm({ ...configForm, tenantId: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                        placeholder="Azure AD Tenant ID"
                      />
                    </div>
                  )}
                </>
              )}

              {/* Sync Settings */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Sync Settings</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Sync Frequency (minutes)
                    </label>
                    <select
                      value={configForm.syncFrequency}
                      onChange={(e) => setConfigForm({ ...configForm, syncFrequency: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                    >
                      <option value="5">Every 5 minutes</option>
                      <option value="15">Every 15 minutes</option>
                      <option value="30">Every 30 minutes</option>
                      <option value="60">Every hour</option>
                      <option value="360">Every 6 hours</option>
                      <option value="1440">Daily</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold">Enable Webhooks</div>
                      <div className="text-sm text-gray-600">Receive real-time updates for invoice and payment events</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={configForm.enableWebhooks}
                      onChange={(e) => setConfigForm({ ...configForm, enableWebhooks: e.target.checked })}
                      className="w-5 h-5 text-orange-400 rounded focus:ring-orange-400"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold">Auto-Sync Invoices</div>
                      <div className="text-sm text-gray-600">Automatically import new invoices from {selectedIntegration.provider}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={configForm.autoSync}
                      onChange={(e) => setConfigForm({ ...configForm, autoSync: e.target.checked })}
                      className="w-5 h-5 text-orange-400 rounded focus:ring-orange-400"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                  variant="outline"
                  className="border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  {testingConnection ? (
                    <>
                      <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowConfigModal(false)}
                  variant="outline"
                  className="border-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveConfiguration}
                  className="bg-orange-400 hover:bg-orange-500 text-white flex-1"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}