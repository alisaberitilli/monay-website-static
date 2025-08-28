'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Shield, CheckCircle, XCircle, AlertCircle, UserCheck,
  FileText, Activity, TrendingUp, Lock, Globe, Clock
} from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

export default function EnhancedCompliance() {
  const [activeTab, setActiveTab] = useState('overview')

  const complianceScore = 92
  const kycStats = {
    verified: 1245,
    pending: 89,
    rejected: 12,
    expired: 34
  }

  const complianceData = [
    { month: 'Jan', score: 88 },
    { month: 'Feb', score: 90 },
    { month: 'Mar', score: 89 },
    { month: 'Apr', score: 91 },
    { month: 'May', score: 92 },
    { month: 'Jun', score: 92 }
  ]

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
            Compliance Dashboard
          </h2>
          <p className="text-gray-600 mt-1">Monitor KYC/AML compliance and regulatory requirements</p>
        </div>
        <Button variant="gradient" className="shadow-lg">
          <FileText className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </motion.div>

      {/* Compliance Score */}
      <motion.div variants={itemVariants}>
        <Card className="glass-gradient">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overall Compliance Score</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-5xl font-bold">{complianceScore}%</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-600">+2% from last month</span>
                  </div>
                </div>
              </div>
              <Shield className="h-16 w-16 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* KYC Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Verified Users', value: kycStats.verified, icon: UserCheck, color: 'text-green-600' },
          { label: 'Pending Verification', value: kycStats.pending, icon: Clock, color: 'text-yellow-600' },
          { label: 'Rejected', value: kycStats.rejected, icon: XCircle, color: 'text-red-600' },
          { label: 'Expired KYC', value: kycStats.expired, icon: AlertCircle, color: 'text-orange-600' }
        ].map((stat) => (
          <Card key={stat.label} className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Compliance Trend */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Compliance Score Trend</CardTitle>
            <CardDescription>6-month compliance performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={complianceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}