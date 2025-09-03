'use client';

import { useState } from 'react';

export default function DebugVtigerPage() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const testVtiger = async () => {
    setLoading(true);
    setStatus('Testing...\n');
    
    const testData = {
      firstName: 'Debug',
      lastName: 'Test_' + Date.now(),
      email: 'debug' + Date.now() + '@test.com',
      phone: '555-9999',
      company: 'Debug Test Company',
      country: 'USA',
      message: 'Debug test submission',
      formType: 'Debug Test'
    };

    try {
      setStatus(prev => prev + 'Sending data to /api/vtiger...\n');
      
      const response = await fetch('/api/vtiger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });
      
      const text = await response.text();
      setStatus(prev => prev + `Response status: ${response.status}\n`);
      setStatus(prev => prev + `Response: ${text}\n`);
      
      try {
        const result = JSON.parse(text);
        if (result.success) {
          setStatus(prev => prev + `\n✅ SUCCESS!\n`);
          setStatus(prev => prev + `Lead ID: ${result.leadId}\n`);
          setStatus(prev => prev + `Lead No: ${result.leadNo}\n`);
        } else {
          setStatus(prev => prev + `\n❌ FAILED: ${result.error}\n`);
        }
      } catch (e) {
        setStatus(prev => prev + `\nCould not parse JSON response\n`);
      }
      
    } catch (error) {
      setStatus(prev => prev + `\n❌ Error: ${error}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Vtiger API</h1>
      
      <button
        onClick={testVtiger}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test API Route'}
      </button>
      
      <pre className="mt-4 p-4 bg-gray-100 rounded whitespace-pre-wrap">
        {status || 'Click button to test...'}
      </pre>
      
      <div className="mt-4 p-4 bg-yellow-100 rounded">
        <p className="text-sm">Check browser console (F12) for detailed logs</p>
        <p className="text-sm">Also check Next.js terminal for server-side logs</p>
      </div>
    </div>
  );
}