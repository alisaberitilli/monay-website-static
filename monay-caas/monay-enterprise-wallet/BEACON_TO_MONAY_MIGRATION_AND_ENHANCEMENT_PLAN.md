# 📋 Beacon to Monay Migration and Enhancement Plan
## Complete Enterprise Integration with ERP/CIS, Multi-Tenant Architecture & Flexible Data Storage

---

## 🎯 Executive Summary
This comprehensive plan outlines the migration from Beacon to Monay, incorporating:
- Full ERP/CIS integration with bidirectional sync
- Multi-tenant architecture for holding companies
- Flexible JSONB schema for heterogeneous enterprise data
- Customer management with verification features
- Invoice-first wallet design
- Communication layer via Nudge (stateless)

---

## 🏗️ Architecture Overview

### System Hierarchy & Roles
```
┌──────────────────────────────────────────────────────────────┐
│                   Enterprise ERP/CIS                          │
│                  (Master System of Record)                    │
│  • Ultimate source of truth for all data                      │
│  • Heterogeneous systems (SAP, Oracle, NetSuite, etc.)       │
│  • Company-specific data structures                           │
└────────────────────┬─────────────────────────────────────────┘
                     │ Bidirectional Sync
                     ▼
┌──────────────────────────────────────────────────────────────┐
│                    Monay CaaS Platform                        │
│                   (Operational CRM)                           │
│  • Real-time transaction processing                           │
│  • Core + JSONB flexible data model                           │
│  • Multi-tenant with company codes                            │
│  • Invoice-first wallet architecture                          │
│  • Tokenization & security layer                              │
└────────────────────┬─────────────────────────────────────────┘
                     │ API Calls Only
                     ▼
┌──────────────────────────────────────────────────────────────┐
│                        Nudge API                              │
│                 (Communication Layer Only)                     │
│  • Email/SMS delivery service                                 │
│  • No data storage                                            │
│  • Template management                                        │
│  • Delivery status webhooks                                   │
└──────────────────────────────────────────────────────────────┘
```

---

## 🏢 Multi-Tenant Architecture for Holding Companies

### Recommended Approach: Single Tenant with Company Codes
One tenant ID for entire holding group, subsidiaries identified by company codes.

### Tenant Structure
```sql
-- Single tenant for entire holding group
tenants (
  id UUID PRIMARY KEY,              -- e.g., 'tenant_acme_group'
  tenant_code VARCHAR(50) UNIQUE,   -- 'ACME-GROUP'
  tenant_name VARCHAR(255),         -- 'Acme Holdings Group'
  tenant_type VARCHAR(50),          -- 'enterprise_group'
  subscription_tier VARCHAR(50),    -- 'enterprise_plus'
  billing_entity_id UUID,           -- Points to holding company
  settings JSONB,                   -- Tenant-level configurations
  features JSONB,                   -- Enabled features
  limits JSONB,                     -- Transaction limits
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Organizations within tenant (holding + subsidiaries)
organizations (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,          -- Same for entire group
  parent_id UUID,                   -- Hierarchy within tenant
  company_code VARCHAR(50),         -- Unique within tenant
  org_type VARCHAR(50),             -- 'holding', 'subsidiary'
  legal_name VARCHAR(255),
  erp_system VARCHAR(50),           -- 'SAP', 'Oracle', 'NetSuite'
  erp_configuration JSONB,          -- System-specific mappings
  path_ids UUID[],                  -- For efficient queries
  UNIQUE(tenant_id, company_code)
);
```

---

## 💾 Flexible ERP Data Storage (Core + JSONB Pattern)

### Database Schema with JSONB for Enterprise Flexibility

#### Enhanced Customer Table with ERP Data
```sql
-- Core fields + flexible JSONB for enterprise-specific data
CREATE TABLE customers (
  -- Core Identity Fields (Universal)
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  organization_id UUID NOT NULL,

  -- Core Customer Fields (Common across all ERPs)
  customer_type ENUM('individual', 'business') NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  email_verified BOOLEAN DEFAULT false,
  phone VARCHAR(50),
  phone_verified BOOLEAN DEFAULT false,

  -- Company-specific fields (optional)
  company_code VARCHAR(100),
  tax_id VARCHAR(50),

  -- Multi-tenant sharing
  shared_across_group BOOLEAN DEFAULT false,
  visible_to_orgs UUID[] DEFAULT '{}',

  -- FLEXIBLE ERP DATA STORAGE
  erp_data JSONB DEFAULT '{}',     -- Enterprise-specific fields
  erp_mappings JSONB DEFAULT '{}',  -- Field mappings for sync
  erp_system VARCHAR(50),          -- Which ERP this came from
  erp_sync_status VARCHAR(50),     -- 'synced', 'pending', 'error'
  erp_last_sync TIMESTAMP,

  -- Verification tracking (Monay-specific)
  verification_status ENUM('unverified', 'partial', 'verified') DEFAULT 'unverified',

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Indexes for performance
  INDEX idx_tenant_org (tenant_id, organization_id),
  INDEX idx_email (email),
  INDEX idx_shared (tenant_id, shared_across_group),
  INDEX idx_erp_sync (erp_sync_status, erp_last_sync)
);

-- Example ERP data in JSONB:
-- SAP Customer:
-- erp_data: {
--   "KUNNR": "0000100523",
--   "BUKRS": "1000",
--   "LAND1": "US",
--   "REGIO": "CA",
--   "ORT01": "San Francisco",
--   "PSTLZ": "94105",
--   "STRAS": "123 Market St",
--   "KTOKD": "D001",
--   "custom_fields": { ... }
-- }
--
-- Oracle EBS Customer:
-- erp_data: {
--   "CUSTOMER_NUMBER": "CUST-2024-001",
--   "PARTY_ID": "3000145",
--   "ACCOUNT_NUMBER": "ACC-001",
--   "SITE_USE_CODE": "BILL_TO",
--   "PAYMENT_TERMS": "NET30",
--   "CREDIT_LIMIT": 50000,
--   "GL_CODE_COMBINATIONS": { ... }
-- }
```

#### Enhanced Invoice Table with ERP Data
```sql
CREATE TABLE invoices (
  -- Core Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  organization_id UUID NOT NULL,

  -- Core Invoice Fields
  invoice_number VARCHAR(100) NOT NULL,
  customer_id UUID REFERENCES customers(id),
  amount DECIMAL(15,2),
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50),
  due_date DATE,

  -- Inter-company tracking
  is_intercompany BOOLEAN DEFAULT false,
  from_org_id UUID,
  to_org_id UUID,

  -- Customer snapshot at invoice time
  customer_snapshot JSONB,

  -- FLEXIBLE ERP DATA STORAGE
  erp_data JSONB DEFAULT '{}',      -- Enterprise-specific invoice data
  erp_document_type VARCHAR(50),    -- 'AR_INVOICE', 'SALES_ORDER', etc.
  erp_reference VARCHAR(255),       -- Original ERP document number
  erp_sync_status VARCHAR(50),
  erp_last_sync TIMESTAMP,

  -- Line items with flexible structure
  line_items JSONB DEFAULT '[]',    -- Array of line items with ERP-specific fields

  -- Wallet linkage (Monay-specific)
  wallet_id UUID,
  card_id UUID,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_tenant_org (tenant_id, organization_id),
  INDEX idx_customer (customer_id),
  INDEX idx_intercompany (is_intercompany, from_org_id, to_org_id)
);

-- Example line_items in JSONB:
-- line_items: [
--   {
--     "line_number": 1,
--     "description": "Professional Services",
--     "quantity": 10,
--     "unit_price": 150.00,
--     "amount": 1500.00,
--     "erp_fields": {
--       "GL_ACCOUNT": "4000-1000-100",
--       "COST_CENTER": "CC100",
--       "PROJECT_CODE": "PROJ-2024-001",
--       "WBS_ELEMENT": "WBS.1.2.3"
--     }
--   }
-- ]
```

#### ERP Field Mapping Configuration
```sql
CREATE TABLE erp_field_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  erp_system VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL, -- 'customer', 'invoice', 'payment'

  -- Mapping configuration
  field_mappings JSONB NOT NULL,
  -- Example:
  -- {
  --   "monay_to_erp": {
  --     "name": "NAME1",
  --     "email": "SMTP_ADDR",
  --     "phone": "TEL_NUMBER"
  --   },
  --   "erp_to_monay": {
  --     "KUNNR": "customer_code",
  --     "NAME1": "name",
  --     "SMTP_ADDR": "email"
  --   },
  --   "custom_transformations": [...]
  -- }

  validation_rules JSONB,
  transformation_scripts JSONB,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(tenant_id, organization_id, erp_system, entity_type)
);
```

---

## 🔄 ERP Integration Services

### Bidirectional Sync Architecture

#### ERP Sync Service Implementation
```javascript
class ERPSyncService {
  constructor() {
    this.adapters = {
      'SAP': new SAPAdapter(),
      'Oracle': new OracleAdapter(),
      'NetSuite': new NetSuiteAdapter(),
      'Dynamics': new DynamicsAdapter(),
      'Custom': new CustomERPAdapter()
    };
  }

  // Sync customer from ERP to Monay
  async importCustomerFromERP(organizationId, erpCustomerId) {
    const org = await this.getOrganization(organizationId);
    const adapter = this.adapters[org.erp_system];
    const mappings = await this.getFieldMappings(organizationId, 'customer');

    // Fetch from ERP
    const erpData = await adapter.getCustomer(erpCustomerId);

    // Transform to Monay structure
    const monayCustomer = {
      // Core fields
      name: this.mapField(erpData, mappings, 'name'),
      email: this.mapField(erpData, mappings, 'email'),
      phone: this.mapField(erpData, mappings, 'phone'),

      // Store original ERP data
      erp_data: erpData,
      erp_system: org.erp_system,
      erp_sync_status: 'synced',
      erp_last_sync: new Date()
    };

    // Upsert in Monay database
    return await this.upsertCustomer(monayCustomer);
  }

  // Sync customer from Monay to ERP
  async exportCustomerToERP(customerId) {
    const customer = await this.getCustomer(customerId);
    const org = await this.getOrganization(customer.organization_id);
    const adapter = this.adapters[org.erp_system];
    const mappings = await this.getFieldMappings(org.id, 'customer');

    // Transform Monay data to ERP format
    const erpData = this.transformToERP(customer, mappings);

    // Push to ERP
    const result = await adapter.upsertCustomer(erpData);

    // Update sync status
    await this.updateSyncStatus(customerId, 'synced', result);

    return result;
  }

  // Batch reconciliation
  async reconcileWithERP(tenantId, options = {}) {
    const organizations = await this.getOrganizations(tenantId);

    for (const org of organizations) {
      const adapter = this.adapters[org.erp_system];

      // Get modified records from ERP
      const erpChanges = await adapter.getModifiedRecords(
        org.erp_last_sync || new Date(0)
      );

      // Import changes
      for (const change of erpChanges) {
        await this.processERPChange(org.id, change);
      }

      // Push Monay changes to ERP
      const monayChanges = await this.getPendingSyncRecords(org.id);
      for (const record of monayChanges) {
        await this.syncToERP(record);
      }
    }
  }
}
```

### ERP Adapter Pattern for Different Systems
```javascript
// Base adapter interface
class ERPAdapter {
  async connect() { throw new Error('Not implemented'); }
  async getCustomer(id) { throw new Error('Not implemented'); }
  async upsertCustomer(data) { throw new Error('Not implemented'); }
  async getInvoice(id) { throw new Error('Not implemented'); }
  async upsertInvoice(data) { throw new Error('Not implemented'); }
}

// SAP Adapter implementation
class SAPAdapter extends ERPAdapter {
  async connect() {
    // SAP RFC connection
    this.client = new SAPClient({
      ashost: process.env.SAP_HOST,
      sysnr: process.env.SAP_SYSNR,
      client: process.env.SAP_CLIENT,
      user: process.env.SAP_USER,
      passwd: process.env.SAP_PASSWORD
    });
  }

  async getCustomer(kunnr) {
    const result = await this.client.call('RFC_READ_TABLE', {
      QUERY_TABLE: 'KNA1',
      OPTIONS: [{ TEXT: `KUNNR = '${kunnr}'` }]
    });
    return this.parseTableData(result);
  }
}

// Oracle Adapter implementation
class OracleAdapter extends ERPAdapter {
  async connect() {
    this.connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECTION_STRING
    });
  }

  async getCustomer(customerId) {
    const result = await this.connection.execute(
      `SELECT * FROM AR_CUSTOMERS WHERE CUSTOMER_ID = :id`,
      [customerId]
    );
    return result.rows[0];
  }
}
```

---

## 📊 Complete Database Migration Plan

### Phase 1: Core Schema with Multi-Tenant Support
**Timeline: Week 1**

#### 1.1 Tenant & Organization Tables
```sql
-- Already defined above in Multi-Tenant Architecture section
```

#### 1.2 Enhanced Customer Table with ERP Fields
```sql
-- Already defined above in Flexible ERP Data Storage section
```

#### 1.3 Customer Contacts with Verification
```sql
CREATE TABLE customer_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  contact_type ENUM('mobile', 'landline', 'email', 'fax') NOT NULL,
  contact_value VARCHAR(255) NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP NULL,
  verification_code VARCHAR(10),
  verification_attempts INT DEFAULT 0,
  last_verification_sent TIMESTAMP NULL,
  erp_data JSONB DEFAULT '{}',  -- ERP-specific contact fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  INDEX idx_tenant_customer (tenant_id, customer_id)
);
```

#### 1.4 Customer Addresses with Verification
```sql
CREATE TABLE customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  address_type ENUM('billing', 'shipping', 'both') DEFAULT 'billing',

  -- Core address fields
  street_address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(2) DEFAULT 'US',

  -- Google validation
  is_verified BOOLEAN DEFAULT false,
  google_place_id VARCHAR(255),
  formatted_address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- ERP-specific address data
  erp_data JSONB DEFAULT '{}',
  erp_address_code VARCHAR(100),  -- ERP's address identifier

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  INDEX idx_tenant_customer (tenant_id, customer_id)
);
```

#### 1.5 Invoice-Wallet Relationship Tables
```sql
CREATE TABLE invoice_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  invoice_id UUID NOT NULL,
  wallet_id UUID NOT NULL,
  card_id UUID NOT NULL,  -- Every wallet MUST have a card

  -- Wallet configuration
  wallet_type VARCHAR(50) DEFAULT 'invoice_payment',
  spending_limit DECIMAL(15,2),
  expiry_date DATE,

  -- Card configuration
  card_type VARCHAR(50) DEFAULT 'virtual',
  card_status VARCHAR(50) DEFAULT 'active',

  -- ERP linkage
  erp_cost_center VARCHAR(100),
  erp_gl_account VARCHAR(100),
  erp_data JSONB DEFAULT '{}',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (invoice_id) REFERENCES invoices(id),
  INDEX idx_tenant_org (tenant_id, organization_id),
  INDEX idx_invoice (invoice_id)
);
```

---

## 🔧 Backend Implementation Plan

### Phase 2: Core Services with ERP Integration
**Timeline: Week 2-3**

#### 2.1 Multi-Tenant Context Service
```javascript
// src/services/tenant-context.service.js
class TenantContextService {
  async setContext(req) {
    const tenantId = req.headers['x-tenant-id'];
    const companyCode = req.headers['x-company-code'];

    const organization = await this.getOrganization(tenantId, companyCode);

    req.context = {
      tenantId,
      organizationId: organization.id,
      companyCode,
      erpSystem: organization.erp_system,
      isHoldingCompany: organization.org_type === 'holding',
      permissions: await this.getPermissions(req.user, organization)
    };

    // Apply data filters based on context
    req.dataFilter = this.buildDataFilter(req.context);
  }

  buildDataFilter(context) {
    if (context.isHoldingCompany) {
      // See all data in tenant
      return { tenant_id: context.tenantId };
    }

    // See own org data + shared data
    return {
      tenant_id: context.tenantId,
      [Op.or]: [
        { organization_id: context.organizationId },
        { shared_across_group: true }
      ]
    };
  }
}
```

#### 2.2 ERP Field Mapping Service
```javascript
// src/services/erp-mapping.service.js
class ERPMappingService {
  async mapCustomerData(customer, targetSystem, direction = 'monay_to_erp') {
    const mappings = await this.getMappings(
      customer.tenant_id,
      customer.organization_id,
      targetSystem,
      'customer'
    );

    if (direction === 'monay_to_erp') {
      return this.mapMonayToERP(customer, mappings);
    } else {
      return this.mapERPToMonay(customer, mappings);
    }
  }

  mapMonayToERP(customer, mappings) {
    const result = {};

    // Map core fields
    for (const [monayField, erpField] of Object.entries(mappings.monay_to_erp)) {
      if (customer[monayField] !== undefined) {
        result[erpField] = customer[monayField];
      }
    }

    // Include ERP-specific fields
    if (customer.erp_data) {
      Object.assign(result, customer.erp_data);
    }

    // Apply transformations
    if (mappings.custom_transformations) {
      result = this.applyTransformations(result, mappings.custom_transformations);
    }

    return result;
  }
}
```

#### 2.3 Customer Service with ERP Support
```javascript
// src/services/customer.service.js
class CustomerService {
  async createCustomer(data, context) {
    // Create in Monay
    const customer = await Customer.create({
      ...data,
      tenant_id: context.tenantId,
      organization_id: context.organizationId,
      erp_system: context.erpSystem,
      erp_sync_status: 'pending'
    });

    // Queue for ERP sync
    await this.queueERPSync(customer.id, 'create');

    return customer;
  }

  async searchCustomers(query, context) {
    const filter = {
      ...context.dataFilter,
      [Op.or]: [
        { name: { [Op.iLike]: `%${query}%` } },
        { email: { [Op.iLike]: `%${query}%` } },
        { company_code: { [Op.iLike]: `%${query}%` } },
        // Search in JSONB fields
        { 'erp_data.KUNNR': { [Op.iLike]: `%${query}%` } }
      ]
    };

    return Customer.findAll({ where: filter });
  }

  async importFromERP(organizationId, erpCustomerIds) {
    const results = [];

    for (const erpId of erpCustomerIds) {
      try {
        const customer = await this.erpSyncService.importCustomerFromERP(
          organizationId,
          erpId
        );
        results.push({ success: true, customer });
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }

    return results;
  }
}
```

#### 2.4 Invoice Service with Wallet Integration
```javascript
// src/services/invoice.service.js
class InvoiceService {
  async createInvoice(data, context) {
    // Create invoice
    const invoice = await Invoice.create({
      ...data,
      tenant_id: context.tenantId,
      organization_id: context.organizationId,
      erp_sync_status: 'pending'
    });

    // Create associated wallet and card (Invoice-First design)
    const wallet = await this.createInvoiceWallet(invoice);
    const card = await this.issueVirtualCard(wallet, invoice);

    // Link invoice to wallet
    await InvoiceWallet.create({
      tenant_id: context.tenantId,
      organization_id: context.organizationId,
      invoice_id: invoice.id,
      wallet_id: wallet.id,
      card_id: card.id,
      spending_limit: invoice.amount,
      expiry_date: invoice.due_date
    });

    // Queue for ERP sync
    await this.queueERPSync(invoice.id, 'create');

    return invoice;
  }

  async createInvoiceWallet(invoice) {
    return await WalletService.create({
      name: `Invoice ${invoice.invoice_number}`,
      type: 'invoice_payment',
      balance: 0,
      spending_limit: invoice.amount,
      metadata: {
        invoice_id: invoice.id,
        customer_id: invoice.customer_id
      }
    });
  }

  async issueVirtualCard(wallet, invoice) {
    return await CardService.issueCard({
      wallet_id: wallet.id,
      type: 'virtual',
      spending_limit: invoice.amount,
      expiry_date: invoice.due_date,
      auto_issued: true,
      metadata: {
        invoice_id: invoice.id
      }
    });
  }
}
```

### Phase 3: API Routes with Multi-Tenant Support
**Timeline: Week 3**

#### 3.1 Customer API Routes
```javascript
// src/routes/customers.js
router.use(tenantContext.middleware());

// List customers with tenant filtering
router.get('/api/customers', async (req, res) => {
  const customers = await customerService.findAll(req.context.dataFilter);
  res.json(customers);
});

// Search across organization or group
router.get('/api/customers/search', async (req, res) => {
  const { q, scope = 'organization' } = req.query;

  let filter = req.context.dataFilter;
  if (scope === 'group' && req.context.isHoldingCompany) {
    filter = { tenant_id: req.context.tenantId };
  }

  const customers = await customerService.search(q, filter);
  res.json(customers);
});

// Import from ERP
router.post('/api/customers/import', async (req, res) => {
  const { erp_ids, source_system } = req.body;

  const results = await customerService.importFromERP(
    req.context.organizationId,
    erp_ids
  );

  res.json(results);
});

// Inter-company customer sharing
router.post('/api/customers/:id/share', async (req, res) => {
  const { organization_ids } = req.body;

  await customerService.shareWithOrganizations(
    req.params.id,
    organization_ids,
    req.context
  );

  res.json({ success: true });
});
```

#### 3.2 ERP Sync Management Routes
```javascript
// src/routes/erp-sync.js

// Manual sync trigger
router.post('/api/erp/sync/customer/:id', async (req, res) => {
  const result = await erpSyncService.syncCustomer(
    req.params.id,
    req.context
  );
  res.json(result);
});

// Batch reconciliation
router.post('/api/erp/reconcile', async (req, res) => {
  const job = await erpSyncService.scheduleReconciliation(
    req.context.tenantId
  );
  res.json({ job_id: job.id, status: 'scheduled' });
});

// Field mapping configuration
router.get('/api/erp/mappings', async (req, res) => {
  const mappings = await erpMappingService.getMappings(
    req.context.organizationId
  );
  res.json(mappings);
});

router.put('/api/erp/mappings', async (req, res) => {
  await erpMappingService.updateMappings(
    req.context.organizationId,
    req.body
  );
  res.json({ success: true });
});
```

---

## 💻 Frontend Components

### Phase 4: UI Components with Multi-Tenant Support
**Timeline: Week 3-4**

#### 4.1 Organization Selector Component
```typescript
// src/components/OrganizationSelector.tsx
interface OrganizationSelectorProps {
  tenantId: string;
  currentOrgId: string;
  onOrganizationChange: (orgId: string) => void;
}

export function OrganizationSelector({
  tenantId,
  currentOrgId,
  onOrganizationChange
}: OrganizationSelectorProps) {
  const [organizations, setOrganizations] = useState([]);

  useEffect(() => {
    // Load organizations for tenant
    api.get(`/api/organizations?tenant_id=${tenantId}`)
      .then(res => setOrganizations(res.data));
  }, [tenantId]);

  return (
    <Select value={currentOrgId} onChange={onOrganizationChange}>
      {organizations.map(org => (
        <option key={org.id} value={org.id}>
          {org.display_name} ({org.company_code})
          {org.org_type === 'holding' && ' - Holding'}
        </option>
      ))}
    </Select>
  );
}
```

#### 4.2 Customer Search with ERP Data
```typescript
// src/components/CustomerSearch.tsx
interface CustomerSearchProps {
  onSelect: (customer: Customer) => void;
  includeERPData?: boolean;
  searchScope?: 'organization' | 'group';
}

export function CustomerSearch({
  onSelect,
  includeERPData = true,
  searchScope = 'organization'
}: CustomerSearchProps) {
  const [results, setResults] = useState([]);

  const search = debounce(async (query: string) => {
    const { data } = await api.get('/api/customers/search', {
      params: { q: query, scope: searchScope }
    });
    setResults(data);
  }, 300);

  return (
    <div>
      <input onChange={(e) => search(e.target.value)} />
      {results.map(customer => (
        <div key={customer.id} onClick={() => onSelect(customer)}>
          <span>{customer.name}</span>
          {customer.shared_across_group && <Badge>Shared</Badge>}
          {includeERPData && customer.erp_data?.KUNNR && (
            <span className="text-sm">ERP: {customer.erp_data.KUNNR}</span>
          )}
        </div>
      ))}
    </div>
  );
}
```

#### 4.3 ERP Field Mapping Editor
```typescript
// src/components/ERPFieldMapper.tsx
interface ERPFieldMapperProps {
  organizationId: string;
  entityType: 'customer' | 'invoice';
}

export function ERPFieldMapper({ organizationId, entityType }: ERPFieldMapperProps) {
  const [mappings, setMappings] = useState({});

  const addMapping = (monayField: string, erpField: string) => {
    setMappings({
      ...mappings,
      monay_to_erp: {
        ...mappings.monay_to_erp,
        [monayField]: erpField
      }
    });
  };

  const saveMapping = async () => {
    await api.put('/api/erp/mappings', {
      organization_id: organizationId,
      entity_type: entityType,
      field_mappings: mappings
    });
  };

  return (
    <div className="p-4 border rounded">
      <h3>ERP Field Mappings</h3>
      <table>
        <thead>
          <tr>
            <th>Monay Field</th>
            <th>ERP Field</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(mappings.monay_to_erp || {}).map(([monay, erp]) => (
            <tr key={monay}>
              <td>{monay}</td>
              <td>{erp}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={saveMapping}>Save Mappings</button>
    </div>
  );
}
```

---

## 🚀 Enterprise Onboarding Process

### Overview
A comprehensive, wizard-driven onboarding process is essential to properly configure each enterprise tenant based on their specific ERP system, organizational structure, and business requirements.

### Onboarding Phases

#### Phase 1: Organization Discovery (Day 1)
```javascript
// Step 1: Basic Organization Setup
{
  tenant_name: "Acme Holdings Group",
  tenant_type: "enterprise_group", // or "single_company"
  primary_contact: {
    name: "John Doe",
    email: "john@acme.com",
    role: "IT Director"
  }
}

// Step 2: Organization Structure Discovery
{
  has_subsidiaries: true,
  subsidiary_count: 5,
  countries_of_operation: ["US", "UK", "DE", "JP"],
  consolidated_reporting: true
}

// Step 3: ERP System Identification
{
  erp_system: "SAP",  // Dropdown: SAP, Oracle, NetSuite, Dynamics, QuickBooks, Custom
  erp_version: "S/4HANA 2021",
  uses_subledger: true,  // Critical decision point
  has_custom_fields: true,
  integration_method: "API" // or "File", "Database"
}
```

#### Phase 2: ERP Configuration & Field Mapping (Day 2-3)

##### 2.1 Connection Setup
```javascript
class ERPConnectionWizard {
  async testConnection(config) {
    switch(config.erp_system) {
      case 'SAP':
        return await this.testSAPConnection({
          host: config.sap_host,
          system_number: config.sap_sysnr,
          client: config.sap_client,
          username: config.username,
          password: config.password
        });

      case 'Oracle':
        return await this.testOracleConnection({
          hostname: config.oracle_host,
          service_name: config.oracle_service,
          username: config.username,
          password: config.password
        });

      case 'API':
        return await this.testAPIConnection({
          endpoint: config.api_endpoint,
          auth_type: config.auth_type,
          credentials: config.credentials
        });
    }
  }
}
```

##### 2.2 Automatic Field Discovery
```javascript
class FieldDiscoveryService {
  async discoverERPSchema(connection) {
    const schema = await connection.getSchema();

    // Auto-detect common fields
    const suggestedMappings = {
      customer_fields: this.detectCustomerFields(schema),
      invoice_fields: this.detectInvoiceFields(schema),
      account_fields: this.detectAccountFields(schema)
    };

    // Present to user for confirmation/adjustment
    return {
      detected_tables: schema.tables,
      suggested_mappings: suggestedMappings,
      custom_fields: schema.custom_fields
    };
  }

  detectCustomerFields(schema) {
    // Smart detection based on common patterns
    const patterns = {
      customer_id: ['KUNNR', 'CUSTOMER_ID', 'CUST_ID', 'CustomerNumber'],
      customer_name: ['NAME1', 'CUSTOMER_NAME', 'CompanyName'],
      tax_id: ['STCD1', 'TAX_ID', 'VAT_NUMBER', 'TaxID']
    };

    return this.matchPatterns(schema, patterns);
  }
}
```

##### 2.3 Interactive Field Mapping UI
```typescript
// Frontend Component for Field Mapping
interface FieldMappingProps {
  erpFields: ERPField[];
  monayFields: MonayField[];
  suggestedMappings: FieldMapping[];
}

export function FieldMappingWizard({
  erpFields,
  monayFields,
  suggestedMappings
}: FieldMappingProps) {
  const [mappings, setMappings] = useState(suggestedMappings);

  return (
    <div className="field-mapping-wizard">
      <h3>Map Your ERP Fields to Monay</h3>

      {/* Core Required Fields */}
      <section>
        <h4>Required Fields</h4>
        {monayFields.filter(f => f.required).map(field => (
          <FieldMappingRow
            key={field.name}
            monayField={field}
            erpFields={erpFields}
            currentMapping={mappings[field.name]}
            onChange={(erpField) => updateMapping(field.name, erpField)}
          />
        ))}
      </section>

      {/* Optional/Custom Fields */}
      <section>
        <h4>Optional Fields</h4>
        {/* Allow adding custom field mappings */}
        <AddCustomFieldMapping />
      </section>

      {/* Test Mapping with Sample Data */}
      <section>
        <h4>Test Your Mappings</h4>
        <SampleDataValidator mappings={mappings} />
      </section>
    </div>
  );
}
```

#### Phase 3: Account Structure Configuration (Day 4)

##### 3.1 Determine Account Requirements
```javascript
class AccountStructureWizard {
  async configureAccounts(tenant, erpConfig) {
    // Decision tree for account structure
    const needsAccounts = await this.checkAccountRequirements({
      erp_system: erpConfig.erp_system,
      uses_subledger: erpConfig.uses_subledger,
      has_mass_billing: tenant.requirements.mass_billing,
      customer_count: tenant.estimated_customer_count
    });

    if (!needsAccounts) {
      // Simple structure: Customer → Invoice
      return {
        uses_accounts: false,
        account_structure: 'simple'
      };
    }

    // Complex structure: Customer → Account(s) → Invoice
    return {
      uses_accounts: true,
      account_structure: 'hierarchical',
      account_levels: await this.configureAccountHierarchy(),
      gl_mapping: await this.configureGLMapping()
    };
  }
}
```

##### 3.2 GL Account Mapping
```javascript
// For organizations using subledger
const glMappingConfig = {
  default_ar_account: "1200-000-000",  // Accounts Receivable
  default_revenue_account: "4000-000-000",  // Revenue

  // Department/Division specific mappings
  department_mappings: [
    {
      department_code: "IT",
      ar_account: "1200-100-000",
      revenue_account: "4000-100-000"
    },
    {
      department_code: "SALES",
      ar_account: "1200-200-000",
      revenue_account: "4000-200-000"
    }
  ]
};
```

#### Phase 4: Data Import & Validation (Day 5-7)

##### 4.1 Initial Data Import
```javascript
class DataImportWizard {
  async importInitialData(tenant) {
    const steps = [
      {
        name: 'Import Organizations',
        handler: () => this.importOrganizations(tenant),
        required: true
      },
      {
        name: 'Import Customers',
        handler: () => this.importCustomers(tenant),
        required: true,
        validator: this.validateCustomers
      },
      {
        name: 'Import Customer Accounts',
        handler: () => this.importAccounts(tenant),
        required: tenant.uses_accounts,
        validator: this.validateAccounts
      },
      {
        name: 'Import Open Invoices',
        handler: () => this.importInvoices(tenant),
        required: false,
        validator: this.validateInvoices
      }
    ];

    return await this.executeStepsWithRollback(steps);
  }

  async validateCustomers(customers) {
    const errors = [];

    for (const customer of customers) {
      // Validate required fields
      if (!customer.name) errors.push(`Customer missing name: ${customer.id}`);
      if (!customer.email && !customer.phone) {
        errors.push(`Customer missing contact info: ${customer.id}`);
      }

      // Validate ERP references
      if (customer.erp_data && !customer.erp_data.customer_code) {
        errors.push(`Customer missing ERP code: ${customer.id}`);
      }
    }

    return { valid: errors.length === 0, errors };
  }
}
```

##### 4.2 Import Templates
```javascript
// Provide CSV/Excel templates for manual import
const importTemplates = {
  customers: {
    headers: ['name', 'email', 'phone', 'tax_id', 'erp_customer_code'],
    sample_data: [
      ['Acme Corp', 'contact@acme.com', '+1-555-0100', '12-3456789', 'CUST001'],
      ['Beta Inc', 'info@beta.com', '+1-555-0200', '98-7654321', 'CUST002']
    ]
  },

  accounts: {
    headers: ['customer_code', 'account_number', 'account_name', 'credit_limit', 'payment_terms'],
    sample_data: [
      ['CUST001', 'ACC-001-01', 'Acme Corp - Main', '100000', 'NET30'],
      ['CUST001', 'ACC-001-02', 'Acme Corp - Projects', '50000', 'NET60']
    ]
  }
};
```

#### Phase 5: Testing & Validation (Day 8-9)

##### 5.1 End-to-End Testing
```javascript
class OnboardingValidator {
  async runValidationSuite(tenant) {
    const tests = [
      {
        name: 'ERP Connection Test',
        test: () => this.testERPConnection(tenant)
      },
      {
        name: 'Field Mapping Test',
        test: () => this.testFieldMappings(tenant)
      },
      {
        name: 'Customer Sync Test',
        test: () => this.testCustomerSync(tenant)
      },
      {
        name: 'Invoice Creation Test',
        test: () => this.testInvoiceCreation(tenant)
      },
      {
        name: 'Account Hierarchy Test',
        test: () => this.testAccountHierarchy(tenant),
        condition: () => tenant.uses_accounts
      },
      {
        name: 'Inter-Company Test',
        test: () => this.testInterCompany(tenant),
        condition: () => tenant.has_subsidiaries
      }
    ];

    const results = await this.runTests(tests);
    return this.generateValidationReport(results);
  }
}
```

##### 5.2 User Acceptance Testing
```javascript
// Provide sandbox environment for testing
const sandboxConfig = {
  create_test_customers: 10,
  create_test_invoices: 50,
  enable_test_payments: true,
  test_period_days: 7,

  test_scenarios: [
    'Create new customer',
    'Import customer from ERP',
    'Create invoice with auto-wallet',
    'Process payment',
    'Generate consolidated report'
  ]
};
```

#### Phase 6: Production Configuration (Day 10)

##### 6.1 Final Configuration
```javascript
const productionConfig = {
  // Security Settings
  security: {
    enforce_2fa: true,
    ip_whitelist: ['203.0.113.0/24'],
    api_rate_limits: {
      reads_per_minute: 1000,
      writes_per_minute: 100
    }
  },

  // Sync Configuration
  sync_settings: {
    erp_sync_enabled: true,
    sync_interval_minutes: 15,
    sync_batch_size: 100,
    error_retry_count: 3
  },

  // Notification Settings
  notifications: {
    sync_failures: ['it-team@acme.com'],
    daily_summary: ['finance@acme.com'],
    threshold_alerts: {
      failed_transactions: 10,
      sync_errors: 5
    }
  }
};
```

##### 6.2 Go-Live Checklist
```javascript
const goLiveChecklist = [
  { task: 'All validation tests passed', required: true },
  { task: 'Production credentials configured', required: true },
  { task: 'SSL certificates installed', required: true },
  { task: 'Backup strategy configured', required: true },
  { task: 'Monitoring alerts set up', required: true },
  { task: 'User training completed', required: true },
  { task: 'Support contacts established', required: true },
  { task: 'Rollback plan documented', required: true }
];
```

### Onboarding UI/UX Flow

#### Step-by-Step Wizard Interface
```typescript
interface OnboardingWizardProps {
  tenant: Tenant;
  currentStep: number;
  onComplete: (config: TenantConfig) => void;
}

export function OnboardingWizard({ tenant, currentStep, onComplete }: OnboardingWizardProps) {
  const steps = [
    { id: 1, name: 'Organization Setup', component: OrgSetupStep },
    { id: 2, name: 'ERP Configuration', component: ERPConfigStep },
    { id: 3, name: 'Field Mapping', component: FieldMappingStep },
    { id: 4, name: 'Account Structure', component: AccountStructureStep },
    { id: 5, name: 'Data Import', component: DataImportStep },
    { id: 6, name: 'Testing', component: TestingStep },
    { id: 7, name: 'Review & Launch', component: ReviewLaunchStep }
  ];

  return (
    <div className="onboarding-wizard">
      {/* Progress Indicator */}
      <ProgressBar current={currentStep} total={steps.length} />

      {/* Current Step */}
      <StepContent step={steps[currentStep]} />

      {/* Navigation */}
      <WizardNavigation
        canGoBack={currentStep > 0}
        canGoNext={isStepComplete(currentStep)}
        onBack={() => setStep(currentStep - 1)}
        onNext={() => setStep(currentStep + 1)}
        onSkip={() => skipOptionalStep()}
      />

      {/* Help & Support */}
      <OnboardingSupport
        currentStep={currentStep}
        showChat={true}
        showDocs={true}
      />
    </div>
  );
}
```

### Onboarding Service Implementation
```javascript
class EnterpriseOnboardingService {
  constructor() {
    this.steps = [];
    this.currentStep = 0;
    this.config = {};
  }

  async startOnboarding(tenantId) {
    const session = await this.createOnboardingSession(tenantId);

    // Track progress
    await this.trackProgress(session.id, 'started');

    // Load tenant-specific requirements
    const requirements = await this.analyzeTenantRequirements(tenantId);

    // Generate custom onboarding flow
    this.steps = this.generateOnboardingSteps(requirements);

    return session;
  }

  async saveProgress(session, stepData) {
    // Save configuration incrementally
    await this.updateConfiguration(session.tenant_id, stepData);

    // Update progress tracking
    await this.trackProgress(session.id, `completed_step_${this.currentStep}`);

    // Move to next step
    this.currentStep++;
  }

  async completeOnboarding(session) {
    // Final validation
    const validation = await this.validateConfiguration(session.tenant_id);

    if (!validation.isValid) {
      throw new Error(`Configuration invalid: ${validation.errors.join(', ')}`);
    }

    // Activate tenant
    await this.activateTenant(session.tenant_id);

    // Send welcome email
    await this.sendWelcomePackage(session.tenant_id);

    // Schedule follow-up
    await this.scheduleFollowUp(session.tenant_id, 7); // 7 days

    return {
      success: true,
      tenant_id: session.tenant_id,
      activation_date: new Date()
    };
  }
}
```

### Onboarding Automation Tools

#### 1. ERP Auto-Discovery
```javascript
class ERPAutoDiscovery {
  async detectERPSystem(connectionString) {
    // Try common patterns
    const patterns = [
      { pattern: /sap/i, system: 'SAP' },
      { pattern: /oracle/i, system: 'Oracle' },
      { pattern: /netsuite/i, system: 'NetSuite' },
      { pattern: /dynamics/i, system: 'Dynamics' }
    ];

    for (const p of patterns) {
      if (p.pattern.test(connectionString)) {
        return p.system;
      }
    }

    // Try connection probing
    return await this.probeConnection(connectionString);
  }
}
```

#### 2. Intelligent Field Mapping
```javascript
class IntelligentMapper {
  async suggestMappings(sourceFields, targetFields) {
    // Use ML/AI for field matching
    const suggestions = [];

    for (const source of sourceFields) {
      const bestMatch = await this.findBestMatch(source, targetFields);

      if (bestMatch.confidence > 0.8) {
        suggestions.push({
          source: source,
          target: bestMatch.field,
          confidence: bestMatch.confidence,
          auto_mapped: true
        });
      }
    }

    return suggestions;
  }
}
```

### Post-Onboarding Support

#### 30-Day Success Program
```javascript
const successProgram = {
  day_1: {
    action: 'Welcome call',
    responsible: 'Customer Success Manager'
  },
  day_7: {
    action: 'First week review',
    metrics: ['users_activated', 'transactions_processed', 'sync_success_rate']
  },
  day_14: {
    action: 'Training webinar',
    topics: ['Advanced features', 'Best practices', 'Q&A']
  },
  day_30: {
    action: 'Success review',
    deliverables: ['Usage report', 'Optimization recommendations', 'Roadmap discussion']
  }
};
```

---

## 🚀 Industry-Specific Integration Requirements

### Capital Markets & Secondary Trading (HIGH PRIORITY - Near-term Opportunity)
- **Bloomberg AIM, Charles River, Murex, SimCorp** integration
- Portfolio accounting with complex subledger requirements
- Real-time settlement and position tracking
- Multi-currency and derivatives support
- Prime brokerage and custody account management
- Regulatory reporting (MiFID II, AIFMD)

### Gig Economy & Payout Platforms (HIGHEST PRIORITY - Immediate Value)
- **Uber/Lyft, DoorDash, Instacart** driver platforms
- **Stripe Connect, Hyperwallet** payout infrastructure
- Instant earnings access (sub-60 second)
- 1099 contractor tax management
- High-volume micro-transactions (10,000+ TPS)
- Multi-method payout support (ACH, debit, wallet)

### Supplier & Distributor Platforms (MEDIUM PRIORITY)
- **SAP Ariba, Coupa, Oracle Procurement** integration
- Purchase order to payment workflow
- Dynamic discounting and supply chain finance
- Vendor performance tracking
- Multi-tier approval workflows
- Early payment programs

### Equipment Leasing & Asset Finance (HIGH PRIORITY - Near-term Opportunity)
- **DLL Group** and lease management platforms
- Complex amortization schedules
- Residual value tracking
- ASC 842/IFRS 16 compliance
- Asset lifecycle management
- Insurance and maintenance tracking

### SMB Platforms (MEDIUM PRIORITY)
- **QuickBooks, Xero, Wave, Square** integration
- Simplified data models (no subledger)
- Quick onboarding (<1 day)
- Lower transaction volumes
- Basic payment terms

### Government & GENIUS Act (CRITICAL - July 18, 2025 Deadline)
- **Monay-Fiat Rails Integration** for all payment rails (https://qaapi.monay.com/UtilliGPS/)
  - FedNow instant payments (via Monay-Fiat Rails)
  - RTP network integration (via Monay-Fiat Rails)
  - ACH same-day settlement (via Monay-Fiat Rails)
  - Credit/Debit card processing (via Monay-Fiat Rails)
- **Monay-Fiat Payout API** for disbursements (v1 API)
  - Government benefit payouts
  - Emergency relief payments
  - Instant disbursements
- Digital identity (login.gov, id.me) integration
- Emergency payment infrastructure (<4 hour processing)
- NIST 800-63 IAL2/AAL2 compliance

---

## 📊 REPRIORITIZED Development Roadmap (Government Benefits Focus)

### Phase 0: Critical Infrastructure + Monay-Fiat Rails (Week 1)
**Focus: Foundation with immediate payment rail integration**
- [ ] Core database schema with JSONB flexibility
- [ ] Multi-tenant architecture implementation
- [ ] **Monay-Fiat Rails Integration** (PRIORITY)
  - [ ] Connect to gps.monay.com production endpoint
  - [ ] Configure v3 API for deposits/on-ramp
  - [ ] Configure v1 API for disbursements/off-ramp
- [ ] Enhanced Business Rule Engine for MCC restrictions
- [ ] Authentication and security layer

### Phase 1: Government Benefits Platform (Week 2-4) 🔴 NEW PRIORITY
**Rationale: $930B+ market, regulatory compliance, social impact**

#### Week 2: SNAP Implementation
- [ ] Beneficiary enrollment system
- [ ] Household composition tracking
- [ ] MCC restriction rules (5411, 5422, 5451 allowed)
- [ ] Real-time card authorization via Monay-Fiat Rails
- [ ] Balance management system
- [ ] Monthly ACH benefit loading

#### Week 3: School Choice & TANF
- [ ] School Choice ESA management
  - [ ] Educational vendor whitelist
  - [ ] Receipt upload and validation
  - [ ] Quarterly reporting
  - [ ] Rollover balance tracking
- [ ] TANF cash benefits
  - [ ] Time limit tracking (60-month federal limit)
  - [ ] ATM withdrawal limits
  - [ ] Work requirement verification

#### Week 4: Testing & State Integration
- [ ] State agency API integration
- [ ] EBT processor partnership
- [ ] Retailer onboarding
- [ ] Load testing (100K+ concurrent beneficiaries)

### Phase 2: GENIUS Act Full Compliance (Week 5-6)
**Rationale: July 18, 2025 deadline, enables all federal programs**
- [ ] Digital identity integration (login.gov, id.me)
- [ ] Emergency disbursement system (<4 hour SLA)
- [ ] Multi-channel notifications
- [ ] Disaster relief workflows
- [ ] Federal agency reporting

### Phase 3: Gig Economy Platform (Week 7-8)
**Rationale: Leverages same payment infrastructure as benefits**
- [ ] Driver/contractor profiles
- [ ] Instant payout via Monay-Fiat Rails
- [ ] 1099 tax reporting
- [ ] Multi-platform support (Uber, Lyft, DoorDash)

### Phase 4: Capital Markets & Leasing (Week 9-10)
**Rationale: High-value, lower volume**
- [ ] **Monay-Fiat Rails Integration** (https://qaapi.monay.com/UtilliGPS/)
  - [ ] Configure Monay-Fiat Rails client for production (gps.monay.com)
  - [ ] Implement v3 API for deposits/on-ramp (ACH, cards, wires)
  - [ ] Implement v1 API for disbursements/off-ramp (Fiat Payout)
  - [ ] Test FedNow instant payments via Monay-Fiat Rails
  - [ ] Test RTP network integration via Monay-Fiat Rails
  - [ ] Test ACH same-day settlement via Monay-Fiat Rails
- [ ] **Digital Identity Integration**
  - [ ] login.gov OAuth 2.0/OpenID Connect integration
  - [ ] id.me SAML 2.0 integration
  - [ ] NIST 800-63 IAL2/AAL2 compliance validation
- [ ] **Emergency Disbursement System**
  - [ ] 4-hour SLA workflow implementation
  - [ ] Geo-targeted disbursement capability
  - [ ] Multi-channel notification system
  - [ ] Disaster declaration intake system
- [ ] **Compliance & Monitoring**
  - [ ] Audit trail for all federal transactions
  - [ ] Real-time compliance dashboard
  - [ ] Automated reporting to federal agencies

### Phase 5: Enterprise Procurement (Week 10-11)
**Rationale: B2B expansion, supply chain finance**
- [ ] SAP Ariba connector
- [ ] PO matching and approval workflows
- [ ] Dynamic discounting engine
- [ ] Vendor portal
- [ ] Supply chain finance integration
- [ ] Performance scorecards

### Phase 6: SMB Quick Start (Week 12)
**Rationale: Volume play, simplified onboarding**
- [ ] QuickBooks/Xero connectors
- [ ] Automated field mapping
- [ ] Self-service onboarding
- [ ] Basic invoice management
- [ ] Simple payment processing

---

## 📝 Comprehensive Implementation Checklist

### Week 1: Foundation & Database Schema
- [ ] Create git backup branch 'Prior-to-beacon-Enhancement' ✅
- [ ] Create tenant and organization tables with subledger flags
- [ ] Create enhanced customer table with JSONB for ERP data
- [ ] **Create customer_accounts table (OPTIONAL - for subledger systems)**
  - [ ] Support for main ledger and subledger accounts
  - [ ] Account hierarchy (parent/child accounts)
  - [ ] GL account code mapping
  - [ ] Cost center and profit center tracking
  - [ ] Mass billing group configuration
- [ ] Create invoice table with JSONB support and account linkage
- [ ] **Create payments table with subledger tracking**
  - [ ] Link to customer accounts
  - [ ] Ledger posting status
  - [ ] Subledger entry references
  - [ ] Bank reconciliation fields
- [ ] **Create billing_groups table for mass billing**
- [ ] Create invoice_wallets table for card linkage
- [ ] Create erp_field_mappings configuration table
- [ ] Create verification and audit tables
- [ ] **Create account_hierarchy view for navigation**
- [ ] Set up PostgreSQL JSONB indexes
- [ ] Configure Row-Level Security policies
- [ ] Create database migration scripts
- [ ] Set up test tenant with holding company structure
- [ ] Configure Google Maps API for address validation
- [ ] Set up Nudge API credentials (communication only)
- [ ] Configure ERP connection parameters

### Week 2: Backend Core Services & Payment Rails
- [ ] Implement TenantContextService for multi-tenant support
- [ ] Implement ERPSyncService with adapter pattern
- [ ] Create ERP adapters (SAP, Oracle, NetSuite)
- [ ] Implement ERPMappingService for field transformations
- [ ] Update CustomerService with JSONB support
- [ ] **Implement Monay-Fiat Rails Integration**
  - [ ] Create MonayFiatRailsClient service
  - [ ] Implement MonayFiatPayoutClient for disbursements/off-ramp
  - [ ] Implement MonayFiatDepositClient for deposits/on-ramp
  - [ ] Add payment rail orchestrator with failover
  - [ ] Configure ACH, card, and wire endpoints
  - [ ] Test with qaapi.monay.com endpoints
- [ ] **Implement CustomerAccountService (OPTIONAL)**
  - [ ] Account creation with hierarchy support
  - [ ] GL account mapping service
  - [ ] Subledger entry creation
  - [ ] Account balance tracking
  - [ ] Mass billing group management
- [ ] Update InvoiceService with wallet integration and account linkage
- [ ] **Implement PaymentService with ledger posting**
  - [ ] Payment to account allocation
  - [ ] Ledger posting logic
  - [ ] Bank reconciliation support
- [ ] Implement automatic card issuance on wallet creation
- [ ] Create verification services (email, SMS, address)
- [ ] Implement inter-company data sharing logic
- [ ] **Add decision logic for account requirement detection**
- [ ] Set up async job queue for ERP sync
- [ ] Create webhook handlers for Nudge delivery status
- [ ] Implement batch reconciliation service
- [ ] Add comprehensive error handling
- [ ] Create audit logging service

### Week 3: API Routes & Integration
- [ ] Create multi-tenant middleware
- [ ] Implement customer API routes with JSONB queries
- [ ] **Create customer account API routes (OPTIONAL)**
  - [ ] GET /api/customers/:id/accounts - List customer accounts
  - [ ] POST /api/accounts - Create account with hierarchy
  - [ ] GET /api/accounts/:id/hierarchy - Get account tree
  - [ ] PUT /api/accounts/:id/gl-mapping - Update GL mappings
- [ ] Create invoice API routes with wallet and account linkage
- [ ] **Create payment API routes with ledger support**
  - [ ] POST /api/payments - Create payment with account allocation
  - [ ] POST /api/payments/:id/ledger-post - Post to ledger
  - [ ] GET /api/payments/reconciliation - Bank reconciliation
- [ ] **Create mass billing API endpoints**
  - [ ] POST /api/billing-groups - Create billing group
  - [ ] POST /api/billing-groups/:id/generate - Generate batch invoices
- [ ] Implement ERP sync management endpoints
- [ ] Create field mapping configuration APIs
- [ ] Add inter-company transaction endpoints
- [ ] Implement verification API endpoints
- [ ] Create organization management routes
- [ ] Add data sharing permission endpoints
- [ ] Implement search with JSONB field support
- [ ] Create reporting APIs for holding companies
- [ ] Add rate limiting for all endpoints
- [ ] Implement API authentication/authorization
- [ ] Create OpenAPI documentation

### Week 4: Frontend Components
- [ ] Create OrganizationSelector component
- [ ] Update CustomerSearch with ERP data display
- [ ] **Create CustomerAccountManager component (OPTIONAL)**
  - [ ] Account hierarchy tree view
  - [ ] Account creation/edit forms
  - [ ] GL mapping interface
  - [ ] Account balance display
- [ ] **Create AccountSelector for invoice creation**
  - [ ] Dropdown with account hierarchy
  - [ ] Quick account creation option
  - [ ] Account details preview
- [ ] Create ERPFieldMapper component
- [ ] Update CreateInvoiceModal with wallet creation and account selection
- [ ] **Create MassBillingWizard component**
  - [ ] Billing group configuration
  - [ ] Customer/account selection
  - [ ] Batch invoice preview
  - [ ] Schedule configuration
- [ ] **Create PaymentReconciliation component**
  - [ ] Payment to invoice matching
  - [ ] Ledger posting status
  - [ ] Bank statement import
- [ ] Create InterCompanyInvoice component
- [ ] Add verification status indicators
- [ ] Create holding company dashboard
- [ ] Implement subsidiary switcher
- [ ] Add ERP sync status monitoring UI
- [ ] Create batch import interface
- [ ] Update customer details with JSONB fields and accounts
- [ ] Add field mapping configuration UI
- [ ] Create consolidated reporting views
- [ ] Implement real-time sync notifications

### Week 5: Testing & Optimization
- [ ] Write unit tests for multi-tenant logic
- [ ] Test JSONB field operations
- [ ] **Test customer account hierarchy operations**
  - [ ] Account creation with parent/child relationships
  - [ ] GL mapping validation
  - [ ] Account balance calculations
- [ ] **Test mass billing functionality**
  - [ ] Billing group selection logic
  - [ ] Batch invoice generation
  - [ ] Performance with 1000+ accounts
- [ ] **Test payment and ledger posting**
  - [ ] Payment allocation to accounts
  - [ ] Ledger posting accuracy
  - [ ] Bank reconciliation matching
- [ ] Test ERP sync bidirectional flow
- [ ] **Test subledger vs non-subledger flows**
- [ ] Test inter-company transactions
- [ ] Test holding company data aggregation
- [ ] Performance test JSONB queries
- [ ] Load test with multiple subsidiaries
- [ ] Test field mapping transformations
- [ ] Test verification flows
- [ ] Test wallet-card automatic creation
- [ ] Security audit for multi-tenant isolation
- [ ] Test failover for communication providers
- [ ] Validate ERP data integrity
- [ ] User acceptance testing

### Week 6: Deployment & Documentation
- [ ] Create deployment scripts
- [ ] Set up production ERP connections
- [ ] Configure production tenant structure
- [ ] **Configure organization subledger flags**
- [ ] **Set up GL account mappings for production**
- [ ] Migrate existing data to new schema
- [ ] **Migrate existing customers to account structure (if needed)**
- [ ] Deploy to staging environment
- [ ] Perform production readiness review
- [ ] Create user documentation
- [ ] **Document account management features**
  - [ ] When to use accounts vs simple structure
  - [ ] Account hierarchy best practices
  - [ ] GL mapping configuration guide
  - [ ] Mass billing setup guide
- [ ] Document ERP field mappings
- [ ] Create admin guides for tenant management
- [ ] **Create onboarding wizard documentation**
- [ ] Document API endpoints
- [ ] Create troubleshooting guides
- [ ] Set up monitoring and alerting
- [ ] Configure backup strategies
- [ ] Production deployment

---

## 🔐 Security & Compliance

### Data Isolation Strategy
```sql
-- Row Level Security for multi-tenant isolation
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Policy for holding company access
CREATE POLICY holding_company_policy ON customers
  FOR ALL
  TO authenticated_users
  USING (
    tenant_id = current_setting('app.current_tenant')::uuid
    AND (
      current_setting('app.is_holding')::boolean = true
      OR organization_id = current_setting('app.current_org')::uuid
      OR current_setting('app.current_org')::uuid = ANY(visible_to_orgs)
    )
  );
```

### Audit Trail Implementation
```javascript
class AuditService {
  async logDataAccess(entity, action, context) {
    await AuditLog.create({
      tenant_id: context.tenantId,
      organization_id: context.organizationId,
      user_id: context.userId,
      entity_type: entity,
      entity_id: entity.id,
      action: action,
      ip_address: context.ipAddress,
      timestamp: new Date()
    });
  }

  async logERPSync(syncOperation) {
    await ERPSyncLog.create({
      operation: syncOperation.type,
      source_system: syncOperation.source,
      target_system: syncOperation.target,
      records_processed: syncOperation.count,
      status: syncOperation.status,
      errors: syncOperation.errors,
      timestamp: new Date()
    });
  }
}
```

---

## 📊 Success Metrics

### Technical KPIs
- ERP sync success rate > 99%
- API response time < 200ms for JSONB queries
- Cross-organization query performance < 500ms
- Wallet-card creation success rate = 100%
- System uptime > 99.95%
- Data consistency score > 99.9%

### Business KPIs
- Time to create invoice with customer < 30 seconds
- ERP reconciliation time < 5 minutes
- Inter-company transaction processing < 1 minute
- Customer data accuracy > 99%
- Verification completion rate > 80%
- User adoption rate > 90% within 30 days

---

## 🚀 Rollout Strategy

### Phase 1: Pilot (Week 7-8)
- Deploy to one holding company with 3-5 subsidiaries
- Test all ERP integration points
- Validate JSONB performance at scale
- Gather feedback on multi-tenant features

### Phase 2: Limited Rollout (Week 9-10)
- Expand to 5 holding companies
- Include diverse ERP systems
- Monitor system performance
- Refine field mappings

### Phase 3: Full Deployment (Week 11-12)
- Deploy to all enterprise customers
- Enable all features
- Provide training and documentation
- Monitor and optimize

---

## 🔧 Technology Stack

### Backend
```json
{
  "core": {
    "node": "20.x",
    "postgresql": "15.x",
    "redis": "7.x"
  },
  "dependencies": {
    "sequelize": "^6.x.x",
    "bull": "^4.x.x",
    "joi": "^17.x.x",
    "node-sap-rfc": "^2.x.x",
    "oracledb": "^5.x.x",
    "netsuite-api": "^1.x.x"
  }
}
```

### Frontend
```json
{
  "dependencies": {
    "@headlessui/react": "^1.7.x",
    "react-hook-form": "^7.x.x",
    "@tanstack/react-query": "^4.x.x",
    "recharts": "^2.x.x"
  }
}
```

---

## 🎯 Industry-Specific Implementation Details

### 🚗 Gig Economy Integration (Week 2-3)
**Database Schema**
```sql
-- Driver/Contractor profiles
CREATE TABLE gig_workers (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  platform VARCHAR(50),  -- uber, lyft, doordash
  worker_id VARCHAR(255),  -- Platform-specific ID
  worker_uuid UUID,
  tax_classification VARCHAR(50),  -- 1099, W2
  instant_pay_enabled BOOLEAN DEFAULT true,
  daily_limit DECIMAL(10,2),
  lifetime_earnings DECIMAL(15,2),

  -- Payout methods
  payout_methods JSONB,  -- Array of methods
  default_payout_method VARCHAR(50),

  -- Platform data
  platform_data JSONB,  -- Platform-specific fields

  INDEX idx_worker_platform (tenant_id, platform, worker_id)
);

-- High-volume payout transactions
CREATE TABLE gig_payouts (
  id UUID PRIMARY KEY,
  worker_id UUID NOT NULL,
  amount DECIMAL(10,2),
  payout_method VARCHAR(50),
  status VARCHAR(20),
  initiated_at TIMESTAMP,
  completed_at TIMESTAMP,

  -- Optimize for high volume
  INDEX idx_payout_worker_date (worker_id, initiated_at),
  INDEX idx_payout_status (status, initiated_at)
) PARTITION BY RANGE (initiated_at);
```

**API Endpoints**
- `POST /api/gig/instant-payout` - Process instant earnings
- `GET /api/gig/earnings/{workerId}` - Fetch earnings history
- `POST /api/gig/bulk-payout` - Process batch payouts
- `GET /api/gig/tax-documents/{year}` - Generate 1099s

### 💹 Capital Markets Integration (Week 4-5)
**Database Schema**
```sql
-- Portfolio management
CREATE TABLE portfolios (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  client_id UUID NOT NULL,
  portfolio_code VARCHAR(100),
  portfolio_name VARCHAR(255),
  base_currency VARCHAR(3),
  aum DECIMAL(20,2),

  -- Bloomberg/Charles River IDs
  bloomberg_id VARCHAR(100),
  charles_river_id VARCHAR(100),

  -- Complex accounting
  accounting_basis VARCHAR(50),  -- FAIR_VALUE, AMORTIZED_COST
  benchmark VARCHAR(100),

  -- Subledger accounts
  custody_account VARCHAR(100),
  prime_broker VARCHAR(100),

  portfolio_data JSONB  -- System-specific data
);

-- Trading positions
CREATE TABLE positions (
  id UUID PRIMARY KEY,
  portfolio_id UUID NOT NULL,
  instrument_id VARCHAR(100),
  quantity DECIMAL(20,4),
  cost_basis DECIMAL(20,2),
  market_value DECIMAL(20,2),
  unrealized_pnl DECIMAL(20,2),

  -- Settlement
  settlement_date DATE,
  settlement_status VARCHAR(50),

  position_data JSONB,  -- System-specific fields

  INDEX idx_portfolio_positions (portfolio_id, instrument_id)
);
```

### 🏢 Equipment Leasing Integration (Week 6-7)
**Database Schema**
```sql
-- Lease contracts
CREATE TABLE lease_contracts (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  lessee_id UUID NOT NULL,
  contract_number VARCHAR(100),
  lease_type VARCHAR(50),  -- FINANCE, OPERATING

  -- Financial terms
  asset_value DECIMAL(15,2),
  residual_value DECIMAL(15,2),
  monthly_payment DECIMAL(10,2),
  term_months INT,
  interest_rate DECIMAL(5,4),

  -- Dates
  commencement_date DATE,
  maturity_date DATE,

  -- Accounting
  accounting_standard VARCHAR(20),  -- ASC_842, IFRS_16
  right_of_use_asset DECIMAL(15,2),
  lease_liability DECIMAL(15,2),

  lease_data JSONB  -- Platform-specific data
);

-- Leased assets
CREATE TABLE leased_assets (
  id UUID PRIMARY KEY,
  contract_id UUID NOT NULL,
  asset_type VARCHAR(100),
  description TEXT,
  serial_number VARCHAR(100),
  manufacturer VARCHAR(100),
  model VARCHAR(100),

  -- Tracking
  location VARCHAR(255),
  condition VARCHAR(50),
  last_inspection DATE,

  -- Insurance
  insurance_required BOOLEAN,
  insurance_policy VARCHAR(100),
  insurance_expiry DATE,

  asset_data JSONB
);
```

### 🏛️ GENIUS Act Implementation (Week 8-9)
**Payment Rails Configuration**
```javascript
const geniusPaymentConfig = {
  payment_rails: {
    fednow: {
      enabled: true,
      priority: 1,
      settlement_time: "instant",
      max_amount: 1000000
    },
    rtp: {
      enabled: true,
      priority: 2,
      settlement_time: "instant",
      max_amount: 100000
    },
    ach_same_day: {
      enabled: true,
      priority: 3,
      settlement_time: "same_day",
      max_amount: 1000000
    },
    blockchain: {
      enabled: true,
      priority: 4,
      settlement_time: "instant",
      networks: ["Base", "Solana"]
    }
  },

  digital_identity: {
    providers: ["login.gov", "id.me"],
    verification_level: "IAL2",
    biometric_enabled: true
  },

  emergency_disbursement: {
    max_processing_time: "4_hours",
    auto_approval: true,
    notification_required: true
  }
};
```

### 🏭 Supplier Platform Integration (Week 10-11)
**Procurement Workflow**
```javascript
const procurementWorkflow = {
  stages: [
    { name: "requisition", approvals_required: 1 },
    { name: "purchase_order", approvals_required: 2 },
    { name: "receipt", approvals_required: 0 },
    { name: "invoice", approvals_required: 1 },
    { name: "payment", approvals_required: 2 }
  ],

  approval_matrix: {
    under_10k: ["manager"],
    under_50k: ["manager", "director"],
    under_250k: ["manager", "director", "vp"],
    over_250k: ["manager", "director", "vp", "cfo"]
  },

  early_payment: {
    dynamic_discounting: true,
    supply_chain_finance: true,
    standard_terms: "2/10_NET_30"
  }
};
```

---

## 📝 Notes & Considerations

1. **JSONB Performance**: Create appropriate indexes for frequently queried JSONB fields
2. **ERP Latency**: Implement async processing for ERP sync to avoid blocking operations
3. **Data Volume**: Consider partitioning for large enterprises with millions of records
4. **Field Mapping**: Provide UI for business users to configure mappings without code changes
5. **Compliance**: Ensure data residency requirements are met for different subsidiaries
6. **Caching**: Implement Redis caching for frequently accessed ERP data
7. **Monitoring**: Set up detailed monitoring for ERP sync operations
8. **Documentation**: Maintain mapping documentation for each ERP system

---

*Last Updated: 2025-01-21*
*Version: 2.0 - Complete Enterprise Integration*