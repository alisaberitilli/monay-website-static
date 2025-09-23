# Capital Markets Rule Sets - User Guide

## Overview
The Capital Markets feature in Monay Enterprise Wallet enables deployment of hybrid rule sets that combine multiple categories (TOKEN, COMPLIANCE, TRANSACTION, SECURITY, WALLET) in single smart contracts. This is specifically designed for complex capital markets operations requiring coordinated enforcement of various regulatory and operational rules.

## Key Features

### 1. Hybrid Rule Sets
Deploy 50+ rules in a single smart contract transaction, combining different rule categories:
- **TRANSACTION**: Payment processing and validation
- **COMPLIANCE**: Regulatory requirements (KYC/AML, Reg D, etc.)
- **SECURITY**: Access controls and fraud prevention
- **WALLET**: Balance management and restrictions
- **TOKEN**: Minting, burning, and supply management

### 2. Pre-Configured Templates
Six ready-to-use templates for common scenarios:
- **Equity Trading**: Pattern Day Trader rules, trading hours, margin requirements
- **Fixed Income**: QIB verification, minimum denomination, settlement rules
- **Private Securities (Reg D)**: Lock-up periods, transfer restrictions, accreditation
- **Derivatives/Options**: Position limits, exercise rules, margin calculations
- **Hybrid Multi-Asset**: Portfolio diversification, risk management
- **Commodities**: Position limits, daily price limits, delivery requirements

### 3. Multi-Chain Deployment
Deploy to multiple blockchain networks:
- Base L2 (Primary)
- Ethereum Mainnet
- Polygon zkEVM
- Solana

## Getting Started

### Accessing Capital Markets Features

1. Navigate to http://localhost:3007
2. Go to **Business Rules Engine**
3. Click **Capital Markets** button (or **Create Rule Set** for direct creation)

### Creating a Rule Set

#### Method 1: From Template
1. Click **Create Rule Set**
2. Go to **Templates** tab
3. Select a template (e.g., "Equity Trading")
4. Click **Apply Template**
5. Customize configuration as needed
6. Save the rule set

#### Method 2: Custom Rule Set
1. Click **Create Rule Set**
2. Fill in **Details** tab:
   - Name: Descriptive name for your rule set
   - Category: Select asset class (EQUITY, FIXED_INCOME, etc.)
   - Description: Purpose and scope
   - Instrument Type: Specific instrument (optional)

3. Go to **Rules** tab:
   - Use search to find rules
   - Filter by category
   - Select multiple rules (checkbox)
   - System automatically handles dependencies

4. Configure in **Configuration** tab:
   - Set category-specific parameters
   - Add custom metadata (JSON format)

5. Click **Save Rule Set**

### Validating Rule Sets

Before deployment, validate your rule set:

1. Open your rule set
2. Click **Validate** button
3. Review validation results:
   - ✅ **Green**: No issues
   - ⚠️ **Yellow**: Warnings (can proceed)
   - ❌ **Red**: Errors (must fix)

Common validation checks:
- Required rules for category
- Rule dependencies satisfied
- No conflicting rules
- Regulatory compliance
- Gas optimization

### Deploying to Blockchain

1. Open validated rule set
2. Go to **Deploy** tab
3. Select blockchain network:
   - Choose between testnet/mainnet
   - Review gas estimates

4. Configure deployment options:
   - Contract name
   - Verify on block explorer
   - Enable monitoring
   - Multi-signature (for production)

5. Click **Deploy to [Network]**
6. Monitor deployment progress
7. Copy contract address when complete

## Rule Categories Explained

### EQUITY Rules
For stock trading and equity markets:
- Trading hours enforcement (9:30 AM - 4:00 PM EST)
- Pattern Day Trader (PDT) requirements ($25,000 minimum)
- Margin requirements (Reg T)
- Short sale restrictions (SSR)

### FIXED_INCOME Rules
For bonds and debt securities:
- Qualified Institutional Buyer (QIB) verification
- Minimum denomination ($100,000+)
- Settlement rules (T+1, T+2)
- TRACE reporting requirements

### PRIVATE_SECURITIES Rules
For private placements (Reg D):
- Accredited investor verification
- Lock-up period enforcement (180 days)
- Transfer restrictions
- Maximum 35 non-accredited investors

### DERIVATIVES Rules
For options and futures:
- Options trading level verification
- Position limits
- Margin requirements
- Automatic exercise rules

### HYBRID Rules
For multi-asset portfolios:
- Cross-asset netting
- Portfolio diversification limits
- Risk management (VaR)
- Liquidity coverage ratios

## Best Practices

### 1. Template Selection
- Start with templates for standard scenarios
- Customize only necessary parameters
- Test on testnet first

### 2. Rule Organization
- Group related rules together
- Set appropriate priorities (higher = executed first)
- Document custom rules clearly

### 3. Compliance Considerations
- Include all required regulatory rules
- Document compliance standards
- Regular audit trail reviews

### 4. Performance Optimization
- Limit to 50-75 rules per set for optimal gas usage
- Use rule categories efficiently
- Consider splitting very large rule sets

### 5. Testing Strategy
1. Create rule set in draft
2. Validate thoroughly
3. Deploy to testnet
4. Test all scenarios
5. Deploy to mainnet

## API Integration

### Creating Rule Set via API
```javascript
const response = await fetch('/api/capital-markets/rule-sets', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    name: 'Equity Trading Rules Q1 2025',
    description: 'Standard equity trading compliance',
    category: 'EQUITY',
    rule_ids: ['rule1', 'rule2', 'rule3'],
    metadata: {
      min_account_balance: 25000,
      max_daily_trades: 4
    }
  })
})
```

### Deploying via API
```javascript
const response = await fetch(`/api/capital-markets/rule-sets/${ruleSetId}/deploy`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    chain: 'base',
    options: {
      testMode: true,
      verifyContract: true,
      gasPrice: 30
    }
  })
})
```

## Troubleshooting

### Common Issues

1. **"Rule set validation failed"**
   - Check all required fields are filled
   - Ensure at least one rule is selected
   - Verify no conflicting rules

2. **"Missing dependencies"**
   - System should auto-add dependencies
   - Manually add if needed via Rules tab

3. **"Gas limit exceeded"**
   - Reduce number of rules
   - Split into multiple rule sets
   - Optimize rule conditions

4. **"Deployment failed"**
   - Check wallet has sufficient funds
   - Verify network connection
   - Try increasing gas price

### Support

For additional help:
- Technical Documentation: `/CAPITAL_MARKETS_ENHANCEMENT.md`
- API Reference: `/api/capital-markets` endpoints
- Support Email: support@monay.com

## Security Considerations

1. **Multi-Signature Wallets**: Use for production deployments
2. **Audit Trail**: All changes are logged
3. **Role-Based Access**: Configure appropriate permissions
4. **Contract Verification**: Always verify on block explorer
5. **Testing**: Thoroughly test on testnet before mainnet

## Regulatory Compliance

The system supports major regulatory frameworks:
- **SEC Regulations**: Rule 144, Reg D, Reg S
- **FINRA Rules**: Rule 4210 (margin), Rule 2360 (options)
- **CFTC Rules**: Position limits, reporting
- **International**: MiFID II, Basel III

Always consult legal counsel for specific compliance requirements.

## Version History

- **v1.0.0** (January 2025): Initial release
  - Hybrid rule sets
  - 6 predefined templates
  - Multi-chain deployment
  - Dependency management
  - Gas optimization

---

**Last Updated**: January 2025
**Status**: Production Ready
**Contact**: engineering@monay.com