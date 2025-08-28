# Monay Coin-as-a-Service (CaaS) Implementation Specification
## Version 2.0 - Updated January 2025

## 🎯 Overview

The Monay CaaS platform enables enterprises to create, manage, and control their own branded stablecoins with full regulatory compliance using a dual-rail blockchain architecture. This specification provides comprehensive implementation details for the Enterprise Wallet management system and supporting infrastructure.

## 🏗️ System Architecture

### Core Components

1. **Enterprise Wallet Dashboard** (Port 3007) - Complete enterprise management portal
2. **CaaS Admin Console** (Port 3005) - Platform administration
3. **Enterprise Console** (Port 3006) - Self-service token management
4. **Consumer Wallet** (Port 3003) - End-user wallet application + iOS/Android apps
5. **Backend Services** (Port 3001) - Extended `monay-backend-common` with CaaS routes
6. **Blockchain Layer** - Base L2 (Enterprise) + Solana (Consumer)

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Monay CaaS Ecosystem                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                    Frontend Applications Layer                      │ │
│  ├────────────────────────────────────────────────────────────────────┤ │
│  │                                                                    │ │
│  │  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │ │
│  │  │Enterprise Wallet│  │  CaaS Admin      │  │ Enterprise       │ │ │
│  │  │  Dashboard      │  │  Console         │  │  Console         │ │ │
│  │  │  Port 3007      │  │  Port 3005       │  │  Port 3006       │ │ │
│  │  └─────────────────┘  └──────────────────┘  └──────────────────┘ │ │
│  │                                                                    │ │
│  │  ┌──────────────────┐  ┌───────────────────┐                     │ │
│  │  │  Consumer Web    │  │  Mobile Apps      │                     │ │
│  │  │  Wallet          │  │  iOS / Android    │                     │ │
│  │  │  Port 3003       │  │                   │                     │ │
│  │  └──────────────────┘  └───────────────────┘                     │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                │                                        │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │           API Gateway & Backend Services (Port 3001)                │ │
│  │                monay-backend-common + CaaS Extensions               │ │
│  ├────────────────────────────────────────────────────────────────────┤ │
│  │ • Authentication & Authorization (JWT + Role-based)                 │ │
│  │ • Transaction Management & Processing                               │ │
│  │ • Invoice Management (Inbound/Outbound)                            │ │
│  │ • Token Operations (Mint/Burn/Transfer)                            │ │
│  │ • Treasury Management & Cross-Rail Swaps                           │ │
│  │ • Compliance & KYC/AML Integration                                 │ │
│  │ • Business Rules Engine (BRF)                                      │ │
│  │ • Analytics & Reporting                                            │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                │                                        │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │              Data Layer (PostgreSQL + Redis)                        │ │
│  ├────────────────────────────────────────────────────────────────────┤ │
│  │ • PostgreSQL (Port 5432): Primary data storage                      │ │
│  │ • Redis (Port 6379): Caching, sessions, real-time data             │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                │                                        │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                     Blockchain Infrastructure                       │ │
│  ├────────────────────────────────────────────────────────────────────┤ │
│  │  ┌──────────────────────┐      ┌──────────────────────┐           │ │
│  │  │  Base L2 (EVM)        │      │  Solana              │           │ │
│  │  │  • ERC-3643 Tokens    │      │  • Token-2022        │           │ │
│  │  │  • Compliance Rules    │      │  • High Throughput   │           │ │
│  │  │  • Multi-sig Wallets  │      │  • Low Fees          │           │ │
│  │  └──────────────────────┘      └──────────────────────┘           │ │
│  │                                                                    │ │
│  │              ┌─────────────────────────┐                          │ │
│  │              │  Cross-Rail Bridge      │                          │ │
│  │              │  • Atomic Swaps         │                          │ │
│  │              │  • Settlement < 60s     │                          │ │
│  │              └─────────────────────────┘                          │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

## 📱 Enterprise Wallet Dashboard Implementation

### Technology Stack
- **Framework**: Next.js 14.0.4 with App Router
- **Language**: TypeScript 5.3
- **UI Library**: TailwindCSS 3.4 + Shadcn/ui components
- **State Management**: Zustand 4.4
- **Animations**: Framer Motion 10.16
- **Charts**: Recharts 2.10
- **Forms**: React Hook Form 7.48 + Zod validation
- **Icons**: Lucide React
- **Theme**: next-themes for dark mode support

### Core Features Implementation

#### 1. Authentication & Authorization
```typescript
// Role-based access control implementation
interface UserRole {
  id: string
  name: 'platform_admin' | 'enterprise_admin' | 'enterprise_finance' | 
        'enterprise_developer' | 'compliance_officer' | 'treasury_manager'
  permissions: Permission[]
}

// JWT authentication flow
const authFlow = {
  login: '/api/auth/login',
  refresh: '/api/auth/refresh',
  logout: '/api/auth/logout',
  verify: '/api/auth/verify'
}

// Protected route wrapper
export function withAuth(Component: React.FC, requiredRoles: string[]) {
  return function ProtectedRoute(props: any) {
    const { user, loading } = useAuth()
    
    if (loading) return <LoadingSpinner />
    if (!user) return <Redirect to="/login" />
    if (!hasRequiredRole(user, requiredRoles)) return <AccessDenied />
    
    return <Component {...props} />
  }
}
```

#### 2. Dashboard Component Structure
```typescript
// Main dashboard with real-time updates
components/
├── AnimatedDashboard.tsx          // Main dashboard with stats & quick actions
├── EnhancedTransactionHistory.tsx // Complete transaction management
├── EnhancedInvoiceManagement.tsx  // Inbound/outbound invoice handling
├── EnhancedProgrammableWallet.tsx // Card management & API access
├── EnhancedTokenManagement.tsx    // Token creation & operations
├── EnhancedTreasury.tsx          // Liquidity & cross-rail management
├── EnhancedCompliance.tsx        // KYC/AML & audit trails
├── EnhancedBusinessRulesEngine.tsx // Rule creation & management
├── EnhancedAnalytics.tsx         // Charts & performance metrics
├── EnhancedCrossRailTransfer.tsx // Cross-chain operations
├── EnhancedSettings.tsx          // User & system configuration
└── GlobalSearch.tsx               // Universal search functionality
```

#### 3. Real-Time Data Updates
```typescript
// WebSocket integration for live updates
import { io } from 'socket.io-client'

const socket = io('http://localhost:3001', {
  auth: { token: getAuthToken() }
})

// Subscribe to real-time events
socket.on('transaction:new', (data) => {
  updateTransactionList(data)
  showNotification('New transaction received')
})

socket.on('balance:update', (data) => {
  updateBalances(data)
})

socket.on('compliance:alert', (data) => {
  handleComplianceAlert(data)
})
```

## 🔧 Database Schema Implementation

### Core Tables

```sql
-- Enterprise management
CREATE TABLE enterprises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100),
    kyb_status VARCHAR(50) DEFAULT 'pending',
    compliance_tier VARCHAR(50),
    settings JSONB,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Token registry
CREATE TABLE tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enterprise_id UUID REFERENCES enterprises(id),
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    token_type VARCHAR(50), -- 'ERC-3643' or 'Token-2022'
    contract_address_base VARCHAR(255),
    program_id_solana VARCHAR(255),
    total_supply DECIMAL(36, 18),
    circulating_supply DECIMAL(36, 18),
    compliance_rules JSONB,
    metadata JSONB,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Transaction tracking with dual-rail support
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_type VARCHAR(50), -- payment, transfer, mint, burn, swap
    token_id UUID REFERENCES tokens(id),
    sender_address VARCHAR(255),
    receiver_address VARCHAR(255),
    amount DECIMAL(36, 18),
    fee DECIMAL(36, 18),
    blockchain VARCHAR(50), -- 'base' or 'solana'
    chain_tx_hash VARCHAR(255),
    status VARCHAR(50),
    metadata JSONB,
    compliance_check_id UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Invoice management
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    enterprise_id UUID REFERENCES enterprises(id),
    invoice_type VARCHAR(50), -- 'inbound' or 'outbound'
    client_name VARCHAR(255),
    vendor_name VARCHAR(255),
    amount DECIMAL(36, 18),
    currency VARCHAR(10),
    payment_method VARCHAR(50), -- 'USDM', 'Card', 'ACH', 'SWIFT', 'Wallet'
    status VARCHAR(50), -- 'draft', 'sent', 'paid', 'overdue'
    due_date DATE,
    line_items JSONB,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Programmable wallet cards
CREATE TABLE wallet_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enterprise_id UUID REFERENCES enterprises(id),
    user_id UUID REFERENCES users(id),
    card_type VARCHAR(50), -- 'virtual' or 'physical'
    card_number_encrypted VARCHAR(500),
    card_last_four VARCHAR(4),
    spending_limit DECIMAL(36, 18),
    daily_limit DECIMAL(36, 18),
    status VARCHAR(50), -- 'active', 'frozen', 'cancelled'
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Business rules engine
CREATE TABLE business_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enterprise_id UUID REFERENCES enterprises(id),
    rule_name VARCHAR(255),
    rule_type VARCHAR(100),
    conditions JSONB,
    actions JSONB,
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    blockchain VARCHAR(50), -- 'base', 'solana', or 'both'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Treasury operations
CREATE TABLE treasury_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enterprise_id UUID REFERENCES enterprises(id),
    operation_type VARCHAR(50), -- 'add_liquidity', 'remove_liquidity', 'swap'
    token_id UUID REFERENCES tokens(id),
    amount DECIMAL(36, 18),
    source_rail VARCHAR(50),
    destination_rail VARCHAR(50),
    status VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Cross-rail transfers
CREATE TABLE cross_rail_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enterprise_id UUID REFERENCES enterprises(id),
    token_id UUID REFERENCES tokens(id),
    source_rail VARCHAR(50), -- 'base' or 'solana'
    destination_rail VARCHAR(50),
    source_address VARCHAR(255),
    destination_address VARCHAR(255),
    amount DECIMAL(36, 18),
    burn_tx_hash VARCHAR(255),
    mint_tx_hash VARCHAR(255),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Compliance and KYC
CREATE TABLE compliance_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50), -- 'user' or 'enterprise'
    entity_id UUID,
    check_type VARCHAR(100),
    provider VARCHAR(50), -- 'persona', 'alloy', 'onfido'
    result VARCHAR(50),
    risk_score DECIMAL(5, 2),
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Audit trail
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(255),
    entity_type VARCHAR(100),
    entity_id UUID,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 API Implementation

### RESTful Endpoints

```typescript
// Authentication endpoints
POST   /api/auth/login
POST   /api/auth/logout  
POST   /api/auth/refresh
GET    /api/auth/verify
POST   /api/auth/2fa/enable
POST   /api/auth/2fa/verify

// Dashboard & Analytics
GET    /api/dashboard/stats
GET    /api/dashboard/recent-activity
GET    /api/analytics/metrics
GET    /api/analytics/charts/:type
POST   /api/analytics/export

// Transaction Management
GET    /api/transactions
GET    /api/transactions/:id
POST   /api/transactions/send
POST   /api/transactions/request
GET    /api/transactions/export
GET    /api/transactions/search

// Invoice Management
GET    /api/invoices
GET    /api/invoices/:id
POST   /api/invoices/create
PUT    /api/invoices/:id
POST   /api/invoices/:id/pay
POST   /api/invoices/:id/send
GET    /api/invoices/export

// Token Management
GET    /api/tokens
GET    /api/tokens/:id
POST   /api/tokens/create
POST   /api/tokens/:id/mint
POST   /api/tokens/:id/burn
GET    /api/tokens/:id/holders
GET    /api/tokens/:id/supply

// Programmable Wallet
GET    /api/wallet/cards
POST   /api/wallet/cards/create
PUT    /api/wallet/cards/:id
POST   /api/wallet/cards/:id/freeze
POST   /api/wallet/cards/:id/activate
GET    /api/wallet/api-keys
POST   /api/wallet/api-keys/generate
DELETE /api/wallet/api-keys/:id

// Treasury Management
GET    /api/treasury/pools
POST   /api/treasury/pools/add-liquidity
POST   /api/treasury/pools/remove-liquidity
GET    /api/treasury/positions
POST   /api/treasury/rebalance

// Cross-Rail Transfers
POST   /api/cross-rail/initiate
GET    /api/cross-rail/:id/status
GET    /api/cross-rail/history
POST   /api/cross-rail/estimate-fees

// Business Rules Engine
GET    /api/rules
GET    /api/rules/:id
POST   /api/rules/create
PUT    /api/rules/:id
POST   /api/rules/:id/test
GET    /api/rules/:id/analytics

// Compliance & KYC
GET    /api/compliance/checks
POST   /api/compliance/verify
GET    /api/compliance/audit-trail
POST   /api/compliance/report
GET    /api/compliance/risk-score

// Settings
GET    /api/settings/profile
PUT    /api/settings/profile
GET    /api/settings/security
PUT    /api/settings/security
GET    /api/settings/preferences
PUT    /api/settings/preferences

// Global Search
GET    /api/search?q={query}&type={type}&limit={limit}
```

## 🔐 Smart Contract Implementation

### Base L2 (EVM) Contracts

```solidity
// ERC-3643 Compliant Enterprise Token
pragma solidity ^0.8.20;

import "@onchain-id/solidity/contracts/token/IToken.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract MonayEnterpriseToken is IToken, AccessControlUpgradeable {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    
    // Compliance rules
    IIdentityRegistry public identityRegistry;
    IComplianceRegistry public complianceRegistry;
    
    // Treasury bridge integration
    address public treasuryBridge;
    
    // Mint with compliance check
    function mint(address account, uint256 amount) public onlyRole(MINTER_ROLE) {
        require(identityRegistry.isVerified(account), "Account not verified");
        require(complianceRegistry.canTransfer(account, amount), "Compliance check failed");
        
        _balances[account] += amount;
        _totalSupply += amount;
        
        emit Transfer(address(0), account, amount);
    }
    
    // Burn for cross-rail transfer
    function burnForBridge(address account, uint256 amount) public onlyRole(BRIDGE_ROLE) {
        require(_balances[account] >= amount, "Insufficient balance");
        
        _balances[account] -= amount;
        _totalSupply -= amount;
        
        emit BurnedForBridge(account, amount);
    }
    
    // Transfer with compliance
    function transfer(address to, uint256 amount) public override returns (bool) {
        require(identityRegistry.isVerified(msg.sender), "Sender not verified");
        require(identityRegistry.isVerified(to), "Receiver not verified");
        require(complianceRegistry.canTransfer(msg.sender, amount), "Transfer restricted");
        
        _transfer(msg.sender, to, amount);
        return true;
    }
}

// Treasury Bridge Contract
contract TreasuryBridge {
    mapping(bytes32 => bool) public processedTransfers;
    
    event CrossRailInitiated(
        address indexed from,
        string toAddress,
        uint256 amount,
        string destinationChain
    );
    
    function initiateCrossRail(
        address token,
        uint256 amount,
        string memory destinationAddress,
        string memory destinationChain
    ) external {
        IToken(token).burnForBridge(msg.sender, amount);
        
        bytes32 transferId = keccak256(
            abi.encodePacked(msg.sender, destinationAddress, amount, block.timestamp)
        );
        
        emit CrossRailInitiated(msg.sender, destinationAddress, amount, destinationChain);
    }
}
```

### Solana Programs

```rust
// Token-2022 with Compliance Extensions
use anchor_lang::prelude::*;
use anchor_spl::token_2022::{self, Token2022};

#[program]
pub mod monay_enterprise_token {
    use super::*;
    
    // Initialize token with compliance rules
    pub fn initialize(
        ctx: Context<Initialize>,
        name: String,
        symbol: String,
        decimals: u8,
        compliance_rules: ComplianceRules,
    ) -> Result<()> {
        let token = &mut ctx.accounts.token;
        token.name = name;
        token.symbol = symbol;
        token.decimals = decimals;
        token.compliance_rules = compliance_rules;
        token.authority = ctx.accounts.authority.key();
        
        Ok(())
    }
    
    // Mint with compliance check
    pub fn mint_with_compliance(
        ctx: Context<MintWithCompliance>,
        amount: u64,
    ) -> Result<()> {
        // Check KYC status
        require!(
            ctx.accounts.recipient.kyc_verified,
            ErrorCode::KYCNotVerified
        );
        
        // Check transaction limits
        require!(
            amount <= ctx.accounts.compliance_rules.max_transaction_amount,
            ErrorCode::ExceedsTransactionLimit
        );
        
        // Perform mint
        token_2022::mint_to(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token_2022::MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.recipient_ata.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
            ),
            amount,
        )?;
        
        Ok(())
    }
    
    // Cross-rail burn operation
    pub fn burn_for_bridge(
        ctx: Context<BurnForBridge>,
        amount: u64,
        destination_chain: String,
        destination_address: String,
    ) -> Result<()> {
        // Burn tokens
        token_2022::burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token_2022::Burn {
                    mint: ctx.accounts.mint.to_account_info(),
                    from: ctx.accounts.from_ata.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
            ),
            amount,
        )?;
        
        // Emit bridge event
        emit!(CrossRailBurnEvent {
            from: ctx.accounts.authority.key(),
            amount,
            destination_chain,
            destination_address,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct ComplianceRules {
    pub kyc_required: bool,
    pub max_transaction_amount: u64,
    pub daily_limit: u64,
    pub allowed_countries: Vec<String>,
    pub blocked_addresses: Vec<Pubkey>,
}

#[event]
pub struct CrossRailBurnEvent {
    pub from: Pubkey,
    pub amount: u64,
    pub destination_chain: String,
    pub destination_address: String,
    pub timestamp: i64,
}
```

## 🔄 Cross-Rail Transfer Implementation

### Transfer Flow

1. **Initiation** (Frontend)
```typescript
const initiateTransfer = async (params: CrossRailTransferParams) => {
  // Step 1: Validate recipient address
  const isValid = await validateAddress(params.destinationAddress, params.destinationChain)
  
  // Step 2: Check compliance
  const complianceCheck = await checkCompliance({
    amount: params.amount,
    sender: currentUser.address,
    recipient: params.destinationAddress,
  })
  
  // Step 3: Estimate fees
  const fees = await estimateCrossRailFees(params)
  
  // Step 4: Execute transfer
  const txHash = await executeCrossRailTransfer({
    ...params,
    fees,
    complianceCheckId: complianceCheck.id
  })
  
  // Step 5: Monitor status
  return monitorTransferStatus(txHash)
}
```

2. **Backend Processing**
```typescript
// Cross-rail transfer service
class CrossRailTransferService {
  async processTransfer(params: TransferParams) {
    // 1. Burn tokens on source chain
    const burnTx = await this.burnTokens(
      params.sourceChain,
      params.amount,
      params.tokenAddress
    )
    
    // 2. Wait for confirmation
    await this.waitForConfirmation(burnTx, params.sourceChain)
    
    // 3. Generate mint proof
    const proof = await this.generateMintProof(burnTx)
    
    // 4. Mint on destination chain
    const mintTx = await this.mintTokens(
      params.destinationChain,
      params.amount,
      params.destinationAddress,
      proof
    )
    
    // 5. Update database
    await this.updateTransferStatus(params.transferId, 'completed', {
      burnTx,
      mintTx,
      completedAt: new Date()
    })
    
    return { burnTx, mintTx, status: 'completed' }
  }
}
```

## 🎨 UI/UX Implementation Details

### Component Architecture

```typescript
// Glass morphism design system
const glassStyles = {
  card: 'bg-white/10 backdrop-blur-md border border-white/20',
  button: 'bg-white/20 backdrop-blur-sm hover:bg-white/30',
  input: 'bg-white/5 backdrop-blur-sm border border-white/10'
}

// Animation configurations
const animations = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  slideIn: {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 }
  },
  scale: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 }
  }
}

// Dark mode theme configuration
const darkModeConfig = {
  attribute: 'class',
  defaultTheme: 'system',
  enableSystem: true,
  themes: ['light', 'dark'],
  storageKey: 'monay-theme'
}
```

### Key UI Components

1. **Collapsible Sidebar Navigation**
```tsx
const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="fixed left-0 top-0 h-full bg-white/90 dark:bg-gray-900/90"
    >
      {/* Navigation items with tooltips when collapsed */}
    </motion.aside>
  )
}
```

2. **Global Search with Command Palette**
```tsx
const GlobalSearch = () => {
  const [open, setOpen] = useState(false)
  
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])
  
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search transactions, invoices, tokens..." />
      <CommandList>
        {/* Search results */}
      </CommandList>
    </CommandDialog>
  )
}
```

3. **Real-time Dashboard Metrics**
```tsx
const MetricsCard = ({ metric }: { metric: Metric }) => {
  const [value, setValue] = useState(metric.initialValue)
  
  useEffect(() => {
    const socket = getSocket()
    socket.on(`metric:${metric.id}`, setValue)
    
    return () => socket.off(`metric:${metric.id}`)
  }, [metric.id])
  
  return (
    <Card className="glass-card">
      <CardContent>
        <AnimatedNumber value={value} />
        <TrendIndicator trend={metric.trend} />
      </CardContent>
    </Card>
  )
}
```

## 🧪 Testing Implementation

### Unit Testing
```typescript
// Jest configuration for Next.js
describe('EnterpriseWallet', () => {
  it('should authenticate user with correct role', async () => {
    const { result } = renderHook(() => useAuth())
    
    await act(async () => {
      await result.current.login('admin@monay.com', 'password')
    })
    
    expect(result.current.user?.role).toBe('enterprise_admin')
  })
  
  it('should handle cross-rail transfer correctly', async () => {
    const transfer = await initiateTransfer({
      amount: 1000,
      sourceChain: 'base',
      destinationChain: 'solana',
      destinationAddress: '...'
    })
    
    expect(transfer.status).toBe('completed')
    expect(transfer.duration).toBeLessThan(60000) // < 60 seconds
  })
})
```

### E2E Testing
```typescript
// Playwright tests
test('complete invoice payment flow', async ({ page }) => {
  await page.goto('/invoices')
  await page.click('text=Create Invoice')
  
  // Fill invoice form
  await page.fill('[name=client]', 'Acme Corp')
  await page.fill('[name=amount]', '10000')
  await page.selectOption('[name=payment_method]', 'USDM')
  
  await page.click('text=Create')
  
  // Verify invoice created
  await expect(page).toHaveText('Invoice created successfully')
})
```

## 🚀 Deployment Configuration

### Docker Configuration
```dockerfile
# Enterprise Wallet Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3007
CMD ["npm", "start"]
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: enterprise-wallet
spec:
  replicas: 3
  selector:
    matchLabels:
      app: enterprise-wallet
  template:
    metadata:
      labels:
        app: enterprise-wallet
    spec:
      containers:
      - name: enterprise-wallet
        image: monay/enterprise-wallet:2.0.0
        ports:
        - containerPort: 3007
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "https://api.monay.com"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

## 📊 Performance Optimization

### Frontend Optimization
```typescript
// Code splitting with dynamic imports
const EnhancedAnalytics = dynamic(
  () => import('@/components/EnhancedAnalytics'),
  { 
    loading: () => <AnalyticsSkeleton />,
    ssr: false 
  }
)

// Image optimization
<Image 
  src="/logo.png" 
  alt="Monay" 
  width={200} 
  height={50}
  priority
  placeholder="blur"
/>

// Memoization for expensive computations
const expensiveCalculation = useMemo(() => {
  return calculateMetrics(transactions)
}, [transactions])

// Debounced search
const debouncedSearch = useDebouncedCallback((value) => {
  searchAPI(value)
}, 300)
```

### Backend Optimization
```typescript
// Database query optimization
const getTransactions = async (filters: TransactionFilters) => {
  return db.transaction.findMany({
    where: filters,
    include: {
      token: true,
      compliance_check: true
    },
    orderBy: { created_at: 'desc' },
    take: 100,
    // Use cursor-based pagination for large datasets
    cursor: filters.cursor ? { id: filters.cursor } : undefined
  })
}

// Redis caching
const getCachedDashboardStats = async (enterpriseId: string) => {
  const cacheKey = `dashboard:stats:${enterpriseId}`
  
  // Try cache first
  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)
  
  // Calculate and cache
  const stats = await calculateDashboardStats(enterpriseId)
  await redis.setex(cacheKey, 300, JSON.stringify(stats)) // 5 min TTL
  
  return stats
}
```

## 🔐 Security Implementation

### Authentication Security
```typescript
// Multi-factor authentication
const enable2FA = async (userId: string) => {
  const secret = authenticator.generateSecret()
  const qrCode = await QRCode.toDataURL(
    authenticator.otpauthURL({
      secret,
      label: 'Monay Enterprise',
      issuer: 'Monay'
    })
  )
  
  await updateUser(userId, { twoFactorSecret: secret })
  return { qrCode, secret }
}

// Session management
const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  cookie: {
    secure: true, // HTTPS only
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 minutes
  }
}
```

### Data Encryption
```typescript
// Field-level encryption for sensitive data
import { encrypt, decrypt } from '@/lib/crypto'

const encryptCardNumber = (cardNumber: string) => {
  return encrypt(cardNumber, process.env.ENCRYPTION_KEY!)
}

const decryptCardNumber = (encryptedCard: string) => {
  return decrypt(encryptedCard, process.env.ENCRYPTION_KEY!)
}
```

## 📈 Monitoring & Analytics

### Application Monitoring
```typescript
// DataDog integration
import { datadogRum } from '@datadog/browser-rum'

datadogRum.init({
  applicationId: process.env.DD_APP_ID,
  clientToken: process.env.DD_CLIENT_TOKEN,
  site: 'datadoghq.com',
  service: 'enterprise-wallet',
  env: process.env.NODE_ENV,
  trackInteractions: true,
  trackResources: true,
  trackLongTasks: true
})

// Custom metrics
datadogRum.addAction('cross_rail_transfer_initiated', {
  amount: transfer.amount,
  source: transfer.sourceChain,
  destination: transfer.destinationChain
})
```

### Error Tracking
```typescript
// Sentry integration
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  beforeSend(event) {
    // Sanitize sensitive data
    if (event.request?.cookies) {
      delete event.request.cookies
    }
    return event
  }
})
```

## 📝 Documentation & Support

### API Documentation
- Swagger/OpenAPI specs at `/api/docs`
- Postman collection available
- GraphQL playground at `/api/graphql`

### Developer Resources
- Component Storybook: `npm run storybook`
- API Testing: `npm run test:api`
- Load Testing: `npm run test:load`

### Support Channels
- Technical Documentation: `/docs`
- API Status: `https://status.monay.com`
- Developer Portal: `https://developers.monay.com`
- Support Email: `support@monay.com`

## 🚦 Success Metrics

### Performance Targets
- **Page Load**: < 2 seconds (FCP)
- **API Response**: < 200ms (P95)
- **Transaction Processing**: < 5 seconds
- **Cross-Rail Transfer**: < 60 seconds
- **System Uptime**: > 99.95%

### Business Metrics
- **Daily Active Users**: Track unique enterprise users
- **Transaction Volume**: Monitor daily/monthly volumes
- **Token Issuance**: Track new tokens created
- **Cross-Rail Usage**: Monitor bridge utilization
- **Invoice Processing**: Track payment success rates

## 📅 Implementation Timeline

### Phase 1: Foundation (Weeks 1-4) ✅
- [x] Setup project structure
- [x] Implement authentication system
- [x] Create dashboard UI
- [x] Build transaction management
- [x] Develop invoice system

### Phase 2: Advanced Features (Weeks 5-8) ✅
- [x] Programmable wallet implementation
- [x] Token management system
- [x] Treasury operations
- [x] Business rules engine
- [x] Cross-rail transfers

### Phase 3: Integration (Weeks 9-12) 🔄
- [ ] Smart contract deployment
- [ ] Blockchain integration
- [ ] KYC/AML provider integration
- [ ] Payment gateway setup

### Phase 4: Testing & Security (Weeks 13-16)
- [ ] Security audit
- [ ] Performance testing
- [ ] User acceptance testing
- [ ] Bug fixes and optimization

### Phase 5: Deployment (Weeks 17-20)
- [ ] Production environment setup
- [ ] Migration planning
- [ ] Staged rollout
- [ ] Monitoring setup

### Phase 6: Launch (Weeks 21-24)
- [ ] Beta user onboarding
- [ ] Performance monitoring
- [ ] Feedback collection
- [ ] Iteration and improvements

## 🔄 Version Control

### Version History
| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.0.0 | Oct 2024 | Initial specification | Released |
| 2.0.0 | Jan 2025 | Complete Enterprise Wallet implementation | Active |

### Recent Updates (v2.0.0)
- Added comprehensive Enterprise Wallet Dashboard
- Implemented all major features (transactions, invoices, tokens, etc.)
- Added dark mode support with next-themes
- Implemented collapsible sidebar navigation
- Added global search functionality
- Integrated Business Rules Engine with dual-rail blockchain
- Added programmable wallet features
- Implemented cross-rail transfer system
- Added comprehensive compliance and KYC management
- Built advanced analytics and reporting

---

**Document Status**: ACTIVE DEVELOPMENT
**Last Updated**: January 27, 2025
**Next Review**: February 2025
**Maintained By**: Monay Engineering Team