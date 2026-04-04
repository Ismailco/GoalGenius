'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/app/shared/Navbar';
import Sidebar from '@/components/app/shared/Sidebar';
import { isPublicPath } from '@/components/app/shared/navigation';

export default function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isPublicRoute = isPublicPath(pathname);

  return (
    <div className="app-shell flex min-h-screen">
      {!isPublicRoute && <Sidebar />}
      <main
        className={`shell-main ${
          isPublicRoute ? '' : 'pb-28 pt-24 md:pb-8 md:pt-8'
        }`}
      >
        {children}
      </main>
      {!isPublicRoute && <Navbar />}
    </div>
  );
}
