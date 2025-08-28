import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function captureOneQA() {
  console.log('Starting OneQA capture...\n');
  
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
    
    // Navigate to OneQA
    console.log('Navigating to OneQA login page...');
    await page.goto('https://oneqa.utilli.com/login', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    console.log('Please log in manually in the browser window...');
    console.log('Waiting 30 seconds for you to complete login...\n');
    
    // Wait for manual login
    await page.waitForTimeout(30000);
    
    // Check if logged in (URL should have changed)
    const afterLoginUrl = page.url();
    console.log('Current URL after wait:', afterLoginUrl);
    
    if (afterLoginUrl.includes('/home') || afterLoginUrl.includes('/dashboard')) {
      console.log('✅ Login detected! Capturing provider data...\n');
      
      const timestamp = Date.now();
      const screenshotDir = path.join(process.cwd(), 'oneqa-captures');
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir);
      }
      
      // Take screenshot
      const screenshotPath = path.join(screenshotDir, `providers-${timestamp}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log('📸 Screenshot saved:', screenshotPath);
      
      // Extract provider data
      const providers = await page.evaluate(() => {
        const results = [];
        
        // Look for Pepco, Pennsylvania American Water, Washington Gas
        const knownProviders = ['Pepco', 'Pennsylvania American Water', 'Washington Gas'];
        
        // Find all clickable elements
        const clickableElements = document.querySelectorAll('a, button, div[onclick], div[role="button"], [class*="card"], [class*="provider"], [class*="service"]');
        
        clickableElements.forEach(element => {
          const text = element.textContent?.trim();
          if (text) {
            knownProviders.forEach(provider => {
              if (text.includes(provider)) {
                results.push({
                  name: provider,
                  element: {
                    tag: element.tagName,
                    class: element.className,
                    id: element.id,
                    href: element.href || null,
                    onclick: !!element.onclick
                  },
                  boundingBox: element.getBoundingClientRect(),
                  parent: {
                    tag: element.parentElement?.tagName,
                    class: element.parentElement?.className
                  }
                });
              }
            });
          }
        });
        
        // Also get general structure
        const allCards = document.querySelectorAll('[class*="card"], .item, .list-item');
        allCards.forEach(card => {
          const text = card.textContent?.trim();
          if (text && text.length < 200) {
            results.push({
              type: 'card',
              text: text.substring(0, 100),
              class: card.className,
              hasImage: !!card.querySelector('img')
            });
          }
        });
        
        return results;
      });
      
      // Save provider data
      const dataPath = path.join(screenshotDir, `providers-${timestamp}.json`);
      fs.writeFileSync(dataPath, JSON.stringify(providers, null, 2));
      console.log('💾 Provider data saved:', dataPath);
      
      // Try clicking on Pepco
      console.log('\nAttempting to click on Pepco...');
      
      // Find and click Pepco
      const pepcoClicked = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        for (const el of elements) {
          if (el.textContent?.includes('Pepco') && !el.querySelector('*')) {
            // Try to click the element or its parent
            try {
              if (el.tagName === 'A' || el.tagName === 'BUTTON') {
                el.click();
              } else if (el.parentElement) {
                el.parentElement.click();
              }
              return true;
            } catch (e) {
              console.log('Click failed:', e);
            }
          }
        }
        return false;
      });
      
      if (pepcoClicked) {
        console.log('Clicked on Pepco, waiting for navigation...');
        await page.waitForTimeout(5000);
        
        // Capture invoice page
        const invoiceUrl = page.url();
        console.log('Invoice page URL:', invoiceUrl);
        
        const invoiceScreenshot = path.join(screenshotDir, `invoices-${timestamp}.png`);
        await page.screenshot({ path: invoiceScreenshot, fullPage: true });
        console.log('📸 Invoice screenshot saved:', invoiceScreenshot);
        
        // Extract invoice data
        const invoices = await page.evaluate(() => {
          const results = [];
          
          // Look for tables
          const tables = document.querySelectorAll('table');
          tables.forEach(table => {
            const rows = table.querySelectorAll('tr');
            rows.forEach(row => {
              const cells = Array.from(row.querySelectorAll('td')).map(td => td.textContent?.trim());
              if (cells.length > 0) {
                results.push({
                  type: 'table_row',
                  cells
                });
              }
            });
          });
          
          // Look for invoice-related elements
          const invoiceElements = document.querySelectorAll('[class*="invoice"], [class*="bill"], [class*="statement"]');
          invoiceElements.forEach(el => {
            results.push({
              type: 'invoice_element',
              class: el.className,
              text: el.textContent?.trim().substring(0, 200)
            });
          });
          
          return results;
        });
        
        const invoicePath = path.join(screenshotDir, `invoices-${timestamp}.json`);
        fs.writeFileSync(invoicePath, JSON.stringify(invoices, null, 2));
        console.log('💾 Invoice data saved:', invoicePath);
      }
      
      console.log('\n✅ Capture complete!');
      console.log('Files saved in:', screenshotDir);
      
    } else {
      console.log('⚠️ Login not detected. Please run the script again and log in.');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    console.log('\nClosing browser in 5 seconds...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

captureOneQA().catch(console.error);