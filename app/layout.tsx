import { JetBrains_Mono, Manrope } from 'next/font/google';
import "./globals.css";
import Providers from "../components/Providers";
import AppShell from '@/components/app/shared/AppShell';
import { InstallPWA } from "@/components/common/InstallPWA";
import type { Metadata, Viewport } from 'next';

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Rungset',
    default: 'Rungset - Build momentum, one rung at a time',
  },
  description:
    'Rungset turns goals into milestones, tasks, check-ins, and steady progress.',
  manifest: '/manifest.json',
  icons: {
    icon: [{ url: '/images/rungset-app-icon.png', type: 'image/png' }],
    apple: [{ url: '/images/rungset-app-icon.png', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#060f1b',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${jetBrainsMono.variable}`}
    >
      <body className="antialiased">
        <Providers>
          <AppShell>{children}</AppShell>
          <div className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-50 lg:bottom-6 lg:right-6">
            <InstallPWA />
          </div>
        </Providers>
      </body>
    </html>
  );
}
