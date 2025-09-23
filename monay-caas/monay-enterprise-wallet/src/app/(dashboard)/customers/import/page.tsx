'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  Upload,
  Download,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Users,
  FileSpreadsheet,
  Database,
  RefreshCw,
  Trash2,
  Eye,
  ArrowRight,
  FileDown
} from 'lucide-react'

interface ImportRecord {
  row: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  accountType: 'individual' | 'business'
  status: 'pending' | 'valid' | 'invalid' | 'duplicate' | 'imported'
  errors: string[]
}

interface ImportJob {
  id: string
  fileName: string
  uploadedAt: string
  totalRecords: number
  validRecords: number
  invalidRecords: number
  duplicateRecords: number
  importedRecords: number
  status: 'processing' | 'ready' | 'importing' | 'completed' | 'failed'
  progress: number
}

const sampleCSV = `firstName,lastName,email,phone,accountType,addressLine1,city,state,zipCode,country
John,Doe,john.doe@example.com,+1234567890,individual,123 Main St,New York,NY,10001,US
Jane,Smith,jane.smith@email.com,+1234567891,individual,456 Oak Ave,Los Angeles,CA,90001,US
Acme,Corporation,finance@acme.com,+1234567892,business,789 Business Blvd,San Francisco,CA,94102,US
Bob,Johnson,bob.j@test.com,+1234567893,individual,321 Elm St,Chicago,IL,60601,US
Tech,Startup,contact@techstart.io,+1234567894,business,654 Innovation Way,Austin,TX,78701,US`

export default function CustomerImportPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importJob, setImportJob] = useState<ImportJob | null>(null)
  const [importRecords, setImportRecords] = useState<ImportRecord[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [activeTab, setActiveTab] = useState('upload')
  const [filterStatus, setFilterStatus] = useState('all')

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file')
      return
    }

    setSelectedFile(file)
    processFile(file)
  }

  const processFile = async (file: File) => {
    setIsProcessing(true)
    setActiveTab('preview')

    // Simulate file processing
    setTimeout(() => {
      const mockRecords: ImportRecord[] = [
        {
          row: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          accountType: 'individual',
          status: 'duplicate',
          errors: ['Customer with this email already exists']
        },
        {
          row: 2,
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@email.com',
          phone: '+1234567891',
          accountType: 'individual',
          status: 'valid',
          errors: []
        },
        {
          row: 3,
          firstName: 'Acme',
          lastName: 'Corporation',
          email: 'finance@acme.com',
          phone: '+1234567892',
          accountType: 'business',
          status: 'valid',
          errors: []
        },
        {
          row: 4,
          firstName: 'Bob',
          lastName: 'Johnson',
          email: 'bob.j@test',
          phone: '+1234567893',
          accountType: 'individual',
          status: 'invalid',
          errors: ['Invalid email format']
        },
        {
          row: 5,
          firstName: 'Tech',
          lastName: 'Startup',
          email: 'contact@techstart.io',
          phone: '+1234567894',
          accountType: 'business',
          status: 'valid',
          errors: []
        }
      ]

      setImportRecords(mockRecords)

      const job: ImportJob = {
        id: 'import-' + Date.now(),
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        totalRecords: mockRecords.length,
        validRecords: mockRecords.filter(r => r.status === 'valid').length,
        invalidRecords: mockRecords.filter(r => r.status === 'invalid').length,
        duplicateRecords: mockRecords.filter(r => r.status === 'duplicate').length,
        importedRecords: 0,
        status: 'ready',
        progress: 0
      }

      setImportJob(job)
      setIsProcessing(false)
      toast.success(`File processed: ${job.validRecords} valid records ready for import`)
    }, 2000)
  }

  const handleImport = async () => {
    if (!importJob) return

    setIsImporting(true)
    setActiveTab('progress')

    // Simulate import process
    const validRecords = importRecords.filter(r => r.status === 'valid')
    let imported = 0

    const importInterval = setInterval(() => {
      imported++
      const progress = (imported / validRecords.length) * 100

      setImportJob(prev => prev ? {
        ...prev,
        importedRecords: imported,
        progress,
        status: progress >= 100 ? 'completed' : 'importing'
      } : null)

      setImportRecords(prev => prev.map((record, index) => {
        if (record.status === 'valid' && index < imported) {
          return { ...record, status: 'imported' }
        }
        return record
      }))

      if (imported >= validRecords.length) {
        clearInterval(importInterval)
        setIsImporting(false)
        toast.success(`Successfully imported ${imported} customers!`)
      }
    }, 500)
  }

  const handleRemoveRecord = (row: number) => {
    setImportRecords(prev => prev.filter(r => r.row !== row))
    if (importJob) {
      const updated = importRecords.filter(r => r.row !== row)
      setImportJob({
        ...importJob,
        totalRecords: updated.length,
        validRecords: updated.filter(r => r.status === 'valid').length,
        invalidRecords: updated.filter(r => r.status === 'invalid').length,
        duplicateRecords: updated.filter(r => r.status === 'duplicate').length
      })
    }
  }

  const downloadTemplate = () => {
    const blob = new Blob([sampleCSV], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'customer_import_template.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Template downloaded')
  }

  const getStatusBadge = (status: string) => {
    const config = {
      valid: { variant: 'success' as const, icon: CheckCircle, label: 'Valid' },
      invalid: { variant: 'destructive' as const, icon: XCircle, label: 'Invalid' },
      duplicate: { variant: 'secondary' as const, icon: AlertCircle, label: 'Duplicate' },
      imported: { variant: 'default' as const, icon: CheckCircle, label: 'Imported' },
      pending: { variant: 'outline' as const, icon: AlertCircle, label: 'Pending' }
    }
    const statusConfig = config[status as keyof typeof config]
    const Icon = statusConfig?.icon || AlertCircle

    return (
      <Badge variant={statusConfig?.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {statusConfig?.label || status}
      </Badge>
    )
  }

  const filteredRecords = filterStatus === 'all'
    ? importRecords
    : importRecords.filter(r => r.status === filterStatus)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Import Customers</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Bulk import customers from CSV files
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadTemplate}>
            <FileDown className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <Button variant="outline" onClick={() => router.push('/customers')}>
            View All Customers
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {importJob && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{importJob.totalRecords}</div>
              <p className="text-xs text-gray-600">In file</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Valid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{importJob.validRecords}</div>
              <p className="text-xs text-gray-600">Ready to import</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Invalid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{importJob.invalidRecords}</div>
              <p className="text-xs text-gray-600">Needs fixing</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Duplicates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{importJob.duplicateRecords}</div>
              <p className="text-xs text-gray-600">Already exist</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Imported</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{importJob.importedRecords}</div>
              <p className="text-xs text-gray-600">Successfully added</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Progress
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Upload CSV File</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Select a CSV file containing customer data to import
                </p>
                <div className="flex justify-center gap-2">
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
                {selectedFile && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm font-medium">{selectedFile.name}</span>
                      <span className="text-sm text-gray-500">
                        ({(selectedFile.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>CSV Format Requirements</AlertTitle>
                <AlertDescription>
                  Your CSV file must include the following columns:
                  <ul className="list-disc list-inside mt-2">
                    <li>firstName, lastName, email (required)</li>
                    <li>phone, accountType (optional)</li>
                    <li>addressLine1, city, state, zipCode, country (optional)</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mb-4" />
                  <p className="text-gray-600">Processing file...</p>
                </div>
              ) : importRecords.length > 0 ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Records</SelectItem>
                        <SelectItem value="valid">Valid Only</SelectItem>
                        <SelectItem value="invalid">Invalid Only</SelectItem>
                        <SelectItem value="duplicate">Duplicates Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleImport}
                      disabled={importJob?.validRecords === 0 || isImporting}
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Import Valid Records ({importJob?.validRecords || 0})
                    </Button>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Row</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Issues</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.map((record) => (
                        <TableRow key={record.row}>
                          <TableCell>{record.row}</TableCell>
                          <TableCell>
                            {record.firstName} {record.lastName}
                          </TableCell>
                          <TableCell>{record.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{record.accountType}</Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(record.status)}</TableCell>
                          <TableCell>
                            {record.errors.length > 0 && (
                              <span className="text-sm text-red-600">
                                {record.errors.join(', ')}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {record.status !== 'imported' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveRecord(record.row)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Data</AlertTitle>
                  <AlertDescription>
                    Please upload a CSV file to preview the import data
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="progress" className="space-y-4">
              {importJob && (importJob.status === 'importing' || importJob.status === 'completed') ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Import Progress</span>
                      <span className="text-sm text-gray-500">
                        {importJob.importedRecords} / {importJob.validRecords} records
                      </span>
                    </div>
                    <Progress value={importJob.progress} className="h-3" />
                  </div>

                  {importJob.status === 'completed' && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800">Import Complete!</AlertTitle>
                      <AlertDescription className="text-green-700">
                        Successfully imported {importJob.importedRecords} customers from {importJob.fileName}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setImportJob(null)
                        setImportRecords([])
                        setSelectedFile(null)
                        setActiveTab('upload')
                      }}
                    >
                      Import Another File
                    </Button>
                    <Button onClick={() => router.push('/customers')}>
                      View Customers
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Import in Progress</AlertTitle>
                  <AlertDescription>
                    Upload and validate a file to start the import process
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}