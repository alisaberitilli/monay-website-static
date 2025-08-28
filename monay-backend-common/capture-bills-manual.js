import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function waitForEnter(message) {
  return new Promise(resolve => {
    rl.question(message + '\nPress Enter to continue...', () => {
      resolve();
    });
  });
}

async function captureBillsManual() {
  console.log('OneQA Bills Capture Tool');
  console.log('========================\n');
  
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
    
    // Step 1: Go to login
    console.log('Step 1: Opening OneQA login page...');
    await page.goto('https://oneqa.utilli.com/login', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    await waitForEnter('\n📝 Please log in to OneQA manually in the browser window.');
    
    // Step 2: Navigate to bills
    console.log('\nStep 2: Navigating to bills page...');
    await page.goto('https://oneqa.utilli.com/bills', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    // Wait for bills to load
    await page.waitForTimeout(5000);
    
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    const timestamp = Date.now();
    const screenshotDir = path.join(process.cwd(), 'oneqa-captures');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir);
    }
    
    // Take screenshot
    const screenshotPath = path.join(screenshotDir, `bills-manual-${timestamp}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('📸 Screenshot saved:', screenshotPath);
    
    // Save HTML for analysis
    const htmlPath = path.join(screenshotDir, `bills-manual-${timestamp}.html`);
    const pageContent = await page.content();
    fs.writeFileSync(htmlPath, pageContent);
    console.log('📄 HTML saved:', htmlPath);
    
    // Extract comprehensive bill data
    console.log('\n🔍 Extracting bill data...');
    
    const bills = await page.evaluate(() => {
      const results = {
        tables: [],
        bills: [],
        structure: {},
        rawData: []
      };
      
      // Get all tables
      document.querySelectorAll('table').forEach((table, tableIndex) => {
        const tableData = {
          index: tableIndex,
          headers: [],
          rows: []
        };
        
        // Get headers
        table.querySelectorAll('thead th, thead td').forEach(cell => {
          tableData.headers.push(cell.textContent?.trim());
        });
        
        // Get rows
        table.querySelectorAll('tbody tr').forEach(row => {
          const rowData = [];
          row.querySelectorAll('td').forEach(cell => {
            rowData.push(cell.textContent?.trim());
          });
          if (rowData.length > 0) {
            tableData.rows.push(rowData);
          }
        });
        
        if (tableData.rows.length > 0 || tableData.headers.length > 0) {
          results.tables.push(tableData);
        }
      });
      
      // Look for bill-like structures
      const billPatterns = [
        // Amount patterns
        /\$[\d,]+\.?\d*/g,
        // Date patterns  
        /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g,
        // Provider patterns
        /(Pepco|Pennsylvania American Water|Washington Gas)/gi,
        // Bill keywords
        /(invoice|bill|statement|due|amount|balance)/gi
      ];
      
      // Find all elements with bill-related content
      document.querySelectorAll('*').forEach(element => {
        const text = element.textContent?.trim();
        if (text && text.length > 10 && text.length < 500) {
          const hasAmount = text.match(billPatterns[0]);
          const hasDate = text.match(billPatterns[1]);
          const hasProvider = text.match(billPatterns[2]);
          const hasBillKeyword = text.match(billPatterns[3]);
          
          if (hasAmount || hasProvider) {
            // Skip if this is a parent of already processed elements
            const children = element.querySelectorAll('*');
            if (children.length < 5) {
              results.bills.push({
                tag: element.tagName,
                class: element.className,
                text: text,
                amount: hasAmount ? hasAmount[0] : null,
                date: hasDate ? hasDate[0] : null,
                provider: hasProvider ? hasProvider[0] : null,
                hasBillKeyword: !!hasBillKeyword,
                parentClass: element.parentElement?.className
              });
            }
          }
        }
      });
      
      // Get page structure
      results.structure = {
        title: document.title,
        h1: Array.from(document.querySelectorAll('h1')).map(h => h.textContent?.trim()),
        h2: Array.from(document.querySelectorAll('h2')).map(h => h.textContent?.trim()),
        mainContent: document.querySelector('main')?.className || 'no main element',
        containers: Array.from(document.querySelectorAll('.container, .content, .main')).map(c => c.className)
      };
      
      // Get all text that looks like bill data
      const allDivs = document.querySelectorAll('div, section, article, li');
      allDivs.forEach(div => {
        const text = div.textContent?.trim();
        if (text && text.includes('$')) {
          results.rawData.push({
            tag: div.tagName,
            class: div.className,
            text: text.substring(0, 200)
          });
        }
      });
      
      return results;
    });
    
    // Save comprehensive data
    const dataPath = path.join(screenshotDir, `bills-manual-${timestamp}.json`);
    fs.writeFileSync(dataPath, JSON.stringify(bills, null, 2));
    console.log('💾 Bills data saved:', dataPath);
    
    // Print summary
    console.log('\n📊 Data Summary:');
    console.log(`- Tables found: ${bills.tables.length}`);
    console.log(`- Bill items found: ${bills.bills.length}`);
    console.log(`- Raw data items with $: ${bills.rawData.length}`);
    
    if (bills.tables.length > 0) {
      console.log('\n📋 Table Data:');
      bills.tables.forEach((table, i) => {
        console.log(`  Table ${i + 1}: ${table.headers.join(' | ')}`);
        table.rows.slice(0, 3).forEach(row => {
          console.log(`    - ${row.join(' | ')}`);
        });
      });
    }
    
    if (bills.bills.length > 0) {
      console.log('\n💰 Bill Items Found:');
      bills.bills.slice(0, 5).forEach((bill, i) => {
        console.log(`  ${i + 1}. Provider: ${bill.provider}, Amount: ${bill.amount}, Date: ${bill.date}`);
      });
    }
    
    console.log('\n✅ Capture complete! Check the files in:', screenshotDir);
    
    await waitForEnter('\n📌 Review the data, then');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    rl.close();
    await browser.close();
  }
}

captureBillsManual().catch(console.error);