'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, TrendingUp, TrendingDown, Activity } from 'lucide-react'

const transactionData = [
  { month: 'Jan', enterprise: 4500, consumer: 3200, total: 7700 },
  { month: 'Feb', enterprise: 5200, consumer: 3800, total: 9000 },
  { month: 'Mar', enterprise: 4800, consumer: 4200, total: 9000 },
  { month: 'Apr', enterprise: 6100, consumer: 4500, total: 10600 },
  { month: 'May', enterprise: 5900, consumer: 5100, total: 11000 },
  { month: 'Jun', enterprise: 7200, consumer: 5800, total: 13000 },
]

const tokenDistribution = [
  { name: 'USDM', value: 45, color: '#3b82f6' },
  { name: 'EURC', value: 25, color: '#6366f1' },
  { name: 'GBPC', value: 15, color: '#8b5cf6' },
  { name: 'JPYC', value: 10, color: '#a78bfa' },
  { name: 'Others', value: 5, color: '#c4b5fd' },
]

const performanceData = [
  { metric: 'Transaction Speed', enterprise: 85, consumer: 95 },
  { metric: 'Success Rate', enterprise: 98, consumer: 99 },
  { metric: 'User Satisfaction', enterprise: 88, consumer: 92 },
  { metric: 'Security Score', enterprise: 95, consumer: 90 },
  { metric: 'Compliance Rate', enterprise: 100, consumer: 85 },
  { metric: 'Cost Efficiency', enterprise: 80, consumer: 95 },
]

const volumeData = [
  { time: '00:00', volume: 120000 },
  { time: '04:00', volume: 80000 },
  { time: '08:00', volume: 250000 },
  { time: '12:00', volume: 380000 },
  { time: '16:00', volume: 420000 },
  { time: '20:00', volume: 320000 },
  { time: '23:59', volume: 180000 },
]

export default function EnhancedAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Analytics Dashboard
          </h2>
          <p className="text-gray-600 mt-1">Real-time insights across dual-rail operations</p>
        </div>
        <div className="flex gap-2">
          {['day', 'week', 'month', 'year'].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'gradient' : 'outline'}
              onClick={() => setSelectedPeriod(period)}
              className="capitalize"
            >
              {period}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Volume', value: '$13.5M', change: '+15.3%', trend: 'up' },
          { label: 'Active Users', value: '24,532', change: '+8.7%', trend: 'up' },
          { label: 'Success Rate', value: '98.5%', change: '+0.5%', trend: 'up' },
          { label: 'Avg. TPS', value: '2,450', change: '-2.1%', trend: 'down' },
        ].map((kpi, index) => (
          <Card key={index} className="glass-card">
            <CardContent className="p-6">
              <p className="text-sm text-gray-600">{kpi.label}</p>
              <p className="text-2xl font-bold mt-2">{kpi.value}</p>
              <div className={`flex items-center mt-2 text-sm ${
                kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {kpi.trend === 'up' ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                {kpi.change}
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Transaction Volume Chart */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Transaction Volume</CardTitle>
            <CardDescription>Monthly transaction volume by rail</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={transactionData}>
                <defs>
                  <linearGradient id="enterpriseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="consumerGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="enterprise" 
                  stroke="#3b82f6" 
                  fill="url(#enterpriseGradient)"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="consumer" 
                  stroke="#8b5cf6" 
                  fill="url(#consumerGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Token Distribution & Performance */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Token Distribution */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Token Distribution</CardTitle>
            <CardDescription>Portfolio allocation by token type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tokenDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {tokenDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Radar */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Comparative analysis by rail</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={performanceData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="metric" stroke="#6b7280" fontSize={12} />
                <Radar 
                  name="Enterprise" 
                  dataKey="enterprise" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.3}
                />
                <Radar 
                  name="Consumer" 
                  dataKey="consumer" 
                  stroke="#8b5cf6" 
                  fill="#8b5cf6" 
                  fillOpacity={0.3}
                />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Real-time Volume */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>24-Hour Volume Pattern</CardTitle>
              <CardDescription>Transaction volume throughout the day</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="url(#gradient)" 
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', strokeWidth: 2 }}
                  activeDot={{ r: 8 }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemVariants}>
        <Card className="glass-gradient">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Real-time Status</p>
                <p className="text-2xl font-bold flex items-center gap-2 mt-1">
                  <Activity className="h-6 w-6 text-green-500" />
                  All Systems Operational
                </p>
              </div>
              <div className="flex gap-8">
                <div>
                  <p className="text-sm text-gray-600">Base L2 TPS</p>
                  <p className="text-xl font-bold">892</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Solana TPS</p>
                  <p className="text-xl font-bold">3,241</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Swaps</p>
                  <p className="text-xl font-bold">47</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}