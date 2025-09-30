import { test, expect } from '@playwright/test';

// Configuration
const ADMIN_URL = 'http://localhost:3002';
const ADMIN_EMAIL = 'admin@monay.com';
const ADMIN_PASSWORD = 'Admin@123';  // Correct password

// Test data configuration
const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing',
  'Education', 'Real Estate', 'Transportation', 'Energy', 'Media',
  'Government', 'Capital Markets', 'Insurance', 'Telecommunications', 'Agriculture'
];

const TENANT_TYPES = ['Enterprise', 'SMB', 'Startup', 'Government', 'Non-Profit'];
const ORG_TYPES = ['Headquarters', 'Branch', 'Subsidiary', 'Division', 'Department'];
const USER_ROLES = ['Admin', 'Manager', 'User', 'Viewer'];

// Generate test data hierarchy
const generateHierarchy = () => {
  const timestamp = Date.now();
  const tenants = [];

  // 1. Enterprise Tenants with multiple organizations
  tenants.push({
    name: `TechCorp Global`,
    type: 'Enterprise',
    industry: 'Technology',
    email: `techcorp_${timestamp}@test.com`,
    phone: `555${Math.floor(Math.random() * 10000000)}`,
    organizations: [
      {
        name: 'TechCorp HQ',
        type: 'Headquarters',
        users: [
          { firstName: 'John', lastName: 'Smith', role: 'Admin', email: `john.smith_${timestamp}@techcorp.com` },
          { firstName: 'Sarah', lastName: 'Johnson', role: 'Manager', email: `sarah.j_${timestamp}@techcorp.com` },
          { firstName: 'Mike', lastName: 'Davis', role: 'User', email: `mike.d_${timestamp}@techcorp.com` }
        ]
      },
      {
        name: 'TechCorp R&D',
        type: 'Division',
        users: [
          { firstName: 'Alice', lastName: 'Chen', role: 'Manager', email: `alice.c_${timestamp}@techcorp.com` },
          { firstName: 'Bob', lastName: 'Kumar', role: 'User', email: `bob.k_${timestamp}@techcorp.com` }
        ]
      },
      {
        name: 'TechCorp Sales',
        type: 'Division',
        users: [
          { firstName: 'Emma', lastName: 'Wilson', role: 'Manager', email: `emma.w_${timestamp}@techcorp.com` }
        ]
      }
    ]
  });

  // 2. Healthcare Network Tenant
  tenants.push({
    name: `HealthNet System`,
    type: 'Enterprise',
    industry: 'Healthcare',
    email: `healthnet_${timestamp}@test.com`,
    phone: `555${Math.floor(Math.random() * 10000000)}`,
    organizations: [
      {
        name: 'HealthNet Main Hospital',
        type: 'Headquarters',
        users: [
          { firstName: 'Dr. James', lastName: 'Miller', role: 'Admin', email: `james.m_${timestamp}@healthnet.com` },
          { firstName: 'Dr. Linda', lastName: 'Brown', role: 'Manager', email: `linda.b_${timestamp}@healthnet.com` }
        ]
      },
      {
        name: 'HealthNet Clinic East',
        type: 'Branch',
        users: [
          { firstName: 'Nancy', lastName: 'Taylor', role: 'Manager', email: `nancy.t_${timestamp}@healthnet.com` }
        ]
      },
      {
        name: 'HealthNet Clinic West',
        type: 'Branch',
        users: [
          { firstName: 'Robert', lastName: 'Lee', role: 'Manager', email: `robert.l_${timestamp}@healthnet.com` }
        ]
      }
    ]
  });

  // 3. Financial Services Tenant
  tenants.push({
    name: `Global Finance Corp`,
    type: 'Enterprise',
    industry: 'Finance',
    email: `globalfinance_${timestamp}@test.com`,
    phone: `555${Math.floor(Math.random() * 10000000)}`,
    organizations: [
      {
        name: 'Global Finance HQ',
        type: 'Headquarters',
        users: [
          { firstName: 'William', lastName: 'Anderson', role: 'Admin', email: `william.a_${timestamp}@globalfinance.com` },
          { firstName: 'Patricia', lastName: 'Martinez', role: 'Manager', email: `patricia.m_${timestamp}@globalfinance.com` }
        ]
      },
      {
        name: 'Investment Banking',
        type: 'Division',
        users: [
          { firstName: 'Charles', lastName: 'Garcia', role: 'Manager', email: `charles.g_${timestamp}@globalfinance.com` }
        ]
      },
      {
        name: 'Retail Banking',
        type: 'Division',
        users: [
          { firstName: 'Jennifer', lastName: 'Lopez', role: 'Manager', email: `jennifer.l_${timestamp}@globalfinance.com` }
        ]
      }
    ]
  });

  // 4. Retail Chain Tenant
  tenants.push({
    name: `RetailMax Stores`,
    type: 'Enterprise',
    industry: 'Retail',
    email: `retailmax_${timestamp}@test.com`,
    phone: `555${Math.floor(Math.random() * 10000000)}`,
    organizations: [
      {
        name: 'RetailMax Corporate',
        type: 'Headquarters',
        users: [
          { firstName: 'David', lastName: 'Thompson', role: 'Admin', email: `david.t_${timestamp}@retailmax.com` }
        ]
      },
      {
        name: 'RetailMax Store #001',
        type: 'Branch',
        users: [
          { firstName: 'Maria', lastName: 'Rodriguez', role: 'Manager', email: `maria.r_${timestamp}@retailmax.com` }
        ]
      },
      {
        name: 'RetailMax Store #002',
        type: 'Branch',
        users: [
          { firstName: 'Kevin', lastName: 'White', role: 'Manager', email: `kevin.w_${timestamp}@retailmax.com` }
        ]
      }
    ]
  });

  // 5. Government Tenant
  tenants.push({
    name: `State Treasury Dept`,
    type: 'Government',
    industry: 'Government',
    email: `treasury_${timestamp}@gov.test`,
    phone: `555${Math.floor(Math.random() * 10000000)}`,
    organizations: [
      {
        name: 'Treasury Main Office',
        type: 'Headquarters',
        users: [
          { firstName: 'George', lastName: 'Washington', role: 'Admin', email: `george.w_${timestamp}@treasury.gov` },
          { firstName: 'Thomas', lastName: 'Jefferson', role: 'Manager', email: `thomas.j_${timestamp}@treasury.gov` }
        ]
      },
      {
        name: 'Revenue Department',
        type: 'Department',
        users: [
          { firstName: 'Benjamin', lastName: 'Franklin', role: 'Manager', email: `benjamin.f_${timestamp}@treasury.gov` }
        ]
      }
    ]
  });

  // 6-10. SMB Tenants (single organization each)
  const smbTenants = [
    { name: 'Local Marketing Agency', industry: 'Media' },
    { name: 'Regional Logistics LLC', industry: 'Transportation' },
    { name: 'Community Insurance Co', industry: 'Insurance' },
    { name: 'TelecomPlus Services', industry: 'Telecommunications' },
    { name: 'AgriTech Farms Inc', industry: 'Agriculture' }
  ];

  smbTenants.forEach((smb, index) => {
    tenants.push({
      name: smb.name,
      type: 'SMB',
      industry: smb.industry,
      email: `${smb.name.toLowerCase().replace(/\s+/g, '_')}_${timestamp}@test.com`,
      phone: `555${Math.floor(Math.random() * 10000000)}`,
      organizations: [
        {
          name: `${smb.name} Main`,
          type: 'Headquarters',
          users: [
            { firstName: `Owner${index}`, lastName: 'Smith', role: 'Admin', email: `owner${index}_${timestamp}@${smb.name.toLowerCase().replace(/\s+/g, '')}.com` },
            { firstName: `Manager${index}`, lastName: 'Jones', role: 'Manager', email: `manager${index}_${timestamp}@${smb.name.toLowerCase().replace(/\s+/g, '')}.com` }
          ]
        }
      ]
    });
  });

  // 11-15. Startup Tenants (single organization, fewer users)
  const startupTenants = [
    { name: 'AI Innovations', industry: 'Technology' },
    { name: 'GreenTech Solutions', industry: 'Energy' },
    { name: 'FinTech Pioneers', industry: 'Finance' },
    { name: 'EdTech Ventures', industry: 'Education' },
    { name: 'BioMed Discoveries', industry: 'Healthcare' }
  ];

  startupTenants.forEach((startup, index) => {
    tenants.push({
      name: startup.name,
      type: 'Startup',
      industry: startup.industry,
      email: `${startup.name.toLowerCase().replace(/\s+/g, '_')}_${timestamp}@test.com`,
      phone: `555${Math.floor(Math.random() * 10000000)}`,
      organizations: [
        {
          name: startup.name,
          type: 'Headquarters',
          users: [
            { firstName: `Founder${index}`, lastName: 'Startup', role: 'Admin', email: `founder${index}_${timestamp}@${startup.name.toLowerCase().replace(/\s+/g, '')}.com` }
          ]
        }
      ]
    });
  });

  return tenants;
};

test.describe('Seed Complete Hierarchy: Tenants → Organizations → Users', () => {
  test('Create complete tenant hierarchy via UI', async ({ page, context }) => {
    test.setTimeout(600000); // 10 minutes timeout for this comprehensive test

    const tenants = generateHierarchy();
    const totalOrgs = tenants.reduce((sum, t) => sum + t.organizations.length, 0);
    const totalUsers = tenants.reduce((sum, t) =>
      t.organizations.reduce((orgSum, o) => orgSum + o.users.length, sum), 0
    );

    console.log('\n' + '='.repeat(60));
    console.log('📊 HIERARCHY TO CREATE');
    console.log('='.repeat(60));
    console.log(`🏢 Tenants: ${tenants.length}`);
    console.log(`🏛️ Organizations: ${totalOrgs}`);
    console.log(`👥 Users: ${totalUsers}`);
    console.log('='.repeat(60) + '\n');

    // Step 1: Navigate to Admin Portal first
    console.log('1️⃣ Logging into Admin Portal...');
    await page.goto(ADMIN_URL);

    // Clear storage after navigating to the page
    try {
      await context.clearCookies();
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    } catch (e) {
      console.log('Note: Could not clear storage, continuing...');
    }
    await page.waitForLoadState('networkidle');

    if (await page.locator('input[type="email"]').isVisible()) {
      await page.fill('input[type="email"]', ADMIN_EMAIL);
      await page.fill('input[type="password"]', ADMIN_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      console.log('✅ Logged in successfully\n');
    }

    const results = {
      tenants: { successful: [], failed: [] },
      organizations: { successful: [], failed: [] },
      users: { successful: [], failed: [] }
    };

    // Step 2: Create Tenants
    for (let t = 0; t < tenants.length; t++) {
      const tenant = tenants[t];
      console.log(`\n${'='.repeat(50)}`);
      console.log(`🏢 TENANT ${t + 1}/${tenants.length}: ${tenant.name}`);
      console.log(`${'='.repeat(50)}`);
      console.log(`   Type: ${tenant.type}`);
      console.log(`   Industry: ${tenant.industry}`);
      console.log(`   Organizations: ${tenant.organizations.length}`);

      try {
        // Navigate to Tenants page
        const tenantsNav = page.locator('a[href="/tenants"], a:has-text("Tenants"), nav >> text=Tenants').first();
        if (await tenantsNav.isVisible({ timeout: 3000 })) {
          await tenantsNav.click();
        } else {
          await page.goto(`${ADMIN_URL}/tenants`);
        }
        await page.waitForLoadState('networkidle');

        // Click Create Tenant button
        const createTenantBtn = page.locator('button:has-text("New Tenant"), button:has-text("Add Tenant"), button:has-text("Create Tenant"), button >> text=/new|add|create/i').first();

        if (await createTenantBtn.isVisible({ timeout: 5000 })) {
          await createTenantBtn.click();
          await page.waitForTimeout(1000);
        } else {
          await page.goto(`${ADMIN_URL}/tenants/new`);
        }

        // Fill tenant form
        await page.fill('input[name="name"], input[name="tenantName"], input[placeholder*="Tenant Name"]', tenant.name);

        const typeSelect = page.locator('select[name="type"], select[name="tenantType"]').first();
        if (await typeSelect.isVisible({ timeout: 1000 })) {
          await typeSelect.selectOption({ label: tenant.type });
        }

        const industrySelect = page.locator('select[name="industry"]').first();
        if (await industrySelect.isVisible({ timeout: 1000 })) {
          await industrySelect.selectOption({ label: tenant.industry });
        }

        await page.fill('input[name="email"], input[type="email"]:not([name*="admin"])', tenant.email);
        await page.fill('input[name="phone"], input[type="tel"]:not([name*="admin"])', tenant.phone);

        // Submit tenant
        const submitBtn = page.locator('button[type="submit"]:has-text("Create"), button:has-text("Create Tenant")').first();
        await submitBtn.click();
        await page.waitForTimeout(2000);

        // Check for success
        const success = await page.locator('text=/success|created/i').isVisible({ timeout: 3000 }).catch(() => false);

        if (success) {
          console.log(`   ✅ Tenant created successfully`);
          results.tenants.successful.push(tenant.name);

          // Step 3: Create Organizations for this Tenant
          for (let o = 0; o < tenant.organizations.length; o++) {
            const org = tenant.organizations[o];
            console.log(`\n   📁 Organization ${o + 1}/${tenant.organizations.length}: ${org.name}`);
            console.log(`      Type: ${org.type}`);
            console.log(`      Users: ${org.users.length}`);

            try {
              // Navigate to Organizations
              await page.goto(`${ADMIN_URL}/organizations`);
              await page.waitForLoadState('networkidle');

              // Create Organization
              const createOrgBtn = page.locator('button:has-text("New Organization"), button:has-text("Add Organization")').first();

              if (await createOrgBtn.isVisible({ timeout: 3000 })) {
                await createOrgBtn.click();
                await page.waitForTimeout(1000);
              }

              // Select tenant for this organization
              const tenantSelect = page.locator('select[name="tenant"], select[name="tenantId"]').first();
              if (await tenantSelect.isVisible({ timeout: 1000 })) {
                await tenantSelect.selectOption({ label: tenant.name });
              }

              // Fill organization details
              await page.fill('input[name="name"], input[name="organizationName"]', org.name);

              const orgTypeSelect = page.locator('select[name="type"], select[name="organizationType"]').first();
              if (await orgTypeSelect.isVisible({ timeout: 1000 })) {
                await orgTypeSelect.selectOption({ label: org.type });
              }

              // Submit organization
              await page.click('button[type="submit"]:has-text("Create")');
              await page.waitForTimeout(2000);

              const orgSuccess = await page.locator('text=/success|created/i').isVisible({ timeout: 3000 }).catch(() => false);

              if (orgSuccess) {
                console.log(`      ✅ Organization created`);
                results.organizations.successful.push(`${org.name} (${tenant.name})`);

                // Step 4: Create Users for this Organization
                for (let u = 0; u < org.users.length; u++) {
                  const user = org.users[u];
                  console.log(`         👤 User ${u + 1}/${org.users.length}: ${user.firstName} ${user.lastName} (${user.role})`);

                  try {
                    // Navigate to Users
                    await page.goto(`${ADMIN_URL}/users`);
                    await page.waitForLoadState('networkidle');

                    // Create User
                    const createUserBtn = page.locator('button:has-text("New User"), button:has-text("Add User")').first();

                    if (await createUserBtn.isVisible({ timeout: 3000 })) {
                      await createUserBtn.click();
                      await page.waitForTimeout(1000);
                    }

                    // Select organization for this user
                    const orgSelect = page.locator('select[name="organization"], select[name="organizationId"]').first();
                    if (await orgSelect.isVisible({ timeout: 1000 })) {
                      await orgSelect.selectOption({ label: org.name });
                    }

                    // Fill user details
                    await page.fill('input[name="firstName"]', user.firstName);
                    await page.fill('input[name="lastName"]', user.lastName);
                    await page.fill('input[name="email"]', user.email);

                    const roleSelect = page.locator('select[name="role"]').first();
                    if (await roleSelect.isVisible({ timeout: 1000 })) {
                      await roleSelect.selectOption({ label: user.role });
                    }

                    // Default password
                    await page.fill('input[name="password"], input[type="password"]', 'TempPass123!');

                    // Submit user
                    await page.click('button[type="submit"]:has-text("Create")');
                    await page.waitForTimeout(1500);

                    const userSuccess = await page.locator('text=/success|created/i').isVisible({ timeout: 2000 }).catch(() => false);

                    if (userSuccess) {
                      console.log(`         ✅ User created`);
                      results.users.successful.push(`${user.firstName} ${user.lastName}`);
                    } else {
                      console.log(`         ⚠️ User creation uncertain`);
                      results.users.failed.push(`${user.firstName} ${user.lastName}`);
                    }

                  } catch (userError) {
                    console.log(`         ❌ Failed to create user: ${userError.message}`);
                    results.users.failed.push(`${user.firstName} ${user.lastName}`);
                  }
                }
              } else {
                console.log(`      ⚠️ Organization creation uncertain`);
                results.organizations.failed.push(`${org.name} (${tenant.name})`);
              }

            } catch (orgError) {
              console.log(`      ❌ Failed to create organization: ${orgError.message}`);
              results.organizations.failed.push(`${org.name} (${tenant.name})`);
            }
          }
        } else {
          console.log(`   ⚠️ Tenant creation uncertain`);
          results.tenants.failed.push(tenant.name);
        }

      } catch (tenantError) {
        console.log(`   ❌ Failed to create tenant: ${tenantError.message}`);
        results.tenants.failed.push(tenant.name);
      }
    }

    // Print final summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SEEDING COMPLETE - FINAL SUMMARY');
    console.log('='.repeat(60));
    console.log(`🏢 Tenants: ${results.tenants.successful.length}/${tenants.length} created`);
    console.log(`🏛️ Organizations: ${results.organizations.successful.length}/${totalOrgs} created`);
    console.log(`👥 Users: ${results.users.successful.length}/${totalUsers} created`);
    console.log('='.repeat(60));

    if (results.tenants.successful.length > 0) {
      console.log('\n✅ Successfully Created Tenants:');
      results.tenants.successful.forEach((name, i) => {
        console.log(`   ${i + 1}. ${name}`);
      });
    }

    // Take screenshots
    console.log('\n📸 Taking screenshots...');
    await page.goto(`${ADMIN_URL}/tenants`);
    await page.screenshot({ path: `tenants-${Date.now()}.png`, fullPage: true });

    await page.goto(`${ADMIN_URL}/organizations`);
    await page.screenshot({ path: `organizations-${Date.now()}.png`, fullPage: true });

    await page.goto(`${ADMIN_URL}/users`);
    await page.screenshot({ path: `users-${Date.now()}.png`, fullPage: true });

    console.log('✅ Screenshots saved');
  });
});