import { chromium } from 'playwright';

async function testOneQA() {
  let browser = null;
  
  try {
    console.log('Launching browser...');
    browser = await chromium.launch({
      headless: false, // Show browser for debugging
      args: ['--disable-blink-features=AutomationControlled']
    });
    
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    });
    
    const page = await context.newPage();
    
    console.log('Navigating to OneQA...');
    await page.goto('https://oneqa.utilli.com/login', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    console.log('Page loaded. URL:', page.url());
    
    // Take screenshot
    await page.screenshot({ 
      path: 'oneqa-test.png',
      fullPage: true 
    });
    console.log('Screenshot saved as oneqa-test.png');
    
    // Try to find mobile input field
    const selectors = [
      'input[type="tel"]',
      'input[name="mobile"]',
      'input[placeholder*="mobile" i]',
      'input[placeholder*="phone" i]',
      '#mobile'
    ];
    
    let found = false;
    for (const selector of selectors) {
      const element = await page.$(selector);
      if (element) {
        console.log(`Found mobile input with selector: ${selector}`);
        found = true;
        
        // Try to interact with it
        await element.click();
        await element.type('+13307018398');
        console.log('Typed mobile number');
        break;
      }
    }
    
    if (!found) {
      console.log('Mobile input field not found');
      
      // Get all input fields for debugging
      const inputs = await page.$$eval('input', els => 
        els.map(el => ({
          type: el.type,
          name: el.name,
          id: el.id,
          placeholder: el.placeholder,
          className: el.className
        }))
      );
      console.log('Found inputs:', inputs);
    }
    
    // Wait a bit before closing
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testOneQA();