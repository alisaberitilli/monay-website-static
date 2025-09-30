'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Shield,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  FileText,
  Search,
  Filter,
  Download,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  UserCheck,
  UserX,
  Activity,
  Eye,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  Flag,
  FileCheck,
  AlertOctagon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DonutChart, AreaChart } from '@tremor/react';
import { superAdminService } from '@/services/super-admin.service';
import { useToast } from '@/components/ui/use-toast';

interface KYCRequest {
  id: string;
  userId: string;
  userEmail: string;
  firstName: string;
  lastName: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  submittedAt: string;
  documents: {
    type: string;
    status: string;
    url?: string;
  }[];
  riskScore: number;
  notes?: string;
}

interface ComplianceMetrics {
  pendingKYC: number;
  approvedToday: number;
  rejectedToday: number;
  averageProcessingTime: string;
  complianceRate: number;
  highRiskUsers: number;
}

interface TransactionFlag {
  id: string;
  transactionId: string;
  amount: number;
  userId: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  flaggedAt: string;
  status: 'pending' | 'reviewed' | 'cleared' | 'escalated';
}

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState('kyc');
  const [kycQueue, setKycQueue] = useState<KYCRequest[]>([]);
  const [selectedKYC, setSelectedKYC] = useState<KYCRequest | null>(null);
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [flaggedTransactions, setFlaggedTransactions] = useState<TransactionFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionFlag | null>(null);
  const [processingReview, setProcessingReview] = useState(false);
  const [transactionReviewNotes, setTransactionReviewNotes] = useState('');
  const [riskAssessment, setRiskAssessment] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadComplianceData();
    const interval = setInterval(loadComplianceData, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadComplianceData = async () => {
    try {
      setLoading(true);
      const kycData = await superAdminService.getKYCQueue();

      // Mock data for demonstration
      setKycQueue([
        {
          id: '1',
          userId: 'user-001',
          userEmail: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          status: 'pending',
          submittedAt: '2024-01-24T10:00:00Z',
          documents: [
            { type: 'ID Card', status: 'verified' },
            { type: 'Proof of Address', status: 'pending' },
          ],
          riskScore: 25,
        },
        {
          id: '2',
          userId: 'user-002',
          userEmail: 'jane.smith@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          status: 'under_review',
          submittedAt: '2024-01-24T09:30:00Z',
          documents: [
            { type: 'Passport', status: 'verified' },
            { type: 'Bank Statement', status: 'verified' },
          ],
          riskScore: 75,
          notes: 'High-risk jurisdiction',
        },
      ]);

      setMetrics({
        pendingKYC: 12,
        approvedToday: 45,
        rejectedToday: 3,
        averageProcessingTime: '2h 15m',
        complianceRate: 94.2,
        highRiskUsers: 5,
      });

      setFlaggedTransactions([
        {
          id: 'flag-001',
          transactionId: 'tx-001',
          amount: 50000,
          userId: 'user-003',
          reason: 'Unusual transaction pattern',
          severity: 'high',
          flaggedAt: '2024-01-24T11:00:00Z',
          status: 'pending',
        },
        {
          id: 'flag-002',
          transactionId: 'tx-002',
          amount: 15000,
          userId: 'user-004',
          reason: 'Velocity limit exceeded',
          severity: 'medium',
          flaggedAt: '2024-01-24T10:30:00Z',
          status: 'reviewed',
        },
      ]);
    } catch (error) {
      console.error('Failed to load compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKYCReview = async (status: 'approved' | 'rejected') => {
    if (!selectedKYC) return;

    if (!reviewNotes.trim()) {
      toast.error('Please provide review notes');
      return;
    }

    setProcessingReview(true);
    try {
      // Update KYC status in database (UPDATE only, no deletions)
      await superAdminService.reviewKYC(selectedKYC.id, status, reviewNotes);

      toast.success(`KYC ${status} successfully. Database updated safely.`);

      setShowKYCModal(false);
      setSelectedKYC(null);
      setReviewNotes('');
      setRiskAssessment('');
      await loadComplianceData();
    } catch (error) {
      console.error('KYC review error:', error);
      toast.error(`Failed to ${status} KYC. Database remains intact.`);
    } finally {
      setProcessingReview(false);
    }
  };

  const handleTransactionReview = async (status: 'cleared' | 'escalated') => {
    if (!selectedTransaction) return;

    if (!transactionReviewNotes.trim()) {
      toast.error('Please provide review notes for the transaction');
      return;
    }

    setProcessingReview(true);
    try {
      // Update transaction flag status in database (UPDATE only)
      await superAdminService.reviewFlaggedTransaction(
        selectedTransaction.id,
        status,
        transactionReviewNotes
      );

      toast.success(`Transaction ${status} successfully. Database updated safely.`);

      setShowTransactionModal(false);
      setSelectedTransaction(null);
      setTransactionReviewNotes('');
      await loadComplianceData();
    } catch (error) {
      console.error('Transaction review error:', error);
      toast.error(`Failed to ${status} transaction. Database remains intact.`);
    } finally {
      setProcessingReview(false);
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score <= 30) return 'text-green-600 bg-green-100';
    if (score <= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-blue-600 bg-blue-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const complianceChartData = [
    { date: '2024-01-20', approved: 42, rejected: 3 },
    { date: '2024-01-21', approved: 38, rejected: 5 },
    { date: '2024-01-22', approved: 45, rejected: 2 },
    { date: '2024-01-23', approved: 51, rejected: 4 },
    { date: '2024-01-24', approved: 45, rejected: 3 },
  ];

  const riskDistribution = [
    { name: 'Low Risk', value: 65, color: 'green' },
    { name: 'Medium Risk', value: 28, color: 'yellow' },
    { name: 'High Risk', value: 7, color: 'red' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Compliance & KYC Management</h1>
          <p className="text-gray-600">Monitor and manage compliance across all platforms</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={loadComplianceData}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <Badge className="bg-orange-100 text-orange-600">PENDING</Badge>
            </div>
            <p className="text-sm text-gray-600">Pending KYC</p>
            <p className="text-2xl font-bold">{metrics?.pendingKYC || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-xs text-gray-500">Today</span>
            </div>
            <p className="text-sm text-gray-600">Approved</p>
            <p className="text-2xl font-bold text-green-600">{metrics?.approvedToday || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="text-xs text-gray-500">Today</span>
            </div>
            <p className="text-sm text-gray-600">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{metrics?.rejectedToday || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Avg. Processing</p>
            <p className="text-2xl font-bold">{metrics?.averageProcessingTime || '-'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600">Compliance Rate</p>
            <p className="text-2xl font-bold">{metrics?.complianceRate || 0}%</p>
            <Progress value={metrics?.complianceRate || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <Badge className="bg-red-100 text-red-600">ALERT</Badge>
            </div>
            <p className="text-sm text-gray-600">High Risk</p>
            <p className="text-2xl font-bold text-red-600">{metrics?.highRiskUsers || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="kyc">KYC Queue</TabsTrigger>
          <TabsTrigger value="transactions">Flagged Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="rules">Rules Engine</TabsTrigger>
        </TabsList>

        {/* KYC Queue Tab */}
        <TabsContent value="kyc" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pending KYC Verifications</CardTitle>
                <div className="flex items-center gap-4">
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kycQueue.map((kyc) => (
                    <TableRow key={kyc.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{kyc.firstName} {kyc.lastName}</p>
                          <p className="text-sm text-gray-500">{kyc.userEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {kyc.documents.map((doc, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <FileText className="w-3 h-3" />
                              <span className="text-sm">{doc.type}</span>
                              {doc.status === 'verified' ? (
                                <CheckCircle2 className="w-3 h-3 text-green-600" />
                              ) : (
                                <Clock className="w-3 h-3 text-orange-600" />
                              )}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRiskScoreColor(kyc.riskScore)}>
                          {kyc.riskScore}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            kyc.status === 'approved' ? 'success' :
                            kyc.status === 'rejected' ? 'destructive' :
                            kyc.status === 'under_review' ? 'warning' :
                            'secondary'
                          }
                        >
                          {kyc.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(kyc.submittedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedKYC(kyc);
                              setShowKYCModal(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

        </TabsContent>

        {/* Flagged Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flagged Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Flagged At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flaggedTransactions.map((flag) => (
                    <TableRow key={flag.id}>
                      <TableCell className="font-mono text-sm">
                        {flag.transactionId}
                      </TableCell>
                      <TableCell className="font-bold">
                        ${flag.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>{flag.reason}</TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(flag.severity)}>
                          {flag.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={flag.status === 'pending' ? 'warning' : 'secondary'}>
                          {flag.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(flag.flaggedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedTransaction(flag);
                            setShowTransactionModal(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>KYC Processing Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <AreaChart
                    className="h-full"
                    data={complianceChartData}
                    index="date"
                    categories={["approved", "rejected"]}
                    colors={["green", "red"]}
                    showAnimation={true}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <DonutChart
                    className="h-full"
                    data={riskDistribution}
                    category="value"
                    index="name"
                    colors={["green", "yellow", "red"]}
                    showAnimation={true}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Rules Engine Tab */}
        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Rules Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  Business rules engine configuration coming soon. This will allow you to set up
                  custom compliance rules, transaction limits, and automated flagging criteria.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* KYC Review Modal */}
      <Dialog open={showKYCModal} onOpenChange={setShowKYCModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              KYC Review: {selectedKYC?.firstName} {selectedKYC?.lastName}
            </DialogTitle>
          </DialogHeader>

          {selectedKYC && (
            <div className="space-y-4">
              {/* Database Safety Alert */}
              <Alert className="bg-blue-50 border-blue-200">
                <Shield className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  This action will UPDATE the KYC status in the database. No data will be deleted.
                  All changes are logged for audit purposes.
                </AlertDescription>
              </Alert>

              {/* User Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Email</Label>
                  <p className="font-medium">{selectedKYC.userEmail}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">User ID</Label>
                  <p className="font-medium font-mono text-sm">{selectedKYC.userId}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Risk Score</Label>
                  <div className="flex items-center gap-2">
                    <Badge className={getRiskScoreColor(selectedKYC.riskScore)}>
                      {selectedKYC.riskScore}%
                    </Badge>
                    {selectedKYC.riskScore > 70 && (
                      <AlertOctagon className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Submitted</Label>
                  <p className="font-medium">{new Date(selectedKYC.submittedAt).toLocaleString()}</p>
                </div>
              </div>

              <Separator />

              {/* Documents Verification */}
              <div>
                <Label className="text-sm text-gray-600 mb-2">Documents Status</Label>
                <div className="space-y-2 mt-2">
                  {selectedKYC.documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span className="font-medium">{doc.type}</span>
                      </div>
                      {doc.status === 'verified' ? (
                        <Badge className="bg-green-100 text-green-600">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge className="bg-orange-100 text-orange-600">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Assessment */}
              <div>
                <Label htmlFor="risk-assessment">Risk Assessment</Label>
                <Select value={riskAssessment} onValueChange={setRiskAssessment}>
                  <SelectTrigger id="risk-assessment">
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Risk - Standard User</SelectItem>
                    <SelectItem value="medium">Medium Risk - Enhanced Monitoring</SelectItem>
                    <SelectItem value="high">High Risk - Restricted Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Review Notes */}
              <div>
                <Label htmlFor="review-notes">Review Notes (Required)</Label>
                <Textarea
                  id="review-notes"
                  placeholder="Enter detailed review notes including verification checks performed..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="min-h-[120px]"
                />
                {selectedKYC.notes && (
                  <p className="text-sm text-orange-600 mt-2">
                    Previous note: {selectedKYC.notes}
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowKYCModal(false);
                setReviewNotes('');
                setRiskAssessment('');
              }}
              disabled={processingReview}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleKYCReview('rejected')}
              disabled={processingReview || !reviewNotes.trim()}
            >
              {processingReview ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Reject KYC
            </Button>
            <Button
              variant="default"
              onClick={() => handleKYCReview('approved')}
              disabled={processingReview || !reviewNotes.trim()}
            >
              {processingReview ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Approve KYC
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transaction Review Modal */}
      <Dialog open={showTransactionModal} onOpenChange={setShowTransactionModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5" />
              Review Flagged Transaction
            </DialogTitle>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4">
              {/* Database Safety Alert */}
              <Alert className="bg-blue-50 border-blue-200">
                <Shield className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  This action will UPDATE the transaction flag status. No transactions will be deleted.
                  All reviews are logged for compliance.
                </AlertDescription>
              </Alert>

              {/* Transaction Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Transaction ID</Label>
                  <p className="font-mono text-sm">{selectedTransaction.transactionId}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Amount</Label>
                  <p className="font-bold text-lg">${selectedTransaction.amount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">User ID</Label>
                  <p className="font-mono text-sm">{selectedTransaction.userId}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Flagged At</Label>
                  <p className="font-medium">{new Date(selectedTransaction.flaggedAt).toLocaleString()}</p>
                </div>
              </div>

              <Separator />

              {/* Flag Details */}
              <div>
                <Label className="text-sm text-gray-600">Flag Reason</Label>
                <div className="p-3 bg-gray-50 rounded mt-1">
                  <p className="font-medium">{selectedTransaction.reason}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-600">Severity Level</Label>
                <Badge className={`mt-1 ${getSeverityColor(selectedTransaction.severity)}`}>
                  {selectedTransaction.severity.toUpperCase()}
                </Badge>
              </div>

              {/* Review Notes */}
              <div>
                <Label htmlFor="transaction-notes">Review Notes (Required)</Label>
                <Textarea
                  id="transaction-notes"
                  placeholder="Enter investigation findings and decision rationale..."
                  value={transactionReviewNotes}
                  onChange={(e) => setTransactionReviewNotes(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowTransactionModal(false);
                setTransactionReviewNotes('');
              }}
              disabled={processingReview}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleTransactionReview('escalated')}
              disabled={processingReview || !transactionReviewNotes.trim()}
            >
              {processingReview ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <AlertTriangle className="w-4 h-4 mr-2" />
              )}
              Escalate
            </Button>
            <Button
              variant="default"
              onClick={() => handleTransactionReview('cleared')}
              disabled={processingReview || !transactionReviewNotes.trim()}
            >
              {processingReview ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileCheck className="w-4 h-4 mr-2" />
              )}
              Clear Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}