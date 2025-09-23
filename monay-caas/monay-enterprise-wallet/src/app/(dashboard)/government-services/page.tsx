'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import EmergencyDisbursement from '@/components/EmergencyDisbursement'
import BenefitsManagement from '@/components/BenefitsManagement'
import IndustryVerticals from '@/components/IndustryVerticals'
import {
  Shield,
  AlertTriangle,
  Heart,
  Building,
  Activity,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react'

export default function GovernmentServicesPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Government & Enterprise Services</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive payment solutions for government programs and industry verticals
          </p>
        </div>
        <Badge variant="default" className="px-3 py-1">
          <Shield className="h-4 w-4 mr-1" />
          Federal Compliant
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <span className="text-2xl font-bold">4hr</span>
            </div>
            <p className="text-sm font-medium mt-2">GENIUS Act SLA</p>
            <p className="text-xs text-muted-foreground">Emergency disbursements</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <Heart className="h-8 w-8 text-green-500" />
              <span className="text-2xl font-bold">13.5k</span>
            </div>
            <p className="text-sm font-medium mt-2">Active Beneficiaries</p>
            <p className="text-xs text-muted-foreground">SNAP/TANF recipients</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <Building className="h-8 w-8 text-blue-500" />
              <span className="text-2xl font-bold">15</span>
            </div>
            <p className="text-sm font-medium mt-2">Industry Verticals</p>
            <p className="text-xs text-muted-foreground">Specialized solutions</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <DollarSign className="h-8 w-8 text-purple-500" />
              <span className="text-2xl font-bold">$186M</span>
            </div>
            <p className="text-sm font-medium mt-2">Monthly Volume</p>
            <p className="text-xs text-muted-foreground">All programs combined</p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Alert */}
      <Alert className="border-blue-500 bg-blue-50">
        <Shield className="h-4 w-4" />
        <AlertTitle>Federal Compliance Active</AlertTitle>
        <AlertDescription>
          All systems are operating in compliance with GENIUS Act, SNAP/TANF regulations, and federal payment standards.
          Real-time monitoring and audit trails are active for all transactions.
        </AlertDescription>
      </Alert>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="emergency">Emergency Disbursement</TabsTrigger>
          <TabsTrigger value="benefits">Benefits Management</TabsTrigger>
          <TabsTrigger value="verticals">Industry Verticals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Emergency Disbursement System
                  </h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• GENIUS Act compliant 4-hour SLA</li>
                    <li>• Multi-channel disbursement</li>
                    <li>• Real-time tracking</li>
                    <li>• Bulk processing capabilities</li>
                    <li>• Complete audit trails</li>
                  </ul>
                  <Badge variant="outline" className="w-fit">Operational</Badge>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Heart className="h-5 w-5 text-green-500" />
                    SNAP/TANF Benefits
                  </h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Automated eligibility verification</li>
                    <li>• MCC-based purchase restrictions</li>
                    <li>• Monthly issuance scheduling</li>
                    <li>• Recertification workflows</li>
                    <li>• Balance management</li>
                  </ul>
                  <Badge variant="outline" className="w-fit">Active</Badge>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Building className="h-5 w-5 text-blue-500" />
                    Industry Verticals
                  </h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• 15 specialized industries</li>
                    <li>• Custom business rules</li>
                    <li>• Compliance frameworks</li>
                    <li>• Escrow services</li>
                    <li>• Industry-specific features</li>
                  </ul>
                  <Badge variant="outline" className="w-fit">Configured</Badge>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Recent Activity</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Emergency Disbursements (24h)</span>
                        <span className="font-medium">247</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">SNAP Transactions (24h)</span>
                        <span className="font-medium">8,432</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Industry Payments (24h)</span>
                        <span className="font-medium">1,856</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">SLA Compliance Rate</span>
                        <span className="font-medium text-green-600">98.7%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">System Health</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">API Response Time</span>
                        <span className="font-medium text-green-600">124ms</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">System Uptime</span>
                        <span className="font-medium text-green-600">99.98%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Failed Transactions</span>
                        <span className="font-medium text-yellow-600">0.3%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Active Connections</span>
                        <span className="font-medium">2,847</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Compliance Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">GENIUS Act (H.R.8084)</span>
                    <Badge variant="default" className="bg-green-500">Compliant</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SNAP Program Standards</span>
                    <Badge variant="default" className="bg-green-500">Compliant</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">TANF Federal Guidelines</span>
                    <Badge variant="default" className="bg-green-500">Compliant</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">FedRAMP Authorization</span>
                    <Badge variant="default" className="bg-yellow-500">In Progress</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">StateRAMP Certification</span>
                    <Badge variant="default" className="bg-yellow-500">In Progress</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Emergency Disbursement SLA</span>
                      <span className="text-sm font-medium">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Benefits Processing Rate</span>
                      <span className="text-sm font-medium">98%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '98%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Industry Transaction Success</span>
                      <span className="text-sm font-medium">99.7%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '99.7%' }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="emergency">
          <EmergencyDisbursement />
        </TabsContent>

        <TabsContent value="benefits">
          <BenefitsManagement />
        </TabsContent>

        <TabsContent value="verticals">
          <IndustryVerticals />
        </TabsContent>
      </Tabs>
    </div>
  )
}