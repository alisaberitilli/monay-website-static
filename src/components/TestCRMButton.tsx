'use client';

import { useState } from 'react';
import { sendToVtigerAPI } from '@/lib/vtiger-api-integration';

export function TestCRMButton() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testCRM = async () => {
    setLoading(true);
    setStatus('Sending test data to CRM...');
    
    const timestamp = Date.now();
    const testData = {
      // Lead data
      firstName: 'Test',
      lastName: `User_${timestamp}`,
      email: `test.${timestamp}@example.com`,
      phone: '555-0123',
      
      // Company data
      company: `TestCompany_${timestamp}`,
      companyWebsite: 'https://test.com',
      industry: 'Technology',
      organizationSize: '51-200',
      
      // Message
      message: 'This is a test submission from Monay website',
      
      // Source
      country: 'USA',
      useCase: 'Testing API Integration'
    };

    try {
      const result = await sendToVtigerAPI(testData, 'Test Form');
      
      if (result.success) {
        setStatus(`✅ Success! Created: 
          ${result.entities?.organization ? '• Organization ID: ' + result.entities.organization.id : ''}
          ${result.entities?.contact ? '• Contact ID: ' + result.entities.contact.id : ''}
          ${result.entities?.lead ? '• Lead ID: ' + result.entities.lead.id : ''}`);
      } else {
        setStatus(`❌ Failed: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-bold mb-2">CRM API Test</h3>
      <button
        onClick={testCRM}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test CRM Integration'}
      </button>
      {status && (
        <pre className="mt-4 p-2 bg-gray-100 rounded text-sm whitespace-pre-wrap">
          {status}
        </pre>
      )}
    </div>
  );
}