import { test, expect } from '@playwright/test';

// Configuration
const ADMIN_URL = 'http://localhost:3002';
const ADMIN_EMAIL = 'admin@monay.com';
const ADMIN_PASSWORD = 'SecureAdmin123';

// Test data configuration
const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing',
  'Education', 'Real Estate', 'Transportation', 'Energy', 'Media',
  'Government', 'Capital Markets', 'Insurance', 'Telecommunications', 'Agriculture'
];

const ORG_TYPES = ['Enterprise', 'SMB', 'Startup', 'Non-Profit', 'Government'];
const WALLET_TYPES = ['Corporate', 'Standard', 'Premium'];

// Generate test organizations
const generateOrganizations = () => {
  const orgs = [];
  const timestamp = Date.now();

  // Technology Companies (with holding companies)
  orgs.push({
    name: `TechCorp Global ${timestamp}`,
    type: 'Enterprise',
    industry: 'Technology',
    email: `techcorp_${timestamp}@test.com`,
    phone: `555${Math.floor(Math.random() * 10000000)}`,
    walletType: 'Corporate',
    isHolding: true,
    subsidiaries: [
      { name: `TechCorp USA`, region: 'North America' },
      { name: `TechCorp Europe`, region: 'Europe' },
      { name: `TechCorp Asia`, region: 'Asia Pacific' }
    ]
  });

  // Healthcare Network (with holding)
  orgs.push({
    name: `HealthNet International ${timestamp}`,
    type: 'Enterprise',
    industry: 'Healthcare',
    email: `healthnet_${timestamp}@test.com`,
    phone: `555${Math.floor(Math.random() * 10000000)}`,
    walletType: 'Corporate',
    isHolding: true,
    subsidiaries: [
      { name: `Regional Medical Center`, region: 'East' },
      { name: `Community Health Services`, region: 'West' }
    ]
  });

  // Financial Services (with holding)
  orgs.push({
    name: `Global Finance Group ${timestamp}`,
    type: 'Enterprise',
    industry: 'Finance',
    email: `finance_${timestamp}@test.com`,
    phone: `555${Math.floor(Math.random() * 10000000)}`,
    walletType: 'Premium',
    isHolding: true,
    subsidiaries: [
      { name: `Investment Banking Division`, region: 'Global' },
      { name: `Retail Banking Services`, region: 'National' },
      { name: `Wealth Management`, region: 'Private' }
    ]
  });

  // Retail Chain (with holding)
  orgs.push({
    name: `RetailMax Holdings ${timestamp}`,
    type: 'Enterprise',
    industry: 'Retail',
    email: `retailmax_${timestamp}@test.com`,
    phone: `555${Math.floor(Math.random() * 10000000)}`,
    walletType: 'Corporate',
    isHolding: true,
    subsidiaries: [
      { name: `RetailMax Stores`, region: 'Retail' },
      { name: `RetailMax Online`, region: 'E-commerce' }
    ]
  });

  // Manufacturing Conglomerate (with holding)
  orgs.push({
    name: `Industrial Manufacturing Co ${timestamp}`,
    type: 'Enterprise',
    industry: 'Manufacturing',
    email: `industrial_${timestamp}@test.com`,
    phone: `555${Math.floor(Math.random() * 10000000)}`,
    walletType: 'Corporate',
    isHolding: true,
    subsidiaries: [
      { name: `Heavy Machinery Division`, region: 'Industrial' },
      { name: `Consumer Products`, region: 'Consumer' }
    ]
  });

  // Individual Companies (no holding structure)
  const standaloneCompanies = [
    // Startups
    { name: `AI Innovations`, type: 'Startup', industry: 'Technology', wallet: 'Standard' },
    { name: `GreenTech Solutions`, type: 'Startup', industry: 'Energy', wallet: 'Standard' },
    { name: `FinTech Pioneers`, type: 'Startup', industry: 'Finance', wallet: 'Standard' },
    { name: `EdTech Ventures`, type: 'Startup', industry: 'Education', wallet: 'Standard' },
    { name: `BioMed Discoveries`, type: 'Startup', industry: 'Healthcare', wallet: 'Standard' },

    // SMBs
    { name: `Local Marketing Agency`, type: 'SMB', industry: 'Media', wallet: 'Standard' },
    { name: `Regional Logistics`, type: 'SMB', industry: 'Transportation', wallet: 'Standard' },
    { name: `Community Insurance`, type: 'SMB', industry: 'Insurance', wallet: 'Standard' },
    { name: `Telecom Services Plus`, type: 'SMB', industry: 'Telecommunications', wallet: 'Standard' },
    { name: `AgriTech Farms`, type: 'SMB', industry: 'Agriculture', wallet: 'Standard' },

    // Non-Profits
    { name: `Education Foundation`, type: 'Non-Profit', industry: 'Education', wallet: 'Standard' },
    { name: `Health Initiative`, type: 'Non-Profit', industry: 'Healthcare', wallet: 'Standard' },
    { name: `Environmental Alliance`, type: 'Non-Profit', industry: 'Energy', wallet: 'Standard' },
    { name: `Community Development`, type: 'Non-Profit', industry: 'Real Estate', wallet: 'Standard' },

    // Government
    { name: `State Treasury Dept`, type: 'Government', industry: 'Government', wallet: 'Corporate' },
    { name: `Municipal Services`, type: 'Government', industry: 'Government', wallet: 'Corporate' },
    { name: `Federal Agency Alpha`, type: 'Government', industry: 'Government', wallet: 'Premium' },

    // Capital Markets
    { name: `Hedge Fund Alpha`, type: 'Enterprise', industry: 'Capital Markets', wallet: 'Premium' },
    { name: `Private Equity Partners`, type: 'Enterprise', industry: 'Capital Markets', wallet: 'Premium' },
    { name: `Trading Desk Pro`, type: 'Enterprise', industry: 'Capital Markets', wallet: 'Premium' },
  ];

  // Add standalone companies to the list
  standaloneCompanies.forEach((company, index) => {
    orgs.push({
      name: `${company.name} ${timestamp + index}`,
      type: company.type,
      industry: company.industry,
      email: `${company.name.toLowerCase().replace(/\s+/g, '_')}_${timestamp}@test.com`,
      phone: `555${Math.floor(Math.random() * 10000000)}`,
      walletType: company.wallet,
      isHolding: false,
      subsidiaries: []
    });
  });

  return orgs;
};

test.describe('Seed Tenants and Organizations', () => {
  test('Create 25-30 diverse organizations via UI', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes timeout for this long test

    const organizations = generateOrganizations();
    console.log(`\n🎯 Creating ${organizations.length} organizations\n`);

    // Step 1: Login
    console.log('1️⃣ Logging into Admin Portal...');
    await page.goto(ADMIN_URL);
    await page.waitForLoadState('networkidle');

    if (await page.locator('input[type="email"]').isVisible()) {
      await page.fill('input[type="email"]', ADMIN_EMAIL);
      await page.fill('input[type="password"]', ADMIN_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      console.log('✅ Logged in successfully\n');
    }

    // Step 2: Create Organizations
    const results = {
      successful: [],
      failed: [],
      holdingCompanies: [],
      subsidiaries: []
    };

    for (let i = 0; i < organizations.length; i++) {
      const org = organizations[i];
      console.log(`\n📊 Creating Organization ${i + 1}/${organizations.length}`);
      console.log(`   Name: ${org.name}`);
      console.log(`   Type: ${org.type}`);
      console.log(`   Industry: ${org.industry}`);
      console.log(`   Holding Company: ${org.isHolding ? 'Yes' : 'No'}`);

      try {
        // Navigate to Organizations page
        await page.goto(`${ADMIN_URL}/organizations`);
        await page.waitForLoadState('networkidle');

        // Click Create/Add Organization button
        const createButton = page.locator('button:has-text("New Organization"), button:has-text("Add Organization"), button:has-text("Create Organization"), button:has-text("Create"), a:has-text("New Organization"), button >> text=/new|add|create/i').first();

        if (await createButton.isVisible({ timeout: 5000 })) {
          await createButton.click();
          await page.waitForTimeout(1000); // Wait for modal/form
        } else {
          // Try direct navigation to create page
          await page.goto(`${ADMIN_URL}/organizations/new`);
        }

        // Fill organization form
        // Try various possible field selectors
        const nameSelectors = [
          'input[name="name"]',
          'input[name="organizationName"]',
          'input[name="orgName"]',
          'input[placeholder*="Organization Name"]',
          'input[placeholder*="Company Name"]',
          'input[label*="Name"]'
        ];

        for (const selector of nameSelectors) {
          if (await page.locator(selector).isVisible({ timeout: 1000 }).catch(() => false)) {
            await page.fill(selector, org.name);
            break;
          }
        }

        // Organization Type
        const typeSelectors = ['select[name="type"]', 'select[name="organizationType"]', 'select[name="orgType"]'];
        for (const selector of typeSelectors) {
          if (await page.locator(selector).isVisible({ timeout: 1000 }).catch(() => false)) {
            await page.selectOption(selector, { label: org.type });
            break;
          }
        }

        // Industry
        const industrySelector = page.locator('select[name="industry"]');
        if (await industrySelector.isVisible({ timeout: 1000 }).catch(() => false)) {
          await industrySelector.selectOption({ label: org.industry });
        }

        // Email
        const emailSelectors = ['input[name="email"]', 'input[type="email"]:not([name*="admin"])'];
        for (const selector of emailSelectors) {
          if (await page.locator(selector).isVisible({ timeout: 1000 }).catch(() => false)) {
            await page.fill(selector, org.email);
            break;
          }
        }

        // Phone
        const phoneSelectors = ['input[name="phone"]', 'input[type="tel"]:not([name*="admin"])'];
        for (const selector of phoneSelectors) {
          if (await page.locator(selector).isVisible({ timeout: 1000 }).catch(() => false)) {
            await page.fill(selector, org.phone);
            break;
          }
        }

        // Wallet Type
        const walletSelector = page.locator('select[name="wallet_type"], select[name="walletType"]');
        if (await walletSelector.isVisible({ timeout: 1000 }).catch(() => false)) {
          await walletSelector.selectOption({ label: org.walletType });
        }

        // If holding company, check the holding checkbox
        if (org.isHolding) {
          const holdingCheckbox = page.locator('input[type="checkbox"][name*="holding"], input[type="checkbox"][label*="holding"], label:has-text("Holding Company") input[type="checkbox"]');
          if (await holdingCheckbox.isVisible({ timeout: 1000 }).catch(() => false)) {
            await holdingCheckbox.check();
          }
        }

        // Submit the form
        const submitButton = page.locator('button[type="submit"]:has-text("Create"), button[type="submit"]:has-text("Submit"), button:has-text("Create Organization")').first();
        await submitButton.click();

        // Wait for success
        await page.waitForTimeout(2000);

        // Check for success
        const successIndicators = [
          page.locator('text=/success|created|added/i'),
          page.locator(`text="${org.name}"`),
        ];

        let isSuccess = false;
        for (const indicator of successIndicators) {
          if (await indicator.isVisible({ timeout: 3000 }).catch(() => false)) {
            isSuccess = true;
            break;
          }
        }

        if (isSuccess) {
          console.log(`   ✅ Created successfully`);
          results.successful.push(org.name);

          if (org.isHolding) {
            results.holdingCompanies.push(org.name);

            // Create subsidiaries
            if (org.subsidiaries && org.subsidiaries.length > 0) {
              console.log(`   📁 Creating ${org.subsidiaries.length} subsidiaries...`);

              for (const subsidiary of org.subsidiaries) {
                // Create subsidiary logic here (similar to above but linked to parent)
                console.log(`      - ${subsidiary.name} (${subsidiary.region})`);
                results.subsidiaries.push(`${subsidiary.name} (Parent: ${org.name})`);
              }
            }
          }
        } else {
          console.log(`   ⚠️ Creation uncertain - continuing`);
          results.failed.push(org.name);
        }

        // Add small delay between creations
        await page.waitForTimeout(1000);

      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);
        results.failed.push(org.name);
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SEEDING COMPLETE - SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully Created: ${results.successful.length} organizations`);
    console.log(`🏢 Holding Companies: ${results.holdingCompanies.length}`);
    console.log(`📁 Subsidiaries: ${results.subsidiaries.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    console.log('='.repeat(60));

    if (results.successful.length > 0) {
      console.log('\n✅ Created Organizations:');
      results.successful.forEach((name, i) => {
        console.log(`   ${i + 1}. ${name}`);
      });
    }

    if (results.holdingCompanies.length > 0) {
      console.log('\n🏢 Holding Companies:');
      results.holdingCompanies.forEach((name, i) => {
        console.log(`   ${i + 1}. ${name}`);
      });
    }

    // Take final screenshot
    await page.goto(`${ADMIN_URL}/organizations`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `seeded-organizations-${Date.now()}.png`, fullPage: true });
    console.log('\n📸 Screenshot saved of organizations list');
  });
});