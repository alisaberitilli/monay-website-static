/**
 * RuleSetBuilder Component
 * Interface for creating and configuring capital markets rule sets
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { MultiRuleSelector } from './MultiRuleSelector';
import { TemplateSelector } from './TemplateSelector';
import { RuleSetDeployment } from './RuleSetDeployment';
import {
  Save,
  Package,
  FileText,
  Settings,
  Rocket,
  AlertTriangle,
  CheckCircle,
  Copy,
  Plus,
  Trash2,
  Edit,
  Eye,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface RuleSet {
  id?: string;
  name: string;
  description: string;
  category: 'EQUITY' | 'FIXED_INCOME' | 'DERIVATIVES' | 'PRIVATE_SECURITIES' | 'HYBRID';
  instrument_type?: string;
  rules: any[];
  metadata: Record<string, any>;
  status?: 'draft' | 'validated' | 'deployed' | 'failed';
  template_id?: string;
}

interface CapitalMarketTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  rules: any[];
  configuration: Record<string, any>;
  compliance_standards: string[];
}

interface RuleSetBuilderProps {
  onSave: (ruleSet: RuleSet) => void;
  templates?: CapitalMarketTemplate[];
  existingRuleSet?: RuleSet;
  mode?: 'create' | 'edit' | 'view';
}

const categoryDescriptions = {
  EQUITY: 'Stock trading, equity markets, and share transactions',
  FIXED_INCOME: 'Bonds, debt securities, and fixed income instruments',
  DERIVATIVES: 'Options, futures, swaps, and derivative contracts',
  PRIVATE_SECURITIES: 'Private placements, restricted securities, Reg D',
  HYBRID: 'Multi-asset class, combined instrument types',
};

export const RuleSetBuilder: React.FC<RuleSetBuilderProps> = ({
  onSave,
  templates = [],
  existingRuleSet,
  mode = 'create',
}) => {
  const [activeTab, setActiveTab] = useState('details');
  const [ruleSet, setRuleSet] = useState<RuleSet>({
    name: '',
    description: '',
    category: 'EQUITY',
    rules: [],
    metadata: {},
    ...existingRuleSet,
  });
  const [availableRules, setAvailableRules] = useState<any[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Load available rules on mount
  useEffect(() => {
    loadAvailableRules();
  }, []);

  const loadAvailableRules = async () => {
    try {
      const response = await fetch('/api/business-rules', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableRules(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load rules:', error);
      toast.error('Failed to load available rules');
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setRuleSet(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleMetadataChange = (key: string, value: any) => {
    setRuleSet(prev => ({
      ...prev,
      metadata: { ...prev.metadata, [key]: value },
    }));
    setIsDirty(true);
  };

  const handleRuleSelectionChange = (selectedRules: any[]) => {
    setRuleSet(prev => ({ ...prev, rules: selectedRules }));
    setIsDirty(true);
  };

  const applyTemplate = (template: CapitalMarketTemplate) => {
    setRuleSet({
      name: `${template.name} - ${new Date().toLocaleDateString()}`,
      description: template.description,
      category: template.category as any,
      template_id: template.id,
      rules: template.rules,
      metadata: template.configuration,
    });
    setIsDirty(true);
    toast.success(`Template "${template.name}" applied`);
    setActiveTab('rules');
  };

  const validateRuleSet = async () => {
    setIsValidating(true);
    try {
      // Simulate validation (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = {
        valid: ruleSet.rules.length > 0 && ruleSet.name && ruleSet.description,
        errors: [],
        warnings: [],
      };
      
      if (!ruleSet.name) result.errors.push('Rule set name is required');
      if (!ruleSet.description) result.errors.push('Description is required');
      if (ruleSet.rules.length === 0) result.errors.push('At least one rule is required');
      
      if (ruleSet.category === 'PRIVATE_SECURITIES' && !ruleSet.metadata.lockup_days) {
        result.warnings.push('Consider setting lockup period for private securities');
      }
      
      setValidationResult(result);
      
      if (result.valid) {
        toast.success('Rule set validation passed');
      } else {
        toast.error('Validation failed. Please fix the errors.');
      }
    } catch (error) {
      toast.error('Validation failed');
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = async () => {
    if (!validationResult?.valid) {
      await validateRuleSet();
      if (!validationResult?.valid) return;
    }
    
    onSave(ruleSet);
    setIsDirty(false);
    toast.success('Rule set saved successfully');
  };

  const duplicateRuleSet = () => {
    const duplicated = {
      ...ruleSet,
      id: undefined,
      name: `${ruleSet.name} (Copy)`,
      status: 'draft' as const,
    };
    setRuleSet(duplicated);
    setIsDirty(true);
    toast.success('Rule set duplicated');
  };

  const isReadOnly = mode === 'view';

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">
                {mode === 'create' ? 'Create New Rule Set' :
                 mode === 'edit' ? 'Edit Rule Set' : 'View Rule Set'}
              </CardTitle>
              <CardDescription className="mt-2">
                Configure capital markets rules for {categoryDescriptions[ruleSet.category]}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {ruleSet.status && (
                <Badge
                  variant={
                    ruleSet.status === 'deployed' ? 'default' :
                    ruleSet.status === 'validated' ? 'secondary' :
                    ruleSet.status === 'failed' ? 'destructive' : 'outline'
                  }
                >
                  {ruleSet.status.toUpperCase()}
                </Badge>
              )}
              {isDirty && (
                <Badge variant="outline" className="text-orange-600">
                  Unsaved Changes
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="deploy">Deploy</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Rule Set Details</CardTitle>
              <CardDescription>
                Basic information about the rule set
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Rule Set Name *</Label>
                  <Input
                    id="name"
                    value={ruleSet.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder="e.g., Equity Trading Rules Q1 2025"
                    disabled={isReadOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={ruleSet.category}
                    onValueChange={(value) => handleFieldChange('category', value)}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EQUITY">Equity Securities</SelectItem>
                      <SelectItem value="FIXED_INCOME">Fixed Income</SelectItem>
                      <SelectItem value="DERIVATIVES">Derivatives</SelectItem>
                      <SelectItem value="PRIVATE_SECURITIES">Private Securities</SelectItem>
                      <SelectItem value="HYBRID">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={ruleSet.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Describe the purpose and scope of this rule set..."
                  rows={4}
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instrument_type">Instrument Type</Label>
                <Input
                  id="instrument_type"
                  value={ruleSet.instrument_type || ''}
                  onChange={(e) => handleFieldChange('instrument_type', e.target.value)}
                  placeholder="e.g., Common Stock, Corporate Bond, Option"
                  disabled={isReadOnly}
                />
              </div>

              {ruleSet.template_id && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-medium">Based on template:</span>
                    <Badge variant="secondary">{ruleSet.template_id}</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <TemplateSelector
            templates={templates}
            onSelectTemplate={applyTemplate}
            currentCategory={ruleSet.category}
          />
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle>Select Rules</CardTitle>
              <CardDescription>
                Choose which rules to include in this set
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MultiRuleSelector
                availableRules={availableRules}
                selectedRules={ruleSet.rules}
                onSelectionChange={handleRuleSelectionChange}
                showCategories={true}
                showDependencies={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Configuration</CardTitle>
              <CardDescription>
                Additional settings and metadata for the rule set
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category-specific configurations */}
              {ruleSet.category === 'EQUITY' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Minimum Account Balance</Label>
                      <Input
                        type="number"
                        value={ruleSet.metadata.min_account_balance || ''}
                        onChange={(e) => handleMetadataChange('min_account_balance', Number(e.target.value))}
                        placeholder="25000"
                        disabled={isReadOnly}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Daily Trades</Label>
                      <Input
                        type="number"
                        value={ruleSet.metadata.max_daily_trades || ''}
                        onChange={(e) => handleMetadataChange('max_daily_trades', Number(e.target.value))}
                        placeholder="4"
                        disabled={isReadOnly}
                      />
                    </div>
                  </div>
                </>
              )}

              {ruleSet.category === 'FIXED_INCOME' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Minimum Denomination</Label>
                      <Input
                        type="number"
                        value={ruleSet.metadata.min_denomination || ''}
                        onChange={(e) => handleMetadataChange('min_denomination', Number(e.target.value))}
                        placeholder="100000"
                        disabled={isReadOnly}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Settlement Days</Label>
                      <Input
                        type="number"
                        value={ruleSet.metadata.settlement_days || ''}
                        onChange={(e) => handleMetadataChange('settlement_days', Number(e.target.value))}
                        placeholder="1"
                        disabled={isReadOnly}
                      />
                    </div>
                  </div>
                </>
              )}

              {ruleSet.category === 'PRIVATE_SECURITIES' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Lockup Period (days)</Label>
                      <Input
                        type="number"
                        value={ruleSet.metadata.lockup_days || ''}
                        onChange={(e) => handleMetadataChange('lockup_days', Number(e.target.value))}
                        placeholder="180"
                        disabled={isReadOnly}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Non-Accredited Investors</Label>
                      <Input
                        type="number"
                        value={ruleSet.metadata.max_non_accredited || ''}
                        onChange={(e) => handleMetadataChange('max_non_accredited', Number(e.target.value))}
                        placeholder="35"
                        disabled={isReadOnly}
                      />
                    </div>
                  </div>
                </>
              )}

              {ruleSet.category === 'DERIVATIVES' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Max Position Size</Label>
                      <Input
                        type="number"
                        value={ruleSet.metadata.max_position_size || ''}
                        onChange={(e) => handleMetadataChange('max_position_size', Number(e.target.value))}
                        placeholder="1000"
                        disabled={isReadOnly}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Margin Requirement (%)</Label>
                      <Input
                        type="number"
                        value={ruleSet.metadata.margin_requirement ? ruleSet.metadata.margin_requirement * 100 : ''}
                        onChange={(e) => handleMetadataChange('margin_requirement', Number(e.target.value) / 100)}
                        placeholder="20"
                        disabled={isReadOnly}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Common metadata fields */}
              <div className="space-y-2">
                <Label>Custom Properties (JSON)</Label>
                <Textarea
                  value={JSON.stringify(ruleSet.metadata, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setRuleSet(prev => ({ ...prev, metadata: parsed }));
                      setIsDirty(true);
                    } catch (error) {
                      // Invalid JSON, ignore
                    }
                  }}
                  rows={6}
                  className="font-mono text-sm"
                  placeholder="{}"
                  disabled={isReadOnly}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deploy Tab */}
        <TabsContent value="deploy">
          {validationResult && !validationResult.valid ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Validation Required</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>Please fix the following issues before deployment:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {validationResult.errors.map((error: string, index: number) => (
                      <li key={index} className="text-red-600">{error}</li>
                    ))}
                  </ul>
                  {validationResult.warnings.length > 0 && (
                    <>
                      <p className="mt-4">Warnings:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {validationResult.warnings.map((warning: string, index: number) => (
                          <li key={index} className="text-yellow-600">{warning}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <RuleSetDeployment
              ruleSet={ruleSet}
              onDeploy={(chain, options) => {
                console.log('Deploy to', chain, 'with options', options);
                // Implement deployment logic
              }}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <Card>
        <CardContent className="flex justify-between items-center py-4">
          <div className="flex gap-2">
            <Button
              onClick={validateRuleSet}
              variant="outline"
              disabled={isValidating || isReadOnly}
            >
              {isValidating ? (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Validate
                </>
              )}
            </Button>
            {mode === 'edit' && (
              <Button
                onClick={duplicateRuleSet}
                variant="outline"
              >
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={!isDirty}>
                  Cancel
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You have unsaved changes. Are you sure you want to discard them?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Editing</AlertDialogCancel>
                  <AlertDialogAction onClick={() => window.location.reload()}>
                    Discard Changes
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              onClick={handleSave}
              disabled={isReadOnly || !isDirty}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Rule Set
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};