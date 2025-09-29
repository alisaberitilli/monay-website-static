'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { superAdminService } from '@/services/super-admin.service';
import { 
  Search, Filter, Download, Eye, Clock, User, Shield, 
  Activity, Database, Key, Settings, AlertTriangle 
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure' | 'warning';
  details?: any;
  duration?: number;
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [dateRange, setDateRange] = useState('24h');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Mock audit data
  const mockLogs: AuditLog[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      userId: 'USR-001',
      userEmail: 'admin@monay.com',
      action: 'USER_LOGIN',
      resource: 'Authentication',
      ipAddress: '192.168.1.1',
      userAgent: 'Chrome/120.0.0.0',
      status: 'success',
      duration: 250
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      userId: 'USR-002',
      userEmail: 'compliance@monay.com',
      action: 'KYC_APPROVAL',
      resource: 'User',
      resourceId: 'USR-12345',
      ipAddress: '10.0.0.5',
      userAgent: 'Safari/17.0',
      status: 'success',
      details: { kycLevel: 'Level 2', documents: ['passport', 'utility_bill'] },
      duration: 1200
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      userId: 'USR-001',
      userEmail: 'admin@monay.com',
      action: 'WALLET_FREEZE',
      resource: 'Wallet',
      resourceId: 'WAL-98765',
      ipAddress: '192.168.1.1',
      userAgent: 'Chrome/120.0.0.0',
      status: 'warning',
      details: { reason: 'Suspicious activity detected', amount: 50000 },
      duration: 450
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      userId: 'USR-003',
      userEmail: 'treasury@monay.com',
      action: 'TOKEN_MINT',
      resource: 'Token',
      resourceId: 'TOK-USDC',
      ipAddress: '172.16.0.10',
      userAgent: 'Firefox/121.0',
      status: 'success',
      details: { amount: 1000000, chain: 'Base', txHash: '0x123...' },
      duration: 3500
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      userId: 'USR-004',
      userEmail: 'developer@monay.com',
      action: 'API_KEY_CREATE',
      resource: 'API',
      ipAddress: '203.0.113.0',
      userAgent: 'Postman/10.0',
      status: 'success',
      details: { keyName: 'Production API', permissions: ['read', 'write'] },
      duration: 180
    },
    {
      id: '6',
      timestamp: new Date(Date.now() - 1000 * 60 * 90),
      userId: 'USR-001',
      userEmail: 'admin@monay.com',
      action: 'SETTINGS_UPDATE',
      resource: 'System',
      ipAddress: '192.168.1.1',
      userAgent: 'Chrome/120.0.0.0',
      status: 'success',
      details: { setting: 'transaction_limits', oldValue: 10000, newValue: 25000 },
      duration: 320
    },
    {
      id: '7',
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      userId: 'USR-005',
      userEmail: 'support@monay.com',
      action: 'PASSWORD_RESET',
      resource: 'User',
      resourceId: 'USR-67890',
      ipAddress: '10.0.0.20',
      userAgent: 'Edge/120.0',
      status: 'success',
      duration: 280
    },
    {
      id: '8',
      timestamp: new Date(Date.now() - 1000 * 60 * 180),
      userId: 'USR-002',
      userEmail: 'compliance@monay.com',
      action: 'TRANSACTION_FLAG',
      resource: 'Transaction',
      resourceId: 'TXN-11111',
      ipAddress: '10.0.0.5',
      userAgent: 'Safari/17.0',
      status: 'warning',
      details: { amount: 150000, reason: 'Large transaction', flagType: 'manual_review' },
      duration: 520
    },
    {
      id: '9',
      timestamp: new Date(Date.now() - 1000 * 60 * 240),
      userId: 'USR-001',
      userEmail: 'admin@monay.com',
      action: 'DATABASE_BACKUP',
      resource: 'System',
      ipAddress: '192.168.1.1',
      userAgent: 'Chrome/120.0.0.0',
      status: 'success',
      details: { backupType: 'full', size: '5.2GB', destination: 's3://backups/2024-01-15' },
      duration: 45000
    },
    {
      id: '10',
      timestamp: new Date(Date.now() - 1000 * 60 * 300),
      userId: 'USR-006',
      userEmail: 'unauthorized@external.com',
      action: 'LOGIN_ATTEMPT',
      resource: 'Authentication',
      ipAddress: '45.67.89.10',
      userAgent: 'Unknown',
      status: 'failure',
      details: { reason: 'Invalid credentials', attempts: 3 },
      duration: 150
    }
  ];

  useEffect(() => {
    loadAuditLogs();
  }, [dateRange]);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, selectedAction, selectedStatus, selectedUser]);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      // Use mock data for now
      setLogs(mockLogs);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resourceId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedAction !== 'all') {
      filtered = filtered.filter(log => log.action === selectedAction);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(log => log.status === selectedStatus);
    }

    if (selectedUser !== 'all') {
      filtered = filtered.filter(log => log.userId === selectedUser);
    }

    setFilteredLogs(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failure':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('LOGIN') || action.includes('AUTH')) return <Key className="w-4 h-4" />;
    if (action.includes('KYC') || action.includes('COMPLIANCE')) return <Shield className="w-4 h-4" />;
    if (action.includes('WALLET') || action.includes('TOKEN')) return <Database className="w-4 h-4" />;
    if (action.includes('SETTINGS') || action.includes('API')) return <Settings className="w-4 h-4" />;
    if (action.includes('USER')) return <User className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'User', 'Action', 'Resource', 'Resource ID', 'Status', 'IP Address', 'Duration (ms)'],
      ...filteredLogs.map(log => [
        log.timestamp.toISOString(),
        log.userEmail,
        log.action,
        log.resource,
        log.resourceId || '',
        log.status,
        log.ipAddress,
        log.duration?.toString() || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.csv`;
    link.click();
  };

  const uniqueActions = [...new Set(logs.map(l => l.action))];
  const uniqueUsers = [...new Set(logs.map(l => ({ id: l.userId, email: l.userEmail })))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Trail</h1>
          <p className="text-gray-500 mt-1">Complete system activity log and audit history</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportLogs}>
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger>
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action}>{action}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failure">Failure</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {uniqueUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>{user.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-gray-500">Loading audit logs...</p>
          ) : filteredLogs.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No audit logs found</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {format(log.timestamp, 'MMM dd, HH:mm:ss')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{log.userEmail}</p>
                          <p className="text-xs text-gray-500">{log.userId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action)}
                          <span className="font-medium">{log.action}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{log.resource}</p>
                          {log.resourceId && (
                            <p className="text-xs text-gray-500">{log.resourceId}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(log.status)}>
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{log.ipAddress}</TableCell>
                      <TableCell className="text-sm">
                        {log.duration ? `${log.duration}ms` : '-'}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedLog(null)}>
          <Card className="w-full max-w-2xl mx-4" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>Audit Log Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Timestamp</p>
                    <p className="font-medium">{format(selectedLog.timestamp, 'PPpp')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge className={getStatusColor(selectedLog.status)}>
                      {selectedLog.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">User</p>
                    <p className="font-medium">{selectedLog.userEmail}</p>
                    <p className="text-xs text-gray-500">{selectedLog.userId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">IP Address</p>
                    <p className="font-medium">{selectedLog.ipAddress}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Action</p>
                    <p className="font-medium">{selectedLog.action}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Resource</p>
                    <p className="font-medium">{selectedLog.resource}</p>
                    {selectedLog.resourceId && (
                      <p className="text-xs text-gray-500">{selectedLog.resourceId}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">User Agent</p>
                    <p className="font-medium text-sm">{selectedLog.userAgent}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">{selectedLog.duration ? `${selectedLog.duration}ms` : 'N/A'}</p>
                  </div>
                </div>
                {selectedLog.details && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Additional Details</p>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                )}
                <div className="flex justify-end">
                  <Button onClick={() => setSelectedLog(null)}>Close</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}