/**
 * TemplateSelector Component
 * Select and preview capital markets templates
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
import { Search, FileText, Shield, TrendingUp, Lock, Layers, Zap, Eye, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CapitalMarketTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  rules: any[];
  configuration: Record<string, any>;
  compliance_standards: string[];
}

interface TemplateSelectorProps {
  templates: CapitalMarketTemplate[];
  onSelectTemplate: (template: CapitalMarketTemplate) => void;
  currentCategory?: string;
}

const categoryIcons: Record<string, any> = {
  EQUITY: TrendingUp,
  FIXED_INCOME: Shield,
  DERIVATIVES: Zap,
  PRIVATE_SECURITIES: Lock,
  HYBRID: Layers,
};

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  onSelectTemplate,
  currentCategory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<CapitalMarketTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Filter templates based on search and category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchTerm === '' ||
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = activeTab === 'all' || template.category === activeTab;

    return matchesSearch && matchesCategory;
  });

  // Group templates by category
  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, CapitalMarketTemplate[]>);

  const handlePreview = (template: CapitalMarketTemplate) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const handleApplyTemplate = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
      setShowPreview(false);
      setSelectedTemplate(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Capital Markets Templates</CardTitle>
          <CardDescription>
            Pre-configured rule sets for common capital markets scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="EQUITY">Equity</TabsTrigger>
          <TabsTrigger value="FIXED_INCOME">Fixed Income</TabsTrigger>
          <TabsTrigger value="DERIVATIVES">Derivatives</TabsTrigger>
          <TabsTrigger value="PRIVATE_SECURITIES">Private</TabsTrigger>
          <TabsTrigger value="HYBRID">Hybrid</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => {
              const Icon = categoryIcons[template.category] || FileText;
              const isRecommended = template.category === currentCategory;

              return (
                <Card
                  key={template.id}
                  className={`hover:shadow-lg transition-shadow cursor-pointer ${
                    isRecommended ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handlePreview(template)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      {isRecommended && (
                        <Badge variant="secondary" className="text-xs">
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Rules</span>
                        <Badge variant="outline">{template.rules.length}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Category</span>
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {template.compliance_standards.slice(0, 3).map((standard, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {standard}
                          </Badge>
                        ))}
                        {template.compliance_standards.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.compliance_standards.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreview(template);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTemplate(template);
                        }}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Apply
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No templates found matching your criteria</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Template Preview Dialog */}
      <AlertDialog open={showPreview} onOpenChange={setShowPreview}>
        <AlertDialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>{selectedTemplate?.name}</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedTemplate?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {selectedTemplate && (
            <div className="space-y-4 my-4">
              {/* Category and Standards */}
              <div className="flex flex-wrap gap-2">
                <Badge>{selectedTemplate.category}</Badge>
                {selectedTemplate.compliance_standards.map((standard, index) => (
                  <Badge key={index} variant="secondary">
                    {standard}
                  </Badge>
                ))}
              </div>

              {/* Rules List */}
              <div>
                <h4 className="font-medium mb-2">Included Rules ({selectedTemplate.rules.length})</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedTemplate.rules.map((rule, index) => (
                    <div key={index} className="p-2 bg-muted rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{rule.name}</p>
                          <p className="text-xs text-muted-foreground">{rule.category}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Priority: {rule.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configuration */}
              <div>
                <h4 className="font-medium mb-2">Default Configuration</h4>
                <pre className="p-3 bg-muted rounded-lg text-xs overflow-x-auto">
                  {JSON.stringify(selectedTemplate.configuration, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApplyTemplate}>
              Apply Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};