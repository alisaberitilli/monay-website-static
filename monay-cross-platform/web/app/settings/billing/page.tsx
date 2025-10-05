'use client'

import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function BillingPreferencesPage() {
  return (
    <DashboardLayout>
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Billing Preferences</CardTitle>
          <CardDescription>Manage your billing settings and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>Configure billing preferences</p>
            <Button>Update Preferences</Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  )
}