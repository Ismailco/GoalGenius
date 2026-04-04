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
    template: '%s | GoalGenius',
    default: 'GoalGenius - Track Your Goals',
  },
  description: 'Personal goal tracking and productivity dashboard',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#08111e',
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
          <div className="fixed bottom-24 right-4 z-50 md:bottom-6 md:right-6">
            <InstallPWA />
          </div>
        </Providers>
      </body>
    </html>
  );
}
