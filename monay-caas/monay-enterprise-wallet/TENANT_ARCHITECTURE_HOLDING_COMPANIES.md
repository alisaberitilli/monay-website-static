# 🏗️ Tenant Architecture for Holding Companies in Monay
## Multi-Tenant Design Patterns for Enterprise Groups

---

## 🎯 Core Question
How should Monay structure tenancy for holding companies with multiple subsidiaries?

---

## 📊 Tenant Architecture Options

### Option 1: **Single Tenant with Company Codes** (RECOMMENDED) ✅
One tenant ID for the entire holding group, subsidiaries identified by company codes.

### Option 2: **Multi-Tenant with Shared Access**
Each subsidiary is a separate tenant with cross-tenant visibility.

### Option 3: **Hybrid Approach**
Holding company as master tenant, subsidiaries as sub-tenants.

---

## 🏆 Recommended: Single Tenant with Company Codes

### Architecture Overview

```sql
-- Tenant represents the entire holding group
tenants (
  id UUID PRIMARY KEY,              -- e.g., 'tenant_acme_group'
  tenant_code VARCHAR(50) UNIQUE,   -- 'ACME-GROUP'
  tenant_name VARCHAR(255),         -- 'Acme Holdings Group'
  tenant_type VARCHAR(50),          -- 'enterprise_group'
  status VARCHAR(20),               -- 'active'

  -- Billing & Subscription
  subscription_tier VARCHAR(50),    -- 'enterprise_plus'
  billing_entity_id UUID,           -- Points to holding company

  -- Configuration
  settings JSONB,
  features JSONB,                   -- Enabled features
  limits JSONB,                     -- Transaction limits, user counts

  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Organizations within the tenant (holding + subsidiaries)
organizations (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,          -- Same for entire group
  parent_id UUID,                   -- Hierarchy within tenant
  company_code VARCHAR(50),         -- Unique within tenant

  -- Organization details
  org_type VARCHAR(50),             -- 'holding', 'subsidiary', 'division'
  legal_name VARCHAR(255),
  display_name VARCHAR(255),
  tax_id VARCHAR(50),

  -- ERP Integration
  erp_system VARCHAR(50),           -- Can differ per subsidiary
  erp_company_code VARCHAR(50),     -- ERP's internal code
  erp_configuration JSONB,          -- Subsidiary-specific mappings

  -- Hierarchy
  path_ids UUID[],                  -- For efficient queries
  level INT,

  UNIQUE(tenant_id, company_code),
  INDEX idx_tenant_org (tenant_id, parent_id)
)
```

### Why Single Tenant is Better

#### 1. **Simplified Data Access**
```javascript
// All group data accessible with single tenant context
const getGroupCustomers = async (tenantId) => {
  return await db.customers.findAll({
    where: { tenant_id: tenantId },
    include: [{ model: Organization, attributes: ['name', 'company_code'] }]
  });
};

// No complex cross-tenant queries needed
const consolidatedReport = await generateReport(tenantId);
```

#### 2. **Unified Billing & Licensing**
```javascript
const tenantLimits = {
  tenant_id: 'tenant_acme_group',
  subscription: {
    tier: 'enterprise_plus',
    features: {
      max_subsidiaries: 50,
      max_users: 1000,
      max_transactions_per_month: 1000000,
      consolidation_reporting: true,
      inter_company_invoicing: true,
      multi_currency: true
    },
    billing: {
      method: 'invoice',
      billing_entity: 'org_holding_001',
      amount: 50000, // Monthly
      currency: 'USD'
    }
  }
};
```

#### 3. **Shared Resources**
```javascript
// Shared services across the group
const sharedResources = {
  // Shared customer database
  customers: {
    visibility: 'group_wide',
    sharing_rules: 'configurable'
  },

  // Shared wallet pool
  wallets: {
    treasury: 'holding_level',
    operational: 'per_subsidiary'
  },

  // Shared compliance rules
  compliance: {
    kyc_provider: 'shared',
    aml_rules: 'group_level'
  }
};
```

---

## 🏢 Implementation Pattern

### 1. **Tenant Onboarding for Holding Company**

```javascript
class TenantOnboardingService {
  async onboardHoldingCompany(holdingCompanyData) {
    // 1. Create tenant for the group
    const tenant = await this.createTenant({
      tenant_code: holdingCompanyData.groupCode,
      tenant_name: holdingCompanyData.groupName,
      tenant_type: 'enterprise_group',
      subscription_tier: holdingCompanyData.subscription
    });

    // 2. Create holding company organization
    const holdingOrg = await this.createOrganization({
      tenant_id: tenant.id,
      parent_id: null,
      company_code: holdingCompanyData.holdingCode,
      org_type: 'holding',
      legal_name: holdingCompanyData.legalName
    });

    // 3. Create subsidiaries
    for (const subsidiary of holdingCompanyData.subsidiaries) {
      await this.createOrganization({
        tenant_id: tenant.id,
        parent_id: holdingOrg.id,
        company_code: subsidiary.companyCode,
        org_type: 'subsidiary',
        legal_name: subsidiary.legalName,
        erp_system: subsidiary.erpSystem,
        erp_configuration: subsidiary.erpConfig
      });
    }

    // 4. Setup shared resources
    await this.setupSharedResources(tenant.id);

    return tenant;
  }
}
```

### 2. **Data Isolation with Company Codes**

```javascript
// Middleware for request context
class TenantContextMiddleware {
  async setContext(req, res, next) {
    const tenantId = req.headers['x-tenant-id'];
    const companyCode = req.headers['x-company-code'];

    // Set tenant context
    req.context = {
      tenantId,
      companyCode,
      organizationId: await this.getOrgId(tenantId, companyCode)
    };

    // Apply data filters
    req.dataFilter = this.buildDataFilter(req.context);

    next();
  }

  buildDataFilter(context) {
    // User at holding company level
    if (context.isHoldingUser) {
      return { tenant_id: context.tenantId }; // See everything
    }

    // User at subsidiary level
    return {
      tenant_id: context.tenantId,
      [Op.or]: [
        { organization_id: context.organizationId },
        { shared_across_group: true },
        { visible_to_orgs: { [Op.contains]: [context.organizationId] } }
      ]
    };
  }
}
```

### 3. **API Structure with Company Context**

```javascript
// API routes include company context
router.get('/api/v1/:companyCode/customers', async (req, res) => {
  const { tenantId, organizationId } = req.context;

  const customers = await customerService.getCustomers({
    tenant_id: tenantId,
    organization_id: organizationId,
    include_shared: req.query.includeShared
  });

  res.json(customers);
});

// Inter-company operations
router.post('/api/v1/inter-company/invoice', async (req, res) => {
  const { fromCompanyCode, toCompanyCode, invoiceData } = req.body;

  // Both companies must be in same tenant
  const invoice = await interCompanyService.createInvoice({
    tenant_id: req.context.tenantId,
    from_company: fromCompanyCode,
    to_company: toCompanyCode,
    ...invoiceData
  });

  res.json(invoice);
});
```

---

## 🔄 Comparison: Single vs Multi-Tenant

### Single Tenant Advantages ✅

| Feature | Single Tenant | Multi-Tenant |
|---------|--------------|--------------|
| **Data Queries** | Simple, single tenant filter | Complex cross-tenant joins |
| **Consolidation** | Native, fast | Requires data aggregation |
| **Inter-company** | Direct references | Cross-tenant complexity |
| **Billing** | One invoice | Multiple invoices |
| **User Management** | Centralized | Per-tenant administration |
| **Shared Customers** | Natural sharing | Complex sync required |
| **Performance** | Better (single partition) | Slower (cross-partition) |
| **Compliance** | Unified audit trail | Distributed logs |

### When to Use Multi-Tenant ❌

Only consider multi-tenant if:
- Subsidiaries require complete data isolation (regulatory)
- Subsidiaries are acquired companies with existing tenants
- Different data residency requirements per subsidiary
- Subsidiaries need independent billing

---

## 💾 Database Design for Single Tenant

### Core Tables with Tenant + Organization

```sql
-- All tables include tenant_id and organization_id
customers (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,           -- Group identifier
  organization_id UUID NOT NULL,     -- Subsidiary identifier

  -- Customer data
  name VARCHAR(255),
  email VARCHAR(255),

  -- Sharing configuration
  shared_across_group BOOLEAN DEFAULT false,
  visible_to_orgs UUID[] DEFAULT '{}',

  -- Ensure proper isolation
  INDEX idx_tenant_org (tenant_id, organization_id),
  INDEX idx_tenant_shared (tenant_id, shared_across_group)
);

invoices (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  organization_id UUID NOT NULL,

  -- Invoice data
  invoice_number VARCHAR(100),
  customer_id UUID,
  amount DECIMAL(15,2),

  -- Inter-company tracking
  is_intercompany BOOLEAN DEFAULT false,
  from_org_id UUID,
  to_org_id UUID,

  INDEX idx_tenant_org (tenant_id, organization_id)
);

-- Optimized view for subsidiary data
CREATE VIEW subsidiary_data AS
SELECT * FROM customers
WHERE tenant_id = current_setting('app.tenant_id')
  AND organization_id = current_setting('app.organization_id');
```

---

## 🔐 Security & Access Control

### Row-Level Security (RLS)

```sql
-- Enable RLS for multi-company isolation
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Policy for holding company users
CREATE POLICY holding_company_access ON customers
  FOR ALL
  TO holding_users
  USING (tenant_id = current_setting('app.tenant_id'));

-- Policy for subsidiary users
CREATE POLICY subsidiary_access ON customers
  FOR ALL
  TO subsidiary_users
  USING (
    tenant_id = current_setting('app.tenant_id')
    AND (
      organization_id = current_setting('app.organization_id')
      OR shared_across_group = true
      OR current_setting('app.organization_id')::uuid = ANY(visible_to_orgs)
    )
  );
```

---

## 📈 Scalability Considerations

### Performance Optimization

```sql
-- Partition large tables by tenant for performance
CREATE TABLE customers_partitioned (
  LIKE customers INCLUDING ALL
) PARTITION BY HASH (tenant_id);

-- Create partitions
CREATE TABLE customers_p0 PARTITION OF customers_partitioned
  FOR VALUES WITH (modulus 4, remainder 0);
CREATE TABLE customers_p1 PARTITION OF customers_partitioned
  FOR VALUES WITH (modulus 4, remainder 1);
-- etc...

-- Indexes for common queries
CREATE INDEX idx_tenant_date ON invoices (tenant_id, created_at);
CREATE INDEX idx_tenant_customer ON invoices (tenant_id, customer_id);
```

---

## 🚀 Migration Path

### For Existing Multi-Tenant Setups

```javascript
class TenantConsolidationService {
  async consolidateTenants(subsidiaryTenantIds, newGroupTenantId) {
    // 1. Create new group tenant
    const groupTenant = await this.createGroupTenant(newGroupTenantId);

    // 2. Migrate each subsidiary
    for (const oldTenantId of subsidiaryTenantIds) {
      // Create organization in new tenant
      const org = await this.createOrganization(groupTenant.id, oldTenantId);

      // Migrate data with new tenant_id and organization_id
      await this.migrateCustomers(oldTenantId, groupTenant.id, org.id);
      await this.migrateInvoices(oldTenantId, groupTenant.id, org.id);
      await this.migrateWallets(oldTenantId, groupTenant.id, org.id);
    }

    // 3. Setup inter-company relationships
    await this.setupInterCompanyRelationships(groupTenant.id);

    // 4. Archive old tenants
    await this.archiveOldTenants(subsidiaryTenantIds);
  }
}
```

---

## 🎯 Best Practices

### 1. **Use Single Tenant for New Holdings**
- Simpler implementation
- Better performance
- Easier consolidation

### 2. **Company Code Standards**
```javascript
const companyCodeFormat = {
  holding: 'GROUP-HQ',
  subsidiary: 'GROUP-{COUNTRY}-{NUMBER}',
  examples: [
    'ACME-HQ',      // Holding
    'ACME-US-001',  // US Subsidiary 1
    'ACME-UK-001',  // UK Subsidiary 1
    'ACME-DE-001'   // Germany Subsidiary 1
  ]
};
```

### 3. **Tenant Limits Configuration**
```javascript
const tenantLimits = {
  max_organizations: 100,
  max_users_per_org: 500,
  max_transactions_per_month: 10000000,
  max_wallets: 1000,
  max_intercompany_per_month: 10000
};
```

---

## 📊 Reporting & Analytics

### Consolidated Views

```sql
-- Group-wide customer summary
CREATE MATERIALIZED VIEW group_customer_summary AS
SELECT
  t.tenant_name as group_name,
  o.name as company_name,
  o.company_code,
  COUNT(DISTINCT c.id) as customer_count,
  COUNT(DISTINCT CASE WHEN c.shared_across_group THEN c.id END) as shared_customers
FROM tenants t
JOIN organizations o ON t.id = o.tenant_id
LEFT JOIN customers c ON o.id = c.organization_id
GROUP BY t.tenant_name, o.name, o.company_code;

-- Inter-company transaction summary
CREATE VIEW intercompany_summary AS
SELECT
  t.tenant_name,
  o1.name as from_company,
  o2.name as to_company,
  COUNT(*) as transaction_count,
  SUM(i.amount) as total_amount
FROM invoices i
JOIN tenants t ON i.tenant_id = t.id
JOIN organizations o1 ON i.from_org_id = o1.id
JOIN organizations o2 ON i.to_org_id = o2.id
WHERE i.is_intercompany = true
GROUP BY t.tenant_name, o1.name, o2.name;
```

---

## ✅ Recommendation Summary

### **Use Single Tenant with Company Codes for:**
- ✅ New holding company implementations
- ✅ Groups requiring consolidated reporting
- ✅ Inter-company transactions
- ✅ Shared customer databases
- ✅ Unified billing and licensing
- ✅ Centralized user management

### **Consider Multi-Tenant Only for:**
- ⚠️ Strict regulatory isolation requirements
- ⚠️ Acquired companies with existing tenants
- ⚠️ Different geographic data residency
- ⚠️ Independent subsidiary billing requirements

---

## 🔧 Implementation Checklist

- [ ] Define tenant structure (single vs multi)
- [ ] Create organization hierarchy table
- [ ] Add tenant_id + organization_id to all tables
- [ ] Implement company code standards
- [ ] Setup RLS policies
- [ ] Create consolidated views
- [ ] Build inter-company APIs
- [ ] Implement sharing rules
- [ ] Setup billing at tenant level
- [ ] Create migration scripts

---

*Last Updated: 2025-01-21*
*Version: 1.0*