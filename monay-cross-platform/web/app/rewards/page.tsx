'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function RewardsPage() {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Rewards</CardTitle>
          <CardDescription>Your rewards and cashback</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>View and redeem your rewards</p>
            <Button>View All Rewards</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}