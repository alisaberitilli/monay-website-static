'use client';

import { useState, useRef } from 'react';
import { Upload, FileJson, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { PaymentRequestData } from '@/app/pay/page';

interface PaymentRequestUploadProps {
  onUpload: (data: PaymentRequestData) => void;
}

export default function PaymentRequestUpload({ onUpload }: PaymentRequestUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validatePaymentRequest = (data: any): data is PaymentRequestData => {
    const requiredFields = ['accountNumber', 'firstName', 'lastName', 'amountDue', 'dueDate'];
    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length > 0) {
      setError(`Missing required fields: ${missingFields.join(', ')}`);
      return false;
    }

    if (typeof data.amountDue !== 'number' || data.amountDue <= 0) {
      setError('Amount due must be a positive number');
      return false;
    }

    if (isNaN(Date.parse(data.dueDate))) {
      setError('Invalid due date format');
      return false;
    }

    return true;
  };

  const handleFile = async (file: File) => {
    setError('');
    setSuccess(false);

    if (!file.name.endsWith('.json')) {
      setError('Please upload a JSON file');
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (validatePaymentRequest(data)) {
        setSuccess(true);
        setTimeout(() => {
          onUpload(data);
        }, 500);
      }
    } catch (err) {
      setError('Invalid JSON file format');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const sampleJSON = {
    accountNumber: "ACC-123456",
    firstName: "John",
    lastName: "Doe",
    amountDue: 1250.00,
    dueDate: "2025-12-31"
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-2xl p-12 transition-all duration-200
          ${isDragging
            ? 'border-blue-500 bg-blue-50/50'
            : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50'
          }
          ${error ? 'border-red-300 bg-red-50/30' : ''}
          ${success ? 'border-green-300 bg-green-50/30' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          {success ? (
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          ) : error ? (
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              {isDragging ? (
                <FileJson className="w-8 h-8 text-blue-600 animate-bounce" />
              ) : (
                <Upload className="w-8 h-8 text-blue-600" />
              )}
            </div>
          )}

          <div className="text-center">
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {success ? 'Payment Request Loaded' : 'Upload Payment Request'}
            </h3>
            <p className="text-slate-600 mb-1">
              {isDragging
                ? 'Drop your JSON file here'
                : 'Drag and drop your JSON file or click to browse'
              }
            </p>
            <p className="text-sm text-slate-500">JSON file with payment request details</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md">
              <p className="text-sm text-green-800">Payment request loaded successfully!</p>
            </div>
          )}
        </div>
      </div>

      {/* Sample JSON Format */}
      <div className="bg-slate-900 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-semibold flex items-center space-x-2">
            <FileJson className="w-5 h-5" />
            <span>Sample JSON Format</span>
          </h4>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(JSON.stringify(sampleJSON, null, 2));
            }}
            className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded-lg transition-colors"
          >
            Copy
          </button>
        </div>
        <pre className="text-green-400 text-sm overflow-x-auto">
          <code>{JSON.stringify(sampleJSON, null, 2)}</code>
        </pre>
      </div>

      {/* Required Fields Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="font-semibold text-blue-900 mb-3">Required Fields</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start space-x-2">
            <span className="font-mono bg-blue-100 px-2 py-0.5 rounded text-xs mt-0.5">accountNumber</span>
            <span>Customer account identifier (string)</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="font-mono bg-blue-100 px-2 py-0.5 rounded text-xs mt-0.5">firstName</span>
            <span>Customer first name (string)</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="font-mono bg-blue-100 px-2 py-0.5 rounded text-xs mt-0.5">lastName</span>
            <span>Customer last name (string)</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="font-mono bg-blue-100 px-2 py-0.5 rounded text-xs mt-0.5">amountDue</span>
            <span>Payment amount (number, e.g., 1250.00)</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="font-mono bg-blue-100 px-2 py-0.5 rounded text-xs mt-0.5">dueDate</span>
            <span>Payment due date (ISO 8601 format, e.g., "2025-12-31")</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
