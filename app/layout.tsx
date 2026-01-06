import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stock Sense",
  description: "Stock Sense - Your Personal Stock Market Assistant",
  openGraph: {
    title: "Stock Sense",
    description: "Stock Sense - Your Personal Stock Market Assistant",
    type: "website",
    url: "https://stock-sense-dev.vercel.app",
    siteName: "Stock Sense",
    images: [
      {
        url: "https://stock-sense-dev.vercel.app/assets/images/dashboard-preview.png",
        width: 1200,
        height: 630,
        alt: "Stock Sense - Your Personal Stock Market Assistant",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stock Sense",
    description: "Stock Sense - Your Personal Stock Market Assistant",
    images: [
      {
        url: "https://stock-sense-dev.vercel.app/assets/images/dashboard-preview.png",
        width: 1200,
        height: 630,
        alt: "Stock Sense - Your Personal Stock Market Assistant",
      },
    ],
  },

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
