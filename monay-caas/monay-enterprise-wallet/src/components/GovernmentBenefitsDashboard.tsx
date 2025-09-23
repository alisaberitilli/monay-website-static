'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { governmentBenefitsAPI } from '../lib/api/services';
import {
  Users,
  DollarSign,
  ShoppingCart,
  Heart,
  Home,
  GraduationCap,
  Shield,
  UserCheck,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';

interface BenefitProgram {
  id: string;
  name: string;
  shortName: string;
  icon: React.ElementType;
  totalBeneficiaries: number;
  monthlyDisbursement: number;
  utilizationRate: number;
  pendingApplications: number;
  status: 'active' | 'paused' | 'inactive';
}

const GovernmentBenefitsDashboard: React.FC = () => {
  const [benefitPrograms, setBenefitPrograms] = useState<BenefitProgram[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalBeneficiaries: 0,
    totalDisbursements: 0,
    averageProcessingTime: 0,
    fraudDetectionRate: 0,
    complianceScore: 0
  });

  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard data
      const userId = localStorage.getItem('userId') || 'admin';
      const dashboardData = await governmentBenefitsAPI.getDashboard(userId);

      // Update metrics
      if (dashboardData?.metrics) {
        setMetrics({
          totalBeneficiaries: dashboardData.metrics.totalBeneficiaries || 574540,
          totalDisbursements: dashboardData.metrics.totalDisbursements || 301250000,
          averageProcessingTime: dashboardData.metrics.averageProcessingTime || 2.4,
          fraudDetectionRate: dashboardData.metrics.fraudDetectionRate || 0.23,
          complianceScore: dashboardData.metrics.complianceScore || 98.7
        });
      }

      // Update programs if provided, otherwise use defaults
      if (dashboardData?.programs && dashboardData.programs.length > 0) {
        setBenefitPrograms(dashboardData.programs);
      } else {
        // Use default mock data
        setDefaultPrograms();
      }
    } catch (error) {
      console.log('Using mock data for government dashboard:', error);
      setDefaultPrograms();
    } finally {
      setLoading(false);
    }
  };

  const setDefaultPrograms = () => {
    const programs: BenefitProgram[] = [
      {
        id: 'snap',
        name: 'Supplemental Nutrition Assistance Program',
        shortName: 'SNAP',
        icon: ShoppingCart,
        totalBeneficiaries: 125420,
        monthlyDisbursement: 18500000,
        utilizationRate: 94.5,
        pendingApplications: 2341,
        status: 'active'
      },
      {
        id: 'tanf',
        name: 'Temporary Assistance for Needy Families',
        shortName: 'TANF',
        icon: Users,
        totalBeneficiaries: 45320,
        monthlyDisbursement: 8750000,
        utilizationRate: 87.2,
        pendingApplications: 892,
        status: 'active'
      },
      {
        id: 'medicaid',
        name: 'Medicaid',
        shortName: 'Medicaid',
        icon: Heart,
        totalBeneficiaries: 234500,
        monthlyDisbursement: 125000000,
        utilizationRate: 91.3,
        pendingApplications: 5421,
        status: 'active'
      },
      {
        id: 'section8',
        name: 'Housing Choice Voucher Program',
        shortName: 'Section 8',
        icon: Home,
        totalBeneficiaries: 78900,
        monthlyDisbursement: 45000000,
        utilizationRate: 96.8,
        pendingApplications: 12450,
        status: 'active'
      },
      {
        id: 'schoolchoice',
        name: 'School Choice Program',
        shortName: 'School Choice',
        icon: GraduationCap,
        totalBeneficiaries: 34200,
        monthlyDisbursement: 15000000,
        utilizationRate: 82.4,
        pendingApplications: 3210,
        status: 'active'
      },
      {
        id: 'veterans',
        name: 'Veterans Benefits',
        shortName: 'VA Benefits',
        icon: Shield,
        totalBeneficiaries: 56700,
        monthlyDisbursement: 89000000,
        utilizationRate: 88.9,
        pendingApplications: 1890,
        status: 'active'
      }
    ];

    setBenefitPrograms(programs);

    // Calculate total metrics from programs
    const totals = programs.reduce((acc, prog) => ({
      totalBeneficiaries: acc.totalBeneficiaries + prog.totalBeneficiaries,
      totalDisbursements: acc.totalDisbursements + prog.monthlyDisbursement,
      averageProcessingTime: 2.4,
      fraudDetectionRate: 0.23,
      complianceScore: 98.7
    }), {
      totalBeneficiaries: 0,
      totalDisbursements: 0,
      averageProcessingTime: 0,
      fraudDetectionRate: 0,
      complianceScore: 0
    });

    setMetrics(totals);
  };

  // Initialize on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading Government Benefits Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Beneficiaries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{formatNumber(metrics.totalBeneficiaries)}</span>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Disbursements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{formatCurrency(metrics.totalDisbursements)}</span>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">On target</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Processing Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{metrics.averageProcessingTime} days</span>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">-15% improvement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Fraud Detection Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{metrics.fraudDetectionRate}%</span>
              <Shield className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-red-600 dark:text-red-400 mt-2">23 cases prevented</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Compliance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{metrics.complianceScore}%</span>
              <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
            </div>
            <Progress value={metrics.complianceScore} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* Program Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">All Programs</TabsTrigger>
          <TabsTrigger value="snap">SNAP</TabsTrigger>
          <TabsTrigger value="tanf">TANF</TabsTrigger>
          <TabsTrigger value="medicaid">Medicaid</TabsTrigger>
          <TabsTrigger value="section8">Section 8</TabsTrigger>
          <TabsTrigger value="schoolchoice">School Choice</TabsTrigger>
          <TabsTrigger value="veterans">Veterans</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Program Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefitPrograms.map((program) => {
              const Icon = program.icon;
              return (
                <Card key={program.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg">{program.shortName}</CardTitle>
                      </div>
                      <Badge className={getStatusColor(program.status)}>
                        {program.status}
                      </Badge>
                    </div>
                    <CardDescription>{program.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Beneficiaries</span>
                        <span className="font-semibold">{formatNumber(program.totalBeneficiaries)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Monthly Disbursement</span>
                        <span className="font-semibold">{formatCurrency(program.monthlyDisbursement)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Utilization Rate</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={program.utilizationRate} className="w-20 h-2" />
                          <span className="text-sm font-medium">{program.utilizationRate}%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Pending Applications</span>
                        <span className="font-semibold text-yellow-600">
                          {formatNumber(program.pendingApplications)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest benefit processing activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">SNAP Benefits Approved</p>
                      <p className="text-sm text-gray-600">234 applications processed</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">2 minutes ago</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <UserCheck className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Medicaid Eligibility Verified</p>
                      <p className="text-sm text-gray-600">512 verifications completed</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">15 minutes ago</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">Fraud Alert Triggered</p>
                      <p className="text-sm text-gray-600">Suspicious activity detected in TANF program</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">1 hour ago</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Monthly Report Generated</p>
                      <p className="text-sm text-gray-600">All programs compliance report ready</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">3 hours ago</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GENIUS Act Compliance */}
          <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-blue-900">GENIUS Act Compliance Status</CardTitle>
                <Badge className="bg-blue-600 text-white">ON TRACK</Badge>
              </div>
              <CardDescription>Meeting requirements by July 18, 2025</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm font-medium">78%</span>
                  </div>
                  <Progress value={78} className="h-3" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-900">14</p>
                    <p className="text-sm text-gray-600">Programs Integrated</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-900">52</p>
                    <p className="text-sm text-gray-600">States Connected</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-900">99.95%</p>
                    <p className="text-sm text-gray-600">System Uptime</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-900">177</p>
                    <p className="text-sm text-gray-600">Days Remaining</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual program tabs would show detailed views */}
        {benefitPrograms.map((program) => (
          <TabsContent key={program.id} value={program.id}>
            <Card>
              <CardHeader>
                <CardTitle>{program.name} Dashboard</CardTitle>
                <CardDescription>Detailed view of {program.shortName} program</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Detailed analytics and controls for {program.name} would appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default GovernmentBenefitsDashboard;