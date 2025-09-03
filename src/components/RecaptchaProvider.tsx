'use client';

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

interface RecaptchaProviderProps {
  children: React.ReactNode;
}

// Use test key for development, replace with your production key
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

export default function RecaptchaProvider({ children }: RecaptchaProviderProps) {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={RECAPTCHA_SITE_KEY}
      scriptProps={{
        async: false,
        defer: false,
        appendTo: 'head',
        nonce: undefined,
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}