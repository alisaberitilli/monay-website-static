'use client';

import { useState } from 'react';
import { Send, Link as LinkIcon, Code } from 'lucide-react';

export default function PaymentTestPage() {
  const [formData, setFormData] = useState({
    accountNumber: 'ACC-123456',
    firstName: 'John',
    lastName: 'Doe',
    amountDue: '1250',
    dueDate: '2025-12-31'
  });

  const [apiResponse, setApiResponse] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUrlRedirect = () => {
    const url = `/pay?accountNumber=${encodeURIComponent(formData.accountNumber)}&firstName=${encodeURIComponent(formData.firstName)}&lastName=${encodeURIComponent(formData.lastName)}&amountDue=${formData.amountDue}&dueDate=${encodeURIComponent(formData.dueDate)}`;
    window.location.href = url;
  };

  const handleApiPost = async () => {
    try {
      const response = await fetch('/pay/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amountDue: parseFloat(formData.amountDue)
        }),
      });

      const data = await response.json();
      setApiResponse(data);

      if (data.redirectUrl) {
        setTimeout(() => {
          window.location.href = data.redirectUrl;
        }, 2000);
      }
    } catch (error) {
      setApiResponse({ error: 'Failed to submit payment request' });
    }
  };

  const generatedUrl = `/pay?accountNumber=${encodeURIComponent(formData.accountNumber)}&firstName=${encodeURIComponent(formData.firstName)}&lastName=${encodeURIComponent(formData.lastName)}&amountDue=${formData.amountDue}&dueDate=${encodeURIComponent(formData.dueDate)}`;

  const curlCommand = `curl -X POST http://localhost:3000/pay/api \\
  -H "Content-Type: application/json" \\
  -d '{
    "accountNumber": "${formData.accountNumber}",
    "firstName": "${formData.firstName}",
    "lastName": "${formData.lastName}",
    "amountDue": ${formData.amountDue},
    "dueDate": "${formData.dueDate}"
  }'`;

  const fetchCode = `fetch('/pay/api', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    accountNumber: "${formData.accountNumber}",
    firstName: "${formData.firstName}",
    lastName: "${formData.lastName}",
    amountDue: ${formData.amountDue},
    dueDate: "${formData.dueDate}"
  })
}).then(res => res.json())
  .then(data => window.location.href = data.redirectUrl);`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Payment Request Test Page</h1>
                <p className="text-sm text-slate-600">Test different payment request methods</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form Input */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Payment Request Data</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Amount Due
                  </label>
                  <input
                    type="number"
                    name="amountDue"
                    value={formData.amountDue}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleUrlRedirect}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                <LinkIcon className="w-5 h-5" />
                <span>Method 1: URL Parameters (GET)</span>
              </button>

              <button
                onClick={handleApiPost}
                className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                <Send className="w-5 h-5" />
                <span>Method 2: API POST Request</span>
              </button>
            </div>

            {apiResponse && (
              <div className={`rounded-xl p-4 ${apiResponse.error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Right Column - Code Examples */}
          <div className="space-y-6">
            {/* Generated URL */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-center space-x-2 mb-3">
                <LinkIcon className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-slate-900">Generated URL</h3>
              </div>
              <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                <code className="text-green-400 text-xs whitespace-pre-wrap break-all">
                  {generatedUrl}
                </code>
              </div>
            </div>

            {/* cURL Command */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Code className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-slate-900">cURL Command</h3>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(curlCommand)}
                  className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded-lg transition-colors"
                >
                  Copy
                </button>
              </div>
              <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                <code className="text-green-400 text-xs whitespace-pre">
                  {curlCommand}
                </code>
              </div>
            </div>

            {/* JavaScript Fetch */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Code className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-semibold text-slate-900">JavaScript Fetch</h3>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(fetchCode)}
                  className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded-lg transition-colors"
                >
                  Copy
                </button>
              </div>
              <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                <code className="text-green-400 text-xs whitespace-pre">
                  {fetchCode}
                </code>
              </div>
            </div>

            {/* HTML Form Example */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-center space-x-2 mb-3">
                <Code className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-slate-900">HTML Form</h3>
              </div>
              <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                <code className="text-green-400 text-xs whitespace-pre">
{`<form action="/pay" method="GET">
  <input type="text" name="accountNumber"
         value="${formData.accountNumber}" />
  <input type="text" name="firstName"
         value="${formData.firstName}" />
  <input type="text" name="lastName"
         value="${formData.lastName}" />
  <input type="number" name="amountDue"
         value="${formData.amountDue}" />
  <input type="date" name="dueDate"
         value="${formData.dueDate}" />
  <button type="submit">Pay Now</button>
</form>`}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-3">How It Works</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p><strong>Method 1 (URL Parameters):</strong> Direct GET request with query parameters - simplest method</p>
            <p><strong>Method 2 (API POST):</strong> POST request to /pay/api endpoint, returns redirect URL</p>
            <p><strong>Both methods</strong> will redirect to the payment page with the provided data pre-filled</p>
          </div>
        </div>
      </main>
    </div>
  );
}
