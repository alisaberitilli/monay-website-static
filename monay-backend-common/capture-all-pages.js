import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function captureAllPages() {
  console.log('OneQA Complete Capture Tool');
  console.log('===========================\n');
  console.log('This will capture data from:');
  console.log('1. Login page');
  console.log('2. Home page (service providers)'); 
  console.log('3. Bills page\n');
  
  const browser = await chromium.launch({
    headless: false,
    args: ['--disable-blink-features=AutomationControlled']
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    });
    
    const page = await context.newPage();
    const timestamp = Date.now();
    const screenshotDir = path.join(process.cwd(), 'oneqa-captures', `session-${timestamp}`);
    
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    
    // Step 1: Login page
    console.log('📝 Step 1: Navigate to login page');
    await page.goto('https://oneqa.utilli.com/login', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    console.log('⏳ Please log in manually...');
    console.log('   Waiting 30 seconds for login...\n');
    await page.waitForTimeout(30000);
    
    // Step 2: Capture home page (service providers)
    console.log('📝 Step 2: Capturing home page (service providers)');
    const homeUrl = page.url();
    
    if (!homeUrl.includes('/home')) {
      await page.goto('https://oneqa.utilli.com/home', {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });
      await page.waitForTimeout(3000);
    }
    
    // Screenshot home
    await page.screenshot({ 
      path: path.join(screenshotDir, 'home.png'), 
      fullPage: true 
    });
    console.log('   ✅ Home screenshot saved');
    
    // Extract service providers
    const providers = await page.evaluate(() => {
      const results = [];
      
      // Strategy 1: Look for known providers
      const knownProviders = ['Pepco', 'Pennsylvania American Water', 'Washington Gas'];
      
      // Strategy 2: Find by class names we discovered
      const providerElements = document.querySelectorAll('.service-provider');
      providerElements.forEach(element => {
        results.push({
          type: 'service-provider-class',
          class: element.className,
          text: element.textContent?.trim(),
          clickable: element.tagName === 'A' || element.tagName === 'BUTTON' || !!element.onclick
        });
      });
      
      // Strategy 3: Find by text content
      document.querySelectorAll('div, a, button, section').forEach(element => {
        const text = element.textContent?.trim();
        knownProviders.forEach(provider => {
          if (text && text.includes(provider) && !element.querySelector('.service-provider')) {
            results.push({
              type: 'text-match',
              provider: provider,
              tag: element.tagName,
              class: element.className,
              id: element.id,
              parentClass: element.parentElement?.className
            });
          }
        });
      });
      
      // Strategy 4: Find any cards/items
      document.querySelectorAll('[class*="card"], [class*="item"], [class*="provider"]').forEach(element => {
        const text = element.textContent?.trim();
        if (text && text.length > 10 && text.length < 200) {
          results.push({
            type: 'card',
            text: text,
            class: element.className
          });
        }
      });
      
      return results;
    });
    
    fs.writeFileSync(
      path.join(screenshotDir, 'providers.json'),
      JSON.stringify(providers, null, 2)
    );
    console.log(`   ✅ Found ${providers.length} provider elements`);
    
    // Step 3: Navigate to bills
    console.log('\n📝 Step 3: Capturing bills page');
    await page.goto('https://oneqa.utilli.com/bills', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    await page.waitForTimeout(5000);
    
    // Screenshot bills
    await page.screenshot({ 
      path: path.join(screenshotDir, 'bills.png'), 
      fullPage: true 
    });
    console.log('   ✅ Bills screenshot saved');
    
    // Extract bills data
    const bills = await page.evaluate(() => {
      const results = {
        tables: [],
        billItems: [],
        amounts: [],
        allText: []
      };
      
      // Extract tables
      document.querySelectorAll('table').forEach(table => {
        const tableData = [];
        table.querySelectorAll('tr').forEach(row => {
          const rowData = [];
          row.querySelectorAll('td, th').forEach(cell => {
            rowData.push(cell.textContent?.trim());
          });
          if (rowData.length > 0) {
            tableData.push(rowData);
          }
        });
        if (tableData.length > 0) {
          results.tables.push(tableData);
        }
      });
      
      // Find amounts
      document.querySelectorAll('*').forEach(element => {
        const text = element.textContent?.trim();
        if (text && text.match(/\$[\d,]+\.?\d*/)) {
          const amount = text.match(/\$[\d,]+\.?\d*/)[0];
          results.amounts.push({
            amount: amount,
            context: text.substring(0, 100),
            tag: element.tagName,
            class: element.className
          });
        }
      });
      
      // Find bill-like items
      const billSelectors = ['.bill', '.invoice', '[class*="bill"]', '[class*="invoice"]'];
      billSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
          results.billItems.push({
            selector: selector,
            text: element.textContent?.trim().substring(0, 200),
            class: element.className
          });
        });
      });
      
      // Get all text content for analysis
      document.body.innerText.split('\n').forEach(line => {
        if (line.trim().length > 10) {
          results.allText.push(line.trim());
        }
      });
      
      return results;
    });
    
    fs.writeFileSync(
      path.join(screenshotDir, 'bills.json'),
      JSON.stringify(bills, null, 2)
    );
    console.log(`   ✅ Found ${bills.tables.length} tables, ${bills.amounts.length} amounts`);
    
    // Save HTML for both pages
    const billsHtml = await page.content();
    fs.writeFileSync(path.join(screenshotDir, 'bills.html'), billsHtml);
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✅ CAPTURE COMPLETE!');
    console.log('='.repeat(50));
    console.log('\n📁 All files saved in:', screenshotDir);
    console.log('\nFiles created:');
    console.log('  - home.png (service providers screenshot)');
    console.log('  - providers.json (extracted provider data)');
    console.log('  - bills.png (bills page screenshot)');
    console.log('  - bills.json (extracted bills data)');
    console.log('  - bills.html (bills page HTML)');
    
    // Print key findings
    console.log('\n🔍 Key Findings:');
    
    const serviceProviders = providers.filter(p => p.type === 'service-provider-class' || p.provider);
    if (serviceProviders.length > 0) {
      console.log('\n  Service Providers:');
      serviceProviders.forEach(p => {
        console.log(`    - ${p.text || p.provider}`);
      });
    }
    
    if (bills.amounts.length > 0) {
      console.log('\n  Bill Amounts Found:');
      bills.amounts.slice(0, 5).forEach(a => {
        console.log(`    - ${a.amount}`);
      });
    }
    
    console.log('\nBrowser will close in 10 seconds...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
    console.log('\n👋 Browser closed. Capture session complete!');
  }
}

captureAllPages().catch(console.error);