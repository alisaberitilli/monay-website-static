'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function SubscriptionPage() {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Subscription Management</CardTitle>
          <CardDescription>Manage your subscription plan and features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>Current Plan: Basic</p>
            <Button>Upgrade Plan</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}