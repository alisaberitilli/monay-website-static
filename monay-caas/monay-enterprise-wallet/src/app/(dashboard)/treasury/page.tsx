'use client'

import { useState, useEffect } from 'react'
import TreasuryInitialization from '@/components/TreasuryInitialization'
import TreasuryDashboard from '@/components/TreasuryDashboard'
import { Loader2 } from 'lucide-react'

export default function TreasuryPage() {
  const [loading, setLoading] = useState(true)
  const [treasuryInitialized, setTreasuryInitialized] = useState(false)

  useEffect(() => {
    checkTreasuryStatus()
  }, [])

  const checkTreasuryStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3001/api/enterprise-treasury/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTreasuryInitialized(!!data.data?.treasury)
      } else {
        setTreasuryInitialized(false)
      }
    } catch (error) {
      console.error('Error checking treasury status:', error)
      setTreasuryInitialized(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {treasuryInitialized ? <TreasuryDashboard /> : <TreasuryInitialization />}
    </div>
  )
}