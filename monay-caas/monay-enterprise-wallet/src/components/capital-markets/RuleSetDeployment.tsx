/**
 * RuleSetDeployment Component
 * Deploy capital markets rule sets to blockchain
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Rocket,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Cpu,
  Link2,
  Globe,
  Shield,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface RuleSet {
  id?: string;
  name: string;
  description: string;
  category: string;
  rules: any[];
  metadata: Record<string, any>;
  status?: string;
}

interface DeployOptions {
  gasPrice?: number;
  gasLimit?: number;
  contractName?: string;
  verifyContract?: boolean;
  enableMonitoring?: boolean;
  multiSig?: boolean;
  testMode?: boolean;
}

interface RuleSetDeploymentProps {
  ruleSet: RuleSet;
  onDeploy: (chain: string, options: DeployOptions) => void;
}

export const RuleSetDeployment: React.FC<RuleSetDeploymentProps> = ({
  ruleSet,
  onDeploy,
}) => {
  const [selectedChain, setSelectedChain] = useState<string>('base');
  const [deploymentStep, setDeploymentStep] = useState<number>(0);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<any>(null);
  const [options, setOptions] = useState<DeployOptions>({
    gasPrice: 30,
    gasLimit: 3000000,
    verifyContract: true,
    enableMonitoring: true,
    multiSig: false,
    testMode: true,
  });

  const chains = [
    { id: 'base', name: 'Base L2', type: 'EVM', icon: '🔵', testnet: 'Base Sepolia' },
    { id: 'ethereum', name: 'Ethereum', type: 'EVM', icon: '⚫', testnet: 'Sepolia' },
    { id: 'polygon', name: 'Polygon zkEVM', type: 'EVM', icon: '🟣', testnet: 'Mumbai' },
    { id: 'solana', name: 'Solana', type: 'Solana', icon: '🟢', testnet: 'Devnet' },
  ];

  const deploymentSteps = [
    { name: 'Compile Rules', status: 'pending' },
    { name: 'Generate Contract', status: 'pending' },
    { name: 'Deploy Contract', status: 'pending' },
    { name: 'Verify Contract', status: 'pending' },
    { name: 'Configure Monitoring', status: 'pending' },
  ];

  const estimateGasCost = () => {
    const baseGas = 1000000;
    const perRuleGas = 50000;
    const totalGas = baseGas + (ruleSet.rules.length * perRuleGas);
    const gasPriceGwei = options.gasPrice || 30;
    const costInEth = (totalGas * gasPriceGwei) / 1e9;
    return {
      gas: totalGas,
      costEth: costInEth.toFixed(6),
      costUsd: (costInEth * 3000).toFixed(2), // Assuming ETH = $3000
    };
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    setDeploymentStep(0);

    try {
      // Simulate deployment steps
      for (let i = 0; i < deploymentSteps.length; i++) {
        setDeploymentStep(i);
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Skip verify step if not selected
        if (i === 3 && !options.verifyContract) continue;
        // Skip monitoring step if not selected
        if (i === 4 && !options.enableMonitoring) continue;
      }

      // Simulate deployment result
      const result = {
        success: true,
        contractAddress: '0x' + Math.random().toString(16).substring(2, 42),
        transactionHash: '0x' + Math.random().toString(16).substring(2, 66),
        blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
        gasUsed: estimateGasCost().gas,
        deploymentTime: new Date().toISOString(),
        chain: selectedChain,
      };

      setDeploymentResult(result);
      toast.success('Rule set deployed successfully!');
      onDeploy(selectedChain, options);
    } catch (error) {
      toast.error('Deployment failed. Please try again.');
      console.error('Deployment error:', error);
    } finally {
      setIsDeploying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const gasEstimate = estimateGasCost();
  const selectedChainInfo = chains.find(c => c.id === selectedChain);

  return (
    <div className="space-y-6">
      {/* Deployment Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Deploy Rule Set to Blockchain</CardTitle>
          <CardDescription>
            Deploy "{ruleSet.name}" with {ruleSet.rules.length} rules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Category</p>
              <Badge variant="secondary">{ruleSet.category}</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Rules</p>
              <p className="font-medium">{ruleSet.rules.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={ruleSet.status === 'validated' ? 'default' : 'outline'}>
                {ruleSet.status || 'Draft'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chain Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Blockchain</CardTitle>
          <CardDescription>
            Choose the blockchain network for deployment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {chains.map((chain) => (
              <Card
                key={chain.id}
                className={`cursor-pointer transition-all ${
                  selectedChain === chain.id
                    ? 'ring-2 ring-primary'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedChain(chain.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{chain.icon}</span>
                    {selectedChain === chain.id && (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <p className="font-medium">{chain.name}</p>
                  <p className="text-xs text-muted-foreground">{chain.type}</p>
                  {options.testMode && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      {chain.testnet}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deployment Options */}
      <Tabs defaultValue="basic">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contractName">Contract Name</Label>
                <Input
                  id="contractName"
                  value={options.contractName || `CapitalMarkets_${ruleSet.name.replace(/\s+/g, '_')}`}
                  onChange={(e) => setOptions({ ...options, contractName: e.target.value })}
                  placeholder="Enter contract name"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="testMode"
                  checked={options.testMode}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, testMode: checked as boolean })
                  }
                />
                <Label htmlFor="testMode">Deploy to testnet (recommended for testing)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verifyContract"
                  checked={options.verifyContract}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, verifyContract: checked as boolean })
                  }
                />
                <Label htmlFor="verifyContract">Verify contract on block explorer</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gasPrice">Gas Price (Gwei)</Label>
                  <Input
                    id="gasPrice"
                    type="number"
                    value={options.gasPrice}
                    onChange={(e) => setOptions({ ...options, gasPrice: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gasLimit">Gas Limit</Label>
                  <Input
                    id="gasLimit"
                    type="number"
                    value={options.gasLimit}
                    onChange={(e) => setOptions({ ...options, gasLimit: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enableMonitoring"
                  checked={options.enableMonitoring}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, enableMonitoring: checked as boolean })
                  }
                />
                <Label htmlFor="enableMonitoring">Enable real-time monitoring</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="multiSig"
                  checked={options.multiSig}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, multiSig: checked as boolean })
                  }
                />
                <Label htmlFor="multiSig">Use multi-signature wallet for deployment</Label>
              </div>
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Security Recommendation</AlertTitle>
                <AlertDescription>
                  For production deployments, we recommend using a multi-signature wallet
                  and conducting a security audit before deployment.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Gas Estimation */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment Cost Estimation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Estimated Gas</p>
              </div>
              <p className="font-medium">{gasEstimate.gas.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Cost (ETH)</p>
              </div>
              <p className="font-medium">{gasEstimate.costEth} ETH</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Cost (USD)</p>
              </div>
              <p className="font-medium">${gasEstimate.costUsd}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deployment Progress */}
      {isDeploying && (
        <Card>
          <CardHeader>
            <CardTitle>Deployment in Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={(deploymentStep + 1) * 20} />
              <div className="space-y-2">
                {deploymentSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {index < deploymentStep ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : index === deploymentStep ? (
                      <Clock className="h-4 w-4 text-blue-500 animate-spin" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-muted" />
                    )}
                    <span className={index <= deploymentStep ? 'font-medium' : 'text-muted-foreground'}>
                      {step.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deployment Result */}
      {deploymentResult && (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle className="text-green-600">Deployment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Contract Address</span>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {deploymentResult.contractAddress}
                  </code>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => copyToClipboard(deploymentResult.contractAddress)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Transaction Hash</span>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {deploymentResult.transactionHash.substring(0, 20)}...
                  </code>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => copyToClipboard(deploymentResult.transactionHash)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Block Number</span>
                <span className="font-mono">{deploymentResult.blockNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Gas Used</span>
                <span className="font-mono">{deploymentResult.gasUsed.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Explorer
              </Button>
              <Button variant="outline" className="flex-1">
                <Globe className="h-4 w-4 mr-2" />
                Test Contract
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deploy Button */}
      {!deploymentResult && (
        <Card>
          <CardContent className="py-4">
            <Button
              onClick={handleDeploy}
              disabled={isDeploying || !ruleSet.rules.length}
              className="w-full"
              size="lg"
            >
              {isDeploying ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4 mr-2" />
                  Deploy to {selectedChainInfo?.name} {options.testMode ? 'Testnet' : 'Mainnet'}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};