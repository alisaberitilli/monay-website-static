'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  Search,
  Download,
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Clock,
  User,
  Activity,
  FileText,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  Lock,
  Key,
  DollarSign,
  UserCheck,
  Settings,
  Database,
} from 'lucide-react';
import { format } from 'date-fns';
import { apiClient } from '@/lib/api';

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  severity: string;
  category: string;
  timestamp: string;
  integrityValid?: boolean;
}

interface AuditLogViewerProps {
  userId?: string;
  tenantId?: string;
  showSecurityEvents?: boolean;
}

const severityColors = {
  DEBUG: 'bg-gray-100 text-gray-800',
  INFO: 'bg-blue-100 text-blue-800',
  WARNING: 'bg-yellow-100 text-yellow-800',
  ERROR: 'bg-red-100 text-red-800',
  CRITICAL: 'bg-red-600 text-white',
  SECURITY: 'bg-purple-600 text-white',
};

const categoryIcons = {
  AUTHENTICATION: Lock,
  AUTHORIZATION: Key,
  FINANCIAL: DollarSign,
  COMPLIANCE: UserCheck,
  SECURITY: Shield,
  SYSTEM: Settings,
  USER_MANAGEMENT: User,
  GENERAL: Activity,
};

export function AuditLogViewer({
  userId,
  tenantId,
  showSecurityEvents = false,
}: AuditLogViewerProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [exporting, setExporting] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (searchTerm) params.append('q', searchTerm);
      if (selectedSeverity !== 'all') params.append('severity', selectedSeverity);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      params.append('page', page.toString());
      params.append('limit', '50');

      // Add time range
      const now = new Date();
      const startDate = new Date();
      switch (selectedTimeRange) {
        case '1h':
          startDate.setHours(startDate.getHours() - 1);
          break;
        case '24h':
          startDate.setHours(startDate.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
      }
      params.append('startDate', startDate.toISOString());
      params.append('endDate', now.toISOString());

      const endpoint = searchTerm ? '/api/audit-logs/search' : '/api/audit-logs';
      const response = await apiClient.get(`${endpoint}?${params.toString()}`);

      setLogs(response.data.data);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
      setError('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [userId, searchTerm, selectedSeverity, selectedCategory, selectedTimeRange, page]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await apiClient.get('/api/audit-logs/stats?days=30');
      setStats(response.data.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      setExporting(true);
      const params = new URLSearchParams();
      params.append('format', format);
      if (selectedSeverity !== 'all') params.append('severity', selectedSeverity);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);

      const response = await apiClient.get(
        `/api/audit-logs/export?${params.toString()}`,
        {
          responseType: format === 'csv' ? 'text' : 'json',
        }
      );

      // Create download
      const blob = new Blob(
        [format === 'csv' ? response.data : JSON.stringify(response.data, null, 2)],
        { type: format === 'csv' ? 'text/csv' : 'application/json' }
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-logs-${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export:', err);
      setError('Failed to export audit logs');
    } finally {
      setExporting(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
      case 'ERROR':
        return <XCircle className="w-4 h-4" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4" />;
      case 'SECURITY':
        return <Shield className="w-4 h-4" />;
      case 'INFO':
        return <Info className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Audit Logs</h2>
          <p className="text-gray-600">Track all system activities and changes</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchLogs()}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            disabled={exporting}
          >
            <Download className="w-4 h-4 mr-1" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('json')}
            disabled={exporting}
          >
            <FileText className="w-4 h-4 mr-1" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.summary?.reduce((acc: number, s: any) => acc + parseInt(s.total), 0) || 0}
              </div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Events</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.summary
                  ?.filter((s: any) => s.severity === 'SECURITY' || s.severity === 'CRITICAL')
                  .reduce((acc: number, s: any) => acc + parseInt(s.total), 0) || 0}
              </div>
              <p className="text-xs text-muted-foreground">Requiring attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.summary?.[0]?.uniqueUsers || 0}
              </div>
              <p className="text-xs text-muted-foreground">Active users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.summary
                  ?.filter((s: any) => s.category === 'COMPLIANCE')
                  .reduce((acc: number, s: any) => acc + parseInt(s.total), 0) || 0}
              </div>
              <p className="text-xs text-muted-foreground">Compliance events</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Logs</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Range</label>
                  <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">Last Hour</SelectItem>
                      <SelectItem value="24h">Last 24 Hours</SelectItem>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Severity</label>
                  <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="DEBUG">Debug</SelectItem>
                      <SelectItem value="INFO">Info</SelectItem>
                      <SelectItem value="WARNING">Warning</SelectItem>
                      <SelectItem value="ERROR">Error</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                      <SelectItem value="SECURITY">Security</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                      <SelectItem value="AUTHORIZATION">Authorization</SelectItem>
                      <SelectItem value="FINANCIAL">Financial</SelectItem>
                      <SelectItem value="COMPLIANCE">Compliance</SelectItem>
                      <SelectItem value="SECURITY">Security</SelectItem>
                      <SelectItem value="SYSTEM">System</SelectItem>
                      <SelectItem value="USER_MANAGEMENT">User Management</SelectItem>
                      <SelectItem value="GENERAL">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Log Entries</CardTitle>
              <CardDescription>
                Showing {logs.length} of {totalPages * 50} total entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="flex justify-center">
                            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          No audit logs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      logs.map((log) => {
                        const Icon = categoryIcons[log.category as keyof typeof categoryIcons] || Activity;
                        return (
                          <TableRow key={log.id}>
                            <TableCell className="font-mono text-sm">
                              {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                            </TableCell>
                            <TableCell className="font-medium">{log.action}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Icon className="w-4 h-4 text-gray-400" />
                                <span>{log.resource}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {log.userId ? log.userId.substring(0, 8) : '-'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{log.category}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={severityColors[log.severity as keyof typeof severityColors]}>
                                <span className="flex items-center space-x-1">
                                  {getSeverityIcon(log.severity)}
                                  <span>{log.severity}</span>
                                </span>
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {log.ipAddress || '-'}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedLog(log)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-500">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <SecurityEvents />
        </TabsContent>

        {/* Other tabs... */}
      </Tabs>

      {/* Log Detail Modal */}
      {selectedLog && (
        <LogDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
}

function SecurityEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await apiClient.get('/api/audit-logs/security-events?hours=48');
        setEvents(response.data.data);
      } catch (err) {
        console.error('Failed to fetch security events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) {
    return <div>Loading security events...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Events</CardTitle>
        <CardDescription>Critical security events from the last 48 hours</CardDescription>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>No security events detected</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-2">
            {events.map((event) => (
              <Alert key={event.id} variant="destructive">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex justify-between">
                    <span>{event.action} - {event.details?.eventType}</span>
                    <span className="text-sm">
                      {format(new Date(event.timestamp), 'MMM dd, HH:mm')}
                    </span>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LogDetailModal({ log, onClose }: { log: AuditLog; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto">
        <CardHeader>
          <CardTitle className="flex justify-between">
            <span>Audit Log Details</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Log ID</label>
              <p className="font-mono text-sm">{log.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Timestamp</label>
              <p>{format(new Date(log.timestamp), 'PPpp')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Action</label>
              <p className="font-medium">{log.action}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Resource</label>
              <p>{log.resource} {log.resourceId && `(${log.resourceId})`}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">User ID</label>
              <p className="font-mono text-sm">{log.userId || 'System'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">IP Address</label>
              <p>{log.ipAddress || 'Unknown'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Session ID</label>
              <p className="font-mono text-sm">{log.sessionId || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Integrity</label>
              <p>
                {log.integrityValid ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Valid
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="w-3 h-3 mr-1" />
                    Invalid
                  </Badge>
                )}
              </p>
            </div>
          </div>

          {log.details && (
            <div>
              <label className="text-sm font-medium text-gray-500">Details</label>
              <pre className="mt-1 p-3 bg-gray-50 rounded text-xs overflow-auto">
                {JSON.stringify(log.details, null, 2)}
              </pre>
            </div>
          )}

          {log.metadata && (
            <div>
              <label className="text-sm font-medium text-gray-500">Metadata</label>
              <pre className="mt-1 p-3 bg-gray-50 rounded text-xs overflow-auto">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          )}

          {log.userAgent && (
            <div>
              <label className="text-sm font-medium text-gray-500">User Agent</label>
              <p className="text-sm break-all">{log.userAgent}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}