import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function captureOneQAData() {
  console.log('OneQA Data Capture Tool');
  console.log('========================\n');
  console.log('This tool will help capture the structure of OneQA after login');
  console.log('Please make sure you are already logged into OneQA in a browser\n');
  
  const browser = await chromium.launch({
    headless: false, // Show browser
    args: ['--disable-blink-features=AutomationControlled']
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    const page = await context.newPage();
    
    console.log('Opening OneQA login page...');
    await page.goto('https://oneqa.utilli.com/login', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    console.log('\n📝 INSTRUCTIONS:');
    console.log('1. Please manually log in to OneQA in the browser window');
    console.log('2. After successful login, press Enter here to continue...\n');
    
    // Wait for user to log in manually
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });
    
    console.log('\n✅ Capturing data from OneQA...\n');
    
    // Get current URL
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Take screenshots
    const timestamp = Date.now();
    const screenshotDir = path.join(process.cwd(), 'oneqa-captures');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir);
    }
    
    // Full page screenshot
    const fullPagePath = path.join(screenshotDir, `oneqa-home-${timestamp}.png`);
    await page.screenshot({ path: fullPagePath, fullPage: true });
    console.log('📸 Screenshot saved:', fullPagePath);
    
    // Extract HTML structure
    const htmlPath = path.join(screenshotDir, `oneqa-home-${timestamp}.html`);
    const pageContent = await page.content();
    fs.writeFileSync(htmlPath, pageContent);
    console.log('📄 HTML saved:', htmlPath);
    
    // Extract service providers
    console.log('\n🔍 Looking for Service Providers...\n');
    
    const providers = await page.evaluate(() => {
      const results = [];
      
      // Try multiple strategies to find providers
      
      // Strategy 1: Look for text content matching known providers
      const knownProviders = ['Pepco', 'Pennsylvania American Water', 'Washington Gas'];
      const allElements = document.querySelectorAll('*');
      
      knownProviders.forEach(providerName => {
        for (const element of allElements) {
          const text = element.textContent?.trim();
          if (text && text.includes(providerName) && !element.querySelector('*')) {
            // This is a leaf node containing the provider name
            const parent = element.parentElement;
            const grandParent = parent?.parentElement;
            
            results.push({
              name: providerName,
              foundIn: {
                element: element.tagName,
                class: element.className,
                id: element.id,
                parentClass: parent?.className,
                grandParentClass: grandParent?.className,
                fullPath: getElementPath(element)
              },
              clickable: {
                isLink: element.tagName === 'A',
                isButton: element.tagName === 'BUTTON',
                hasOnClick: !!element.onclick || !!parent?.onclick,
                parentIsClickable: parent?.tagName === 'A' || parent?.tagName === 'BUTTON'
              },
              context: {
                siblings: Array.from(parent?.children || []).map(child => ({
                  tag: child.tagName,
                  text: child.textContent?.trim().substring(0, 50)
                }))
              }
            });
            break;
          }
        }
      });
      
      // Strategy 2: Look for cards or containers
      const cardSelectors = [
        '.card', '.provider-card', '.service-card', 
        'div[class*="provider"]', 'div[class*="service"]',
        '.item', '.list-item', 'article'
      ];
      
      cardSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(card => {
          const text = card.textContent?.trim();
          if (text && text.length > 10 && text.length < 500) {
            results.push({
              type: 'card',
              selector,
              text: text.substring(0, 200),
              hasImage: !!card.querySelector('img'),
              links: Array.from(card.querySelectorAll('a')).map(a => a.href)
            });
          }
        });
      });
      
      // Helper function to get element path
      function getElementPath(element) {
        const path = [];
        while (element && element.tagName) {
          let selector = element.tagName.toLowerCase();
          if (element.id) {
            selector += '#' + element.id;
          } else if (element.className) {
            selector += '.' + element.className.split(' ').join('.');
          }
          path.unshift(selector);
          element = element.parentElement;
        }
        return path.join(' > ');
      }
      
      return results;
    });
    
    // Save providers data
    const dataPath = path.join(screenshotDir, `oneqa-providers-${timestamp}.json`);
    fs.writeFileSync(dataPath, JSON.stringify(providers, null, 2));
    console.log('💾 Provider data saved:', dataPath);
    
    // Print summary
    console.log('\n📊 Summary:');
    console.log('Found', providers.filter(p => p.name).length, 'named providers');
    console.log('Found', providers.filter(p => p.type === 'card').length, 'card elements');
    
    // Now try to click on a provider to see invoice page
    console.log('\n🔄 Attempting to navigate to a provider...');
    console.log('Please manually click on one of the providers (e.g., Pepco)');
    console.log('After the provider page loads, press Enter to capture invoice data...\n');
    
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });
    
    // Capture invoice page
    const invoiceUrl = page.url();
    console.log('\n📍 Invoice page URL:', invoiceUrl);
    
    // Take invoice page screenshot
    const invoicePath = path.join(screenshotDir, `oneqa-invoices-${timestamp}.png`);
    await page.screenshot({ path: invoicePath, fullPage: true });
    console.log('📸 Invoice screenshot saved:', invoicePath);
    
    // Extract invoice structure
    const invoices = await page.evaluate(() => {
      const results = [];
      
      // Look for table rows
      const tableRows = document.querySelectorAll('tr, tbody > *');
      tableRows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length > 2) {
          const rowData = Array.from(cells).map(cell => cell.textContent?.trim());
          results.push({
            type: 'table_row',
            data: rowData
          });
        }
      });
      
      // Look for invoice-like patterns
      const invoiceSelectors = [
        '.invoice', '.bill', '.statement',
        'div[class*="invoice"]', 'div[class*="bill"]'
      ];
      
      invoiceSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
          const text = element.textContent?.trim();
          if (text) {
            // Try to extract amount
            const amountMatch = text.match(/\$?\d+[,.]?\d*\.?\d*/);
            const dateMatch = text.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/);
            
            results.push({
              type: 'invoice_element',
              selector,
              hasAmount: !!amountMatch,
              amount: amountMatch?.[0],
              hasDate: !!dateMatch,
              date: dateMatch?.[0],
              text: text.substring(0, 200)
            });
          }
        });
      });
      
      return results;
    });
    
    // Save invoice data
    const invoiceDataPath = path.join(screenshotDir, `oneqa-invoices-${timestamp}.json`);
    fs.writeFileSync(invoiceDataPath, JSON.stringify(invoices, null, 2));
    console.log('💾 Invoice data saved:', invoiceDataPath);
    
    console.log('\n✅ Data capture complete!');
    console.log('\n📁 All files saved in:', screenshotDir);
    console.log('\nYou can now review the captured data to understand the page structure.');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    console.log('\nPress Enter to close the browser...');
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });
    await browser.close();
  }
}

captureOneQAData().catch(console.error);