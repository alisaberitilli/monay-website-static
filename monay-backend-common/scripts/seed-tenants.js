#!/usr/bin/env node

import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://alisaberi:@localhost:5432/monay',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Generate tenant code based on type
function generateTenantCode(type, index) {
  const prefix = {
    'individual': 'IND',
    'household_member': 'HHM',
    'small_business': 'SMB',
    'enterprise': 'ENT',
    'holding_company': 'HLD'
  };
  return `${prefix[type]}-${Date.now().toString(36).toUpperCase()}-${index}`;
}

// Generate random gross margin between min and max
function randomMargin(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Tenant data to seed
const tenants = [
  // Enterprise tenants (5)
  {
    name: 'TechCorp Solutions Inc',
    type: 'enterprise',
    billing_tier: 'enterprise',
    gross_margin_percent: randomMargin(25, 35),
    status: 'active',
    metadata: {
      industry: 'Technology',
      employees: 5000,
      annual_revenue: '500M',
      contact_email: 'finance@techcorp.com',
      phone: '+14155551234'
    }
  },
  {
    name: 'Global Finance Partners',
    type: 'enterprise',
    billing_tier: 'custom',
    gross_margin_percent: randomMargin(30, 40),
    status: 'active',
    metadata: {
      industry: 'Financial Services',
      employees: 10000,
      annual_revenue: '2B',
      contact_email: 'treasury@globalfinance.com',
      phone: '+12125555678'
    }
  },
  {
    name: 'Healthcare Systems United',
    type: 'enterprise',
    billing_tier: 'enterprise',
    gross_margin_percent: randomMargin(20, 30),
    status: 'active',
    metadata: {
      industry: 'Healthcare',
      employees: 8000,
      annual_revenue: '1.2B',
      contact_email: 'admin@healthsystems.com',
      phone: '+13125559876'
    }
  },
  {
    name: 'Manufacturing Dynamics Corp',
    type: 'enterprise',
    billing_tier: 'enterprise',
    gross_margin_percent: randomMargin(15, 25),
    status: 'active',
    metadata: {
      industry: 'Manufacturing',
      employees: 15000,
      annual_revenue: '3B',
      contact_email: 'ops@mfgdynamics.com',
      phone: '+13135554321'
    }
  },
  {
    name: 'Retail Chain International',
    type: 'enterprise',
    billing_tier: 'custom',
    gross_margin_percent: randomMargin(10, 20),
    status: 'active',
    metadata: {
      industry: 'Retail',
      employees: 50000,
      annual_revenue: '10B',
      contact_email: 'corporate@retailchain.com',
      phone: '+14045556789'
    }
  },

  // Small Business tenants (8)
  {
    name: 'Sunrise Bakery & Cafe',
    type: 'small_business',
    billing_tier: 'small_business',
    gross_margin_percent: randomMargin(30, 45),
    status: 'active',
    metadata: {
      industry: 'Food Service',
      employees: 25,
      annual_revenue: '2M',
      contact_email: 'owner@sunrisebakery.com',
      phone: '+14155552345'
    }
  },
  {
    name: 'Digital Marketing Pro',
    type: 'small_business',
    billing_tier: 'small_business',
    gross_margin_percent: randomMargin(40, 60),
    status: 'active',
    metadata: {
      industry: 'Marketing',
      employees: 15,
      annual_revenue: '5M',
      contact_email: 'hello@digitalmarketingpro.com',
      phone: '+16505553456'
    }
  },
  {
    name: 'Green Lawn Services',
    type: 'small_business',
    billing_tier: 'free',
    gross_margin_percent: randomMargin(25, 35),
    status: 'active',
    metadata: {
      industry: 'Landscaping',
      employees: 10,
      annual_revenue: '800K',
      contact_email: 'info@greenlawn.com',
      phone: '+19165554567'
    }
  },
  {
    name: 'Boutique Law Associates',
    type: 'small_business',
    billing_tier: 'small_business',
    gross_margin_percent: randomMargin(50, 70),
    status: 'active',
    metadata: {
      industry: 'Legal Services',
      employees: 8,
      annual_revenue: '3M',
      contact_email: 'partners@boutiquelaw.com',
      phone: '+12135555678'
    }
  },
  {
    name: 'Auto Repair Excellence',
    type: 'small_business',
    billing_tier: 'small_business',
    gross_margin_percent: randomMargin(20, 30),
    status: 'active',
    metadata: {
      industry: 'Automotive',
      employees: 12,
      annual_revenue: '1.5M',
      contact_email: 'service@autoexcellence.com',
      phone: '+15105556789'
    }
  },
  {
    name: 'Creative Design Studio',
    type: 'small_business',
    billing_tier: 'small_business',
    gross_margin_percent: randomMargin(45, 65),
    status: 'active',
    metadata: {
      industry: 'Design',
      employees: 6,
      annual_revenue: '1M',
      contact_email: 'studio@creativedesign.com',
      phone: '+14087891'
    }
  },
  {
    name: 'Fitness Plus Gym',
    type: 'small_business',
    billing_tier: 'small_business',
    gross_margin_percent: randomMargin(30, 40),
    status: 'active',
    metadata: {
      industry: 'Health & Fitness',
      employees: 20,
      annual_revenue: '2.5M',
      contact_email: 'manager@fitnessplus.com',
      phone: '+18185558912'
    }
  },
  {
    name: 'Pet Care Paradise',
    type: 'small_business',
    billing_tier: 'free',
    gross_margin_percent: randomMargin(35, 50),
    status: 'active',
    metadata: {
      industry: 'Pet Services',
      employees: 5,
      annual_revenue: '500K',
      contact_email: 'care@petparadise.com',
      phone: '+16195559123'
    }
  },

  // Holding Companies (2)
  {
    name: 'Apex Holdings Group',
    type: 'holding_company',
    billing_tier: 'custom',
    gross_margin_percent: randomMargin(15, 25),
    status: 'active',
    metadata: {
      industry: 'Investment',
      subsidiaries: 12,
      portfolio_value: '5B',
      contact_email: 'investors@apexholdings.com',
      phone: '+12125551111'
    }
  },
  {
    name: 'Diversified Ventures LLC',
    type: 'holding_company',
    billing_tier: 'enterprise',
    gross_margin_percent: randomMargin(18, 28),
    status: 'active',
    metadata: {
      industry: 'Conglomerate',
      subsidiaries: 8,
      portfolio_value: '2B',
      contact_email: 'board@diversifiedventures.com',
      phone: '+13125552222'
    }
  },

  // Individual tenants (5)
  {
    name: 'John Smith Consulting',
    type: 'individual',
    billing_tier: 'free',
    gross_margin_percent: randomMargin(60, 80),
    status: 'active',
    metadata: {
      profession: 'Business Consultant',
      annual_income: '150K',
      contact_email: 'john@smithconsulting.com',
      phone: '+14155553333'
    }
  },
  {
    name: 'Sarah Johnson Freelance',
    type: 'individual',
    billing_tier: 'free',
    gross_margin_percent: randomMargin(70, 90),
    status: 'active',
    metadata: {
      profession: 'Graphic Designer',
      annual_income: '80K',
      contact_email: 'sarah@sjdesigns.com',
      phone: '+16505554444'
    }
  },
  {
    name: 'Michael Chen Trading',
    type: 'individual',
    billing_tier: 'small_business',
    gross_margin_percent: randomMargin(20, 40),
    status: 'active',
    metadata: {
      profession: 'Day Trader',
      annual_income: '250K',
      contact_email: 'michael@chentrading.com',
      phone: '+14085555555'
    }
  },
  {
    name: 'Emily Davis Photography',
    type: 'individual',
    billing_tier: 'free',
    gross_margin_percent: randomMargin(50, 70),
    status: 'active',
    metadata: {
      profession: 'Photographer',
      annual_income: '60K',
      contact_email: 'emily@davisphotos.com',
      phone: '+18185556666'
    }
  },
  {
    name: 'Robert Wilson Investments',
    type: 'individual',
    billing_tier: 'small_business',
    gross_margin_percent: randomMargin(25, 35),
    status: 'active',
    metadata: {
      profession: 'Real Estate Investor',
      annual_income: '500K',
      contact_email: 'robert@wilsoninvest.com',
      phone: '+19255557777'
    }
  },

  // Household Members (3)
  {
    name: 'The Martinez Family',
    type: 'household_member',
    billing_tier: 'free',
    gross_margin_percent: randomMargin(10, 20),
    status: 'active',
    metadata: {
      members: 4,
      primary_contact: 'Carlos Martinez',
      contact_email: 'martinez.family@email.com',
      phone: '+13235558888'
    }
  },
  {
    name: 'Johnson Household',
    type: 'household_member',
    billing_tier: 'free',
    gross_margin_percent: randomMargin(12, 22),
    status: 'active',
    metadata: {
      members: 3,
      primary_contact: 'Linda Johnson',
      contact_email: 'ljohnson@email.com',
      phone: '+17145559999'
    }
  },
  {
    name: 'The Kim Family Trust',
    type: 'household_member',
    billing_tier: 'small_business',
    gross_margin_percent: randomMargin(15, 25),
    status: 'active',
    metadata: {
      members: 5,
      primary_contact: 'David Kim',
      contact_email: 'kimfamily@email.com',
      phone: '+14245550000'
    }
  },

  // Additional diverse tenants
  {
    name: 'EduTech Learning Platform',
    type: 'small_business',
    billing_tier: 'small_business',
    gross_margin_percent: randomMargin(40, 55),
    status: 'active',
    metadata: {
      industry: 'Education Technology',
      employees: 30,
      annual_revenue: '8M',
      contact_email: 'support@edutech.com',
      phone: '+16465551234'
    }
  },
  {
    name: 'Sustainable Energy Co',
    type: 'enterprise',
    billing_tier: 'enterprise',
    gross_margin_percent: randomMargin(22, 32),
    status: 'active',
    metadata: {
      industry: 'Renewable Energy',
      employees: 200,
      annual_revenue: '50M',
      contact_email: 'info@sustainableenergy.com',
      phone: '+15125552345'
    }
  },
  {
    name: 'Crypto Trading Desk',
    type: 'small_business',
    billing_tier: 'small_business',
    gross_margin_percent: randomMargin(35, 50),
    status: 'pending',
    metadata: {
      industry: 'Cryptocurrency',
      employees: 8,
      annual_revenue: '10M',
      contact_email: 'trades@cryptodesk.com',
      phone: '+13055553456'
    }
  }
];

async function seedTenants() {
  const client = await pool.connect();

  try {
    console.log('🌱 Starting tenant seeding...\n');

    await client.query('BEGIN');

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < tenants.length; i++) {
      const tenant = tenants[i];
      const tenantId = uuidv4();
      const tenantCode = tenant.tenant_code || generateTenantCode(tenant.type, i + 1);

      // Generate wallet derivation path
      const tenantIndex = Math.floor(Math.random() * 2147483647);
      const derivationPath = `m/44'/501'/${tenantIndex}'/0'/0`;

      // Determine isolation level based on type
      const isolationLevel = tenant.type === 'enterprise' || tenant.type === 'holding_company'
        ? 'database'
        : 'row';

      try {
        const query = `
          INSERT INTO tenants (
            id,
            tenant_code,
            name,
            type,
            isolation_level,
            billing_tier,
            metadata,
            wallet_derivation_path,
            status,
            gross_margin_percent,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
          RETURNING id, name, tenant_code, type, billing_tier
        `;

        const values = [
          tenantId,
          tenantCode,
          tenant.name,
          tenant.type,
          isolationLevel,
          tenant.billing_tier,
          JSON.stringify(tenant.metadata),
          derivationPath,
          tenant.status || 'active',
          tenant.gross_margin_percent
        ];

        const result = await client.query(query, values);

        console.log(`✅ Created tenant: ${result.rows[0].name} (${result.rows[0].tenant_code})`);
        console.log(`   Type: ${result.rows[0].type}, Tier: ${result.rows[0].billing_tier}`);

        successCount++;

      } catch (error) {
        console.error(`❌ Failed to create tenant: ${tenant.name}`);
        console.error(`   Error: ${error.message}`);
        errorCount++;
      }
    }

    await client.query('COMMIT');

    console.log('\n📊 Seeding Summary:');
    console.log(`✅ Successfully created: ${successCount} tenants`);
    if (errorCount > 0) {
      console.log(`❌ Failed: ${errorCount} tenants`);
    }

    // Show tenant statistics
    const statsQuery = `
      SELECT
        type,
        COUNT(*) as count,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count
      FROM tenants
      GROUP BY type
      ORDER BY count DESC
    `;

    const stats = await client.query(statsQuery);

    console.log('\n📈 Tenant Distribution:');
    stats.rows.forEach(row => {
      console.log(`   ${row.type}: ${row.count} tenants (${row.active_count} active)`);
    });

    const tierStats = await client.query(`
      SELECT
        billing_tier,
        COUNT(*) as count
      FROM tenants
      GROUP BY billing_tier
      ORDER BY count DESC
    `);

    console.log('\n💳 Billing Tier Distribution:');
    tierStats.rows.forEach(row => {
      console.log(`   ${row.billing_tier}: ${row.count} tenants`);
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding tenants:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the seeding
seedTenants()
  .then(() => {
    console.log('\n✨ Tenant seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Tenant seeding failed:', error);
    process.exit(1);
  });