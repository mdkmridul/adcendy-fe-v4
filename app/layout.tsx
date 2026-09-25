import React from "react"
import type { Metadata } from 'next'
import { DM_Sans, Space_Grotesk, Inter } from 'next/font/google'
import { Providers } from '@/shared/providers/Providers'
import { ApiDebugPanel } from '@/components/dev/api-debug-panel'
import { BUSINESS_TERMS } from '@/shared/marketing/business-terms'
import Script from 'next/script'
import './globals.css'

const _spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: '--font-space-grotesk',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: true
});
const _inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: true
});
const _dmSans = DM_Sans({
  subsets: ["latin"],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: true
});

export const metadata: Metadata = {
  title: {
    default: 'AdCendy - Market Intelligence & Strategy Reports',
    template: '%s | AdCendy',
  },
  description: `Competitive intelligence and a human-reviewed marketing strategy your team can own, delivered within ${BUSINESS_TERMS.delivery.businessDays} business days.`,
  icons: {
    icon: [
      {
        url: '/Adcendy icon + bg 48x48.svg',
        type: 'image/svg+xml',
        sizes: '48x48',
      },
    ],
    shortcut: '/Adcendy icon + bg 48x48.svg',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script src="/runtime-config.js" strategy="beforeInteractive" />
      </head>
      <body className={`${_inter.variable} ${_spaceGrotesk.variable} ${_dmSans.variable} font-sans antialiased`} suppressHydrationWarning>
        <Providers>
          {children}
          <ApiDebugPanel />
        </Providers>
      </body>
    </html>
  )
}
