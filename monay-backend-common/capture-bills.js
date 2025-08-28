import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function captureBills() {
  console.log('Starting OneQA Bills capture...\n');
  
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
    
    // Navigate directly to bills page
    console.log('Navigating to OneQA bills page...');
    console.log('Please log in if needed...\n');
    
    await page.goto('https://oneqa.utilli.com/bills', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    // Wait for page to load
    console.log('Waiting for bills page to load...');
    await page.waitForTimeout(10000);
    
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    const timestamp = Date.now();
    const screenshotDir = path.join(process.cwd(), 'oneqa-captures');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir);
    }
    
    // Take screenshot
    const screenshotPath = path.join(screenshotDir, `bills-${timestamp}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('📸 Screenshot saved:', screenshotPath);
    
    // Save HTML
    const htmlPath = path.join(screenshotDir, `bills-${timestamp}.html`);
    const pageContent = await page.content();
    fs.writeFileSync(htmlPath, pageContent);
    console.log('📄 HTML saved:', htmlPath);
    
    // Extract bill/invoice data
    const bills = await page.evaluate(() => {
      const results = [];
      
      // Strategy 1: Look for table rows
      const tableRows = document.querySelectorAll('table tr, tbody tr');
      tableRows.forEach((row, index) => {
        const cells = Array.from(row.querySelectorAll('td, th')).map(cell => cell.textContent?.trim());
        if (cells.length > 0) {
          results.push({
            type: 'table_row',
            rowIndex: index,
            cells: cells,
            isHeader: row.querySelector('th') !== null
          });
        }
      });
      
      // Strategy 2: Look for bill/invoice cards or items
      const billSelectors = [
        '.bill', '.invoice', '.statement',
        '[class*="bill"]', '[class*="invoice"]',
        '.item', '.card', '.list-item',
        'article', 'section'
      ];
      
      billSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          const text = element.textContent?.trim();
          if (text && text.length > 20 && text.length < 1000) {
            // Try to extract structured data
            const amountMatch = text.match(/\$[\d,]+\.?\d*/);
            const dateMatch = text.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/);
            const providerMatch = text.match(/(Pepco|Pennsylvania American Water|Washington Gas)/i);
            
            results.push({
              type: 'bill_item',
              selector: selector,
              text: text.substring(0, 300),
              amount: amountMatch ? amountMatch[0] : null,
              date: dateMatch ? dateMatch[0] : null,
              provider: providerMatch ? providerMatch[1] : null,
              hasButton: element.querySelector('button') !== null,
              hasLink: element.querySelector('a') !== null,
              className: element.className
            });
          }
        });
      });
      
      // Strategy 3: Look for specific patterns
      const allText = document.body.innerText;
      const lines = allText.split('\n');
      
      lines.forEach(line => {
        if (line.includes('$') || line.includes('Due') || line.includes('Bill')) {
          results.push({
            type: 'text_line',
            content: line.trim()
          });
        }
      });
      
      // Strategy 4: Get all clickable items that might be bills
      const clickables = document.querySelectorAll('a[href*="bill"], a[href*="invoice"], button');
      clickables.forEach(element => {
        const text = element.textContent?.trim();
        if (text) {
          results.push({
            type: 'clickable',
            text: text,
            href: element.href || null,
            onclick: element.onclick ? 'has onclick' : null
          });
        }
      });
      
      return results;
    });
    
    // Save bills data
    const dataPath = path.join(screenshotDir, `bills-${timestamp}.json`);
    fs.writeFileSync(dataPath, JSON.stringify(bills, null, 2));
    console.log('💾 Bills data saved:', dataPath);
    
    // Print summary
    console.log('\n📊 Summary:');
    console.log(`- Found ${bills.filter(b => b.type === 'table_row').length} table rows`);
    console.log(`- Found ${bills.filter(b => b.type === 'bill_item').length} bill items`);
    console.log(`- Found ${bills.filter(b => b.amount).length} items with amounts`);
    console.log(`- Found ${bills.filter(b => b.provider).length} items with provider names`);
    
    // Try to extract clean bill data
    const cleanBills = bills
      .filter(b => b.amount || (b.type === 'table_row' && b.cells.some(c => c?.includes('$'))))
      .map(b => ({
        amount: b.amount || b.cells?.find(c => c?.includes('$')),
        date: b.date || b.cells?.find(c => c?.match(/\d{1,2}[\/\-]\d{1,2}/)),
        provider: b.provider || b.cells?.find(c => c?.match(/(Pepco|Pennsylvania|Washington)/i)),
        raw: b
      }));
    
    if (cleanBills.length > 0) {
      console.log('\n💰 Extracted Bills:');
      cleanBills.slice(0, 5).forEach((bill, i) => {
        console.log(`${i + 1}. Amount: ${bill.amount}, Date: ${bill.date}, Provider: ${bill.provider}`);
      });
    }
    
    console.log('\n✅ Capture complete!');
    console.log('Files saved in:', screenshotDir);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    console.log('\nClosing browser in 5 seconds...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

captureBills().catch(console.error);