'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function CreditIncreasePage() {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Request Credit Increase</CardTitle>
          <CardDescription>Apply for a credit limit increase</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>Request a higher credit limit</p>
            <Button>Submit Request</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}