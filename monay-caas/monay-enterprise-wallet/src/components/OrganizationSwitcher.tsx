'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  ChevronDown,
  Plus,
  Check,
  Search,
  Users,
  Globe,
  Shield,
  Loader2
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';

interface Organization {
  id: string;
  name: string;
  type: 'holding' | 'subsidiary' | 'division' | 'department';
  logo?: string;
  memberCount: number;
  region: string;
  compliance: {
    status: 'compliant' | 'review' | 'action-required';
    certifications: string[];
  };
  features: string[];
  parentId?: string;
  children?: Organization[];
}

interface OrganizationSwitcherProps {
  currentOrgId?: string;
  onOrgChange?: (org: Organization) => void;
}

const OrganizationSwitcher: React.FC<OrganizationSwitcherProps> = ({
  currentOrgId,
  onOrgChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentOrgs, setRecentOrgs] = useState<string[]>([]);

  // Fetch organizations from API
  useEffect(() => {
    fetchOrganizations();
    loadRecentOrgs();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      // In production, this would call the API
      // const response = await fetch('/api/organizations');
      // const data = await response.json();

      // Mock data for demonstration
      const mockOrgs: Organization[] = [
        {
          id: 'org-1',
          name: 'Monay Holdings Inc.',
          type: 'holding',
          memberCount: 1250,
          region: 'North America',
          compliance: {
            status: 'compliant',
            certifications: ['SOC2', 'PCI-DSS', 'ISO27001']
          },
          features: ['enterprise-wallets', 'capital-markets', 'treasury'],
          children: [
            {
              id: 'org-2',
              name: 'Monay Financial Services',
              type: 'subsidiary',
              parentId: 'org-1',
              memberCount: 450,
              region: 'North America',
              compliance: {
                status: 'compliant',
                certifications: ['SOC2', 'PCI-DSS']
              },
              features: ['consumer-wallets', 'payments']
            },
            {
              id: 'org-3',
              name: 'Monay Government Solutions',
              type: 'subsidiary',
              parentId: 'org-1',
              memberCount: 320,
              region: 'North America',
              compliance: {
                status: 'compliant',
                certifications: ['FedRAMP', 'StateRAMP']
              },
              features: ['government-benefits', 'emergency-disbursements']
            }
          ]
        },
        {
          id: 'org-4',
          name: 'State of California - DHHS',
          type: 'holding',
          memberCount: 8500,
          region: 'California',
          compliance: {
            status: 'compliant',
            certifications: ['StateRAMP', 'HIPAA']
          },
          features: ['government-benefits', 'healthcare'],
          children: [
            {
              id: 'org-5',
              name: 'CalFresh Program',
              type: 'division',
              parentId: 'org-4',
              memberCount: 125,
              region: 'California',
              compliance: {
                status: 'compliant',
                certifications: ['FNS', 'StateRAMP']
              },
              features: ['snap', 'ebt-cards']
            }
          ]
        },
        {
          id: 'org-6',
          name: 'Acme Insurance Corp',
          type: 'holding',
          memberCount: 3200,
          region: 'Multi-Region',
          compliance: {
            status: 'review',
            certifications: ['SOC2', 'HIPAA']
          },
          features: ['insurance-claims', 'premium-collection']
        }
      ];

      setOrganizations(mockOrgs);

      // Set current org
      const defaultOrg = currentOrgId
        ? findOrgById(mockOrgs, currentOrgId)
        : mockOrgs[0];
      setCurrentOrg(defaultOrg);

    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentOrgs = () => {
    const recent = localStorage.getItem('recentOrgs');
    if (recent) {
      setRecentOrgs(JSON.parse(recent));
    }
  };

  const saveRecentOrg = (orgId: string) => {
    const recent = [orgId, ...recentOrgs.filter(id => id !== orgId)].slice(0, 5);
    setRecentOrgs(recent);
    localStorage.setItem('recentOrgs', JSON.stringify(recent));
  };

  const findOrgById = (orgs: Organization[], id: string): Organization | null => {
    for (const org of orgs) {
      if (org.id === id) return org;
      if (org.children) {
        const found = findOrgById(org.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const handleOrgSelect = (org: Organization) => {
    setCurrentOrg(org);
    saveRecentOrg(org.id);
    setIsOpen(false);

    // Update localStorage for persistence
    localStorage.setItem('currentOrgId', org.id);

    // Call the callback
    if (onOrgChange) {
      onOrgChange(org);
    }

    // In production, this would update the API context
    // await fetch('/api/auth/switch-org', {
    //   method: 'POST',
    //   body: JSON.stringify({ orgId: org.id })
    // });
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'action-required': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const renderOrgTree = (orgs: Organization[], level = 0) => {
    return orgs
      .filter(org =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.region.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map(org => (
        <div key={org.id}>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`
              flex items-center justify-between p-3 rounded-lg cursor-pointer
              hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
              ${currentOrg?.id === org.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
              ${level > 0 ? 'ml-' + (level * 4) : ''}
            `}
            onClick={() => handleOrgSelect(org)}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {org.name}
                  </span>
                  {currentOrg?.id === org.id && (
                    <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {org.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {org.memberCount}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    {org.region}
                  </span>
                </div>
              </div>
            </div>
            <Badge className={getComplianceColor(org.compliance.status)}>
              <Shield className="h-3 w-3 mr-1" />
              {org.compliance.status}
            </Badge>
          </motion.div>
          {org.children && renderOrgTree(org.children, level + 1)}
        </div>
      ));
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading organizations...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Trigger Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2"
      >
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
          <Building2 className="h-4 w-4 text-white" />
        </div>
        <div className="text-left">
          <div className="text-sm font-medium">{currentOrg?.name || 'Select Organization'}</div>
          <div className="text-xs text-muted-foreground">{currentOrg?.type || 'No org selected'}</div>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 w-96 z-50"
          >
            <Card className="shadow-xl border-gray-200/50 dark:border-gray-700/50">
              <div className="p-4">
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search organizations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Recent Organizations */}
                {recentOrgs.length > 0 && searchTerm === '' && (
                  <div className="mb-4">
                    <h3 className="text-xs font-semibold text-muted-foreground mb-2">RECENT</h3>
                    <div className="space-y-1">
                      {recentOrgs.slice(0, 3).map(orgId => {
                        const org = findOrgById(organizations, orgId);
                        if (!org) return null;
                        return (
                          <div
                            key={org.id}
                            onClick={() => handleOrgSelect(org)}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                          >
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{org.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Organization Tree */}
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-muted-foreground mb-2">ALL ORGANIZATIONS</h3>
                  <div className="max-h-96 overflow-y-auto space-y-1">
                    {renderOrgTree(organizations)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => {
                      setIsOpen(false);
                      // Navigate to organization management
                      window.location.href = '/organizations';
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Create Organization
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsOpen(false);
                      window.location.href = '/organizations/settings';
                    }}
                  >
                    Manage Organizations
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrganizationSwitcher;