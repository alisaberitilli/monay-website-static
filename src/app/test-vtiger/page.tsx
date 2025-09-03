'use client';

import { useState } from 'react';
import { sendToVtiger } from '@/lib/vtiger-integration';

export default function TestVtigerPage() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const testVtiger = async () => {
    setLoading(true);
    setStatus('Testing Vtiger REST API integration...');
    
    const testData = {
      firstName: 'Test',
      lastName: 'User_' + Date.now(),
      email: 'test' + Date.now() + '@example.com',
      phone: '555-0123',
      company: 'Test Company from Monay',
      country: 'USA',
      monthlyActiveUsers: '1000-10000',
      useCase: 'Testing Integration',
      message: 'This is a test lead from the Monay website'
    };

    try {
      console.log('Sending test data:', testData);
      await sendToVtiger(testData, 'Test Form');
      setStatus('✅ Success! Lead created in Vtiger CRM. Check your Vtiger at http://localhost:8000');
    } catch (error) {
      console.error('Error:', error);
      setStatus('❌ Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Vtiger REST API Integration</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="mb-4">
            Click the button below to test creating a lead in your local Vtiger CRM instance.
          </p>
          
          <button
            onClick={testVtiger}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating Lead...' : 'Test Create Lead'}
          </button>
          
          {status && (
            <div className="mt-6 p-4 bg-gray-100 rounded">
              <pre className="whitespace-pre-wrap">{status}</pre>
            </div>
          )}
          
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h3 className="font-semibold mb-2">Prerequisites:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Vtiger CRM running at http://localhost:8000</li>
              <li>Database: vtiger_local</li>
              <li>Username: admin</li>
              <li>Access Key: crsogur4p4yvzyur</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}