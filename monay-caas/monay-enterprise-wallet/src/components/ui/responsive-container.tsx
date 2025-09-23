'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { useBreakpoint } from '@/hooks/useMediaQuery'

interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: boolean
  center?: boolean
}

const maxWidthMap = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full'
}

export default function ResponsiveContainer({
  children,
  className,
  maxWidth = '2xl',
  padding = true,
  center = true
}: ResponsiveContainerProps) {
  const breakpoint = useBreakpoint()

  return (
    <div
      className={cn(
        'w-full',
        maxWidthMap[maxWidth],
        center && 'mx-auto',
        padding && [
          breakpoint === 'mobile' && 'px-4',
          breakpoint === 'tablet' && 'px-6',
          breakpoint === 'desktop' && 'px-8'
        ],
        className
      )}
    >
      {children}
    </div>
  )
}

export function ResponsiveGrid({
  children,
  className,
  cols = {
    mobile: 1,
    tablet: 2,
    desktop: 3
  }
}: {
  children: React.ReactNode
  className?: string
  cols?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
}) {
  const breakpoint = useBreakpoint()

  const getGridCols = () => {
    switch (breakpoint) {
      case 'mobile':
        return `grid-cols-${cols.mobile || 1}`
      case 'tablet':
        return `grid-cols-${cols.tablet || 2}`
      case 'desktop':
        return `grid-cols-${cols.desktop || 3}`
      default:
        return 'grid-cols-1'
    }
  }

  return (
    <div
      className={cn(
        'grid gap-4',
        getGridCols(),
        className
      )}
    >
      {children}
    </div>
  )
}

export function ResponsiveStack({
  children,
  className,
  spacing = 'normal'
}: {
  children: React.ReactNode
  className?: string
  spacing?: 'tight' | 'normal' | 'loose'
}) {
  const breakpoint = useBreakpoint()

  const getSpacing = () => {
    if (spacing === 'tight') {
      return breakpoint === 'mobile' ? 'space-y-2' : 'space-y-3'
    }
    if (spacing === 'loose') {
      return breakpoint === 'mobile' ? 'space-y-6' : 'space-y-8'
    }
    return breakpoint === 'mobile' ? 'space-y-4' : 'space-y-6'
  }

  return (
    <div className={cn('flex flex-col', getSpacing(), className)}>
      {children}
    </div>
  )
}