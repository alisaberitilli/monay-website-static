/**
 * MultiRuleSelector Component
 * Allows selection of multiple rules for capital markets rule sets
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, Filter, CheckCircle2, AlertCircle, Layers } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Rule {
  id: string;
  name: string;
  description: string;
  category: 'TRANSACTION' | 'COMPLIANCE' | 'SECURITY' | 'WALLET' | 'TOKEN';
  priority: number;
  status: 'active' | 'draft' | 'archived';
  created_at: string;
  dependencies?: string[];
  conflicts?: string[];
}

interface MultiRuleSelectorProps {
  availableRules: Rule[];
  selectedRules: Rule[];
  onSelectionChange: (rules: Rule[]) => void;
  maxSelection?: number;
  showCategories?: boolean;
  showDependencies?: boolean;
}

const categoryColors: Record<string, string> = {
  TRANSACTION: 'bg-blue-500',
  COMPLIANCE: 'bg-purple-500',
  SECURITY: 'bg-red-500',
  WALLET: 'bg-green-500',
  TOKEN: 'bg-yellow-500',
};

const categoryDescriptions: Record<string, string> = {
  TRANSACTION: 'Transaction processing and validation rules',
  COMPLIANCE: 'Regulatory and compliance requirements',
  SECURITY: 'Security policies and access controls',
  WALLET: 'Wallet management and restrictions',
  TOKEN: 'Token minting and supply management',
};

export const MultiRuleSelector: React.FC<MultiRuleSelectorProps> = ({
  availableRules,
  selectedRules,
  onSelectionChange,
  maxSelection,
  showCategories = true,
  showDependencies = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflictingRules, setConflictingRules] = useState<Rule[]>([]);

  // Initialize selected IDs from props
  useEffect(() => {
    setSelectedIds(new Set(selectedRules.map(r => r.id)));
  }, [selectedRules]);

  // Filter rules based on search and category
  const filteredRules = useMemo(() => {
    return availableRules.filter(rule => {
      const matchesSearch = searchTerm === '' || 
        rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'ALL' || rule.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [availableRules, searchTerm, selectedCategory]);

  // Check for rule conflicts
  const checkConflicts = (ruleId: string): Rule[] => {
    const rule = availableRules.find(r => r.id === ruleId);
    if (!rule?.conflicts) return [];
    
    const conflicts = [];
    for (const conflictId of rule.conflicts) {
      if (selectedIds.has(conflictId)) {
        const conflictingRule = availableRules.find(r => r.id === conflictId);
        if (conflictingRule) conflicts.push(conflictingRule);
      }
    }
    return conflicts;
  };

  // Check for missing dependencies
  const checkDependencies = (ruleId: string): string[] => {
    const rule = availableRules.find(r => r.id === ruleId);
    if (!rule?.dependencies) return [];
    
    return rule.dependencies.filter(depId => !selectedIds.has(depId));
  };

  // Handle rule selection/deselection
  const handleRuleToggle = (rule: Rule) => {
    const newSelectedIds = new Set(selectedIds);
    
    if (selectedIds.has(rule.id)) {
      // Deselecting
      newSelectedIds.delete(rule.id);
    } else {
      // Check max selection limit
      if (maxSelection && selectedIds.size >= maxSelection) {
        toast.error(`Maximum ${maxSelection} rules can be selected`);
        return;
      }
      
      // Check for conflicts
      const conflicts = checkConflicts(rule.id);
      if (conflicts.length > 0) {
        setConflictingRules(conflicts);
        setShowConflictDialog(true);
        return;
      }
      
      // Check for dependencies and auto-add them
      const missingDeps = checkDependencies(rule.id);
      if (missingDeps.length > 0) {
        toast({
          title: 'Adding Dependencies',
          description: `Adding ${missingDeps.length} required dependencies`,
        });
        missingDeps.forEach(depId => newSelectedIds.add(depId));
      }
      
      newSelectedIds.add(rule.id);
    }
    
    setSelectedIds(newSelectedIds);
    const newSelectedRules = availableRules.filter(r => newSelectedIds.has(r.id));
    onSelectionChange(newSelectedRules);
  };

  // Select all visible rules
  const selectAll = () => {
    const newIds = new Set(selectedIds);
    filteredRules.forEach(rule => {
      if (maxSelection && newIds.size >= maxSelection) return;
      newIds.add(rule.id);
    });
    setSelectedIds(newIds);
    const newSelectedRules = availableRules.filter(r => newIds.has(r.id));
    onSelectionChange(newSelectedRules);
  };

  // Clear all selections
  const clearAll = () => {
    setSelectedIds(new Set());
    onSelectionChange([]);
  };

  // Get category statistics
  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; selected: number }> = {};
    
    availableRules.forEach(rule => {
      if (!stats[rule.category]) {
        stats[rule.category] = { total: 0, selected: 0 };
      }
      stats[rule.category].total++;
      if (selectedIds.has(rule.id)) {
        stats[rule.category].selected++;
      }
    });
    
    return stats;
  }, [availableRules, selectedIds]);

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Select Rules for Capital Markets</span>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {selectedIds.size} / {availableRules.length} Selected
              {maxSelection && ` (Max: ${maxSelection})`}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search rules by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                <SelectItem value="TRANSACTION">Transaction</SelectItem>
                <SelectItem value="COMPLIANCE">Compliance</SelectItem>
                <SelectItem value="SECURITY">Security</SelectItem>
                <SelectItem value="WALLET">Wallet</SelectItem>
                <SelectItem value="TOKEN">Token</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Statistics */}
          {showCategories && (
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(categoryStats).map(([category, stats]) => (
                <Card
                  key={category}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedCategory(category)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-3 h-3 rounded-full ${categoryColors[category]}`} />
                      <span className="text-sm font-medium">{category}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stats.selected} / {stats.total} selected
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Bulk Actions */}
          <div className="flex gap-2">
            <Button onClick={selectAll} variant="outline" size="sm">
              Select All Visible
            </Button>
            <Button onClick={clearAll} variant="outline" size="sm">
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rules Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    checked={filteredRules.length > 0 && filteredRules.every(r => selectedIds.has(r.id))}
                    onCheckedChange={(checked) => {
                      if (checked) selectAll();
                      else clearAll();
                    }}
                  />
                </TableHead>
                <TableHead>Rule Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                {showDependencies && <TableHead>Dependencies</TableHead>}
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRules.map((rule) => {
                const isSelected = selectedIds.has(rule.id);
                const missingDeps = checkDependencies(rule.id);
                const hasConflicts = checkConflicts(rule.id).length > 0;
                
                return (
                  <TableRow
                    key={rule.id}
                    className={`cursor-pointer hover:bg-muted/50 ${
                      isSelected ? 'bg-muted/30' : ''
                    }`}
                    onClick={() => handleRuleToggle(rule)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleRuleToggle(rule)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{rule.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {rule.description}
                        </div>
                        {isSelected && missingDeps.length > 0 && (
                          <div className="text-xs text-yellow-600 mt-1">
                            ⚠️ Missing dependencies: {missingDeps.join(', ')}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="gap-1"
                      >
                        <div className={`w-2 h-2 rounded-full ${categoryColors[rule.category]}`} />
                        {rule.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{rule.priority}</TableCell>
                    {showDependencies && (
                      <TableCell>
                        {rule.dependencies && rule.dependencies.length > 0 ? (
                          <Badge variant="secondary">
                            {rule.dependencies.length} deps
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge
                        variant={
                          rule.status === 'active' ? 'default' :
                          rule.status === 'draft' ? 'secondary' : 'outline'
                        }
                      >
                        {rule.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Selected Rules Summary */}
      {selectedIds.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selected Rules Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Array.from(selectedIds).map(id => {
                const rule = availableRules.find(r => r.id === id);
                if (!rule) return null;
                return (
                  <Badge
                    key={id}
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => handleRuleToggle(rule)}
                  >
                    <div className={`w-2 h-2 rounded-full mr-1 ${categoryColors[rule.category]}`} />
                    {rule.name}
                    <span className="ml-1 text-xs">✕</span>
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conflict Dialog */}
      <AlertDialog open={showConflictDialog} onOpenChange={setShowConflictDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rule Conflict Detected</AlertDialogTitle>
            <AlertDialogDescription>
              The selected rule conflicts with the following rules:
              <ul className="mt-2 space-y-1">
                {conflictingRules.map(rule => (
                  <li key={rule.id} className="font-medium">
                    • {rule.name}
                  </li>
                ))}
              </ul>
              Please remove conflicting rules before adding this one.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowConflictDialog(false)}>
              Understood
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};