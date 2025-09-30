'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Camera,
  CameraOff,
  QrCode,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Keyboard,
  Flashlight,
  FlashlightOff,
  SwitchCamera
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose?: () => void;
  title?: string;
  description?: string;
}

interface PaymentData {
  type: 'invoice' | 'p2p' | 'merchant';
  invoiceId?: string;
  amount?: number;
  recipient?: string;
  currency?: string;
  memo?: string;
}

const QRScanner: React.FC<QRScannerProps> = ({
  onScan,
  onClose,
  title = 'Scan QR Code',
  description = 'Position the QR code within the frame to scan'
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [scanResult, setScanResult] = useState<PaymentData | null>(null);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (isScanning) {
      startCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isScanning, facingMode]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setHasPermission(true);
        setError(null);

        // Start scanning
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          scanQRCode();
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setHasPermission(false);
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Here we would use a QR code detection library
    // For now, using mock detection
    detectQRCode(imageData);

    // Continue scanning
    animationRef.current = requestAnimationFrame(scanQRCode);
  };

  const detectQRCode = (imageData: ImageData) => {
    // Mock QR code detection - in production, use a library like jsQR
    // Simulate occasional successful scan for demo
    if (Math.random() < 0.001) {
      handleQRCodeDetected(generateMockQRData());
    }
  };

  const generateMockQRData = (): string => {
    const mockData = {
      type: 'invoice',
      invoiceId: 'INV-2024-' + Math.floor(Math.random() * 1000),
      amount: Math.floor(Math.random() * 10000) + 100,
      currency: 'USDC',
      recipient: 'Merchant Store #' + Math.floor(Math.random() * 100),
      memo: 'Payment for services'
    };
    return JSON.stringify(mockData);
  };

  const handleQRCodeDetected = (data: string) => {
    try {
      const parsedData = JSON.parse(data) as PaymentData;
      setScanResult(parsedData);
      stopCamera();
      setIsScanning(false);
      onScan(data);
    } catch (err) {
      setError('Invalid QR code format');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Read the image file
      const reader = new FileReader();
      reader.onload = async (e) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas to process image
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');

          if (!ctx) return;

          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          // Process QR code from image
          // In production, use a library to decode QR from image
          // For demo, simulate success
          handleQRCodeDetected(generateMockQRData());
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to process image');
    }
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      try {
        // Try to parse as JSON first (for invoice data)
        JSON.parse(manualInput);
        onScan(manualInput);
        setShowManualInput(false);
      } catch {
        // If not JSON, treat as plain invoice ID
        const data = JSON.stringify({
          type: 'invoice',
          invoiceId: manualInput.trim()
        });
        onScan(data);
        setShowManualInput(false);
      }
    }
  };

  const toggleTorch = async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      try {
        await track.applyConstraints({
          advanced: [{ torch: !torchEnabled } as any]
        });
        setTorchEnabled(!torchEnabled);
      } catch (err) {
        setError('Torch not supported on this device');
      }
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="relative">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isScanning && !scanResult && (
            <div className="space-y-4">
              <Button
                onClick={() => setIsScanning(true)}
                className="w-full"
                size="lg"
              >
                <Camera className="mr-2 h-5 w-5" />
                Start Camera Scanner
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="qr-upload"
                  className="block w-full cursor-pointer"
                >
                  <Button variant="outline" className="w-full" asChild>
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload QR Image
                    </span>
                  </Button>
                </label>
                <input
                  id="qr-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              <Button
                variant="outline"
                onClick={() => setShowManualInput(!showManualInput)}
                className="w-full"
              >
                <Keyboard className="mr-2 h-4 w-4" />
                Enter Code Manually
              </Button>

              {showManualInput && (
                <div className="space-y-2">
                  <Input
                    placeholder="Enter invoice ID or payment code..."
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                  />
                  <Button
                    onClick={handleManualSubmit}
                    disabled={!manualInput.trim()}
                    className="w-full"
                  >
                    Submit
                  </Button>
                </div>
              )}
            </div>
          )}

          {isScanning && (
            <div className="relative">
              <div className="relative aspect-square max-w-md mx-auto bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />

                {/* Scanning overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 border-2 border-white/20" />
                  <div className="absolute inset-4 border-2 border-white/40" />
                  <div className="absolute inset-8 border-2 border-white/60">
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-white" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-white" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-white" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-white" />
                  </div>

                  {/* Scanning animation */}
                  <div className="absolute inset-x-8 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-scan" />
                </div>

                {/* Camera controls */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={switchCamera}
                    className="bg-white/20 backdrop-blur"
                  >
                    <SwitchCamera className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={toggleTorch}
                    className="bg-white/20 backdrop-blur"
                  >
                    {torchEnabled ? (
                      <FlashlightOff className="h-4 w-4" />
                    ) : (
                      <Flashlight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex justify-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    stopCamera();
                    setIsScanning(false);
                  }}
                >
                  <CameraOff className="mr-2 h-4 w-4" />
                  Stop Scanner
                </Button>
              </div>
            </div>
          )}

          {scanResult && (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  QR Code successfully scanned!
                </AlertDescription>
              </Alert>

              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Type:</span>
                  <span className="font-medium capitalize">{scanResult.type}</span>
                </div>
                {scanResult.invoiceId && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Invoice ID:</span>
                    <span className="font-mono text-sm">{scanResult.invoiceId}</span>
                  </div>
                )}
                {scanResult.amount && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Amount:</span>
                    <span className="font-medium">
                      ${scanResult.amount.toLocaleString()} {scanResult.currency || 'USDC'}
                    </span>
                  </div>
                )}
                {scanResult.recipient && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Recipient:</span>
                    <span className="font-medium">{scanResult.recipient}</span>
                  </div>
                )}
              </div>

              <Button
                className="w-full"
                onClick={() => {
                  setScanResult(null);
                  setIsScanning(false);
                }}
              >
                Scan Another Code
              </Button>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {hasPermission === false && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Camera permission denied. Please enable camera access in your browser settings to scan QR codes.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          50% { transform: translateY(100%); }
          100% { transform: translateY(-100%); }
        }

        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default QRScanner;