'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AlertTriangle, Shield, Activity, Settings } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface FraudRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  threshold?: number;
}

const FraudDetectionSettings: React.FC = () => {
  const { toast } = useToast();
  const [rules, setRules] = useState<FraudRule[]>([
    {
      id: '1',
      name: 'Unusual Transaction Amount',
      description: 'Flag transactions that exceed normal spending patterns',
      enabled: true,
      severity: 'high',
      threshold: 10000
    },
    {
      id: '2',
      name: 'Rapid Succession Transactions',
      description: 'Multiple transactions within a short time frame',
      enabled: true,
      severity: 'medium',
      threshold: 5
    },
    {
      id: '3',
      name: 'Geographic Anomaly',
      description: 'Transactions from unusual locations',
      enabled: false,
      severity: 'medium'
    },
    {
      id: '4',
      name: 'Merchant Category Risk',
      description: 'Transactions with high-risk merchant categories',
      enabled: true,
      severity: 'low'
    }
  ]);

  const [settings, setSettings] = useState({
    autoBlock: false,
    notificationThreshold: 'medium' as 'low' | 'medium' | 'high',
    realtimeMonitoring: true,
    mlDetection: true,
    riskScore: 75
  });

  const toggleRule = (ruleId: string) => {
    setRules(rules.map(rule =>
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  // Handler functions
  const handleSaveSettings = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Fraud detection settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings. Please try again.');
    }
  };

  const handleResetToDefaults = () => {
    setRules([
      {
        id: '1',
        name: 'Unusual Transaction Amount',
        description: 'Flag transactions that exceed normal spending patterns',
        enabled: true,
        severity: 'high',
        threshold: 10000
      },
      {
        id: '2',
        name: 'Rapid Succession Transactions',
        description: 'Multiple transactions within a short time frame',
        enabled: true,
        severity: 'medium',
        threshold: 5
      },
      {
        id: '3',
        name: 'Geographic Anomaly',
        description: 'Transactions from unusual locations',
        enabled: false,
        severity: 'medium'
      },
      {
        id: '4',
        name: 'Merchant Category Risk',
        description: 'High-risk merchant categories',
        enabled: true,
        severity: 'high'
      }
    ]);
    setSettings({
      autoBlock: false,
      notificationThreshold: 'medium',
      realtimeMonitoring: true,
      mlDetection: true,
      riskScore: 75
    });
    toast.success('Settings reset to defaults');
  };

  const handleAddCustomRule = () => {
    const newRule: FraudRule = {
      id: Date.now().toString(),
      name: 'New Custom Rule',
      description: 'Configure your custom fraud detection rule',
      enabled: false,
      severity: 'low'
    };
    setRules([...rules, newRule]);
    toast.success('Custom rule added. Configure it in the rules list.');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Fraud Detection Settings
        </CardTitle>
        <CardDescription>
          Configure fraud detection rules and monitoring settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="rules">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rules">Detection Rules</TabsTrigger>
            <TabsTrigger value="settings">General Settings</TabsTrigger>
            <TabsTrigger value="alerts">Alert Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="space-y-4">
            <div className="space-y-4">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{rule.name}</h3>
                      <Badge className={getSeverityColor(rule.severity)}>
                        {rule.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{rule.description}</p>
                    {rule.threshold && (
                      <p className="text-sm text-gray-400 mt-1">
                        Threshold: {rule.threshold}
                      </p>
                    )}
                  </div>
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={() => toggleRule(rule.id)}
                  />
                </div>
              ))}
            </div>
            <Button className="w-full" variant="outline" onClick={handleAddCustomRule}>
              Add Custom Rule
            </Button>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Real-time Monitoring</Label>
                  <p className="text-sm text-gray-500">
                    Monitor transactions as they occur
                  </p>
                </div>
                <Switch
                  checked={settings.realtimeMonitoring}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, realtimeMonitoring: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Machine Learning Detection</Label>
                  <p className="text-sm text-gray-500">
                    Use AI to detect fraud patterns
                  </p>
                </div>
                <Switch
                  checked={settings.mlDetection}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, mlDetection: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-block Suspicious Transactions</Label>
                  <p className="text-sm text-gray-500">
                    Automatically block high-risk transactions
                  </p>
                </div>
                <Switch
                  checked={settings.autoBlock}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, autoBlock: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Risk Score Threshold</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[settings.riskScore]}
                    onValueChange={(value: number[]) =>
                      setSettings({ ...settings, riskScore: value[0] })
                    }
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <span className="w-12 text-right">{settings.riskScore}%</span>
                </div>
                <p className="text-sm text-gray-500">
                  Transactions above this score will be flagged
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Notification Threshold</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['low', 'medium', 'high'].map((level) => (
                    <Button
                      key={level}
                      variant={
                        settings.notificationThreshold === level
                          ? 'default'
                          : 'outline'
                      }
                      onClick={() =>
                        setSettings({
                          ...settings,
                          notificationThreshold: level as 'low' | 'medium' | 'high'
                        })
                      }
                      className="capitalize"
                    >
                      {level}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  Minimum severity level for notifications
                </p>
              </div>

              <div className="space-y-2">
                <Label>Alert Recipients</Label>
                <Input placeholder="Enter email addresses" />
                <p className="text-sm text-gray-500">
                  Comma-separated list of email addresses
                </p>
              </div>

              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <Input placeholder="https://your-webhook-url.com" />
                <p className="text-sm text-gray-500">
                  Send fraud alerts to your system
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={handleResetToDefaults}>Reset to Defaults</Button>
          <Button onClick={handleSaveSettings}>Save Settings</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FraudDetectionSettings;