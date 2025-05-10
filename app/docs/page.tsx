'use client';

import { useEffect } from 'react';

export default function DocsPage() {
  useEffect(() => {
    // Using window.location for external redirect since Next.js router is for internal navigation
    window.location.href = 'https://goalgenius.soultware.com/docs';
  }, []);

  // Return empty div while redirect happens
  return <div />;
}
