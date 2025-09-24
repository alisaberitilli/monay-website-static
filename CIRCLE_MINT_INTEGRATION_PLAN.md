# Circle Mint Integration Plan - Hybrid Approach
**Immediate Implementation for Monay Enterprise & Consumer Wallets**

## Strategy Overview
**Phase 1 (Now)**: Use Circle Mint APIs with USDC backing
**Phase 2 (6-12 months)**: Issue MonayUSD tokens backed by USDC
**Phase 3 (18-24 months)**: Transition to direct USD backing

## 🚀 Quick Start Requirements

### 1. Circle Account Setup (Week 1)
1. **Apply for Circle Mint Account**
   - URL: https://www.circle.com/en/circle-mint
   - Type: Institutional Account
   - Requirements: Business documentation, compliance info
   - Approval Time: 3-5 business days

2. **Get API Credentials**
   - API Key
   - Entity Secret
   - Wallet Set ID

3. **Configure Webhooks**
   - Payment notifications
   - Transfer confirmations
   - Settlement updates

## 📦 Backend Implementation

### Step 1: Install Circle SDK
```bash
cd /Users/alisaberi/Data/0ProductBuild/monay/monay-backend-common
npm install @circle-fin/circle-sdk
```

### Step 2: Create Circle Service
Create `/monay-backend-common/src/services/circle.js`:

```javascript
import { Circle, CircleEnvironments } from '@circle-fin/circle-sdk';

class CircleService {
  constructor() {
    this.client = new Circle(
      process.env.CIRCLE_API_KEY,
      CircleEnvironments.production // or sandbox for testing
    );

    this.entitySecret = process.env.CIRCLE_ENTITY_SECRET;
    this.walletSetId = process.env.CIRCLE_WALLET_SET_ID;
  }

  // Create a new wallet for a user/enterprise
  async createWallet(userId, type = 'enterprise') {
    try {
      const wallet = await this.client.wallets.create({
        idempotencyKey: `${userId}-${Date.now()}`,
        entitySecretCipherText: await this.encryptEntitySecret(),
        walletSetId: this.walletSetId,
        metadata: {
          userId,
          type,
          createdAt: new Date().toISOString()
        }
      });

      return {
        walletId: wallet.data.walletId,
        address: wallet.data.address,
        blockchain: 'ETH', // or 'SOL' for Solana
        currency: 'USD:USDC'
      };
    } catch (error) {
      console.error('Create wallet error:', error);
      throw error;
    }
  }

  // Mint USDC (deposit USD -> receive USDC)
  async mintUSDC(amount, destinationAddress, sourceAccount) {
    try {
      const payment = await this.client.paymentIntents.create({
        amount: {
          amount: amount.toString(),
          currency: 'USD'
        },
        settlementCurrency: 'USD',
        paymentMethods: [{
          type: 'blockchain',
          chain: 'ETH',
          address: destinationAddress
        }],
        source: {
          type: 'wire', // or 'ach'
          id: sourceAccount
        }
      });

      return {
        paymentId: payment.data.id,
        status: payment.data.status,
        amount: amount,
        trackingRef: payment.data.trackingRef
      };
    } catch (error) {
      console.error('Mint USDC error:', error);
      throw error;
    }
  }

  // Burn USDC (send USDC -> receive USD)
  async burnUSDC(amount, sourceAddress, destinationBankAccount) {
    try {
      const payout = await this.client.payouts.create({
        idempotencyKey: `burn-${Date.now()}`,
        source: {
          type: 'wallet',
          id: sourceAddress
        },
        destination: {
          type: 'wire', // or 'ach'
          id: destinationBankAccount
        },
        amount: {
          currency: 'USD',
          amount: amount.toString()
        },
        metadata: {
          type: 'redemption',
          timestamp: new Date().toISOString()
        }
      });

      return {
        payoutId: payout.data.id,
        status: payout.data.status,
        amount: amount
      };
    } catch (error) {
      console.error('Burn USDC error:', error);
      throw error;
    }
  }

  // Transfer USDC between wallets
  async transferUSDC(amount, fromWallet, toWallet) {
    try {
      const transfer = await this.client.transfers.create({
        idempotencyKey: `transfer-${Date.now()}`,
        source: {
          type: 'wallet',
          id: fromWallet
        },
        destination: {
          type: 'wallet',
          id: toWallet,
          address: toWallet // Can be external address
        },
        amount: {
          currency: 'USD',
          amount: amount.toString()
        }
      });

      return {
        transferId: transfer.data.id,
        status: transfer.data.status,
        transactionHash: transfer.data.transactionHash
      };
    } catch (error) {
      console.error('Transfer USDC error:', error);
      throw error;
    }
  }

  // Get wallet balance
  async getBalance(walletId) {
    try {
      const wallet = await this.client.wallets.get(walletId);
      const balances = wallet.data.balances;

      return {
        walletId,
        balances: balances.map(b => ({
          currency: b.currency,
          amount: b.amount,
          updateTime: b.updateTime
        }))
      };
    } catch (error) {
      console.error('Get balance error:', error);
      throw error;
    }
  }

  // Create bank account for ACH/Wire
  async linkBankAccount(accountDetails) {
    try {
      const account = await this.client.banks.createBankAccount({
        idempotencyKey: `bank-${Date.now()}`,
        accountNumber: accountDetails.accountNumber,
        routingNumber: accountDetails.routingNumber,
        bankAddress: accountDetails.bankAddress,
        billingDetails: {
          name: accountDetails.accountName,
          city: accountDetails.city,
          country: accountDetails.country,
          postalCode: accountDetails.postalCode,
          line1: accountDetails.address
        }
      });

      return {
        bankAccountId: account.data.id,
        status: account.data.status,
        trackingRef: account.data.trackingRef
      };
    } catch (error) {
      console.error('Link bank account error:', error);
      throw error;
    }
  }
}

export default new CircleService();
```

### Step 3: Create API Routes
Create `/monay-backend-common/src/routes/circle.js`:

```javascript
import { Router } from 'express';
import circleService from '../services/circle.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Create wallet for user/enterprise
router.post('/wallets', authenticate, async (req, res) => {
  try {
    const { type = 'enterprise' } = req.body;
    const wallet = await circleService.createWallet(req.user.id, type);

    // Save wallet info to database
    // await saveWalletToDatabase(wallet);

    res.json({
      success: true,
      data: wallet
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Deposit USD -> Mint USDC
router.post('/mint', authenticate, authorize(['treasury', 'admin']), async (req, res) => {
  try {
    const { amount, destinationAddress, sourceAccount } = req.body;

    // Validate business rules
    const validation = await validateMintRequest(amount, req.user);
    if (!validation.allowed) {
      return res.status(403).json({
        success: false,
        error: validation.reason
      });
    }

    const result = await circleService.mintUSDC(amount, destinationAddress, sourceAccount);

    // Log transaction
    await logTransaction('mint', amount, req.user.id, result);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Redeem USDC -> Withdraw USD
router.post('/burn', authenticate, authorize(['treasury', 'admin']), async (req, res) => {
  try {
    const { amount, sourceAddress, destinationAccount } = req.body;

    const result = await circleService.burnUSDC(amount, sourceAddress, destinationAccount);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Transfer USDC
router.post('/transfer', authenticate, async (req, res) => {
  try {
    const { amount, fromWallet, toWallet } = req.body;

    // Apply business rules
    const validation = await validateTransfer(amount, fromWallet, toWallet, req.user);
    if (!validation.allowed) {
      return res.status(403).json({
        success: false,
        error: validation.reason
      });
    }

    const result = await circleService.transferUSDC(amount, fromWallet, toWallet);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get wallet balance
router.get('/wallets/:walletId/balance', authenticate, async (req, res) => {
  try {
    const balance = await circleService.getBalance(req.params.walletId);

    res.json({
      success: true,
      data: balance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Link bank account
router.post('/bank-accounts', authenticate, async (req, res) => {
  try {
    const result = await circleService.linkBankAccount(req.body);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Webhook handler for Circle notifications
router.post('/webhooks', async (req, res) => {
  try {
    const signature = req.headers['circle-signature'];

    // Verify webhook signature
    if (!verifyWebhookSignature(req.body, signature)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { Type, MessageId, Message } = req.body;

    switch (Type) {
      case 'transfer':
        await handleTransferUpdate(Message);
        break;
      case 'payment':
        await handlePaymentUpdate(Message);
        break;
      case 'payout':
        await handlePayoutUpdate(Message);
        break;
    }

    res.status(200).json({ received: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

## 🎨 Frontend Updates - Enterprise Wallet

### Update Treasury Dashboard Component
`/monay-enterprise-wallet/src/components/TreasuryDashboard.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { Card, Button, Input, Select } from '@/components/ui';

export function TreasuryDashboard() {
  const [balance, setBalance] = useState(null);
  const [showMintDialog, setShowMintDialog] = useState(false);
  const [showBurnDialog, setShowBurnDialog] = useState(false);

  // Fetch USDC balance
  useEffect(() => {
    fetchUSDCBalance();
  }, []);

  const fetchUSDCBalance = async () => {
    const res = await fetch('/api/circle/wallets/main/balance');
    const data = await res.json();
    setBalance(data.data);
  };

  const handleMint = async (amount) => {
    const res = await fetch('/api/circle/mint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        destinationAddress: walletAddress,
        sourceAccount: selectedBankAccount
      })
    });

    if (res.ok) {
      toast.success(`Minted ${amount} USDC successfully`);
      fetchUSDCBalance();
    }
  };

  const handleBurn = async (amount) => {
    const res = await fetch('/api/circle/burn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        sourceAddress: walletAddress,
        destinationAccount: selectedBankAccount
      })
    });

    if (res.ok) {
      toast.success(`Redeemed ${amount} USDC successfully`);
      fetchUSDCBalance();
    }
  };

  return (
    <div className="space-y-6">
      {/* Balance Display */}
      <Card>
        <h2 className="text-2xl font-bold mb-4">USDC Treasury</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Available Balance</p>
            <p className="text-3xl font-bold">
              ${balance?.amount || '0.00'} USDC
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Pending Mints</p>
            <p className="text-xl">$0.00</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Pending Burns</p>
            <p className="text-xl">$0.00</p>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={() => setShowMintDialog(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          Mint USDC (Deposit USD)
        </Button>
        <Button
          onClick={() => setShowBurnDialog(true)}
          className="bg-red-600 hover:bg-red-700"
        >
          Burn USDC (Withdraw USD)
        </Button>
        <Button variant="outline">
          Transfer USDC
        </Button>
      </div>

      {/* Recent Transactions */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Recent USDC Operations</h3>
        <TransactionList type="usdc" />
      </Card>

      {/* Mint Dialog */}
      {showMintDialog && (
        <MintDialog
          onConfirm={handleMint}
          onClose={() => setShowMintDialog(false)}
        />
      )}

      {/* Burn Dialog */}
      {showBurnDialog && (
        <BurnDialog
          onConfirm={handleBurn}
          onClose={() => setShowBurnDialog(false)}
        />
      )}
    </div>
  );
}
```

## 🎨 Frontend Updates - Consumer Wallet

### Update Wallet Balance Display
`/monay-cross-platform/web/src/components/WalletBalance.tsx`:

```typescript
export function WalletBalance() {
  const [balances, setBalances] = useState({
    usdc: 0,
    monayUSD: 0, // Future: Your branded token
    fiat: 0
  });

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4">Your Balance</h2>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>USDC</span>
          <span className="font-bold">${balances.usdc}</span>
        </div>
        {balances.monayUSD > 0 && (
          <div className="flex justify-between">
            <span>MonayUSD</span>
            <span className="font-bold">${balances.monayUSD}</span>
          </div>
        )}
        <div className="flex justify-between border-t pt-2">
          <span>Total USD Value</span>
          <span className="font-bold text-lg">
            ${balances.usdc + balances.monayUSD}
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button size="sm" onClick={handleDeposit}>
          Deposit
        </Button>
        <Button size="sm" onClick={handleWithdraw}>
          Withdraw
        </Button>
      </div>
    </Card>
  );
}
```

## 🔧 Environment Variables

Add to `.env`:
```bash
# Circle API Configuration
CIRCLE_API_KEY=your_api_key_here
CIRCLE_ENTITY_SECRET=your_entity_secret_here
CIRCLE_WALLET_SET_ID=your_wallet_set_id_here
CIRCLE_WEBHOOK_SECRET=your_webhook_secret_here
CIRCLE_ENVIRONMENT=sandbox # or production

# Circle URLs
CIRCLE_API_URL=https://api.circle.com
CIRCLE_SANDBOX_URL=https://api-sandbox.circle.com
```

## 📊 Database Schema Updates

No structural changes needed (as requested), but add to existing tables:

```sql
-- Store Circle wallet references in existing wallet table
-- Add these as JSON in metadata column:
{
  "circle_wallet_id": "uuid",
  "circle_address": "0x...",
  "circle_chain": "ETH",
  "usdc_balance": "10000.00"
}

-- Store Circle transactions in existing transactions table
-- Add these as JSON in metadata column:
{
  "circle_payment_id": "uuid",
  "circle_transfer_id": "uuid",
  "circle_payout_id": "uuid",
  "circle_status": "complete"
}
```

## 🚀 Implementation Timeline

### Week 1: Circle Setup
- [ ] Apply for Circle Mint account
- [ ] Get API credentials
- [ ] Set up sandbox environment
- [ ] Configure webhooks

### Week 2: Backend Integration
- [ ] Implement Circle service
- [ ] Create API routes
- [ ] Add webhook handlers
- [ ] Test mint/burn flows

### Week 3: Frontend Updates
- [ ] Update Enterprise Wallet treasury UI
- [ ] Update Consumer Wallet balance display
- [ ] Add deposit/withdraw flows
- [ ] Implement transfer UI

### Week 4: Testing & Launch
- [ ] End-to-end testing
- [ ] Security review
- [ ] Move to production
- [ ] Pilot with test users

## 💰 Cost Structure

### Circle Fees
- **Mint (USD → USDC)**: 0.1% ($1 per $1,000)
- **Burn (USDC → USD)**: 0.1% ($1 per $1,000)
- **Transfer**: Free between Circle wallets
- **Monthly Minimum**: $1,000-5,000 depending on tier

### Your Revenue Model
- **Add your margin**: Charge 0.2-0.5% for conversions
- **Transfer fees**: $0.50-1.00 for instant transfers
- **FX markup**: 0.5-1% on cross-border
- **Enterprise fees**: Monthly platform fees

## 🔄 Migration Path to Independence

### Phase 1 (Current): USDC Backend
- All value stored as USDC
- Use Circle for all operations
- Build user base and features

### Phase 2 (6-12 months): Wrapped Token
```solidity
// Deploy MonayUSD backed by USDC
contract MonayUSD is ERC20 {
  IERC20 public usdc;

  function mint(uint256 amount) external {
    usdc.transferFrom(msg.sender, address(this), amount);
    _mint(msg.sender, amount);
  }

  function burn(uint256 amount) external {
    _burn(msg.sender, amount);
    usdc.transfer(msg.sender, amount);
  }
}
```

### Phase 3 (18-24 months): Direct Backing
- Replace USDC reserves with USD bank deposits
- Maintain Circle as backup/bridge
- Full independence achieved

## ✅ Next Steps

1. **Today**: Start Circle Mint application
2. **Tomorrow**: Begin implementing Circle service
3. **This Week**: Complete backend integration
4. **Next Week**: Update frontend components
5. **2 Weeks**: Launch in sandbox
6. **3 Weeks**: Production pilot

This approach gets you to market quickly while maintaining your long-term vision of becoming a direct stablecoin issuer!