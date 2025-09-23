'use client'

import React, { Fragment } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

export default function Breadcrumbs() {
  const pathname = usePathname()

  // Don't show breadcrumbs on home page
  if (pathname === '/' || pathname === '') {
    return null
  }

  // Generate breadcrumb items from pathname
  const segments = pathname.split('/').filter(Boolean)

  const breadcrumbItems = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')

    // Format the label (capitalize and replace hyphens)
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    return {
      label,
      href,
      isLast: index === segments.length - 1
    }
  })

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-1 text-sm text-muted-foreground px-4 py-2 border-b">
      {/* Home Icon */}
      <Link
        href="/"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>

      {/* Breadcrumb Items */}
      {breadcrumbItems.map((item, index) => (
        <Fragment key={item.href}>
          <ChevronRight className="h-4 w-4" />
          {item.isLast ? (
            <span className="font-medium text-foreground">{item.label}</span>
          ) : (
            <Link
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  )
}