'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  ArrowLeft,
  ArrowRight,
  Users,
  Database,
  Settings,
  Play
} from 'lucide-react'

interface ImportStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const steps: ImportStep[] = [
  {
    id: 'upload',
    title: 'Upload File',
    description: 'Upload your CSV or Excel file',
    icon: Upload
  },
  {
    id: 'mapping',
    title: 'Field Mapping',
    description: 'Map columns to customer fields',
    icon: Database
  },
  {
    id: 'validation',
    title: 'Validation',
    description: 'Review and fix any issues',
    icon: Settings
  },
  {
    id: 'import',
    title: 'Import',
    description: 'Import customers to system',
    icon: Play
  }
]

export default function CustomerImportWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [file, setFile] = useState<File | null>(null)
  const [importData, setImportData] = useState<any[]>([])
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({})
  const [validationResults, setValidationResults] = useState<any>(null)
  const [importProgress, setImportProgress] = useState(0)
  const [importStatus, setImportStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle')

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0]
    if (uploadedFile) {
      setFile(uploadedFile)
      // Simulate parsing file
      setTimeout(() => {
        setImportData([
          { name: 'John Doe', email: 'john@example.com', phone: '+1-555-0123' },
          { name: 'Jane Smith', email: 'jane@example.com', phone: '+1-555-0124' },
          { name: 'Bob Johnson', email: 'bob@example.com', phone: '+1-555-0125' }
        ])
      }, 1000)
    }
  }

  const systemFields = [
    { id: 'name', label: 'Full Name', required: true },
    { id: 'email', label: 'Email Address', required: true },
    { id: 'phone', label: 'Phone Number', required: false },
    { id: 'company', label: 'Company', required: false },
    { id: 'address', label: 'Address', required: false },
    { id: 'dateOfBirth', label: 'Date of Birth', required: false },
    { id: 'ssn', label: 'SSN/Tax ID', required: false },
    { id: 'accountType', label: 'Account Type', required: false }
  ]

  const validateData = () => {
    const results = {
      total: importData.length,
      valid: 0,
      warnings: 0,
      errors: 0,
      issues: []
    }

    importData.forEach((row, index) => {
      if (!row.email) {
        results.errors++
        results.issues.push({ row: index + 1, field: 'email', message: 'Email is required' })
      } else if (!row.email.includes('@')) {
        results.warnings++
        results.issues.push({ row: index + 1, field: 'email', message: 'Invalid email format' })
      } else {
        results.valid++
      }
    })

    setValidationResults(results)
  }

  const startImport = async () => {
    setImportStatus('processing')
    setImportProgress(0)

    // Simulate import process
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200))
      setImportProgress(i)
    }

    setImportStatus('completed')
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Upload
        return (
          <div className="space-y-6">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <div className="space-y-2">
                  <p className="text-lg font-medium">Drop your file here or click to browse</p>
                  <p className="text-sm text-gray-500">Supports CSV and Excel files (max 10MB)</p>
                </div>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </Label>
            </div>

            {file && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  File uploaded: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  <br />
                  Found {importData.length} records to import
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
              <span className="text-sm text-gray-500">
                Use our template for best results
              </span>
            </div>
          </div>
        )

      case 1: // Mapping
        return (
          <div className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Map your file columns to system fields. Required fields must be mapped.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              {systemFields.map(field => (
                <div key={field.id} className="flex items-center gap-4">
                  <div className="w-1/3">
                    <Label>
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                  </div>
                  <select
                    className="flex-1 px-3 py-2 border rounded-md"
                    value={fieldMappings[field.id] || ''}
                    onChange={(e) => setFieldMappings({ ...fieldMappings, [field.id]: e.target.value })}
                  >
                    <option value="">-- Select Column --</option>
                    {Object.keys(importData[0] || {}).map(column => (
                      <option key={column} value={column}>{column}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )

      case 2: // Validation
        return (
          <div className="space-y-6">
            {!validationResults && (
              <Button onClick={validateData} className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Validate Data
              </Button>
            )}

            {validationResults && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="text-2xl font-bold">{validationResults.valid}</p>
                          <p className="text-sm text-gray-500">Valid Records</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="text-2xl font-bold">{validationResults.warnings}</p>
                          <p className="text-sm text-gray-500">Warnings</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-500" />
                        <div>
                          <p className="text-2xl font-bold">{validationResults.errors}</p>
                          <p className="text-sm text-gray-500">Errors</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {validationResults.issues.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Issues Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {validationResults.issues.map((issue: any, index: number) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <Badge variant={issue.message.includes('required') ? 'destructive' : 'secondary'}>
                              Row {issue.row}
                            </Badge>
                            <span className="text-sm">
                              {issue.field}: {issue.message}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        )

      case 3: // Import
        return (
          <div className="space-y-6">
            {importStatus === 'idle' && (
              <>
                <Alert>
                  <Users className="h-4 w-4" />
                  <AlertDescription>
                    Ready to import {importData.length} customers.
                    This action cannot be undone.
                  </AlertDescription>
                </Alert>

                <Button onClick={startImport} className="w-full" size="lg">
                  <Play className="h-5 w-5 mr-2" />
                  Start Import
                </Button>
              </>
            )}

            {importStatus === 'processing' && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                    <Database className="h-8 w-8 text-blue-600 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-semibold">Importing Customers...</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Please wait while we import your customers
                  </p>
                </div>
                <Progress value={importProgress} className="w-full" />
                <p className="text-center text-sm text-gray-500">
                  {importProgress}% Complete
                </p>
              </div>
            )}

            {importStatus === 'completed' && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold">Import Completed!</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Successfully imported {importData.length} customers
                </p>
                <div className="flex gap-2 justify-center mt-4">
                  <Button variant="outline">
                    View Customers
                  </Button>
                  <Button>
                    Import More
                  </Button>
                </div>
              </div>
            )}
          </div>
        )
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = index === currentStep
          const isCompleted = index < currentStep

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    ${isActive ? 'bg-blue-600 text-white' : ''}
                    ${isCompleted ? 'bg-green-600 text-white' : ''}
                    ${!isActive && !isCompleted ? 'bg-gray-200 text-gray-400' : ''}
                  `}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <Icon className="h-6 w-6" />
                  )}
                </div>
                <p className="text-sm font-medium mt-2">{step.title}</p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 bg-gray-200 mx-4" />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
        </CardHeader>
        <CardContent>{renderStepContent()}</CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(currentStep - 1)}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button
          onClick={() => setCurrentStep(currentStep + 1)}
          disabled={currentStep === steps.length - 1 || (currentStep === 0 && !file)}
        >
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}