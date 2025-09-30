'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Upload, FileCheck, User, CreditCard, CheckCircle2, Building, Copy, Check } from 'lucide-react';

export default function KYCVerificationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'personal' | 'business' | 'documents' | 'review'>('personal');
  const [dataCopied, setDataCopied] = useState(false);
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [personalInfo, setPersonalInfo] = useState({
    dateOfBirth: '',
    ssn: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  });
  const [businessInfo, setBusinessInfo] = useState({
    businessName: '',
    businessType: '',
    ein: '',
    businessAddress: '',
    businessCity: '',
    businessState: '',
    businessZipCode: ''
  });
  const [documents, setDocuments] = useState({
    idFront: null as File | null,
    idBack: null as File | null,
    proofOfAddress: null as File | null,
    businessLicense: null as File | null
  });

  // Get registration data (in real app, this would come from auth context or localStorage)
  useEffect(() => {
    // Try to get data from localStorage first (from actual registration)
    const savedRegistrationData = localStorage.getItem('enterpriseRegistrationData');

    if (savedRegistrationData) {
      try {
        const parsedData = JSON.parse(savedRegistrationData);
        setRegistrationData(parsedData);
        console.log('Loaded registration data from localStorage:', parsedData);
      } catch (error) {
        console.error('Error parsing saved registration data:', error);
      }
    } else {
      // Fallback to demo data if no saved data
      const mockRegistrationData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phoneNumber: '+1-555-123-4567',
        organizationName: 'ACME Corporation',
        organizationId: '12345678'
      };
      setRegistrationData(mockRegistrationData);
      console.log('Using demo registration data:', mockRegistrationData);
    }
  }, []);

  const copyRegistrationData = () => {
    if (registrationData) {
      console.log('Copying registration data:', registrationData);
      // Preserve existing data and only update the fields we want to copy
      const newBusinessInfo = {
        ...businessInfo,
        businessName: registrationData.organizationName || '',
        businessType: 'Corporation'
      };
      console.log('Setting business info to:', newBusinessInfo);
      setBusinessInfo(newBusinessInfo);
      setDataCopied(true);
      toast.success(`Business name "${registrationData.organizationName}" copied from registration!`);
    }
  };

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPersonalInfo({
      ...personalInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleBusinessInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusinessInfo({
      ...businessInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (field: keyof typeof documents) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocuments({
        ...documents,
        [field]: e.target.files[0]
      });
    }
  };

  const handlePersonalInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('business');
  };

  const handleBusinessInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('documents');
  };

  const handleDocumentsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('review');
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);

    try {
      const formData = new FormData();

      // Add personal info
      Object.entries(personalInfo).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Add business info
      Object.entries(businessInfo).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Add documents
      if (documents.idFront) formData.append('idFront', documents.idFront);
      if (documents.idBack) formData.append('idBack', documents.idBack);
      if (documents.proofOfAddress) formData.append('proofOfAddress', documents.proofOfAddress);
      if (documents.businessLicense) formData.append('businessLicense', documents.businessLicense);

      const response = await fetch('http://localhost:3001/api/submit-kyc', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        toast.success('KYC verification submitted successfully!');
        router.push('/dashboard');
      } else {
        toast.error(result.error || 'Failed to submit KYC');
      }
    } catch (error: any) {
      toast.error('KYC submission failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <User className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Identity Verification</CardTitle>
          <CardDescription className="text-center">
            Complete your identity verification to access enterprise features
          </CardDescription>

          {/* Progress Steps */}
          <div className="flex justify-center mt-4">
            <div className="flex items-center space-x-2">
              <div className={`flex items-center text-xs ${step === 'personal' ? 'text-blue-600' : 'text-gray-400'}`}>
                <User className="h-5 w-5" />
                <span className="ml-1">Personal</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-300" />
              <div className={`flex items-center text-xs ${step === 'business' ? 'text-blue-600' : 'text-gray-400'}`}>
                <Building className="h-5 w-5" />
                <span className="ml-1">Business</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-300" />
              <div className={`flex items-center text-xs ${step === 'documents' ? 'text-blue-600' : 'text-gray-400'}`}>
                <CreditCard className="h-5 w-5" />
                <span className="ml-1">Documents</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-300" />
              <div className={`flex items-center text-xs ${step === 'review' ? 'text-blue-600' : 'text-gray-400'}`}>
                <CheckCircle2 className="h-5 w-5" />
                <span className="ml-1">Verification</span>
              </div>
            </div>
          </div>
        </CardHeader>

        {step === 'personal' && (
          <form onSubmit={handlePersonalInfoSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    required
                    value={personalInfo.dateOfBirth}
                    onChange={handlePersonalInfoChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ssn">SSN (Last 4 digits)</Label>
                  <Input
                    id="ssn"
                    name="ssn"
                    placeholder="XXXX"
                    maxLength={4}
                    required
                    value={personalInfo.ssn}
                    onChange={handlePersonalInfoChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="123 Main St"
                  required
                  value={personalInfo.address}
                  onChange={handlePersonalInfoChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="San Francisco"
                    required
                    value={personalInfo.city}
                    onChange={handlePersonalInfoChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    placeholder="CA"
                    maxLength={2}
                    required
                    value={personalInfo.state}
                    onChange={handlePersonalInfoChange}
                  />
                </div>
              </div>
            </CardContent>
            <div className="px-6 pb-6">
              <Button type="submit" className="w-full">
                Continue to Business Info
              </Button>
            </div>
          </form>
        )}

        {step === 'business' && (
          <form onSubmit={handleBusinessInfoSubmit}>
            <CardContent className="space-y-4">
              {/* Copy Registration Data Banner */}
              {registrationData && !dataCopied && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Copy className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="font-semibold text-blue-800">Use Registration Information</span>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={copyRegistrationData}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy Info
                    </Button>
                  </div>
                  <div className="text-sm text-blue-700">
                    <p><strong>Organization:</strong> {registrationData.organizationName}</p>
                    <p><strong>Contact:</strong> {registrationData.firstName} {registrationData.lastName}</p>
                    <p><strong>Email:</strong> {registrationData.email}</p>
                  </div>
                  <p className="text-xs text-blue-600">
                    Click "Copy Info" to pre-fill business information from your registration
                  </p>
                </div>
              )}

              {/* Success banner when data is copied */}
              {dataCopied && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-semibold text-green-800">Registration Information Copied</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Organization name has been filled. Please complete the remaining fields.
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    placeholder="ACME Corporation"
                    required
                    value={businessInfo.businessName}
                    onChange={handleBusinessInfoChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ein">EIN</Label>
                  <Input
                    id="ein"
                    name="ein"
                    placeholder="12-3456789"
                    required
                    value={businessInfo.ein}
                    onChange={handleBusinessInfoChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessAddress">Business Address</Label>
                <Input
                  id="businessAddress"
                  name="businessAddress"
                  placeholder="123 Business St"
                  required
                  value={businessInfo.businessAddress}
                  onChange={handleBusinessInfoChange}
                />
              </div>
            </CardContent>
            <div className="px-6 pb-6 space-y-4">
              <Button type="button" variant="outline" className="w-full" onClick={() => setStep('personal')}>
                Back
              </Button>
              <Button type="submit" className="w-full">
                Continue to Documents
              </Button>
            </div>
          </form>
        )}

        {step === 'documents' && (
          <form onSubmit={handleDocumentsSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessLicense">Business License</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <Input
                      id="businessLicense"
                      type="file"
                      accept="image/*,.pdf"
                      required
                      onChange={handleFileChange('businessLicense')}
                      className="cursor-pointer"
                    />
                    {documents.businessLicense && (
                      <p className="mt-2 text-sm text-green-600 flex items-center">
                        <FileCheck className="h-4 w-4 mr-1" />
                        {documents.businessLicense.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <div className="px-6 pb-6 space-y-4">
              <Button type="button" variant="outline" className="w-full" onClick={() => setStep('business')}>
                Back
              </Button>
              <Button type="submit" className="w-full">
                Continue to Review
              </Button>
            </div>
          </form>
        )}

        {step === 'review' && (
          <div>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Review Your Information</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Business:</strong> {businessInfo.businessName}</p>
                  <p><strong>EIN:</strong> {businessInfo.ein}</p>
                  <p><strong>Documents Uploaded:</strong> Business License</p>
                </div>
              </div>
            </CardContent>
            <div className="px-6 pb-6 space-y-4">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStep('documents')}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                onClick={handleFinalSubmit}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting KYC...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Verify Identity
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}