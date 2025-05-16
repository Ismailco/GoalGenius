import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "../components/Providers";
import Navbar from "../components/app/shared/Navbar";
import Sidebar from "../components/app/shared/Sidebar";
import { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: '%s | GoalGenius',
    default: 'GoalGenius - Track Your Goals',
  },
  description: 'Personal goal tracking and productivity dashboard',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content={`${viewport.width}, initial-scale=${viewport.initialScale}`} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 transition-all duration-300 my-16 md:my-0">
              {children}
            </main>
          </div>
          <Navbar />
        </Providers>
      </body>
    </html>
  );
}
