'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  DollarSign,
  Activity,
  Eye,
} from 'lucide-react';
import { AreaChart, BarChart, LineChart, DonutChart } from '@tremor/react';
import CountUp from 'react-countup';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { dashboardService } from '@/services/dashboard.service';
import { useAuthStore } from '@/store/auth';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const StatCard = ({ icon, title, value, suffix, gradient, index, precision = 0 }: any) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={cardVariants}
    transition={{ delay: index * 0.1, duration: 0.5 }}
    whileHover={{ y: -8, transition: { duration: 0.2 } }}
  >
    <Card className="h-full shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-0" 
      style={{
        background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
      }}>
      <CardContent className="p-6">
        <div className="relative">
          <div className="absolute top-0 right-0 opacity-10">
            <div className="text-6xl text-white">{icon}</div>
          </div>
          <div className="relative z-10">
            <div className="text-white/80 text-sm font-medium mb-2">{title}</div>
            <div className="text-white text-3xl font-bold mb-1">
              <CountUp 
                end={value} 
                duration={2.5} 
                separator="," 
                decimals={precision}
                prefix={title.includes('Balance') || title.includes('Revenue') ? '$' : ''}
              />
            </div>
            {suffix && (
              <div className="text-white/90 text-sm font-medium">
                {suffix}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    walletBalance: 24750.85,
    totalUsers: 12547,
    totalTransactions: 8934,
    monthlyRevenue: 45320.90,
    userGrowth: 12.5,
    transactionGrowth: 8.3,
    revenueGrowth: 15.2,
  });

  const recentTransactions = [
    {
      key: '1',
      id: 'TXN-2024-001',
      user: 'John Doe',
      amount: 2250.00,
      type: 'credit',
      status: 'completed',
      date: '2024-08-23',
      time: '10:30 AM'
    },
    {
      key: '2',
      id: 'TXN-2024-002',
      user: 'Jane Smith',
      amount: 1150.00,
      type: 'debit',
      status: 'completed',
      date: '2024-08-23',
      time: '09:45 AM'
    },
    {
      key: '3',
      id: 'TXN-2024-003',
      user: 'Bob Johnson',
      amount: 3500.00,
      type: 'credit',
      status: 'pending',
      date: '2024-08-23',
      time: '08:20 AM'
    },
    {
      key: '4',
      id: 'TXN-2024-004',
      user: 'Alice Wilson',
      amount: 875.50,
      type: 'debit',
      status: 'completed',
      date: '2024-08-22',
      time: '16:15 PM'
    },
  ];

  const chartData = [
    { month: 'Jan', revenue: 32000, users: 1200 },
    { month: 'Feb', revenue: 45000, users: 1800 },
    { month: 'Mar', revenue: 38000, users: 1650 },
    { month: 'Apr', revenue: 52000, users: 2100 },
    { month: 'May', revenue: 49000, users: 2050 },
    { month: 'Jun', revenue: 63000, users: 2400 },
    { month: 'Jul', revenue: 58000, users: 2350 },
    { month: 'Aug', revenue: 71000, users: 2750 },
  ];

  const userInsightData = [
    { name: 'Active Users', value: 78, color: 'blue' },
    { name: 'KYC Verified', value: 82, color: 'emerald' },
    { name: 'Premium Users', value: 45, color: 'violet' },
    { name: 'New Registrations', value: 65, color: 'amber' },
  ];



  useEffect(() => {
    setTimeout(() => setLoading(false), 1500);
  }, []);

  const statCards = [
    {
      icon: <Wallet className="w-6 h-6" />,
      title: "Total Balance",
      value: stats.walletBalance,
      precision: 2,
      gradient: ['#3b82f6', '#1d4ed8'],
      suffix: null
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Active Users",
      value: stats.totalUsers,
      gradient: ['#10b981', '#059669'],
      suffix: (
        <span className="text-white/90 text-sm flex items-center gap-1">
          <TrendingUp className="w-4 h-4" /> +{stats.userGrowth}% this month
        </span>
      )
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: "Transactions",
      value: stats.totalTransactions,
      gradient: ['#8b5cf6', '#7c3aed'],
      suffix: (
        <span className="text-white/90 text-sm flex items-center gap-1">
          <TrendingUp className="w-4 h-4" /> +{stats.transactionGrowth}% this week
        </span>
      )
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Monthly Revenue",
      value: stats.monthlyRevenue,
      precision: 2,
      gradient: ['#f59e0b', '#d97706'],
      suffix: (
        <span className="text-white/90 text-sm flex items-center gap-1">
          <TrendingUp className="w-4 h-4" /> +{stats.revenueGrowth}% growth
        </span>
      )
    }
  ];

  return (
    <div className="space-y-8">
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 border-0 text-white relative overflow-hidden">
          <CardContent className="p-8">
            <div className="absolute top-0 right-0 opacity-10">
              <DollarSign className="w-36 h-36" />
            </div>
            <div className="relative z-10">
              <h1 className="text-4xl font-bold text-white mb-2">
                Welcome back, {user?.firstName}! 👋
              </h1>
              <p className="text-blue-100 text-lg">
                Here's what's happening with your wallet today
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <StatCard {...card} index={index} key={index} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Card className="h-full shadow-xl border-0 overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-800">Revenue Analytics</CardTitle>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                    <span className="text-gray-600">Last 8 months</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <AreaChart
                    className="h-full"
                    data={chartData}
                    index="month"
                    categories={["revenue"]}
                    colors={["blue"]}
                    valueFormatter={(value) => `$${value.toLocaleString()}`}
                    showAnimation={true}
                    showGridLines={false}
                    showLegend={false}
                    curveType="monotone"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        <div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <Card className="h-full shadow-xl border-0">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-800">User Insights</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <BarChart
                    className="h-full"
                    data={userInsightData}
                    index="name"
                    categories={["value"]}
                    colors={['blue']}
                    valueFormatter={(value) => `${value}%`}
                    showAnimation={true}
                    showGridLines={false}
                    showLegend={false}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.5 }}
      >
        <Card className="shadow-xl border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-800">Recent Transactions</CardTitle>
              </div>
              <motion.button 
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View All
              </motion.button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((transaction) => (
                  <TableRow key={transaction.key} className="hover:bg-gray-50 transition-colors duration-200">
                    <TableCell>
                      <div>
                        <div className="font-semibold text-gray-800">{transaction.id}</div>
                        <div className="text-xs text-gray-500">{transaction.time}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium text-gray-700">{transaction.user}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`font-bold text-lg ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={transaction.status === 'completed' ? 'success' : 'warning'}
                        className="px-3 py-1 rounded-full font-medium"
                      >
                        {transaction.status === 'completed' ? 'Completed' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-gray-600 font-medium">
                        {new Date(transaction.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}