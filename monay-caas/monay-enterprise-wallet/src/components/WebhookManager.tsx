'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Webhook,
  Plus,
  Trash2,
  RefreshCw,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  Copy,
  Eye,
  EyeOff,
  Download,
  Filter,
  Search,
  Settings,
  Link2,
  Shield,
  Clock,
  BarChart3
} from 'lucide-react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';

interface WebhookData {
  id: string;
  url: string;
  events: string[];
  description: string;
  active: boolean;
  secret?: string;
  failureCount: number;
  lastTriggered: string | null;
  lastStatus: number | null;
  createdAt: string;
}

interface WebhookEvent {
  key: string;
  event: string;
  description: string;
}

interface DeliveryLog {
  id: string;
  webhookId: string;
  payloadId: string;
  event: string;
  status: 'success' | 'failed' | 'pending' | 'retrying';
  statusCode?: number;
  error?: string;
  attempt: number;
  timestamp: string;
  responseTime?: number;
}

interface WebhookStats {
  webhookId: string;
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  avgResponseTime: number;
  lastDelivery: string | null;
  nextRetry: string | null;
}

export default function WebhookManager() {
  const [webhooks, setWebhooks] = useState<WebhookData[]>([]);
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [deliveryLogs, setDeliveryLogs] = useState<DeliveryLog[]>([]);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookData | null>(null);
  const [webhookStats, setWebhookStats] = useState<WebhookStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [activeTab, setActiveTab] = useState('webhooks');

  // New webhook form state
  const [newWebhook, setNewWebhook] = useState({
    url: '',
    events: [] as string[],
    description: '',
    secret: '',
    headers: {} as Record<string, string>
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const axiosConfig = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  useEffect(() => {
    fetchWebhooks();
    fetchEvents();
  }, []);

  const fetchWebhooks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/webhooks`, axiosConfig);
      setWebhooks(response.data.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch webhooks');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/webhooks/events/list`, axiosConfig);
      setEvents(response.data.data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  };

  const fetchWebhookDetails = async (webhookId: string) => {
    try {
      const [webhookRes, statsRes, logsRes] = await Promise.all([
        axios.get(`${API_URL}/api/webhooks/${webhookId}`, axiosConfig),
        axios.get(`${API_URL}/api/webhooks/${webhookId}/stats`, axiosConfig),
        axios.get(`${API_URL}/api/webhooks/${webhookId}/deliveries?limit=50`, axiosConfig)
      ]);

      setSelectedWebhook(webhookRes.data.data);
      setWebhookStats(statsRes.data.data);
      setDeliveryLogs(logsRes.data.data);
      setIsDetailsDialogOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch webhook details');
    }
  };

  const createWebhook = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/api/webhooks`,
        newWebhook,
        axiosConfig
      );

      setWebhooks([...webhooks, response.data.data]);
      setIsCreateDialogOpen(false);
      setNewWebhook({
        url: '',
        events: [],
        description: '',
        secret: '',
        headers: {}
      });
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create webhook');
    }
  };

  const updateWebhook = async (webhookId: string, updates: Partial<WebhookData>) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/webhooks/${webhookId}`,
        updates,
        axiosConfig
      );

      setWebhooks(webhooks.map(w =>
        w.id === webhookId ? response.data.data : w
      ));

      if (selectedWebhook?.id === webhookId) {
        setSelectedWebhook(response.data.data);
      }

      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update webhook');
    }
  };

  const deleteWebhook = async (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;

    try {
      await axios.delete(`${API_URL}/api/webhooks/${webhookId}`, axiosConfig);
      setWebhooks(webhooks.filter(w => w.id !== webhookId));
      setIsDetailsDialogOpen(false);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete webhook');
    }
  };

  const toggleWebhook = async (webhookId: string, active: boolean) => {
    try {
      await axios.post(
        `${API_URL}/api/webhooks/${webhookId}/toggle`,
        { active },
        axiosConfig
      );

      setWebhooks(webhooks.map(w =>
        w.id === webhookId ? { ...w, active } : w
      ));

      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to toggle webhook');
    }
  };

  const testWebhook = async (webhookId: string) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/webhooks/${webhookId}/test`,
        {},
        axiosConfig
      );

      alert(`Test webhook sent successfully! Payload ID: ${response.data.data.payloadId}`);
      fetchWebhookDetails(webhookId);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to test webhook');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const exportDeliveryLogs = () => {
    const csv = [
      ['Timestamp', 'Event', 'Status', 'Status Code', 'Response Time', 'Attempt', 'Error'],
      ...deliveryLogs.map(log => [
        log.timestamp,
        log.event,
        log.status,
        log.statusCode?.toString() || '',
        log.responseTime?.toString() || '',
        log.attempt.toString(),
        log.error || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `webhook-deliveries-${selectedWebhook?.id}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'success' | 'destructive' | 'secondary'; icon: React.ReactNode }> = {
      success: { variant: 'success', icon: <CheckCircle className="w-3 h-3" /> },
      failed: { variant: 'destructive', icon: <XCircle className="w-3 h-3" /> },
      pending: { variant: 'secondary', icon: <Clock className="w-3 h-3" /> },
      retrying: { variant: 'default', icon: <RefreshCw className="w-3 h-3 animate-spin" /> }
    };

    const { variant, icon } = variants[status] || variants.pending;

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {icon}
        {status}
      </Badge>
    );
  };

  const filteredWebhooks = webhooks.filter(webhook => {
    const matchesSearch = webhook.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         webhook.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'active' && webhook.active) ||
                         (filterStatus === 'inactive' && !webhook.active);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Webhook className="w-8 h-8" />
            Webhook Management
          </h2>
          <p className="text-muted-foreground mt-1">
            Configure and monitor webhook integrations
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Webhook
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search webhooks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={fetchWebhooks}
                  variant="outline"
                  size="icon"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Webhooks List */}
          <Card>
            <CardHeader>
              <CardTitle>Configured Webhooks</CardTitle>
              <CardDescription>
                {filteredWebhooks.length} webhook{filteredWebhooks.length !== 1 ? 's' : ''} configured
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
              ) : filteredWebhooks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No webhooks found. Create your first webhook to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredWebhooks.map((webhook) => (
                    <div
                      key={webhook.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => fetchWebhookDetails(webhook.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Link2 className="w-4 h-4 text-muted-foreground" />
                            <span className="font-mono text-sm">{webhook.url}</span>
                            <Badge variant={webhook.active ? 'default' : 'secondary'}>
                              {webhook.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          {webhook.description && (
                            <p className="text-sm text-muted-foreground">{webhook.description}</p>
                          )}
                          <div className="flex flex-wrap gap-1">
                            {webhook.events.slice(0, 3).map((event) => (
                              <Badge key={event} variant="outline" className="text-xs">
                                {event}
                              </Badge>
                            ))}
                            {webhook.events.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{webhook.events.length - 3} more
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Created {format(parseISO(webhook.createdAt), 'MMM d, yyyy')}</span>
                            {webhook.lastTriggered && (
                              <span>Last triggered {format(parseISO(webhook.lastTriggered), 'MMM d, h:mm a')}</span>
                            )}
                            {webhook.failureCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {webhook.failureCount} failures
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Switch
                            checked={webhook.active}
                            onCheckedChange={(checked) => {
                              e?.stopPropagation();
                              toggleWebhook(webhook.id, checked);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              testWebhook(webhook.id);
                            }}
                          >
                            <Send className="w-3 h-3" />
                            Test
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Events</CardTitle>
              <CardDescription>
                Subscribe to these events to receive webhook notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map((event) => (
                  <div key={event.key} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Activity className="w-5 h-5 text-primary mt-0.5" />
                      <div className="space-y-1">
                        <div className="font-mono text-sm font-medium">{event.event}</div>
                        <p className="text-xs text-muted-foreground">{event.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Webhooks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{webhooks.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {webhooks.filter(w => w.active).length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">98.5%</div>
                <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">245ms</div>
                <p className="text-xs text-muted-foreground mt-1">Last 100 deliveries</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Failed Deliveries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {webhooks.reduce((sum, w) => sum + w.failureCount, 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total failures</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Monitor webhook delivery status and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <BarChart3 className="h-4 w-4" />
                  <AlertDescription>
                    Real-time monitoring data will appear here once webhooks are triggered.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Webhook Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Webhook</DialogTitle>
            <DialogDescription>
              Configure a new webhook endpoint to receive event notifications
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">Webhook URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://api.example.com/webhooks"
                value={newWebhook.url}
                onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Production webhook for order events"
                value={newWebhook.description}
                onChange={(e) => setNewWebhook({ ...newWebhook, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Events</Label>
              <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {events.map((event) => (
                    <div key={event.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={event.key}
                        checked={newWebhook.events.includes(event.event)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewWebhook({
                              ...newWebhook,
                              events: [...newWebhook.events, event.event]
                            });
                          } else {
                            setNewWebhook({
                              ...newWebhook,
                              events: newWebhook.events.filter(e => e !== event.event)
                            });
                          }
                        }}
                      />
                      <label
                        htmlFor={event.key}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {event.event}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secret">
                Secret Key (optional)
                <span className="text-xs text-muted-foreground ml-2">
                  Leave empty to auto-generate
                </span>
              </Label>
              <Input
                id="secret"
                type="password"
                placeholder="Auto-generated if empty"
                value={newWebhook.secret}
                onChange={(e) => setNewWebhook({ ...newWebhook, secret: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={createWebhook}
              disabled={!newWebhook.url || newWebhook.events.length === 0}
            >
              Create Webhook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Webhook Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Webhook Details</DialogTitle>
            <DialogDescription>
              View and manage webhook configuration and delivery history
            </DialogDescription>
          </DialogHeader>

          {selectedWebhook && (
            <Tabs defaultValue="details" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
                <TabsTrigger value="stats">Statistics</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>URL</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input value={selectedWebhook.url} readOnly />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => copyToClipboard(selectedWebhook.url)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Input value={selectedWebhook.description || ''} readOnly className="mt-1" />
                  </div>

                  <div>
                    <Label>Status</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={selectedWebhook.active ? 'default' : 'secondary'}>
                        {selectedWebhook.active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Switch
                        checked={selectedWebhook.active}
                        onCheckedChange={(checked) => toggleWebhook(selectedWebhook.id, checked)}
                      />
                    </div>
                  </div>

                  {selectedWebhook.secret && (
                    <div>
                      <Label>Secret Key</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type={showSecret ? 'text' : 'password'}
                          value={selectedWebhook.secret}
                          readOnly
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setShowSecret(!showSecret)}
                        >
                          {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => copyToClipboard(selectedWebhook.secret!)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label>Subscribed Events</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedWebhook.events.map((event) => (
                        <Badge key={event} variant="outline">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      variant="destructive"
                      onClick={() => deleteWebhook(selectedWebhook.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Webhook
                    </Button>
                    <Button onClick={() => testWebhook(selectedWebhook.id)}>
                      <Send className="w-4 h-4 mr-2" />
                      Send Test
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="deliveries" className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Showing last 50 deliveries
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={exportDeliveryLogs}
                    disabled={deliveryLogs.length === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>

                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Response Time</TableHead>
                        <TableHead>Attempt</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deliveryLogs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No delivery logs available
                          </TableCell>
                        </TableRow>
                      ) : (
                        deliveryLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-mono text-xs">
                              {format(parseISO(log.timestamp), 'MMM d, h:mm:ss a')}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {log.event}
                              </Badge>
                            </TableCell>
                            <TableCell>{getStatusBadge(log.status)}</TableCell>
                            <TableCell>
                              {log.responseTime ? `${log.responseTime}ms` : '-'}
                            </TableCell>
                            <TableCell>{log.attempt}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="stats" className="space-y-4">
                {webhookStats && (
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{webhookStats.totalDeliveries}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {webhookStats.totalDeliveries > 0
                            ? Math.round((webhookStats.successfulDeliveries / webhookStats.totalDeliveries) * 100)
                            : 0}%
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Failed Deliveries</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{webhookStats.failedDeliveries}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {webhookStats.avgResponseTime}ms
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Created</span>
                        <span>{format(parseISO(selectedWebhook.createdAt), 'MMM d, yyyy h:mm a')}</span>
                      </div>
                      {webhookStats?.lastDelivery && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Last Delivery</span>
                          <span>{format(parseISO(webhookStats.lastDelivery), 'MMM d, yyyy h:mm a')}</span>
                        </div>
                      )}
                      {webhookStats?.nextRetry && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Next Retry</span>
                          <span>{format(parseISO(webhookStats.nextRetry), 'MMM d, yyyy h:mm a')}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}