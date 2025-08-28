import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from './providers';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Monay Wallet - Digital Money Management",
  description: "Secure and easy digital wallet for managing your money, sending payments, and tracking expenses.",
  keywords: ["digital wallet", "money management", "payments", "finance", "banking"],
  authors: [{ name: "Monay Team" }],
  openGraph: {
    title: "Monay Wallet - Digital Money Management",
    description: "Secure and easy digital wallet for managing your money",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}