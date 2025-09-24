# 🔄 Circle + Monay Dual-Wallet Hybrid Architecture Plan

**Date**: January 24, 2025
**Scope**: Consumer Wallet with Dual-Wallet Support
**Architecture**: Circle Wallet + Monay Wallet Integration

---

## 🎯 Executive Summary

This plan implements a dual-wallet architecture where users maintain:
1. **Monay Consumer Wallet**: Traditional fiat operations (existing)
2. **Circle Wallet**: USDC operations (new)
3. **Seamless Bridge**: Intelligent interchange between wallets

---

## 🏗️ Dual-Wallet Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Consumer Mobile/Web App                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                    Unified Wallet View                       │
│  ┌─────────────────────┐    ┌─────────────────────┐        │
│  │   Monay Wallet      │    │   Circle Wallet     │        │
│  │   💳 Traditional    │⟵⟶│   🪙 USDC/Crypto    │        │
│  │   Balance: $5,000   │    │   Balance: 2,000    │        │
│  └─────────────────────┘    └─────────────────────┘        │
│            ↓                           ↓                     │
├──────────────────────────────────────────────────────────────┤
│                  Wallet Orchestration Layer                   │
│                    (Smart Routing Engine)                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────┐    ┌─────────────────────┐        │
│  │  Monay Backend      │    │   Circle APIs       │        │
│  │  - ACH/Wire/Cards   │    │   - Wallets API     │        │
│  │  - P2P Transfers    │    │   - Payments API    │        │
│  │  - Bill Pay         │    │   - Payouts API     │        │
│  │  - Rewards          │    │   - Accounts API    │        │
│  └─────────────────────┘    └─────────────────────┘        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 📊 Wallet Comparison & Use Cases

| Feature | Monay Wallet | Circle Wallet | User Benefit |
|---------|--------------|---------------|--------------|
| **Currency** | USD (Fiat) | USDC (Stablecoin) | Choice & flexibility |
| **Settlement** | 1-3 days | Instant | Speed when needed |
| **Fees** | $2-5 typical | $0.50-1 typical | Cost savings |
| **Global** | Limited | Yes | International access |
| **Rewards** | ✅ Full program | ❌ Limited | Earn on spending |
| **Bill Pay** | ✅ Supported | ⚠️ Convert first | Traditional bills |
| **Crypto** | ❌ No | ✅ Yes | DeFi access |
| **Cards** | ✅ Physical/Virtual | 🔄 Coming | Spend anywhere |

---

## 🔄 Dual-Wallet Integration Strategy

### 1. Wallet Initialization & Linking

```javascript
// wallet-orchestrator-service.js
class WalletOrchestratorService {
    async initializeUserWallets(userId) {
        // 1. Ensure Monay wallet exists (already implemented)
        const monayWallet = await this.getOrCreateMonayWallet(userId);

        // 2. Create or retrieve Circle wallet
        const circleWallet = await this.getOrCreateCircleWallet(userId);

        // 3. Link wallets in database
        await this.linkWallets(userId, {
            monay_wallet_id: monayWallet.id,
            circle_wallet_id: circleWallet.id,
            circle_address: circleWallet.address,
            linking_status: 'active'
        });

        return {
            monay: monayWallet,
            circle: circleWallet,
            linked: true
        };
    }

    async getOrCreateCircleWallet(userId) {
        // Check if user already has Circle wallet
        const existing = await db.query(
            `SELECT * FROM user_circle_wallets WHERE user_id = ?`,
            [userId]
        );

        if (existing) return existing;

        // Create new Circle wallet via API
        const circleWallet = await circleAPI.createWallet({
            idempotencyKey: `user-${userId}`,
            description: `Monay User ${userId} Wallet`
        });

        // Store wallet reference
        await db.query(
            `INSERT INTO user_circle_wallets
             (user_id, circle_wallet_id, address, blockchain)
             VALUES (?, ?, ?, ?)`,
            [userId, circleWallet.walletId, circleWallet.address, 'ETH']
        );

        return circleWallet;
    }
}
```

### 2. Unified Balance & Display

```javascript
// unified-wallet-service.js
class UnifiedWalletService {
    async getConsolidatedView(userId) {
        // Get both wallet balances in parallel
        const [monayBalance, circleBalance] = await Promise.all([
            this.getMonayWalletBalance(userId),
            this.getCircleWalletBalance(userId)
        ]);

        // Calculate unified metrics
        const totalUSDValue = monayBalance.available + circleBalance.usdcBalance;

        return {
            overview: {
                total_usd_value: totalUSDValue,
                total_available: totalUSDValue,
                primary_currency: 'USD'
            },
            wallets: {
                monay: {
                    name: 'Monay Wallet',
                    type: 'fiat',
                    balance: monayBalance.available,
                    pending: monayBalance.pending,
                    currency: 'USD',
                    features: ['cards', 'billpay', 'rewards', 'p2p'],
                    icon: '💳'
                },
                circle: {
                    name: 'Circle Wallet',
                    type: 'crypto',
                    balance: circleBalance.usdcBalance,
                    pending: circleBalance.pendingBalance,
                    currency: 'USDC',
                    address: circleBalance.address,
                    features: ['instant', 'global', 'defi', 'low-fee'],
                    icon: '🪙'
                }
            },
            quick_actions: {
                can_transfer_between: true,
                suggested_balance: this.calculateOptimalDistribution(totalUSDValue),
                pending_transfers: await this.getPendingBridgeTransfers(userId)
            }
        };
    }

    calculateOptimalDistribution(total) {
        // Intelligent balance distribution recommendation
        return {
            monay_suggested: total * 0.7,  // 70% for daily use
            circle_suggested: total * 0.3,  // 30% for savings/international
            reasoning: 'Optimized for daily spending with international capability'
        };
    }
}
```

### 3. Intelligent Transaction Routing

```javascript
// transaction-router-service.js
class TransactionRouterService {
    async routePayment(userId, paymentRequest) {
        const {
            amount,
            recipient,
            type, // 'p2p', 'bill', 'merchant', 'international'
            urgency, // 'instant', 'normal', 'scheduled'
            preferredWallet // 'monay', 'circle', 'auto'
        } = paymentRequest;

        // Get wallet balances and capabilities
        const walletStatus = await this.getWalletCapabilities(userId);

        // Decision matrix for wallet selection
        const decision = await this.makeRoutingDecision({
            paymentType: type,
            walletBalances: walletStatus,
            recipientCapabilities: await this.checkRecipientCapabilities(recipient),
            feeComparison: await this.compareFees(amount, type),
            userPreference: preferredWallet,
            urgencyLevel: urgency
        });

        return decision;
    }

    async makeRoutingDecision(factors) {
        // Rule-based routing logic
        const rules = [
            {
                condition: factors.paymentType === 'international',
                wallet: 'circle',
                reason: 'Circle wallet offers instant international transfers'
            },
            {
                condition: factors.paymentType === 'bill' && factors.walletBalances.monay >= factors.amount,
                wallet: 'monay',
                reason: 'Bill pay is optimized in Monay wallet'
            },
            {
                condition: factors.urgencyLevel === 'instant' && factors.recipientCapabilities.acceptsUSDC,
                wallet: 'circle',
                reason: 'Instant settlement available via Circle'
            },
            {
                condition: factors.paymentType === 'p2p' && factors.recipientCapabilities.hasMonayWallet,
                wallet: 'monay',
                reason: 'Free P2P transfer between Monay wallets'
            },
            {
                condition: factors.feeComparison.circle < factors.feeComparison.monay * 0.5,
                wallet: 'circle',
                reason: 'Significant fee savings with Circle'
            }
        ];

        // Evaluate rules
        for (const rule of rules) {
            if (rule.condition) {
                return {
                    recommended_wallet: rule.wallet,
                    reason: rule.reason,
                    alternative: rule.wallet === 'circle' ? 'monay' : 'circle',
                    requires_bridge: factors.walletBalances[rule.wallet] < factors.amount
                };
            }
        }

        // Default fallback
        return {
            recommended_wallet: 'monay',
            reason: 'Standard payment processing',
            alternative: 'circle'
        };
    }
}
```

### 4. Bridge Transfer Service (Wallet-to-Wallet)

```javascript
// bridge-transfer-service.js
class BridgeTransferService {
    async transferBetweenWallets(userId, direction, amount) {
        // direction: 'monay_to_circle' or 'circle_to_monay'

        if (direction === 'monay_to_circle') {
            return this.fiatToUSDC(userId, amount);
        } else {
            return this.USDCToFiat(userId, amount);
        }
    }

    async fiatToUSDC(userId, amount) {
        const transaction = await db.transaction(async (trx) => {
            // 1. Debit Monay wallet
            await this.debitMonayWallet(userId, amount, trx);

            // 2. Initiate Circle mint
            const mintRequest = await circleAPI.createPayment({
                amount: { amount: amount.toString(), currency: 'USD' },
                source: { type: 'ach', id: await this.getUserBankAccountId(userId) },
                destination: { type: 'wallet', id: await this.getUserCircleWalletId(userId) },
                description: 'Bridge transfer from Monay to Circle'
            });

            // 3. Track bridge transfer
            await this.createBridgeRecord(userId, {
                direction: 'monay_to_circle',
                amount,
                status: 'pending',
                circle_payment_id: mintRequest.id,
                estimated_completion: new Date(Date.now() + 3600000) // 1 hour
            }, trx);

            return mintRequest;
        });

        // 4. Send notifications
        await this.notifyBridgeTransfer(userId, transaction);

        return {
            success: true,
            transferId: transaction.id,
            estimatedTime: '30-60 minutes',
            amount,
            direction: 'Monay → Circle'
        };
    }

    async USDCToFiat(userId, amount) {
        const transaction = await db.transaction(async (trx) => {
            // 1. Check Circle wallet balance
            const balance = await this.getCircleBalance(userId);
            if (balance < amount) throw new Error('Insufficient USDC balance');

            // 2. Initiate Circle burn/payout
            const payoutRequest = await circleAPI.createPayout({
                amount: { amount: amount.toString(), currency: 'USD' },
                source: { type: 'wallet', id: await this.getUserCircleWalletId(userId) },
                destination: { type: 'ach', id: await this.getUserBankAccountId(userId) },
                description: 'Bridge transfer from Circle to Monay'
            });

            // 3. Track bridge transfer
            await this.createBridgeRecord(userId, {
                direction: 'circle_to_monay',
                amount,
                status: 'pending',
                circle_payout_id: payoutRequest.id,
                estimated_completion: new Date(Date.now() + 86400000) // 24 hours
            }, trx);

            return payoutRequest;
        });

        return {
            success: true,
            transferId: transaction.id,
            estimatedTime: '1-2 business days',
            amount,
            direction: 'Circle → Monay'
        };
    }
}
```

---

## 📱 User Interface Design

### 1. Unified Dashboard View

```typescript
// React Native Component
const UnifiedWalletDashboard = () => {
    return (
        <ScrollView>
            {/* Total Balance Card */}
            <TotalBalanceCard
                totalUSD={monayBalance + circleBalance}
                trend="+5.2%"
            />

            {/* Wallet Cards - Swipeable */}
            <WalletCarousel>
                <MonayWalletCard
                    balance={monayBalance}
                    features={['Cards', 'Bill Pay', 'Rewards']}
                    onPress={() => navigateToMonayDetails()}
                />
                <CircleWalletCard
                    balance={circleBalance}
                    address={circleAddress}
                    features={['Instant', 'Global', 'Low Fees']}
                    onPress={() => navigateToCircleDetails()}
                />
            </WalletCarousel>

            {/* Quick Actions */}
            <QuickActions>
                <ActionButton
                    icon="↔️"
                    label="Transfer Between"
                    onPress={openBridgeModal}
                />
                <ActionButton
                    icon="📤"
                    label="Send"
                    onPress={openSmartSend}
                />
                <ActionButton
                    icon="📥"
                    label="Receive"
                    onPress={showReceiveOptions}
                />
            </QuickActions>

            {/* Unified Transaction History */}
            <TransactionList
                transactions={mergedTransactions}
                showWalletBadge={true}
            />
        </ScrollView>
    );
};
```

### 2. Smart Send Flow

```typescript
// Smart payment flow with wallet selection
const SmartSendFlow = () => {
    const [selectedWallet, setSelectedWallet] = useState('auto');
    const [showRecommendation, setShowRecommendation] = useState(false);

    return (
        <SendFlowContainer>
            {/* Step 1: Recipient & Amount */}
            <RecipientInput
                onValidate={checkRecipientCapabilities}
            />
            <AmountInput
                maxAmount={getTotalAvailable()}
            />

            {/* Step 2: Wallet Selection with Recommendation */}
            <WalletSelector>
                <WalletOption
                    wallet="auto"
                    label="Smart Route"
                    description="Let us choose the best option"
                    badge="RECOMMENDED"
                    selected={selectedWallet === 'auto'}
                />
                <WalletOption
                    wallet="monay"
                    label="Monay Wallet"
                    description={`Balance: $${monayBalance}`}
                    fee="$2.50"
                    time="1-2 days"
                    selected={selectedWallet === 'monay'}
                />
                <WalletOption
                    wallet="circle"
                    label="Circle Wallet"
                    description={`Balance: ${circleBalance} USDC`}
                    fee="$0.50"
                    time="Instant"
                    selected={selectedWallet === 'circle'}
                />
            </WalletSelector>

            {/* Show routing recommendation */}
            {showRecommendation && (
                <RecommendationCard>
                    <Text>💡 We recommend using Circle Wallet</Text>
                    <Text>Save $2.00 in fees and get instant delivery</Text>
                </RecommendationCard>
            )}

            {/* Step 3: Review & Confirm */}
            <ReviewTransaction
                wallet={selectedWallet}
                onConfirm={processPayment}
            />
        </SendFlowContainer>
    );
};
```

### 3. Bridge Transfer Interface

```typescript
// Bridge transfer between wallets
const BridgeTransferModal = () => {
    const [direction, setDirection] = useState('monay_to_circle');
    const [amount, setAmount] = useState('');

    return (
        <Modal>
            <Header title="Transfer Between Wallets" />

            {/* Visual Flow Indicator */}
            <TransferFlow>
                <WalletIcon
                    type="monay"
                    balance={monayBalance}
                    selected={direction.startsWith('monay')}
                />
                <ArrowButton
                    onPress={() => toggleDirection()}
                    direction={direction}
                />
                <WalletIcon
                    type="circle"
                    balance={circleBalance}
                    selected={direction.startsWith('circle')}
                />
            </TransferFlow>

            {/* Amount Input */}
            <AmountSection>
                <AmountInput
                    value={amount}
                    onChange={setAmount}
                    max={getSourceBalance()}
                />
                <PresetAmounts
                    amounts={[100, 500, 1000]}
                    onSelect={setAmount}
                />
            </AmountSection>

            {/* Transfer Details */}
            <TransferDetails>
                <DetailRow label="Fee" value="Free" />
                <DetailRow
                    label="Time"
                    value={direction === 'monay_to_circle' ? '~1 hour' : '1-2 days'}
                />
                <DetailRow label="You'll receive" value={calculateReceived(amount)} />
            </TransferDetails>

            {/* Confirm Button */}
            <ConfirmButton
                onPress={() => executeBridge(direction, amount)}
                label={`Transfer ${amount} ${direction === 'monay_to_circle' ? 'to Circle' : 'to Monay'}`}
            />
        </Modal>
    );
};
```

---

## 🔧 Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Database schema for dual-wallet tracking
- [ ] Circle wallet creation/retrieval API
- [ ] Wallet linking mechanism
- [ ] Unified balance calculation

### Phase 2: Core Features (Week 2)
- [ ] Bridge transfer service (both directions)
- [ ] Transaction routing logic
- [ ] Unified transaction history
- [ ] Basic UI for dual wallets

### Phase 3: Intelligence Layer (Week 3)
- [ ] Smart routing algorithm
- [ ] Fee comparison engine
- [ ] Recipient capability detection
- [ ] Auto-balance recommendations

### Phase 4: Polish & Optimization (Week 4)
- [ ] Advanced UI/UX refinements
- [ ] Performance optimization
- [ ] Comprehensive testing
- [ ] Production deployment

---

## 📊 Database Schema Updates

```sql
-- Track dual wallet relationships
CREATE TABLE IF NOT EXISTS user_wallet_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    monay_wallet_id UUID REFERENCES wallets(id),
    circle_wallet_id VARCHAR(255),
    circle_wallet_address VARCHAR(255),
    linking_status VARCHAR(20) DEFAULT 'active',
    linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id)
);

-- Bridge transfer tracking
CREATE TABLE IF NOT EXISTS bridge_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    direction VARCHAR(30) CHECK (direction IN ('monay_to_circle', 'circle_to_monay')),
    amount DECIMAL(20, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    circle_reference_id VARCHAR(255),
    initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    fee_amount DECIMAL(10, 2) DEFAULT 0,

    INDEX idx_bridge_user_status (user_id, status)
);

-- Wallet selection preferences
CREATE TABLE IF NOT EXISTS wallet_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    default_wallet VARCHAR(20) DEFAULT 'auto',
    auto_routing_enabled BOOLEAN DEFAULT true,
    balance_distribution_ratio DECIMAL(3, 2) DEFAULT 0.70, -- % in Monay
    notification_preferences JSONB,

    UNIQUE(user_id)
);

-- Routing decisions audit
CREATE TABLE IF NOT EXISTS routing_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    transaction_id UUID,
    recommended_wallet VARCHAR(20),
    selected_wallet VARCHAR(20),
    reasoning TEXT,
    fee_savings DECIMAL(10, 2),
    decision_factors JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🎯 Success Metrics

### KPIs for Dual-Wallet System

1. **Adoption Metrics**
   - % users with both wallets activated
   - Circle wallet creation rate
   - Bridge transfer frequency

2. **Usage Distribution**
   - Average balance split (Monay vs Circle)
   - Transaction volume per wallet
   - Cross-wallet transfer volume

3. **Efficiency Metrics**
   - Smart routing acceptance rate
   - Average fee savings per user
   - Settlement time improvements

4. **User Experience**
   - Wallet switching frequency
   - Support tickets per wallet type
   - Feature discovery rate

---

## 🔒 Security Considerations

### Dual-Wallet Security Model

1. **Wallet Isolation**
   - Separate authentication for sensitive operations
   - Independent transaction limits
   - Isolated fraud detection rules

2. **Bridge Security**
   - Atomic transfers (all-or-nothing)
   - Maximum bridge limits
   - Cool-down periods for large transfers

3. **Unified Monitoring**
   - Aggregate suspicious activity detection
   - Cross-wallet pattern analysis
   - Combined AML/KYC compliance

---

## ❓ Key Questions for Dual-Wallet Implementation

1. **Wallet Creation**: Should Circle wallet be created automatically for all users or on-demand?

2. **Default Behavior**: Which wallet should be primary for new users?

3. **Bridge Fees**: Should bridge transfers between wallets be free, fixed fee, or percentage?

4. **Balance Management**: Should we offer auto-balancing between wallets based on usage patterns?

5. **Card Issuance**: Should we issue separate cards for each wallet or a unified card?

6. **Rewards**: How should rewards work across both wallets?

7. **Compliance**: Any specific regulatory requirements for dual-wallet operations?

---

## 📝 Next Steps

1. **Confirm Architecture**: Verify dual-wallet approach aligns with business vision
2. **Circle Integration**: Finalize Circle API partnership details
3. **UI/UX Review**: Design review for dual-wallet experience
4. **Compliance Check**: Legal review of dual-wallet structure
5. **Development Sprint**: Begin Phase 1 implementation

---

**This dual-wallet approach provides:**
- ✅ Clear separation of traditional and crypto assets
- ✅ User choice and control
- ✅ Intelligent routing for optimal transactions
- ✅ Seamless bridge between both worlds
- ✅ Future-proof architecture for additional wallets/chains

The architecture maintains the strength of your existing Monay wallet while adding Circle's USDC capabilities as a complementary service, giving users the best of both worlds.