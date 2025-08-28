import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001/api';

async function testOneQAAPI() {
  console.log('🧪 Testing OneQA Automated API\n');
  console.log('================================\n');

  try {
    // Step 1: Check status
    console.log('1️⃣ Checking OneQA Status...');
    const statusResponse = await fetch(`${API_URL}/oneqa/status`);
    const statusData = await statusResponse.json();
    
    if (statusData.success) {
      console.log('✅ OneQA is active');
      console.log('   Available modes:', statusData.data.modes);
      console.log('   Automated endpoints:');
      Object.entries(statusData.data.automated).forEach(([key, value]) => {
        console.log(`     - ${key}: ${value}`);
      });
    } else {
      console.log('❌ OneQA status check failed');
      return;
    }

    // Step 2: Test login
    console.log('\n2️⃣ Testing Automated Login...');
    console.log('   Enter your mobile number (or press Enter to skip): ');
    
    const mobileNumber = await new Promise((resolve) => {
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      readline.question('Mobile number: ', (answer) => {
        readline.close();
        resolve(answer);
      });
    });

    if (!mobileNumber) {
      console.log('   Skipping login test...');
      return;
    }

    const loginResponse = await fetch(`${API_URL}/oneqa/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobileNumber })
    });
    
    const loginData = await loginResponse.json();
    
    if (loginData.success) {
      console.log('✅ Login initiated successfully');
      console.log('   Session ID:', loginData.data.sessionId);
      console.log('   Requires OTP:', loginData.data.requiresOTP);
      
      const sessionId = loginData.data.sessionId;
      
      // Step 3: Enter OTP
      console.log('\n3️⃣ Enter the OTP you received:');
      
      const otp = await new Promise((resolve) => {
        const readline = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        readline.question('OTP: ', (answer) => {
          readline.close();
          resolve(answer);
        });
      });
      
      if (otp) {
        const verifyResponse = await fetch(`${API_URL}/oneqa/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, otp })
        });
        
        const verifyData = await verifyResponse.json();
        
        if (verifyData.success) {
          console.log('✅ OTP verified successfully');
          console.log('   Auth token received');
          
          // Step 4: Fetch providers
          console.log('\n4️⃣ Fetching Service Providers...');
          
          const providersResponse = await fetch(`${API_URL}/oneqa/providers?sessionId=${sessionId}`);
          const providersData = await providersResponse.json();
          
          if (providersData.success) {
            console.log('✅ Providers fetched successfully');
            const providers = providersData.data.providers;
            
            providers.forEach((provider, index) => {
              console.log(`\n   ${index + 1}. ${provider.name}`);
              console.log(`      ID: ${provider.id}`);
              console.log(`      Total Amount: $${provider.totalAmount || 0}`);
              console.log(`      Accounts: ${provider.accounts?.length || 0}`);
            });
            
            // Step 5: Fetch all invoices
            console.log('\n5️⃣ Fetching All Invoices...');
            
            const invoicesResponse = await fetch(`${API_URL}/oneqa/invoices?sessionId=${sessionId}`);
            const invoicesData = await invoicesResponse.json();
            
            if (invoicesData.success) {
              console.log('✅ Invoices fetched successfully');
              const summary = invoicesData.data.summary;
              
              console.log(`\n   Total Invoices: ${summary.total}`);
              console.log(`   Total Amount: $${summary.totalAmount}`);
              console.log(`\n   By Provider:`);
              
              summary.byProvider.forEach(p => {
                console.log(`     - ${p.providerId}: ${p.count} invoices, $${p.totalAmount}`);
              });
              
              // Show first 3 invoices
              console.log('\n   Sample Invoices:');
              invoicesData.data.invoices.slice(0, 3).forEach(inv => {
                console.log(`     - ${inv.serviceProvider}: Invoice #${inv.invoiceNumber}, $${inv.amount}, ${inv.status}`);
              });
            } else {
              console.log('❌ Failed to fetch invoices:', invoicesData.message);
            }
            
            // Step 6: Logout
            console.log('\n6️⃣ Logging out...');
            
            const logoutResponse = await fetch(`${API_URL}/oneqa/logout`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId })
            });
            
            const logoutData = await logoutResponse.json();
            
            if (logoutData.success) {
              console.log('✅ Logged out successfully');
            }
            
          } else {
            console.log('❌ Failed to fetch providers:', providersData.message);
          }
          
        } else {
          console.log('❌ OTP verification failed:', verifyData.message);
        }
      }
      
    } else {
      console.log('❌ Login failed:', loginData.message);
    }

    console.log('\n================================');
    console.log('✅ OneQA API Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testOneQAAPI().catch(console.error);