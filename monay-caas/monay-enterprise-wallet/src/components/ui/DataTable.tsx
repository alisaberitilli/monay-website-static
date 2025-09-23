'use client'

import React, { useState, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Column {
  key: string
  header: React.ReactNode
  cell: (item: any) => React.ReactNode
  sortable?: boolean
  width?: string
}

interface DataTableProps {
  columns: Column[]
  data: any[]
  pageSize?: number
  showPagination?: boolean
  onRowClick?: (item: any) => void
  emptyMessage?: string
  className?: string
}

export default function DataTable({
  columns,
  data,
  pageSize = 10,
  showPagination = true,
  onRowClick,
  emptyMessage = 'No data found',
  className = ''
}: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(pageSize)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Sorting logic
  const sortedData = useMemo(() => {
    if (!sortColumn) return data

    return [...data].sort((a, b) => {
      const aValue = a[sortColumn]
      const bValue = b[sortColumn]

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime()
      }

      return 0
    })
  }, [data, sortColumn, sortDirection])

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = showPagination
    ? sortedData.slice(startIndex, endIndex)
    : sortedData

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) {
      return <ChevronsUpDown className="h-4 w-4 ml-1 text-gray-400" />
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    )
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = []
    const maxVisible = 7
    const halfVisible = Math.floor(maxVisible / 2)

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= halfVisible) {
        for (let i = 1; i <= maxVisible - 2; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - halfVisible) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - (maxVisible - 3); i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }, [currentPage, totalPages])

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-900"
                  style={{ width: column.width }}
                >
                  {column.sortable !== false ? (
                    <button
                      className="flex items-center hover:text-gray-700"
                      onClick={() => handleSort(column.key)}
                    >
                      {column.header}
                      {getSortIcon(column.key)}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.map((item, index) => (
              <tr
                key={index}
                className={`${
                  onRowClick ? 'hover:bg-gray-50 cursor-pointer' : ''
                } transition-colors`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-sm">
                    {column.cell(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, sortedData.length)} of{' '}
              {sortedData.length} results
            </span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(parseInt(value))
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 / page</SelectItem>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="20">20 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
                <SelectItem value="100">100 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {pageNumbers.map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="px-2 text-gray-500">...</span>
                ) : (
                  <Button
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => handlePageChange(page as number)}
                  >
                    {page}
                  </Button>
                )}
              </React.Fragment>
            ))}

            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}