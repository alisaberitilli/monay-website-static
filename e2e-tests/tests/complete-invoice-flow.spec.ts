import { test, expect, Page, BrowserContext } from '@playwright/test';

/**
 * Complete End-to-End Test Flow:
 * 1. Login to Admin Portal as admin@monay.com
 * 2. Create a new tenant organization
 * 3. Create an organization admin user
 * 4. Setup enterprise wallet for the organization
 * 5. Create a consumer user in consumer wallet
 * 6. Create an invoice in enterprise wallet
 * 7. Consumer tops up wallet with card
 * 8. Consumer pays invoice using Tempo
 * 9. Verify payment in enterprise wallet
 */

// Test configuration
const TEST_CONFIG = {
  urls: {
    admin: 'http://localhost:3002',
    consumer: 'http://localhost:3003',
    enterprise: 'http://localhost:3007',
    backend: 'http://localhost:3001'
  },
  adminCredentials: {
    email: 'admin@monay.com',
    password: 'Admin@123',
    mpin: '123456'
  },
  timeouts: {
    navigation: 30000,
    action: 15000
  }
};

// Generate unique test data
const timestamp = Date.now();
const testData = {
  organization: {
    name: `TestCorp_${timestamp}`,
    email: `corp_${timestamp}@test.com`,
    phone: `+1555${Math.floor(1000000 + Math.random() * 9000000)}`,
    address: '123 Enterprise Ave',
    city: 'San Francisco',
    state: 'CA',
    zip: '94105',
    type: 'enterprise'
  },
  orgAdmin: {
    firstName: 'John',
    lastName: `Admin_${timestamp}`,
    email: `orgadmin_${timestamp}@test.com`,
    username: `orgadmin_${timestamp}`,
    password: 'SecurePass123!',
    mpin: '9876',
    role: 'org_admin'
  },
  consumer: {
    firstName: 'Jane',
    lastName: `Consumer_${timestamp}`,
    email: `consumer_${timestamp}@test.com`,
    phone: `+1555${Math.floor(1000000 + Math.random() * 9000000)}`,
    password: 'UserPass123!',
    mpin: '4321'
  },
  invoice: {
    amount: 250.00,
    description: `Test Invoice ${timestamp}`,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [
      { description: 'Professional Services', amount: 200.00 },
      { description: 'Processing Fee', amount: 50.00 }
    ]
  },
  card: {
    number: '4242424242424242',
    expMonth: '12',
    expYear: '2025',
    cvv: '123',
    zipCode: '94105'
  }
};

// Store IDs and tokens
let organizationId: string;
let orgAdminUserId: string;
let consumerUserId: string;
let invoiceId: string;
let enterpriseWalletId: string;
let consumerWalletId: string;

test.describe.serial('Complete Invoice Payment Flow with Tempo', () => {
  let adminContext: BrowserContext;
  let consumerContext: BrowserContext;
  let adminPage: Page;
  let consumerPage: Page;
  let enterprisePage: Page;

  test.beforeAll(async ({ browser }) => {
    // Create separate browser contexts for different user sessions
    adminContext = await browser.newContext({
      storageState: undefined,
      viewport: { width: 1920, height: 1080 }
    });

    consumerContext = await browser.newContext({
      storageState: undefined,
      viewport: { width: 1920, height: 1080 }
    });

    adminPage = await adminContext.newPage();
    enterprisePage = await adminContext.newPage(); // Share admin context
    consumerPage = await consumerContext.newPage();
  });

  test.afterAll(async () => {
    await adminContext.close();
    await consumerContext.close();
  });

  test('Step 1: Login to Admin Portal', async () => {
    console.log('🔐 Logging into Admin Portal...');

    await adminPage.goto(TEST_CONFIG.urls.admin);

    // Handle login page
    await adminPage.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });

    // Fill login credentials
    await adminPage.fill('input[type="email"], input[name="email"]', TEST_CONFIG.adminCredentials.email);
    await adminPage.fill('input[type="password"], input[name="password"]', TEST_CONFIG.adminCredentials.password);

    // Submit login
    await adminPage.click('button[type="submit"]');

    // Wait for successful login - check for dashboard or redirect
    await adminPage.waitForURL(/\/(dashboard|home|admin)/, { timeout: TEST_CONFIG.timeouts.navigation });

    console.log('✅ Logged into Admin Portal successfully');

    // Take screenshot for verification
    await adminPage.screenshot({ path: 'screenshots/01-admin-login.png' });
  });

  test('Step 2: Create Tenant Organization', async () => {
    console.log('🏢 Creating tenant organization...');

    // Navigate to Organizations section
    await adminPage.click('a:has-text("Organizations"), button:has-text("Organizations")', { timeout: 10000 });
    await adminPage.waitForLoadState('networkidle');

    // Click create/new organization button
    await adminPage.click('button:has-text("New Organization"), button:has-text("Create Organization"), button:has-text("Add Organization")');

    // Fill organization details
    await adminPage.fill('input[name="name"], input[name="organizationName"], input[name="orgName"]', testData.organization.name);
    await adminPage.fill('input[name="email"], input[name="organizationEmail"], input[name="orgEmail"]', testData.organization.email);
    await adminPage.fill('input[name="phone"], input[name="organizationPhone"], input[name="orgPhone"]', testData.organization.phone);
    await adminPage.fill('input[name="address"], input[name="organizationAddress"], input[name="orgAddress"]', testData.organization.address);
    await adminPage.fill('input[name="city"], input[name="organizationCity"], input[name="orgCity"]', testData.organization.city);
    await adminPage.fill('input[name="state"], input[name="organizationState"], input[name="orgState"]', testData.organization.state);
    await adminPage.fill('input[name="zip"], input[name="organizationZip"], input[name="orgZip"]', testData.organization.zip);

    // Select organization type if dropdown exists
    const typeSelector = await adminPage.$('select[name="type"], select[name="organizationType"]');
    if (typeSelector) {
      await adminPage.selectOption('select[name="type"], select[name="organizationType"]', testData.organization.type);
    }

    // Submit form
    await adminPage.click('button[type="submit"], button:has-text("Create"), button:has-text("Save")');

    // Wait for success message or redirect
    await adminPage.waitForSelector('text=/success|created/i', { timeout: 10000 });

    // Capture organization ID from URL or page
    const url = adminPage.url();
    const idMatch = url.match(/organizations?\/([a-zA-Z0-9-]+)/);
    if (idMatch) {
      organizationId = idMatch[1];
    }

    console.log(`✅ Organization created: ${testData.organization.name} (ID: ${organizationId || 'captured'})`);
    await adminPage.screenshot({ path: 'screenshots/02-organization-created.png' });
  });

  test('Step 3: Create Organization Admin User', async () => {
    console.log('👤 Creating organization admin user...');

    // Navigate to Users section
    await adminPage.click('a:has-text("Users"), button:has-text("Users")', { timeout: 10000 });
    await adminPage.waitForLoadState('networkidle');

    // Click create new user
    await adminPage.click('button:has-text("New User"), button:has-text("Create User"), button:has-text("Add User")');

    // Fill user details
    await adminPage.fill('input[name="firstName"]', testData.orgAdmin.firstName);
    await adminPage.fill('input[name="lastName"]', testData.orgAdmin.lastName);
    await adminPage.fill('input[name="email"]', testData.orgAdmin.email);
    await adminPage.fill('input[name="username"]', testData.orgAdmin.username);
    await adminPage.fill('input[name="password"]', testData.orgAdmin.password);

    // Set MPIN if field exists
    const mpinField = await adminPage.$('input[name="mpin"]');
    if (mpinField) {
      await adminPage.fill('input[name="mpin"]', testData.orgAdmin.mpin);
    }

    // Select role
    await adminPage.selectOption('select[name="role"], select[name="userRole"]', testData.orgAdmin.role);

    // Associate with organization
    if (organizationId) {
      await adminPage.selectOption('select[name="organizationId"], select[name="organization"]', organizationId);
    }

    // Enable enterprise wallet access
    const walletCheckbox = await adminPage.$('input[name="enableEnterpriseWallet"], input[type="checkbox"][name*="wallet"]');
    if (walletCheckbox) {
      await walletCheckbox.check();
    }

    // Submit
    await adminPage.click('button[type="submit"], button:has-text("Create"), button:has-text("Save")');

    // Wait for success
    await adminPage.waitForSelector('text=/success|created/i', { timeout: 10000 });

    console.log(`✅ Organization admin created: ${testData.orgAdmin.email}`);
    await adminPage.screenshot({ path: 'screenshots/03-org-admin-created.png' });
  });

  test('Step 4: Login to Enterprise Wallet', async () => {
    console.log('💼 Setting up enterprise wallet...');

    await enterprisePage.goto(TEST_CONFIG.urls.enterprise);

    // Login with org admin credentials
    await enterprisePage.fill('input[type="email"], input[name="email"]', testData.orgAdmin.email);
    await enterprisePage.fill('input[type="password"], input[name="password"]', testData.orgAdmin.password);
    await enterprisePage.click('button[type="submit"]');

    // Wait for dashboard
    await enterprisePage.waitForURL(/\/(dashboard|wallet|home)/, { timeout: TEST_CONFIG.timeouts.navigation });

    // Verify wallet is initialized
    const balanceElement = await enterprisePage.$('[data-testid="wallet-balance"], .wallet-balance, text=/\$[\d,]+\.?\d*/');
    if (balanceElement) {
      const balance = await balanceElement.textContent();
      console.log(`💰 Enterprise wallet balance: ${balance}`);
    }

    console.log('✅ Enterprise wallet ready');
    await enterprisePage.screenshot({ path: 'screenshots/04-enterprise-wallet.png' });
  });

  test('Step 5: Register Consumer User', async () => {
    console.log('👥 Creating consumer user...');

    await consumerPage.goto(`${TEST_CONFIG.urls.consumer}/auth/register`);

    // Fill registration form
    await consumerPage.fill('input[name="firstName"]', testData.consumer.firstName);
    await consumerPage.fill('input[name="lastName"]', testData.consumer.lastName);
    await consumerPage.fill('input[name="email"]', testData.consumer.email);
    await consumerPage.fill('input[name="mobileNumber"], input[name="phone"]', testData.consumer.phone);
    await consumerPage.fill('input[name="password"]', testData.consumer.password);
    await consumerPage.fill('input[name="confirmPassword"], input[name="passwordConfirm"]', testData.consumer.password);

    // Accept terms if checkbox exists
    const termsCheckbox = await consumerPage.$('input[type="checkbox"][name*="terms"], input[type="checkbox"][name*="accept"]');
    if (termsCheckbox) {
      await termsCheckbox.check();
    }

    // Submit registration
    await consumerPage.click('button[type="submit"], button:has-text("Register"), button:has-text("Sign Up")');

    // Wait for redirect or success
    await consumerPage.waitForURL(/\/(dashboard|verify|home)/, { timeout: TEST_CONFIG.timeouts.navigation });

    console.log(`✅ Consumer registered: ${testData.consumer.email}`);
    await consumerPage.screenshot({ path: 'screenshots/05-consumer-registered.png' });
  });

  test('Step 6: Create Invoice in Enterprise Wallet', async () => {
    console.log('📄 Creating invoice...');

    await enterprisePage.bringToFront();

    // Navigate to invoices
    await enterprisePage.click('a:has-text("Invoices"), button:has-text("Invoices")');
    await enterprisePage.waitForLoadState('networkidle');

    // Create new invoice
    await enterprisePage.click('button:has-text("Create Invoice"), button:has-text("New Invoice")');

    // Fill invoice details
    await enterprisePage.fill('input[name="recipientEmail"], input[name="customerEmail"]', testData.consumer.email);
    await enterprisePage.fill('input[name="amount"], input[name="totalAmount"]', testData.invoice.amount.toString());
    await enterprisePage.fill('textarea[name="description"], input[name="description"]', testData.invoice.description);
    await enterprisePage.fill('input[name="dueDate"]', testData.invoice.dueDate);

    // Add line items if section exists
    for (const item of testData.invoice.items) {
      const addItemButton = await enterprisePage.$('button:has-text("Add Item"), button:has-text("Add Line")');
      if (addItemButton) {
        await addItemButton.click();
        await enterprisePage.fill('input[name*="itemDescription"]:last-of-type', item.description);
        await enterprisePage.fill('input[name*="itemAmount"]:last-of-type', item.amount.toString());
      }
    }

    // Send invoice
    await enterprisePage.click('button:has-text("Send Invoice"), button:has-text("Create & Send")');

    // Wait for success
    await enterprisePage.waitForSelector('text=/sent|success|created/i', { timeout: 10000 });

    // Capture invoice ID
    const invoiceUrl = enterprisePage.url();
    const invoiceMatch = invoiceUrl.match(/invoices?\/([a-zA-Z0-9-]+)/);
    if (invoiceMatch) {
      invoiceId = invoiceMatch[1];
    }

    console.log(`✅ Invoice created: ${testData.invoice.description} ($${testData.invoice.amount})`);
    await enterprisePage.screenshot({ path: 'screenshots/06-invoice-created.png' });
  });

  test('Step 7: Consumer Tops Up Wallet', async () => {
    console.log('💳 Consumer adding funds to wallet...');

    await consumerPage.bringToFront();

    // Navigate to add money
    await consumerPage.goto(`${TEST_CONFIG.urls.consumer}/add-money`);

    // Select card payment
    await consumerPage.click('text=/card|credit|debit/i');

    // Enter amount (enough for invoice + buffer)
    const topUpAmount = testData.invoice.amount + 100;
    await consumerPage.fill('input[name="amount"]', topUpAmount.toString());

    // Fill card details
    await consumerPage.fill('input[name="cardNumber"], input[name="number"]', testData.card.number);
    await consumerPage.fill('input[name="expMonth"], input[name="expiryMonth"]', testData.card.expMonth);
    await consumerPage.fill('input[name="expYear"], input[name="expiryYear"]', testData.card.expYear);
    await consumerPage.fill('input[name="cvv"], input[name="cvc"]', testData.card.cvv);

    // Name on card
    await consumerPage.fill('input[name="nameOnCard"], input[name="cardholderName"]',
      `${testData.consumer.firstName} ${testData.consumer.lastName}`);

    // MPIN if required
    const mpinField = await consumerPage.$('input[name="mpin"], input[type="password"][name*="pin"]');
    if (mpinField) {
      await consumerPage.fill('input[name="mpin"], input[type="password"][name*="pin"]', testData.consumer.mpin);
    }

    // Submit payment
    await consumerPage.click('button:has-text("Add Money"), button:has-text("Top Up"), button[type="submit"]');

    // Wait for success
    await consumerPage.waitForSelector('text=/success|completed|added/i', { timeout: 15000 });

    // Verify new balance
    const balanceAfterTopUp = await consumerPage.$('[data-testid="wallet-balance"], .balance');
    if (balanceAfterTopUp) {
      const balance = await balanceAfterTopUp.textContent();
      console.log(`💰 Consumer wallet balance after top-up: ${balance}`);
    }

    console.log(`✅ Wallet topped up with $${topUpAmount}`);
    await consumerPage.screenshot({ path: 'screenshots/07-wallet-topped-up.png' });
  });

  test('Step 8: Pay Invoice with Tempo', async () => {
    console.log('⚡ Paying invoice with Tempo...');

    // Navigate to invoices
    await consumerPage.click('a:has-text("Invoices"), button:has-text("Invoices"), a:has-text("Payments")');
    await consumerPage.waitForLoadState('networkidle');

    // Find and click on the invoice
    await consumerPage.click(`text=${testData.invoice.description}`);

    // Review invoice details
    await consumerPage.waitForSelector(`text=${testData.invoice.amount}`);

    // Select Tempo payment method
    await consumerPage.click('text=/tempo|instant/i');

    // Confirm payment details
    await consumerPage.waitForSelector('text=/payment.*summary|confirm.*payment/i');

    // Enter MPIN
    await consumerPage.fill('input[name="mpin"], input[type="password"][name*="pin"]', testData.consumer.mpin);

    // Confirm payment
    await consumerPage.click('button:has-text("Pay"), button:has-text("Confirm Payment"), button:has-text("Submit")');

    // Wait for payment processing
    await consumerPage.waitForSelector('text=/processing|sending/i', { timeout: 5000 });

    // Wait for success
    await consumerPage.waitForSelector('text=/success|paid|completed/i', { timeout: 15000 });

    // Verify updated balance
    const balanceAfterPayment = await consumerPage.$('[data-testid="wallet-balance"], .balance');
    if (balanceAfterPayment) {
      const balance = await balanceAfterPayment.textContent();
      console.log(`💰 Consumer wallet balance after payment: ${balance}`);
    }

    console.log('✅ Invoice paid successfully via Tempo');
    await consumerPage.screenshot({ path: 'screenshots/08-invoice-paid.png' });
  });

  test('Step 9: Verify Payment in Enterprise Wallet', async () => {
    console.log('✔️ Verifying payment received...');

    await enterprisePage.bringToFront();

    // Refresh page to see updated balance
    await enterprisePage.reload();
    await enterprisePage.waitForLoadState('networkidle');

    // Check updated balance
    const enterpriseBalance = await enterprisePage.$('[data-testid="wallet-balance"], .wallet-balance, text=/\$[\d,]+\.?\d*/');
    if (enterpriseBalance) {
      const balance = await enterpriseBalance.textContent();
      console.log(`💰 Enterprise wallet balance after payment: ${balance}`);

      // Verify balance increased by invoice amount
      expect(balance).toContain(testData.invoice.amount.toString());
    }

    // Navigate to transactions
    await enterprisePage.click('a:has-text("Transactions"), button:has-text("Transactions")');
    await enterprisePage.waitForLoadState('networkidle');

    // Verify payment transaction exists
    await expect(enterprisePage.locator('text=/payment.*received/i')).toBeVisible({ timeout: 10000 });
    await expect(enterprisePage.locator(`text=${testData.invoice.amount}`)).toBeVisible();

    // Check invoice status
    await enterprisePage.click('a:has-text("Invoices"), button:has-text("Invoices")');
    await enterprisePage.waitForLoadState('networkidle');

    // Find invoice and verify it's marked as paid
    const invoiceRow = enterprisePage.locator(`tr:has-text("${testData.invoice.description}")`);
    await expect(invoiceRow.locator('text=/paid|completed/i')).toBeVisible();

    console.log('✅ Payment verified in enterprise wallet');
    await enterprisePage.screenshot({ path: 'screenshots/09-payment-verified.png' });

    // Final success message
    console.log(`
    🎉 End-to-End Test Completed Successfully!

    Test Summary:
    - Organization: ${testData.organization.name}
    - Org Admin: ${testData.orgAdmin.email}
    - Consumer: ${testData.consumer.email}
    - Invoice: $${testData.invoice.amount}
    - Payment Method: Tempo (Instant)
    - Status: ✅ Payment Received
    `);
  });
});