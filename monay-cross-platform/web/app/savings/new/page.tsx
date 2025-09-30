'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function NewSavingsGoalPage() {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Savings Goal</CardTitle>
          <CardDescription>Set up a new savings goal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>Define your savings target and timeline</p>
            <Button>Create Goal</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}