import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import RecaptchaProvider from "@/components/RecaptchaProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Monay - Enterprise Stablecoin Platform | CaaS & WaaS Solutions | GENIUS Act Compliant",
  description: "Monay is the first unified platform for enterprise stablecoin issuance, consumer payments, and compliance orchestration. $250B TAM. GENIUS Act compliant. Dual-rail blockchain (Base L2 + Solana). White-label solutions for banks, government, and enterprises. Pre-Series A funding.",
  keywords: ["stablecoin platform", "GENIUS Act", "programmable money", "digital wallet", "blockchain payments", "fintech infrastructure", "CaaS", "WaaS", "enterprise stablecoin", "government payments", "Base L2", "Solana", "compliant stablecoin", "treasury management", "payment rails", "financial infrastructure", "digital disbursements", "public sector payments", "bank modernization", "API-first fintech"],
  authors: [{ name: "Monay" }],
  creator: "Monay",
  publisher: "Monay",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://monay.com',
    title: 'Monay - Enterprise Stablecoin Platform | CaaS & WaaS | GENIUS Act Compliant',
    description: 'First unified platform for enterprise stablecoin issuance & compliance. $250B TAM by 2028. Serving 932K global financial institutions. GENIUS Act compliant infrastructure for banks, government, and enterprises.',
    siteName: 'Monay',
    images: [
      {
        url: 'https://monay.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Monay - Digital Payment Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Monay - Enterprise Stablecoin Platform | Pre-Series A | $6.5M Raise',
    description: 'Revolutionary dual-rail blockchain platform (Base L2 + Solana) for programmable money. White-label CaaS & WaaS solutions. Active RFPs in education, relief & B2B automation.',
    images: ['https://monay.com/twitter-image.png'],
    creator: '@monay',
  },
  metadataBase: new URL('https://monay.com'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Monay",
              "description": "First unified platform for enterprise stablecoin issuance, consumer payments, and compliance orchestration. GENIUS Act compliant. Dual-rail blockchain architecture. $250B TAM by 2028.",
              "url": "https://monay.com",
              "logo": "https://monay.com/Monay.svg",
              "sameAs": [
                "https://twitter.com/monay",
                "https://linkedin.com/company/monay",
                "https://github.com/monay"
              ],
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "US"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+1-888-MONAY",
                "contactType": "investor relations",
                "email": "investors@monay.com",
                "availableLanguage": ["English"]
              },
              "offers": {
                "@type": "AggregateOffer",
                "priceCurrency": "USD",
                "offerCount": "3",
                "offers": [
                  {
                    "@type": "Offer",
                    "name": "Monay CaaS - Coin-as-a-Service",
                    "description": "GENIUS Act compliant enterprise stablecoin issuance platform with built-in Business Rules Framework. Base L2 + Solana dual-rail architecture.",
                    "url": "https://monay.com/products/monay-caas"
                  },
                  {
                    "@type": "Offer",
                    "name": "Monay WaaS - Wallet-as-a-Service",
                    "description": "White-label digital wallet with cards, ATM access, and real-world payment rails. Instant settlement, programmable controls.",
                    "url": "https://monay.com/products/monay-waas"
                  },
                  {
                    "@type": "Offer",
                    "name": "Monay Government Solutions",
                    "description": "Programmable wallets for government disbursements: grants, disaster relief, education savings, subsidies. $500B SAM in public sector flows.",
                    "url": "https://monay.com/solutions/government-programs"
                  }
                ]
              }
            })
          }}
        />
        
        {/* Search Engine Verifications */}
        <meta name="google-site-verification" content="your-google-verification-code" />
        <meta name="msvalidate.01" content="your-bing-verification-code" />
        <meta name="yandex-verification" content="your-yandex-verification-code" />
        <meta name="p:domain_verify" content="your-pinterest-verification-code" />
        
        {/* Bing Specific Meta Tags */}
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Additional SEO Meta Tags */}
        <meta name="author" content="Monay" />
        <meta name="copyright" content="Monay Inc." />
        <meta name="application-name" content="Monay Platform" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Monay" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#000000" />
        
        {/* Reb2b Tracking Script */}
        <Script
          id="reb2b-tracking"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(key) {
                if (window.reb2b) return;
                window.reb2b = {loaded: true};
                var s = document.createElement("script");
                s.async = true;
                s.src = "https://b2bjsstore.s3.us-west-2.amazonaws.com/b/" + key + "/" + key + ".js.gz";
                document.getElementsByTagName("script")[0].parentNode.insertBefore(s, document.getElementsByTagName("script")[0]);
              }("VN080HX77V6J");
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RecaptchaProvider>
          {children}
        </RecaptchaProvider>
      </body>
    </html>
  );
}
