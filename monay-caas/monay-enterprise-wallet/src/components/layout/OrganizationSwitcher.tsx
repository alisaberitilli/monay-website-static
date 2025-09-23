'use client'

import React, { useState, useEffect } from 'react'
import {
  Building2,
  Check,
  ChevronsUpDown,
  Plus,
  Settings,
  Users,
  TrendingUp,
  Shield,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Organization {
  id: string
  name: string
  slug: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  plan: 'starter' | 'growth' | 'enterprise'
  logo?: string
  memberCount: number
  isActive: boolean
  parentOrg?: string
  childOrgs?: string[]
}

const mockOrganizations: Organization[] = [
  {
    id: 'org_001',
    name: 'Acme Corporation',
    slug: 'acme-corp',
    role: 'owner',
    plan: 'enterprise',
    memberCount: 124,
    isActive: true,
    childOrgs: ['org_002', 'org_003']
  },
  {
    id: 'org_002',
    name: 'Acme Retail Division',
    slug: 'acme-retail',
    role: 'admin',
    plan: 'growth',
    memberCount: 45,
    isActive: true,
    parentOrg: 'org_001'
  },
  {
    id: 'org_003',
    name: 'Acme Manufacturing',
    slug: 'acme-manufacturing',
    role: 'admin',
    plan: 'growth',
    memberCount: 67,
    isActive: true,
    parentOrg: 'org_001'
  },
  {
    id: 'org_004',
    name: 'Beta Industries',
    slug: 'beta-industries',
    role: 'member',
    plan: 'starter',
    memberCount: 12,
    isActive: true
  },
  {
    id: 'org_005',
    name: 'Gamma Solutions',
    slug: 'gamma-solutions',
    role: 'viewer',
    plan: 'growth',
    memberCount: 34,
    isActive: false
  },
]

export default function OrganizationSwitcher({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState<Organization>(mockOrganizations[0])
  const [searchQuery, setSearchQuery] = useState('')
  const [organizations, setOrganizations] = useState<Organization[]>(mockOrganizations)
  const [recentOrgs, setRecentOrgs] = useState<string[]>(['org_001', 'org_004'])

  // Group organizations by hierarchy
  const getOrgHierarchy = () => {
    const rootOrgs = organizations.filter(org => !org.parentOrg)
    const grouped = rootOrgs.map(root => ({
      ...root,
      children: organizations.filter(org => org.parentOrg === root.id)
    }))
    return grouped
  }

  const handleSelectOrganization = (org: Organization) => {
    setSelectedOrg(org)
    setOpen(false)

    // Update recent organizations
    setRecentOrgs(prev => {
      const updated = [org.id, ...prev.filter(id => id !== org.id)].slice(0, 3)
      return updated
    })

    // Simulate organization context switch
    console.log('Switching to organization:', org)
    // In real implementation, this would trigger API call and context update
  }

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'default'
      case 'growth': return 'secondary'
      case 'starter': return 'outline'
      default: return 'outline'
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'text-purple-600 bg-purple-100'
      case 'admin': return 'text-blue-600 bg-blue-100'
      case 'member': return 'text-green-600 bg-green-100'
      case 'viewer': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className={cn("flex items-center", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[250px] justify-between"
          >
            <div className="flex items-center gap-2 truncate">
              <div className="h-6 w-6 rounded bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                {selectedOrg.name.charAt(0)}
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium truncate">{selectedOrg.name}</span>
                <span className="text-xs text-muted-foreground">{selectedOrg.memberCount} members</span>
              </div>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput
              placeholder="Search organizations..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>No organization found.</CommandEmpty>

              {/* Recent Organizations */}
              {recentOrgs.length > 0 && (
                <>
                  <CommandGroup heading="Recent">
                    {recentOrgs.map(orgId => {
                      const org = organizations.find(o => o.id === orgId)
                      if (!org) return null
                      return (
                        <CommandItem
                          key={org.id}
                          onSelect={() => handleSelectOrganization(org)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                                {org.name.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{org.name}</span>
                                  {selectedOrg.id === org.id && (
                                    <Check className="h-4 w-4 text-primary" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant={getPlanBadgeVariant(org.plan)} className="text-xs px-1">
                                    {org.plan}
                                  </Badge>
                                  <span className={cn("text-xs px-1 rounded", getRoleBadgeColor(org.role))}>
                                    {org.role}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {org.memberCount} members
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}

              {/* All Organizations (Hierarchical) */}
              <CommandGroup heading="All Organizations">
                {getOrgHierarchy().map(rootOrg => (
                  <div key={rootOrg.id}>
                    <CommandItem
                      onSelect={() => handleSelectOrganization(rootOrg)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                            {rootOrg.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{rootOrg.name}</span>
                              {selectedOrg.id === rootOrg.id && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={getPlanBadgeVariant(rootOrg.plan)} className="text-xs px-1">
                                {rootOrg.plan}
                              </Badge>
                              <span className={cn("text-xs px-1 rounded", getRoleBadgeColor(rootOrg.role))}>
                                {rootOrg.role}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {rootOrg.memberCount} members
                              </span>
                            </div>
                          </div>
                        </div>
                        {rootOrg.childOrgs && rootOrg.childOrgs.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {rootOrg.childOrgs.length} divisions
                          </Badge>
                        )}
                      </div>
                    </CommandItem>

                    {/* Child Organizations */}
                    {rootOrg.children?.map(childOrg => (
                      <CommandItem
                        key={childOrg.id}
                        onSelect={() => handleSelectOrganization(childOrg)}
                        className="cursor-pointer ml-8"
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                            {childOrg.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{childOrg.name}</span>
                              {selectedOrg.id === childOrg.id && (
                                <Check className="h-3 w-3 text-primary" />
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {childOrg.memberCount} members
                            </span>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </div>
                ))}
              </CommandGroup>

              <CommandSeparator />

              {/* Actions */}
              <CommandGroup heading="Actions">
                <CommandItem
                  onSelect={() => {
                    setOpen(false)
                    // Navigate to create organization
                    console.log('Create new organization')
                  }}
                  className="cursor-pointer"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Organization
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    setOpen(false)
                    // Navigate to organization settings
                    console.log('Organization settings')
                  }}
                  className="cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Organization Settings
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    setOpen(false)
                    // Navigate to manage members
                    console.log('Manage members')
                  }}
                  className="cursor-pointer"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Manage Members
                </CommandItem>
              </CommandGroup>

              {/* Consolidation View */}
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false)
                    // Navigate to consolidation view
                    console.log('View consolidation')
                  }}
                  className="cursor-pointer"
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  <div>
                    <div>Consolidation View</div>
                    <div className="text-xs text-muted-foreground">View all organizations together</div>
                  </div>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}