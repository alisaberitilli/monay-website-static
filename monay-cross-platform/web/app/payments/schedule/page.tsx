'use client'

import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function SchedulePaymentPage() {
  return (
    <DashboardLayout>
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Schedule Payment</CardTitle>
          <CardDescription>Schedule recurring or future payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>Create and manage scheduled payments</p>
            <Button>Schedule New Payment</Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  )
}