'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function OnboardingProfilePage() {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>Tell us more about yourself</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>Profile setup form will go here</p>
            <Button>Continue</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}