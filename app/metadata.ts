import { Metadata } from 'next';

// Viewport configuration
// export const viewport = {
// 	width: 'device-width',
// 	initialScale: 1,
// 	maximumScale: 1,
// };

// Base metadata configuration for SEO optimization
export const metadata: Metadata = {
  title: {
    template: '%s | NutryFit',
    default: 'NutryFit - Your Personalized Nutrition & Fitness App'
  },
  description: 'Track your nutrition, plan your meals, and achieve your fitness goals with personalized plans, expert guidance, and progress tracking.',
  keywords: [
    'nutrition app',
    'fitness tracking',
    'meal planning',
    'diet plans',
    'health goals',
    'workout tracking',
    'personalized nutrition',
    'weight management',
    'calorie tracking'
  ],
  authors: [{ name: 'NutryFit Team' }],
  creator: 'NutryFit',
  publisher: 'NutryFit Inc.',
  formatDetection: {
    email: false,
    telephone: false,
    address: false
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://nutryfit.app'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US',
    }
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://nutryfit.app',
    siteName: 'NutryFit',
    title: 'NutryFit - Your Personalized Nutrition & Fitness App',
    description: 'Track your nutrition, plan your meals, and achieve your fitness goals with personalized plans, expert guidance, and progress tracking.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NutryFit - Your Personalized Nutrition & Fitness App'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NutryFit - Your Personalized Nutrition & Fitness App',
    description: 'Track your nutrition, plan your meals, and achieve your fitness goals with personalized plans, expert guidance, and progress tracking.',
    creator: '@nutryfit',
    site: '@nutryfit',
    images: ['/images/twitter-image.jpg']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon-16x16.png',
    apple: [
      { url: '/apple-touch-icon.png' },
      { url: '/apple-touch-icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  applicationName: 'NutryFit',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'NutryFit',
  },
  category: 'health & fitness',
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'theme-color': '#ffffff',
    'msapplication-TileColor': '#ffffff',
    'msapplication-TileImage': '/mstile-144x144.png',
    'msapplication-config': '/browserconfig.xml',
  },
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
    me: ['support@nutryfit.app']
  }
};

/**
 * Generate custom metadata for a specific page
 *
 * @param title - The page title (will be used in the template '%s | NutryFit')
 * @param description - Custom page description
 * @param pageProps - Additional metadata properties specific to the page
 * @returns Metadata object with the base metadata plus customizations
 */
export function generateMetadata(
  title: string,
  description?: string,
  pageProps: Partial<Metadata> = {}
): Metadata {
  // Create a deep copy of the openGraph object to avoid mutating the original
  const ogCustom = {
    ...metadata.openGraph,
    title: title,
    description: description || metadata.description,
  };

  // Create a deep copy of the twitter object
  const twitterCustom = {
    ...metadata.twitter,
    title: title,
    description: description || metadata.description,
  };

  return {
    ...metadata,
    title: title,
    description: description || metadata.description,
    // openGraph: {
    //   ...ogCustom,
    //   ...pageProps.openGraph,
    // },
    // twitter: {
    //   ...twitterCustom,
    //   ...pageProps.twitter,
    // },
    ...pageProps,
  };
}

// Pre-defined metadata for common pages
export const pageMetadata = {
  home: generateMetadata(
    'Home',
    'Your personalized nutrition and fitness journey starts here'
  ),
  dashboard: generateMetadata(
    'Dashboard',
    'Track your progress and manage your nutrition plans'
  ),
  profile: generateMetadata(
    'Profile',
    'Manage your account and personal information'
  ),
  signin: generateMetadata(
    'Sign In',
    'Access your NutryFit account'
  ),
  signup: generateMetadata(
    'Sign Up',
    'Create your NutryFit account and start your health journey'
  ),
  nutrition: generateMetadata(
    'Nutrition',
    'Plan your meals and track your nutrition with personalized recommendations'
  ),
  fitness: generateMetadata(
    'Fitness',
    'Access workout plans and track your fitness progress'
  ),
  settings: generateMetadata(
    'Settings',
    'Manage your account settings and preferences'
  ),
};
