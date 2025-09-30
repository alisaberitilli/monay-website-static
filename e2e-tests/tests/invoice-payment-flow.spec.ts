import { test, expect, Page, BrowserContext } from '@playwright/test';

// Test data
const testData = {
  organization: {
    name: `TestOrg_${Date.now()}`,
    email: `testorg_${Date.now()}@example.com`,
    phone: `+1555${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
    address: '123 Test Street',
    city: 'Test City',
    state: 'CA',
    zip: '90001'
  },
  adminUser: {
    firstName: 'Admin',
    lastName: 'User',
    email: `admin_${Date.now()}@example.com`,
    password: 'TestPass123!',
    mpin: '1234'
  },
  consumerUser: {
    firstName: 'Consumer',
    lastName: 'User',
    email: `consumer_${Date.now()}@example.com`,
    phone: `+1555${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
    password: 'ConsumerPass123!',
    mpin: '5678'
  },
  invoice: {
    amount: 100.00,
    description: 'Test Invoice for E2E Testing',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days from now
  }
};

// Store tokens and IDs across tests
let adminAuthToken: string;
let consumerAuthToken: string;
let organizationId: string;
let invoiceId: string;
let consumerWalletId: string;
let enterpriseWalletId: string;

test.describe('End-to-End Invoice Payment Flow', () => {
  let adminContext: BrowserContext;
  let consumerContext: BrowserContext;
  let adminPage: Page;
  let consumerPage: Page;
  let enterprisePage: Page;

  test.beforeAll(async ({ browser }) => {
    // Create separate contexts for admin and consumer
    adminContext = await browser.newContext();
    consumerContext = await browser.newContext();

    adminPage = await adminContext.newPage();
    consumerPage = await consumerContext.newPage();
    enterprisePage = await adminContext.newPage(); // Enterprise wallet shares admin context
  });

  test.afterAll(async () => {
    await adminContext.close();
    await consumerContext.close();
  });

  test('Step 1: Register Tenant Organization in Admin Portal', async () => {
    // Navigate to Admin Portal
    await adminPage.goto('http://localhost:3002/login');

    // Login as admin with correct credentials
    await adminPage.fill('input[name="email"]', 'admin@monay.com');
    await adminPage.fill('input[name="password"]', 'Admin@Monay2025!');
    await adminPage.click('button[type="submit"]');

    // Wait for dashboard
    await adminPage.waitForURL('**/dashboard');

    // Navigate to Organizations
    await adminPage.click('text=Organizations');
    await adminPage.waitForURL('**/organizations');

    // Create new organization
    await adminPage.click('button:has-text("New Organization")');

    // Fill organization form
    await adminPage.fill('input[name="organizationName"]', testData.organization.name);
    await adminPage.fill('input[name="email"]', testData.organization.email);
    await adminPage.fill('input[name="phone"]', testData.organization.phone);
    await adminPage.fill('input[name="address"]', testData.organization.address);
    await adminPage.fill('input[name="city"]', testData.organization.city);
    await adminPage.fill('input[name="state"]', testData.organization.state);
    await adminPage.fill('input[name="zip"]', testData.organization.zip);

    // Select organization type
    await adminPage.selectOption('select[name="organizationType"]', 'enterprise');

    // Submit form
    await adminPage.click('button:has-text("Create Organization")');

    // Wait for success message
    await expect(adminPage.locator('text=Organization created successfully')).toBeVisible({ timeout: 10000 });

    // Capture organization ID from URL or response
    const url = adminPage.url();
    organizationId = url.match(/organizations\/([^\/]+)/)?.[1] || '';
    console.log('Organization created with ID:', organizationId);
  });

  test('Step 2: Create Organization Admin User', async () => {
    // Still in admin portal, navigate to Users
    await adminPage.click('text=Users');
    await adminPage.waitForURL('**/users');

    // Create new user
    await adminPage.click('button:has-text("New User")');

    // Fill user form
    await adminPage.fill('input[name="firstName"]', testData.adminUser.firstName);
    await adminPage.fill('input[name="lastName"]', testData.adminUser.lastName);
    await adminPage.fill('input[name="email"]', testData.adminUser.email);
    await adminPage.fill('input[name="password"]', testData.adminUser.password);

    // Set user role as organization admin
    await adminPage.selectOption('select[name="role"]', 'org_admin');

    // Associate with organization
    await adminPage.selectOption('select[name="organizationId"]', organizationId);

    // Enable enterprise wallet access
    await adminPage.check('input[name="enableEnterpriseWallet"]');

    // Submit form
    await adminPage.click('button:has-text("Create User")');

    // Wait for success message
    await expect(adminPage.locator('text=User created successfully')).toBeVisible({ timeout: 10000 });

    console.log('Organization admin user created:', testData.adminUser.email);
  });

  test('Step 3: Login to Enterprise Wallet as Org Admin', async () => {
    // Navigate to Enterprise Wallet
    await enterprisePage.goto('http://localhost:3007/login');

    // Login with org admin credentials
    await enterprisePage.fill('input[name="email"]', testData.adminUser.email);
    await enterprisePage.fill('input[name="password"]', testData.adminUser.password);
    await enterprisePage.click('button[type="submit"]');

    // Wait for dashboard
    await enterprisePage.waitForURL('**/dashboard');

    // Verify organization wallet is created
    await expect(enterprisePage.locator('text=Enterprise Wallet Dashboard')).toBeVisible();

    // Check wallet balance (should be 0 initially)
    const balanceElement = await enterprisePage.locator('[data-testid="wallet-balance"]');
    await expect(balanceElement).toContainText('$0.00');

    console.log('Logged into Enterprise Wallet successfully');
  });

  test('Step 4: Register Consumer User in Consumer Wallet', async () => {
    // Navigate to Consumer Wallet
    await consumerPage.goto('http://localhost:3003/auth/register');

    // Fill registration form
    await consumerPage.fill('input[name="firstName"]', testData.consumerUser.firstName);
    await consumerPage.fill('input[name="lastName"]', testData.consumerUser.lastName);
    await consumerPage.fill('input[name="email"]', testData.consumerUser.email);
    await consumerPage.fill('input[name="mobileNumber"]', testData.consumerUser.phone);
    await consumerPage.fill('input[name="password"]', testData.consumerUser.password);
    await consumerPage.fill('input[name="confirmPassword"]', testData.consumerUser.password);

    // Accept terms
    await consumerPage.check('input[name="acceptTerms"]');

    // Submit registration
    await consumerPage.click('button:has-text("Create Account")');

    // Wait for redirect to dashboard or verification
    await consumerPage.waitForURL(/\/(dashboard|verify)/);

    // If verification required, handle it
    if (consumerPage.url().includes('verify')) {
      // In test mode, auto-verify or skip
      console.log('Verification step - skipping in test mode');
    }

    console.log('Consumer user registered:', testData.consumerUser.email);
  });

  test('Step 5: Create Invoice in Enterprise Wallet', async () => {
    // Back to Enterprise Wallet
    await enterprisePage.bringToFront();

    // Navigate to Invoices
    await enterprisePage.click('text=Invoices');
    await enterprisePage.waitForURL('**/invoices');

    // Create new invoice
    await enterprisePage.click('button:has-text("Create Invoice")');

    // Fill invoice form
    await enterprisePage.fill('input[name="recipientEmail"]', testData.consumerUser.email);
    await enterprisePage.fill('input[name="amount"]', testData.invoice.amount.toString());
    await enterprisePage.fill('textarea[name="description"]', testData.invoice.description);
    await enterprisePage.fill('input[name="dueDate"]', testData.invoice.dueDate);

    // Add line items if needed
    await enterprisePage.click('button:has-text("Add Item")');
    await enterprisePage.fill('input[name="itemDescription"]', 'Test Service');
    await enterprisePage.fill('input[name="itemAmount"]', testData.invoice.amount.toString());

    // Send invoice
    await enterprisePage.click('button:has-text("Send Invoice")');

    // Wait for success message
    await expect(enterprisePage.locator('text=Invoice sent successfully')).toBeVisible({ timeout: 10000 });

    // Capture invoice ID
    const invoiceUrl = enterprisePage.url();
    invoiceId = invoiceUrl.match(/invoices\/([^\/]+)/)?.[1] || '';

    console.log('Invoice created with ID:', invoiceId);
  });

  test('Step 6: Consumer Tops Up Wallet with Card', async () => {
    // Switch to Consumer Wallet
    await consumerPage.bringToFront();

    // Navigate to Add Money
    await consumerPage.goto('http://localhost:3003/add-money');

    // Select card payment method
    await consumerPage.click('text=Card Payment');

    // Enter amount (enough to pay invoice)
    await consumerPage.fill('input[name="amount"]', '150'); // $150 to cover $100 invoice

    // Fill card details (test card)
    await consumerPage.fill('input[name="cardNumber"]', '4242424242424242');
    await consumerPage.fill('input[name="expMonth"]', '12');
    await consumerPage.fill('input[name="expYear"]', '2025');
    await consumerPage.fill('input[name="cvv"]', '123');
    await consumerPage.fill('input[name="nameOnCard"]', `${testData.consumerUser.firstName} ${testData.consumerUser.lastName}`);

    // Enter MPIN
    await consumerPage.fill('input[name="mpin"]', testData.consumerUser.mpin);

    // Submit payment
    await consumerPage.click('button:has-text("Add Money")');

    // Wait for success
    await expect(consumerPage.locator('text=Successfully deposited $150.00')).toBeVisible({ timeout: 15000 });

    // Verify new balance
    const balanceElement = await consumerPage.locator('[data-testid="wallet-balance"]');
    await expect(balanceElement).toContainText('$150.00');

    console.log('Consumer wallet topped up with $150');
  });

  test('Step 7: Consumer Pays Invoice Using Tempo', async () => {
    // Navigate to Invoices/Payments section
    await consumerPage.click('text=Invoices');
    await consumerPage.waitForURL('**/invoices');

    // Find the pending invoice
    await expect(consumerPage.locator(`text=${testData.invoice.description}`)).toBeVisible();

    // Click on the invoice to view details
    await consumerPage.click(`text=${testData.invoice.description}`);

    // Review invoice details
    await expect(consumerPage.locator('text=Invoice Details')).toBeVisible();
    await expect(consumerPage.locator(`text=$${testData.invoice.amount}`)).toBeVisible();

    // Select Tempo as payment method
    await consumerPage.click('text=Pay with Tempo');

    // Confirm payment details
    await expect(consumerPage.locator('text=Payment Summary')).toBeVisible();
    await expect(consumerPage.locator('text=Payment Method: Tempo')).toBeVisible();

    // Enter MPIN for payment authorization
    await consumerPage.fill('input[name="mpin"]', testData.consumerUser.mpin);

    // Confirm payment
    await consumerPage.click('button:has-text("Confirm Payment")');

    // Wait for payment processing
    await expect(consumerPage.locator('text=Processing payment...')).toBeVisible();

    // Wait for success message
    await expect(consumerPage.locator('text=Payment successful')).toBeVisible({ timeout: 15000 });

    // Verify updated balance (should be $50 after paying $100 invoice)
    const newBalance = await consumerPage.locator('[data-testid="wallet-balance"]');
    await expect(newBalance).toContainText('$50.00');

    console.log('Invoice paid successfully via Tempo');
  });

  test('Step 8: Verify Payment in Enterprise Wallet', async () => {
    // Switch back to Enterprise Wallet
    await enterprisePage.bringToFront();

    // Refresh the page to see updated balance
    await enterprisePage.reload();

    // Check updated wallet balance (should show $100 received)
    const enterpriseBalance = await enterprisePage.locator('[data-testid="wallet-balance"]');
    await expect(enterpriseBalance).toContainText('$100.00');

    // Navigate to transactions
    await enterprisePage.click('text=Transactions');
    await enterprisePage.waitForURL('**/transactions');

    // Verify the incoming payment transaction
    await expect(enterprisePage.locator('text=Payment Received')).toBeVisible();
    await expect(enterprisePage.locator(`text=$${testData.invoice.amount}`)).toBeVisible();
    await expect(enterprisePage.locator(`text=${testData.consumerUser.email}`)).toBeVisible();

    // Check invoice status (should be marked as paid)
    await enterprisePage.click('text=Invoices');
    await enterprisePage.waitForURL('**/invoices');

    // Find the invoice and verify status
    const invoiceRow = enterprisePage.locator(`tr:has-text("${testData.invoice.description}")`);
    await expect(invoiceRow.locator('text=Paid')).toBeVisible();

    console.log('Payment verified in Enterprise Wallet');
    console.log('End-to-end test completed successfully!');
  });

  test('Step 9: Verify Audit Trail and Compliance', async () => {
    // Optional: Check audit logs in admin portal
    await adminPage.bringToFront();

    // Navigate to Audit Logs
    await adminPage.click('text=Audit Logs');
    await adminPage.waitForURL('**/audit-logs');

    // Verify key events are logged
    const events = [
      'Organization Created',
      'User Created',
      'Invoice Created',
      'Payment Processed',
      'Wallet Topped Up'
    ];

    for (const event of events) {
      await expect(adminPage.locator(`text=${event}`)).toBeVisible();
    }

    console.log('Audit trail verified');
  });
});