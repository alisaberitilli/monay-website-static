'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
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
  FileDown,
  Download,
  Plus,
  RefreshCw,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  FileSpreadsheet,
  FileCode,
  Archive,
  Filter,
  Search,
  Trash2,
  Play,
  Pause,
  Settings,
  Database,
  Users,
  Activity,
  Shield,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import axios from 'axios';
import { format, parseISO, subDays, startOfMonth, endOfMonth } from 'date-fns';

interface ExportJob {
  id: string;
  type: string;
  format: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  recordCount: number;
  fileSize: number | null;
  downloadUrl: string | null;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  format: string;
  filters: any;
}

interface ScheduledExport {
  id: string;
  schedule: string;
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  exportConfig: any;
  enabled: boolean;
  lastRun: string | null;
  nextRun: string;
  createdAt: string;
}

const exportTypes = [
  { value: 'transactions', label: 'Transactions', icon: CreditCard },
  { value: 'wallets', label: 'Wallets', icon: Database },
  { value: 'users', label: 'Users', icon: Users },
  { value: 'audit-logs', label: 'Audit Logs', icon: Shield },
  { value: 'analytics', label: 'Analytics', icon: TrendingUp },
  { value: 'compliance', label: 'Compliance', icon: Shield },
  { value: 'all', label: 'All Data', icon: Archive }
];

const exportFormats = [
  { value: 'csv', label: 'CSV', icon: FileText, color: 'text-green-600' },
  { value: 'json', label: 'JSON', icon: FileCode, color: 'text-blue-600' },
  { value: 'pdf', label: 'PDF', icon: FileText, color: 'text-red-600' },
  { value: 'excel', label: 'Excel', icon: FileSpreadsheet, color: 'text-emerald-600' },
  { value: 'xml', label: 'XML', icon: FileCode, color: 'text-purple-600' }
];

export default function DataExportManager() {
  const [exports, setExports] = useState<ExportJob[]>([]);
  const [templates, setTemplates] = useState<ExportTemplate[]>([]);
  const [schedules, setSchedules] = useState<ScheduledExport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('exports');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | string>('all');
  const [pollingIntervals, setPollingIntervals] = useState<Map<string, NodeJS.Timeout>>(new Map());

  // New export form state
  const [newExport, setNewExport] = useState({
    type: 'transactions',
    format: 'csv',
    dateRange: 'last-30-days',
    filters: {},
    fields: []
  });

  // Schedule form state
  const [newSchedule, setNewSchedule] = useState({
    schedule: 'daily',
    time: '08:00',
    dayOfWeek: 1,
    dayOfMonth: 1,
    exportConfig: {
      type: 'transactions',
      format: 'csv'
    },
    enabled: true
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
    fetchExportHistory();
    fetchTemplates();
    fetchSchedules();
  }, []);

  useEffect(() => {
    // Cleanup polling intervals on unmount
    return () => {
      pollingIntervals.forEach(interval => clearInterval(interval));
    };
  }, [pollingIntervals]);

  const fetchExportHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/exports/history`, axiosConfig);
      setExports(response.data.data);
      setError(null);

      // Start polling for processing exports
      response.data.data.forEach((exp: ExportJob) => {
        if (exp.status === 'pending' || exp.status === 'processing') {
          startPollingExportStatus(exp.id);
        }
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch export history');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/exports/templates`, axiosConfig);
      setTemplates(response.data.data);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/exports/scheduled`, axiosConfig);
      setSchedules(response.data.data);
    } catch (err) {
      console.error('Failed to fetch schedules:', err);
    }
  };

  const startPollingExportStatus = (exportId: string) => {
    if (pollingIntervals.has(exportId)) return;

    const interval = setInterval(async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/exports/${exportId}/status`,
          axiosConfig
        );

        const updatedExport = response.data.data;
        setExports(prev => prev.map(exp =>
          exp.id === exportId ? updatedExport : exp
        ));

        // Stop polling if export is complete
        if (updatedExport.status === 'completed' ||
            updatedExport.status === 'failed' ||
            updatedExport.status === 'cancelled') {
          clearInterval(interval);
          pollingIntervals.delete(exportId);
        }
      } catch (err) {
        console.error('Failed to poll export status:', err);
      }
    }, 2000);

    pollingIntervals.set(exportId, interval);
  };

  const createExport = async () => {
    try {
      // Build filters based on date range
      const filters: any = {};
      const now = new Date();

      switch (newExport.dateRange) {
        case 'today':
          filters.startDate = format(now, 'yyyy-MM-dd');
          filters.endDate = format(now, 'yyyy-MM-dd');
          break;
        case 'last-7-days':
          filters.startDate = format(subDays(now, 7), 'yyyy-MM-dd');
          filters.endDate = format(now, 'yyyy-MM-dd');
          break;
        case 'last-30-days':
          filters.startDate = format(subDays(now, 30), 'yyyy-MM-dd');
          filters.endDate = format(now, 'yyyy-MM-dd');
          break;
        case 'this-month':
          filters.startDate = format(startOfMonth(now), 'yyyy-MM-dd');
          filters.endDate = format(endOfMonth(now), 'yyyy-MM-dd');
          break;
        case 'last-month':
          const lastMonth = subDays(startOfMonth(now), 1);
          filters.startDate = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
          filters.endDate = format(endOfMonth(lastMonth), 'yyyy-MM-dd');
          break;
      }

      const response = await axios.post(
        `${API_URL}/api/exports`,
        {
          type: newExport.type,
          format: newExport.format,
          filters: { ...filters, ...newExport.filters },
          fields: newExport.fields
        },
        axiosConfig
      );

      const exportJob = response.data.data;
      setExports([exportJob, ...exports]);
      setIsCreateDialogOpen(false);

      // Start polling for status
      startPollingExportStatus(exportJob.id);

      // Reset form
      setNewExport({
        type: 'transactions',
        format: 'csv',
        dateRange: 'last-30-days',
        filters: {},
        fields: []
      });

      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create export');
    }
  };

  const createFromTemplate = async (templateId: string) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/exports/template/${templateId}`,
        {},
        axiosConfig
      );

      const exportJob = response.data.data;
      setExports([exportJob, ...exports]);
      startPollingExportStatus(exportJob.id);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create export from template');
    }
  };

  const createScheduledExport = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/api/exports/schedule`,
        newSchedule,
        axiosConfig
      );

      setSchedules([...schedules, response.data.data]);
      setIsScheduleDialogOpen(false);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create scheduled export');
    }
  };

  const cancelExport = async (exportId: string) => {
    try {
      await axios.post(
        `${API_URL}/api/exports/${exportId}/cancel`,
        {},
        axiosConfig
      );

      setExports(exports.map(exp =>
        exp.id === exportId ? { ...exp, status: 'cancelled' } : exp
      ));

      // Stop polling
      const interval = pollingIntervals.get(exportId);
      if (interval) {
        clearInterval(interval);
        pollingIntervals.delete(exportId);
      }

      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to cancel export');
    }
  };

  const deleteSchedule = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this scheduled export?')) return;

    try {
      await axios.delete(
        `${API_URL}/api/exports/scheduled/${scheduleId}`,
        axiosConfig
      );

      setSchedules(schedules.filter(s => s.id !== scheduleId));
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete scheduled export');
    }
  };

  const downloadExport = (exportId: string) => {
    window.open(`${API_URL}/api/exports/download/${exportId}?token=${token}`, '_blank');
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '-';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'success' | 'destructive' | 'secondary'; icon: React.ReactNode }> = {
      pending: { variant: 'secondary', icon: <Clock className="w-3 h-3" /> },
      processing: { variant: 'default', icon: <RefreshCw className="w-3 h-3 animate-spin" /> },
      completed: { variant: 'success', icon: <CheckCircle className="w-3 h-3" /> },
      failed: { variant: 'destructive', icon: <XCircle className="w-3 h-3" /> },
      cancelled: { variant: 'secondary', icon: <XCircle className="w-3 h-3" /> }
    };

    const { variant, icon } = variants[status] || variants.pending;

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {icon}
        {status}
      </Badge>
    );
  };

  const getFormatIcon = (format: string) => {
    const formatConfig = exportFormats.find(f => f.value === format);
    if (!formatConfig) return null;
    const Icon = formatConfig.icon;
    return <Icon className={`w-4 h-4 ${formatConfig.color}`} />;
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = exportTypes.find(t => t.value === type);
    if (!typeConfig) return null;
    const Icon = typeConfig.icon;
    return <Icon className="w-4 h-4" />;
  };

  const filteredExports = exports.filter(exp => {
    const matchesSearch = exp.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exp.format.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || exp.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileDown className="w-8 h-8" />
            Data Export Manager
          </h2>
          <p className="text-muted-foreground mt-1">
            Export and schedule data extracts in multiple formats
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsScheduleDialogOpen(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Schedule Export
          </Button>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Export
          </Button>
        </div>
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="exports">Exports</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Exports Tab */}
        <TabsContent value="exports" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search exports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={fetchExportHistory}
                  variant="outline"
                  size="icon"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Exports List */}
          <Card>
            <CardHeader>
              <CardTitle>Export History</CardTitle>
              <CardDescription>
                Recent data exports and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
              ) : filteredExports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No exports found. Create your first export to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredExports.map((exportJob) => (
                    <div
                      key={exportJob.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(exportJob.type)}
                            <span className="font-medium capitalize">
                              {exportJob.type.replace('-', ' ')} Export
                            </span>
                            {getFormatIcon(exportJob.format)}
                            <span className="text-sm text-muted-foreground">
                              {exportJob.format.toUpperCase()}
                            </span>
                            {getStatusBadge(exportJob.status)}
                          </div>

                          {exportJob.status === 'processing' && (
                            <Progress value={exportJob.progress} className="w-full h-2" />
                          )}

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Created {format(parseISO(exportJob.createdAt), 'MMM d, h:mm a')}</span>
                            {exportJob.completedAt && (
                              <span>Completed {format(parseISO(exportJob.completedAt), 'h:mm a')}</span>
                            )}
                            {exportJob.recordCount > 0 && (
                              <span>{exportJob.recordCount.toLocaleString()} records</span>
                            )}
                            {exportJob.fileSize && (
                              <span>{formatFileSize(exportJob.fileSize)}</span>
                            )}
                          </div>

                          {exportJob.error && (
                            <Alert variant="destructive" className="mt-2">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>{exportJob.error}</AlertDescription>
                            </Alert>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          {exportJob.status === 'completed' && (
                            <Button
                              size="sm"
                              onClick={() => downloadExport(exportJob.id)}
                              className="flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" />
                              Download
                            </Button>
                          )}
                          {(exportJob.status === 'pending' || exportJob.status === 'processing') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => cancelExport(exportJob.id)}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Templates</CardTitle>
              <CardDescription>
                Pre-configured export templates for common use cases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 flex-1">
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {template.description}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {template.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {template.format.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => createFromTemplate(template.id)}
                      >
                        Use Template
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduled Tab */}
        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Exports</CardTitle>
              <CardDescription>
                Automated exports that run on a schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              {schedules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No scheduled exports. Create one to automate your data exports.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Export Type</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Next Run</TableHead>
                      <TableHead>Last Run</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell className="font-medium">
                          {schedule.exportConfig.type} ({schedule.exportConfig.format})
                        </TableCell>
                        <TableCell className="capitalize">
                          {schedule.schedule} at {schedule.time}
                        </TableCell>
                        <TableCell>
                          {format(parseISO(schedule.nextRun), 'MMM d, h:mm a')}
                        </TableCell>
                        <TableCell>
                          {schedule.lastRun
                            ? format(parseISO(schedule.lastRun), 'MMM d, h:mm a')
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          <Badge variant={schedule.enabled ? 'default' : 'secondary'}>
                            {schedule.enabled ? 'Active' : 'Disabled'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteSchedule(schedule.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Settings</CardTitle>
              <CardDescription>
                Configure default export preferences and limits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Settings className="h-4 w-4" />
                  <AlertDescription>
                    Export settings can be configured by administrators in the system settings.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="space-y-2">
                    <Label>Export Retention</Label>
                    <p className="text-sm text-muted-foreground">Files are retained for 24 hours</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Maximum File Size</Label>
                    <p className="text-sm text-muted-foreground">500 MB per export</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Concurrent Exports</Label>
                    <p className="text-sm text-muted-foreground">5 exports at a time</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Rate Limit</Label>
                    <p className="text-sm text-muted-foreground">100 exports per day</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Export Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Data Export</DialogTitle>
            <DialogDescription>
              Configure and generate a data export in your preferred format
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Export Type</Label>
              <Select
                value={newExport.type}
                onValueChange={(value) => setNewExport({ ...newExport, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {exportTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Export Format</Label>
              <div className="grid grid-cols-5 gap-2">
                {exportFormats.map((format) => {
                  const Icon = format.icon;
                  return (
                    <Button
                      key={format.value}
                      variant={newExport.format === format.value ? 'default' : 'outline'}
                      onClick={() => setNewExport({ ...newExport, format: format.value })}
                      className="flex flex-col items-center gap-1 h-auto py-3"
                    >
                      <Icon className={`w-5 h-5 ${format.color}`} />
                      <span className="text-xs">{format.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select
                value={newExport.dateRange}
                onValueChange={(value) => setNewExport({ ...newExport, dateRange: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                  <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Additional Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="include-archived" />
                  <label htmlFor="include-archived" className="text-sm">
                    Include archived records
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="include-deleted" />
                  <label htmlFor="include-deleted" className="text-sm">
                    Include deleted records
                  </label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createExport}>
              Create Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Export Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Export</DialogTitle>
            <DialogDescription>
              Set up an automated export that runs on a schedule
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Export Type</Label>
              <Select
                value={newSchedule.exportConfig.type}
                onValueChange={(value) => setNewSchedule({
                  ...newSchedule,
                  exportConfig: { ...newSchedule.exportConfig, type: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {exportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Format</Label>
              <Select
                value={newSchedule.exportConfig.format}
                onValueChange={(value) => setNewSchedule({
                  ...newSchedule,
                  exportConfig: { ...newSchedule.exportConfig, format: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {exportFormats.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Schedule</Label>
              <Select
                value={newSchedule.schedule}
                onValueChange={(value) => setNewSchedule({ ...newSchedule, schedule: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Time</Label>
              <Input
                type="time"
                value={newSchedule.time}
                onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
              />
            </div>

            {newSchedule.schedule === 'weekly' && (
              <div className="space-y-2">
                <Label>Day of Week</Label>
                <Select
                  value={newSchedule.dayOfWeek.toString()}
                  onValueChange={(value) => setNewSchedule({ ...newSchedule, dayOfWeek: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sunday</SelectItem>
                    <SelectItem value="1">Monday</SelectItem>
                    <SelectItem value="2">Tuesday</SelectItem>
                    <SelectItem value="3">Wednesday</SelectItem>
                    <SelectItem value="4">Thursday</SelectItem>
                    <SelectItem value="5">Friday</SelectItem>
                    <SelectItem value="6">Saturday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {newSchedule.schedule === 'monthly' && (
              <div className="space-y-2">
                <Label>Day of Month</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={newSchedule.dayOfMonth}
                  onChange={(e) => setNewSchedule({ ...newSchedule, dayOfMonth: parseInt(e.target.value) })}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createScheduledExport}>
              Create Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}