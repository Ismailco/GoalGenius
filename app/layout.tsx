import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { createUserIfNotExists } from './lib/auth';

const inter = Inter({ subsets: ['latin'] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await createUserIfNotExists();

  return (
    <html lang="en">
      <ClerkProvider>
        <body className={inter.className}>
          {children}
          <Toaster />
        </body>
      </ClerkProvider>
    </html>
  );
}
