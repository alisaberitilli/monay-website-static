import { chromium } from 'playwright';

async function testProviders() {
  console.log('This script will help identify the providers on OneQA');
  console.log('Please make sure you are already logged into OneQA in a browser window');
  console.log('Press Ctrl+C to exit\n');

  const browser = await chromium.launch({
    headless: false,
    args: ['--disable-blink-features=AutomationControlled']
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Opening OneQA...');
  await page.goto('https://oneqa.utilli.com/login');
  
  console.log('\nPlease manually log in to OneQA in the browser window');
  console.log('After logging in, press Enter here to continue...');
  
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });

  console.log('\nChecking for providers...');
  
  // Try to navigate to providers page
  const currentUrl = page.url();
  console.log('Current URL:', currentUrl);
  
  // Look for providers
  const providers = await page.evaluate(() => {
    const results = [];
    
    // Try multiple selectors
    const selectors = [
      '.provider-item',
      '.service-provider',
      '.provider-card', 
      '.service-card',
      '[data-provider]',
      '.card',
      '.service-item',
      'div[class*="provider"]',
      'div[class*="service"]',
      'a[href*="service"]',
      'button[onclick*="service"]'
    ];
    
    const foundElements = new Set();
    
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        if (foundElements.has(el)) return;
        foundElements.add(el);
        
        const text = el.textContent?.trim();
        if (text && text.length > 0 && text.length < 200) {
          results.push({
            selector,
            text: text.substring(0, 100),
            className: el.className,
            id: el.id,
            tagName: el.tagName,
            hasOnClick: !!el.onclick,
            href: el.href
          });
        }
      });
    }
    
    // Also get all clickable elements with text
    document.querySelectorAll('a, button, div[onclick], div[role="button"]').forEach(el => {
      const text = el.textContent?.trim();
      if (text && text.length > 2 && text.length < 50 && !foundElements.has(el)) {
        results.push({
          selector: 'clickable',
          text: text,
          className: el.className,
          tagName: el.tagName,
          href: el.href,
          onclick: !!el.onclick
        });
      }
    });
    
    return results;
  });
  
  console.log('\nFound potential providers/services:');
  providers.forEach((p, i) => {
    console.log(`${i + 1}. ${p.text}`);
    console.log(`   Tag: ${p.tagName}, Class: ${p.className}, Selector: ${p.selector}`);
    if (p.href) console.log(`   Link: ${p.href}`);
    console.log('');
  });

  // Take screenshot
  await page.screenshot({ path: 'providers-debug.png', fullPage: true });
  console.log('\nScreenshot saved as providers-debug.png');
  
  console.log('\nPress Enter to close browser...');
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });
  
  await browser.close();
}

testProviders().catch(console.error);