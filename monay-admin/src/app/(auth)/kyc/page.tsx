'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';
import { Loader2, Upload, FileCheck, User, CreditCard, CheckCircle2 } from 'lucide-react';
import MonayLogo from '@/components/MonayLogo';

export default function KYCVerificationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'personal' | 'documents' | 'review'>('personal');
  const [personalInfo, setPersonalInfo] = useState({
    dateOfBirth: '',
    ssn: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  });
  const [documents, setDocuments] = useState({
    idFront: null as File | null,
    idBack: null as File | null,
    proofOfAddress: null as File | null
  });

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPersonalInfo({
      ...personalInfo,
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

      // Add documents
      if (documents.idFront) formData.append('idFront', documents.idFront);
      if (documents.idBack) formData.append('idBack', documents.idBack);
      if (documents.proofOfAddress) formData.append('proofOfAddress', documents.proofOfAddress);

      await authService.submitKYC(formData);
      toast.success('KYC verification submitted successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit KYC');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <MonayLogo />
          </div>
          <CardTitle className="text-2xl font-bold text-center">KYC Verification</CardTitle>
          <CardDescription className="text-center">
            Complete your identity verification to access admin features
          </CardDescription>

          {/* Progress Steps */}
          <div className="flex justify-center mt-4">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center ${step === 'personal' ? 'text-blue-600' : 'text-gray-400'}`}>
                <User className="h-6 w-6" />
                <span className="ml-2 text-sm">Personal Info</span>
              </div>
              <div className="w-12 h-0.5 bg-gray-300" />
              <div className={`flex items-center ${step === 'documents' ? 'text-blue-600' : 'text-gray-400'}`}>
                <CreditCard className="h-6 w-6" />
                <span className="ml-2 text-sm">Documents</span>
              </div>
              <div className="w-12 h-0.5 bg-gray-300" />
              <div className={`flex items-center ${step === 'review' ? 'text-blue-600' : 'text-gray-400'}`}>
                <CheckCircle2 className="h-6 w-6" />
                <span className="ml-2 text-sm">Review</span>
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
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  placeholder="94102"
                  required
                  value={personalInfo.zipCode}
                  onChange={handlePersonalInfoChange}
                />
              </div>
            </CardContent>
            <div className="px-6 pb-6">
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
                  <Label htmlFor="idFront">Government ID (Front)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <Input
                      id="idFront"
                      type="file"
                      accept="image/*"
                      required
                      onChange={handleFileChange('idFront')}
                      className="cursor-pointer"
                    />
                    {documents.idFront && (
                      <p className="mt-2 text-sm text-green-600 flex items-center">
                        <FileCheck className="h-4 w-4 mr-1" />
                        {documents.idFront.name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idBack">Government ID (Back)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <Input
                      id="idBack"
                      type="file"
                      accept="image/*"
                      required
                      onChange={handleFileChange('idBack')}
                      className="cursor-pointer"
                    />
                    {documents.idBack && (
                      <p className="mt-2 text-sm text-green-600 flex items-center">
                        <FileCheck className="h-4 w-4 mr-1" />
                        {documents.idBack.name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proofOfAddress">Proof of Address</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <Input
                      id="proofOfAddress"
                      type="file"
                      accept="image/*,.pdf"
                      required
                      onChange={handleFileChange('proofOfAddress')}
                      className="cursor-pointer"
                    />
                    {documents.proofOfAddress && (
                      <p className="mt-2 text-sm text-green-600 flex items-center">
                        <FileCheck className="h-4 w-4 mr-1" />
                        {documents.proofOfAddress.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <div className="px-6 pb-6 space-y-4">
              <Button type="button" variant="outline" className="w-full" onClick={() => setStep('personal')}>
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
                  <p><strong>Date of Birth:</strong> {personalInfo.dateOfBirth}</p>
                  <p><strong>Address:</strong> {personalInfo.address}, {personalInfo.city}, {personalInfo.state} {personalInfo.zipCode}</p>
                  <p><strong>Documents Uploaded:</strong> 3 files</p>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p className="mb-2">By submitting, you confirm that:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>All information provided is accurate and truthful</li>
                  <li>You consent to identity verification checks</li>
                  <li>You understand this information will be securely stored</li>
                </ul>
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
                    Submit KYC Verification
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