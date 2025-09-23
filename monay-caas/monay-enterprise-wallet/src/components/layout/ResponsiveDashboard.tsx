'use client'

import React from 'react'
import { useBreakpoint } from '@/hooks/useMediaQuery'
import ResponsiveContainer, { ResponsiveGrid } from '@/components/ui/responsive-container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DollarSign,
  Users,
  CreditCard,
  TrendingUp,
  Activity,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ComponentType<{ className?: string }>
  trend?: 'up' | 'down'
}

function MetricCard({ title, value, change, icon: Icon, trend }: MetricCardProps) {
  const breakpoint = useBreakpoint()
  const isMobile = breakpoint === 'mobile'

  return (
    <Card className={cn(isMobile && 'p-3')}>
      <CardContent className={cn('p-6', isMobile && 'p-3')}>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className={cn('text-sm text-muted-foreground', isMobile && 'text-xs')}>
              {title}
            </p>
            <p className={cn('text-2xl font-bold', isMobile && 'text-xl')}>
              {value}
            </p>
            {change !== undefined && (
              <p className={cn(
                'text-xs flex items-center gap-1',
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              )}>
                {trend === 'up' ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {Math.abs(change)}%
              </p>
            )}
          </div>
          <div className={cn(
            'h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center',
            isMobile && 'h-10 w-10'
          )}>
            <Icon className={cn('h-6 w-6 text-blue-600', isMobile && 'h-5 w-5')} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ResponsiveDashboard() {
  const breakpoint = useBreakpoint()
  const isMobile = breakpoint === 'mobile'
  const isTablet = breakpoint === 'tablet'

  const metrics = [
    {
      title: 'Total Balance',
      value: '$124,563.89',
      change: 12.5,
      trend: 'up' as const,
      icon: DollarSign
    },
    {
      title: 'Active Users',
      value: '2,845',
      change: 8.2,
      trend: 'up' as const,
      icon: Users
    },
    {
      title: 'Transactions',
      value: '14,526',
      change: -3.1,
      trend: 'down' as const,
      icon: CreditCard
    },
    {
      title: 'Growth Rate',
      value: '23.4%',
      change: 15.7,
      trend: 'up' as const,
      icon: TrendingUp
    }
  ]

  const recentTransactions = [
    { id: 1, name: 'John Smith', amount: '+$1,250.00', time: '2 mins ago', status: 'completed' },
    { id: 2, name: 'Acme Corp', amount: '-$450.00', time: '15 mins ago', status: 'pending' },
    { id: 3, name: 'Sarah Johnson', amount: '+$890.50', time: '1 hour ago', status: 'completed' },
    { id: 4, name: 'Tech Solutions', amount: '+$3,200.00', time: '2 hours ago', status: 'completed' },
    { id: 5, name: 'Mike Davis', amount: '-$125.00', time: '3 hours ago', status: 'failed' }
  ]

  return (
    <ResponsiveContainer className="py-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className={cn('text-3xl font-bold', isMobile && 'text-2xl')}>
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here's your overview.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" size={isMobile ? 'sm' : 'default'}>
              <Calendar className="h-4 w-4 mr-2" />
              Last 30 days
            </Button>
            <Button size={isMobile ? 'sm' : 'default'}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <ResponsiveGrid
        cols={{
          mobile: 1,
          tablet: 2,
          desktop: 4
        }}
        className="mb-6"
      >
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </ResponsiveGrid>

      {/* Charts and Activity */}
      <div className={cn(
        'grid gap-6',
        isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-1' : 'grid-cols-3'
      )}>
        {/* Chart */}
        <Card className={cn(!isMobile && !isTablet && 'col-span-2')}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className={isMobile ? 'text-lg' : 'text-xl'}>
              Revenue Overview
            </CardTitle>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-b from-blue-50 to-transparent rounded-lg flex items-center justify-center">
              <Activity className="h-12 w-12 text-blue-300" />
              <span className="ml-3 text-blue-400">Chart placeholder</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className={isMobile ? 'text-lg' : 'text-xl'}>
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className={isMobile ? 'p-3' : 'p-6'}>
            <div className="space-y-3">
              {recentTransactions.slice(0, isMobile ? 3 : 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className={cn('font-medium truncate', isMobile && 'text-sm')}>
                      {transaction.name}
                    </p>
                    <p className={cn('text-xs text-muted-foreground')}>
                      {transaction.time}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      'font-medium',
                      isMobile && 'text-sm',
                      transaction.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    )}>
                      {transaction.amount}
                    </p>
                    <p className={cn(
                      'text-xs',
                      transaction.status === 'completed' && 'text-green-600',
                      transaction.status === 'pending' && 'text-yellow-600',
                      transaction.status === 'failed' && 'text-red-600'
                    )}>
                      {transaction.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {!isMobile && (
              <Button variant="ghost" className="w-full mt-4" size="sm">
                View all transactions
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mobile-only Quick Actions */}
      {isMobile && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm">
                Send Money
              </Button>
              <Button variant="outline" size="sm">
                Request Payment
              </Button>
              <Button variant="outline" size="sm">
                Add Card
              </Button>
              <Button variant="outline" size="sm">
                View Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </ResponsiveContainer>
  )
}