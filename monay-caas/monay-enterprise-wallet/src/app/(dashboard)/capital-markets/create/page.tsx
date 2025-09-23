'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { RuleSetBuilder } from '@/components/capital-markets/RuleSetBuilder'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CreateRuleSetPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get('template')
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/capital-markets/templates', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
    }
  }

  const handleSaveRuleSet = async (ruleSet: any) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/capital-markets/rule-sets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(ruleSet),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Rule set created successfully!')
        router.push(`/capital-markets/${data.data.id}`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create rule set')
      }
    } catch (error) {
      console.error('Failed to save rule set:', error)
      toast.error('Failed to create rule set')
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 }
    }
  }

  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/capital-markets')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Capital Markets
        </Button>
      </div>

      {/* Main Content */}
      <RuleSetBuilder
        onSave={handleSaveRuleSet}
        templates={templates}
        mode="create"
      />
    </motion.div>
  )
}