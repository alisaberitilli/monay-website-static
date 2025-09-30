'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  CreditCard,
  BarChart3,
  PieChart,
  LineChart,
  FileSpreadsheet,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Shield
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// TypeScript interfaces
interface Report {
  id: string;
  name: string;
  type: 'transaction' | 'financial' | 'compliance' | 'user' | 'custom';
  status: 'completed' | 'processing' | 'failed' | 'scheduled';
  createdAt: string;
  size: string;
  format: 'pdf' | 'csv' | 'excel' | 'json';
  icon: any;
}

interface MetricCard {
  title: string;
  value: string;
  change: number;
  icon: any;
  trend: 'up' | 'down';
}

interface ScheduledReport {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  recipients: string[];
  lastRun: string;
  nextRun: string;
  status: 'active' | 'paused';
}

export default function ReportsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [reportType, setReportType] = useState('transaction');
  const [exportFormat, setExportFormat] = useState('pdf');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Mock data for metrics
  const metrics: MetricCard[] = [
    {
      title: 'Total Transactions',
      value: '45,231',
      change: 12.5,
      icon: CreditCard,
      trend: 'up'
    },
    {
      title: 'Revenue',
      value: '$1.2M',
      change: 8.3,
      icon: DollarSign,
      trend: 'up'
    },
    {
      title: 'Active Users',
      value: '8,421',
      change: -2.1,
      icon: Users,
      trend: 'down'
    },
    {
      title: 'Report Generated',
      value: '342',
      change: 15.7,
      icon: FileText,
      trend: 'up'
    }
  ];

  // Mock data for recent reports
  const recentReports: Report[] = [
    {
      id: '1',
      name: 'Monthly Transaction Report',
      type: 'transaction',
      status: 'completed',
      createdAt: '2024-01-15 09:30 AM',
      size: '2.4 MB',
      format: 'pdf',
      icon: FileText
    },
    {
      id: '2',
      name: 'Q4 Financial Summary',
      type: 'financial',
      status: 'completed',
      createdAt: '2024-01-14 03:45 PM',
      size: '5.1 MB',
      format: 'excel',
      icon: FileSpreadsheet
    },
    {
      id: '3',
      name: 'Compliance Audit Report',
      type: 'compliance',
      status: 'processing',
      createdAt: '2024-01-14 11:20 AM',
      size: '-',
      format: 'pdf',
      icon: FileText
    },
    {
      id: '4',
      name: 'User Activity Analysis',
      type: 'user',
      status: 'completed',
      createdAt: '2024-01-13 02:15 PM',
      size: '1.8 MB',
      format: 'csv',
      icon: FileSpreadsheet
    },
    {
      id: '5',
      name: 'Weekly Revenue Report',
      type: 'financial',
      status: 'failed',
      createdAt: '2024-01-13 08:00 AM',
      size: '-',
      format: 'pdf',
      icon: FileText
    }
  ];

  // Mock data for scheduled reports
  const scheduledReports: ScheduledReport[] = [
    {
      id: '1',
      name: 'Daily Transaction Summary',
      frequency: 'daily',
      recipients: ['finance@company.com', 'cfo@company.com'],
      lastRun: '2024-01-15 12:00 AM',
      nextRun: '2024-01-16 12:00 AM',
      status: 'active'
    },
    {
      id: '2',
      name: 'Weekly Compliance Report',
      frequency: 'weekly',
      recipients: ['compliance@company.com'],
      lastRun: '2024-01-08 06:00 AM',
      nextRun: '2024-01-15 06:00 AM',
      status: 'active'
    },
    {
      id: '3',
      name: 'Monthly Financial Statement',
      frequency: 'monthly',
      recipients: ['board@company.com', 'investors@company.com'],
      lastRun: '2024-01-01 00:00 AM',
      nextRun: '2024-02-01 00:00 AM',
      status: 'paused'
    }
  ];

  // Handler functions
  const handleGenerateReport = async () => {
    if (!dateRange.start || !dateRange.end) {
      toast.error('Please select a date range');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Report generation started. You will be notified when it\'s ready.');
      setIsGenerateModalOpen(false);
      setDateRange({ start: '', end: '' });
    } catch (error) {
      toast.error('Failed to generate report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = async (report: Report) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Downloading ${report.name}`);
      // In a real app, would trigger actual file download
    } catch (error) {
      toast.error('Failed to download report');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryReport = async (report: Report) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Report generation restarted');
    } catch (error) {
      toast.error('Failed to retry report generation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleReport = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Report schedule created successfully');
      setIsScheduleModalOpen(false);
    } catch (error) {
      toast.error('Failed to schedule report');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSchedule = async (reportId: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Schedule status updated');
    } catch (error) {
      toast.error('Failed to update schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailReport = async (report: Report) => {
    const email = prompt('Enter email address:');
    if (email) {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success(`Report sent to ${email}`);
      } catch (error) {
        toast.error('Failed to send report');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getStatusBadge = (status: Report['status']) => {
    const variants = {
      completed: { variant: 'default' as const, icon: CheckCircle },
      processing: { variant: 'secondary' as const, icon: Clock },
      failed: { variant: 'destructive' as const, icon: XCircle },
      scheduled: { variant: 'outline' as const, icon: Calendar }
    };

    const { variant, icon: Icon } = variants[status];
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Filter reports based on search
  const filteredReports = recentReports.filter(report =>
    report.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-gray-600">Generate, view, and manage your reports</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setIsScheduleModalOpen(true)}
            className="gap-2"
          >
            <Calendar className="w-4 h-4" />
            Schedule Report
          </Button>
          <Button
            onClick={() => setIsGenerateModalOpen(true)}
            className="gap-2"
          >
            <FileText className="w-4 h-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold mt-1">{metric.value}</p>
                  <div className="flex items-center mt-2">
                    {metric.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                      {Math.abs(metric.change)}%
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <metric.icon className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reports Tabs */}
      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-fit">
          <TabsTrigger value="recent" className="gap-2">
            <Clock className="w-4 h-4" />
            Recent Reports
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="gap-2">
            <Calendar className="w-4 h-4" />
            Scheduled
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="w-4 h-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        {/* Recent Reports Tab */}
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Recent Reports</CardTitle>
                  <CardDescription>View and download your generated reports</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search reports..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.type}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>{report.createdAt}</TableCell>
                      <TableCell>{report.size}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{report.format.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {report.status === 'completed' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDownloadReport(report)}
                                disabled={isLoading}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEmailReport(report)}
                                disabled={isLoading}
                              >
                                <Mail className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {report.status === 'failed' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRetryReport(report)}
                              disabled={isLoading}
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          )}
                          {report.status === 'processing' && (
                            <div className="animate-spin">
                              <RefreshCw className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-600">
                  Showing {filteredReports.length} of {recentReports.length} reports
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm">Page {currentPage}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={filteredReports.length < 10}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduled Reports Tab */}
        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>Manage your automated report schedules</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Last Run</TableHead>
                    <TableHead>Next Run</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduledReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.frequency}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {report.recipients.slice(0, 2).map((email, idx) => (
                            <span key={idx} className="text-sm">{email}</span>
                          ))}
                          {report.recipients.length > 2 && (
                            <span className="text-sm text-gray-500">
                              +{report.recipients.length - 2} more
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{report.lastRun}</TableCell>
                      <TableCell>{report.nextRun}</TableCell>
                      <TableCell>
                        <Badge variant={report.status === 'active' ? 'default' : 'secondary'}>
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleSchedule(report.id)}
                          disabled={isLoading}
                        >
                          {report.status === 'active' ? 'Pause' : 'Resume'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Report Templates Tab */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Report Templates</CardTitle>
              <CardDescription>Quick-start templates for common reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Transaction Summary', icon: CreditCard, description: 'Daily transaction overview' },
                  { name: 'Financial Statement', icon: DollarSign, description: 'Monthly P&L report' },
                  { name: 'User Analytics', icon: Users, description: 'User activity and growth metrics' },
                  { name: 'Compliance Audit', icon: Shield, description: 'Regulatory compliance check' },
                  { name: 'Revenue Analysis', icon: TrendingUp, description: 'Revenue trends and forecasts' },
                  { name: 'Custom Report', icon: FileText, description: 'Build your own report' }
                ].map((template, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                          <template.icon className="w-6 h-6 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{template.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                          <Button
                            variant="link"
                            className="px-0 mt-2"
                            onClick={() => {
                              setReportType(template.name.toLowerCase().replace(' ', '_'));
                              setIsGenerateModalOpen(true);
                            }}
                          >
                            Use Template →
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generate Report Modal */}
      <Dialog open={isGenerateModalOpen} onOpenChange={setIsGenerateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate New Report</DialogTitle>
            <DialogDescription>
              Configure your report parameters and generate
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transaction">Transaction Report</SelectItem>
                    <SelectItem value="financial">Financial Report</SelectItem>
                    <SelectItem value="compliance">Compliance Report</SelectItem>
                    <SelectItem value="user">User Report</SelectItem>
                    <SelectItem value="custom">Custom Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Export Format</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Include Sections</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {['Summary', 'Details', 'Charts', 'Trends', 'Forecasts', 'Recommendations'].map((section) => (
                  <div key={section} className="flex items-center space-x-2">
                    <input type="checkbox" id={section} className="rounded" defaultChecked />
                    <Label htmlFor={section} className="text-sm font-normal cursor-pointer">
                      {section}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label>Email Recipients (optional)</Label>
              <Input
                placeholder="Enter email addresses separated by commas"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateReport} disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Report Modal */}
      <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Report</DialogTitle>
            <DialogDescription>
              Set up automated report generation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Report Name</Label>
              <Input placeholder="e.g., Weekly Sales Report" className="mt-1" />
            </div>
            <div>
              <Label>Report Type</Label>
              <Select defaultValue="transaction">
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transaction">Transaction Report</SelectItem>
                  <SelectItem value="financial">Financial Report</SelectItem>
                  <SelectItem value="compliance">Compliance Report</SelectItem>
                  <SelectItem value="user">User Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Frequency</Label>
              <Select defaultValue="weekly">
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Recipients</Label>
              <Input
                placeholder="Enter email addresses separated by commas"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Time</Label>
              <Input type="time" defaultValue="09:00" className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleReport} disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Schedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}