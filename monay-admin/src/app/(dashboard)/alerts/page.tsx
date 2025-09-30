'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { superAdminService } from '@/services/super-admin.service';
import { Bell, AlertTriangle, Info, CheckCircle, XCircle, Settings, Filter, Search, Download } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

interface SystemAlert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  category: 'system' | 'compliance' | 'transaction' | 'security' | 'performance';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  metadata?: any;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<SystemAlert[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    critical: 0,
    warning: 0,
    info: 0,
    unacknowledged: 0
  });

  // Mock data - replace with actual API calls
  const mockAlerts: SystemAlert[] = [
    {
      id: '1',
      type: 'critical',
      category: 'system',
      title: 'High Memory Usage',
      message: 'Server memory usage exceeded 90% threshold',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      acknowledged: false
    },
    {
      id: '2',
      type: 'warning',
      category: 'compliance',
      title: 'KYC Documents Expiring',
      message: '15 users have KYC documents expiring in the next 30 days',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      acknowledged: false
    },
    {
      id: '3',
      type: 'info',
      category: 'transaction',
      title: 'Large Transaction Detected',
      message: 'Transaction of $250,000 detected from user ID: USR-12345',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      acknowledged: true,
      acknowledgedBy: 'admin@monay.com',
      acknowledgedAt: new Date(Date.now() - 1000 * 60 * 45)
    },
    {
      id: '4',
      type: 'warning',
      category: 'security',
      title: 'Multiple Failed Login Attempts',
      message: '10 failed login attempts detected from IP: 192.168.1.100',
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      acknowledged: false
    },
    {
      id: '5',
      type: 'critical',
      category: 'performance',
      title: 'API Response Time Degradation',
      message: 'Average API response time increased to 2.5s (threshold: 1s)',
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      acknowledged: false
    },
    {
      id: '6',
      type: 'success',
      category: 'system',
      title: 'System Update Completed',
      message: 'Successfully updated to version 2.1.0',
      timestamp: new Date(Date.now() - 1000 * 60 * 180),
      acknowledged: true,
      acknowledgedBy: 'devops@monay.com',
      acknowledgedAt: new Date(Date.now() - 1000 * 60 * 170)
    }
  ];

  useEffect(() => {
    loadAlerts();
    // Set up WebSocket for real-time alerts
    const subscription = superAdminService.subscribeToUpdates((data) => {
      if (data.type === 'alert') {
        setAlerts(prev => [data.alert, ...prev]);
        toast.error(`New ${data.alert.type} alert: ${data.alert.title}`);
      }
    });

    return () => subscription?.();
  }, []);

  useEffect(() => {
    filterAlerts();
  }, [alerts, selectedType, selectedCategory, searchTerm]);

  const loadAlerts = async () => {
    try {
      // Use mock data for now
      setAlerts(mockAlerts);
      calculateStats(mockAlerts);
    } catch (error) {
      console.error('Error loading alerts:', error);
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (alertsList: SystemAlert[]) => {
    setStats({
      critical: alertsList.filter(a => a.type === 'critical' && !a.acknowledged).length,
      warning: alertsList.filter(a => a.type === 'warning' && !a.acknowledged).length,
      info: alertsList.filter(a => a.type === 'info' && !a.acknowledged).length,
      unacknowledged: alertsList.filter(a => !a.acknowledged).length
    });
  };

  const filterAlerts = () => {
    let filtered = [...alerts];

    if (selectedType !== 'all') {
      filtered = filtered.filter(a => a.type === selectedType);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAlerts(filtered);
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      // API call would go here
      setAlerts(prev => prev.map(a => 
        a.id === alertId 
          ? { ...a, acknowledged: true, acknowledgedBy: 'current-user@monay.com', acknowledgedAt: new Date() }
          : a
      ));
      toast.success('Alert acknowledged');
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      toast.error('Failed to acknowledge alert');
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const exportAlerts = () => {
    const csv = [
      ['ID', 'Type', 'Category', 'Title', 'Message', 'Timestamp', 'Acknowledged', 'Acknowledged By', 'Acknowledged At'],
      ...filteredAlerts.map(a => [
        a.id,
        a.type,
        a.category,
        a.title,
        a.message,
        a.timestamp.toISOString(),
        a.acknowledged ? 'Yes' : 'No',
        a.acknowledgedBy || '',
        a.acknowledgedAt?.toISOString() || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alerts-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Alerts</h1>
          <p className="text-gray-500 mt-1">Monitor and manage system notifications</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={exportAlerts}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Alert Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Critical</p>
                <p className="text-2xl font-bold text-red-900">{stats.critical}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Warning</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.warning}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Information</p>
                <p className="text-2xl font-bold text-blue-900">{stats.info}</p>
              </div>
              <Info className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unacknowledged</p>
                <p className="text-2xl font-bold">{stats.unacknowledged}</p>
              </div>
              <Bell className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Alert Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Information</SelectItem>
                <SelectItem value="success">Success</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="transaction">Transaction</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-500">Loading alerts...</p>
            </CardContent>
          </Card>
        ) : filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-500">No alerts found</p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Card key={alert.id} className={`border ${getAlertColor(alert.type)}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{alert.title}</h3>
                        <Badge variant="outline">{alert.category}</Badge>
                        {alert.acknowledged && (
                          <Badge variant="secondary">Acknowledged</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{alert.message}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{format(alert.timestamp, 'PPpp')}</span>
                        {alert.acknowledged && alert.acknowledgedBy && (
                          <>
                            <span>•</span>
                            <span>Acknowledged by {alert.acknowledgedBy}</span>
                            <span>at {format(alert.acknowledgedAt!, 'PPp')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {!alert.acknowledged && (
                    <Button
                      size="sm"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      Acknowledge
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}