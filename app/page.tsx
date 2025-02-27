import { Metadata } from 'next';
import Link from 'next/link';
import AnimatedSection from './components/AnimatedSection';
import Script from 'next/script';

export const metadata: Metadata = {
	title: 'GoalGenius - Transform Your Goals into Reality',
	description: 'Track your progress, celebrate milestones, and achieve your dreams with GoalGenius - your personal growth companion.',
	openGraph: {
		title: 'GoalGenius - Transform Your Goals into Reality',
		description: 'Track your progress, celebrate milestones, and achieve your dreams with GoalGenius - your personal growth companion.',
		type: 'website',
		url: 'https://goalgenius.soultware.com',
		images: [
			{
				url: 'https://goalgenius.soultware.com/og-home.jpg',
				width: 1200,
				height: 630,
				alt: 'GoalGenius - Goal Tracking App',
			},
		],
		siteName: 'GoalGenius',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'GoalGenius - Transform Your Goals into Reality',
		description: 'Track your progress, celebrate milestones, and achieve your dreams with GoalGenius - your personal growth companion.',
		images: ['https://goalgenius.soultware.com/og-home.jpg'],
	},
	alternates: {
		canonical: 'https://goalgenius.soultware.com',
	},
	keywords: 'goal tracking, personal development, productivity, milestone tracking, daily check-ins, smart notes',
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
};

const features = [
  {
    title: 'Goal Tracking',
    description: 'Set, track, and achieve your goals with our intuitive dashboard.',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
  },
  {
    title: 'Daily Check-ins',
    description: 'Reflect on your progress and maintain accountability with daily check-ins.',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    title: 'Smart Notes',
    description: 'Capture your thoughts and ideas with our beautiful notes system.',
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
  }
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Entrepreneur',
    content: 'GoalGenius has transformed how I approach my business goals. The daily check-ins keep me accountable and focused.',
    avatar: '👩🏽‍💼'
  },
  {
    name: 'Michael Chen',
    role: 'Fitness Enthusiast',
    content: 'The milestone tracking feature is incredible. It helps me break down my fitness goals into achievable steps.',
    avatar: '👨🏻‍💪'
  },
  {
    name: 'Emily Rodriguez',
    role: 'Student',
    content: 'As a student, I love how GoalGenius helps me balance my academic goals with personal development.',
    avatar: '👩🏻‍🎓'
  }
];

const stats = [
  { label: 'Active Users', value: '10K+' },
  { label: 'Goals Achieved', value: '50K+' },
  { label: 'Daily Check-ins', value: '100K+' },
  { label: 'Success Rate', value: '89%' }
];

export default function HomePage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'GoalGenius',
    description: 'Track your progress, celebrate milestones, and achieve your dreams with GoalGenius - your personal growth companion.',
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    featureList: [
      'Goal Tracking',
      'Daily Check-ins',
      'Smart Notes',
      'Progress Monitoring',
      'Milestone Tracking'
    ]
  };

  return (
    <>
      <Script id="structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>

      <main className="min-h-screen bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl"></div>

        {/* Hero Section */}
        <section className="relative" aria-label="hero">
          <div className="container mx-auto px-4 pt-20 pb-32 text-center">
            <AnimatedSection
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto"
            >
              <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-6">
                Transform Your Goals into Reality
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Track your progress, celebrate milestones, and achieve your dreams with GoalGenius - your personal growth companion.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={process.env.NEXT_PUBLIC_APP_URL + '/dashboard'}
                  className="inline-flex items-center px-8 py-3 text-lg font-medium rounded-full text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200"
                  aria-label="Get Started with GoalGenius"
                >
                  Get Started
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center px-8 py-3 text-lg font-medium rounded-full text-white bg-white/10 hover:bg-white/20 transform hover:scale-105 transition-all duration-200"
                >
                  Learn More
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative py-16" aria-label="statistics">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <AnimatedSection
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 text-center border border-white/10"
                >
                  <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-gray-400 mt-2">{stat.label}</p>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative py-20 bg-slate-900/50" aria-label="features">
          <div className="container mx-auto px-4">
            <AnimatedSection
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-4">Everything You Need to Succeed</h2>
              <p className="text-xl text-gray-300">Powerful features to help you stay on track and motivated</p>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <AnimatedSection
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 transform hover:scale-[1.02] transition-all duration-200"
                >
                  <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl inline-block mb-4">
                    <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="relative py-20" aria-label="how it works">
          <div className="container mx-auto px-4">
            <AnimatedSection
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
              <p className="text-xl text-gray-300">Simple steps to achieve your goals</p>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Set Your Goals',
                  description: 'Define clear, actionable goals and break them down into manageable milestones.'
                },
                {
                  step: '02',
                  title: 'Track Progress',
                  description: 'Monitor your progress with our intuitive dashboard and daily check-ins.'
                },
                {
                  step: '03',
                  title: 'Achieve Success',
                  description: 'Stay motivated, adjust your strategy, and celebrate your achievements.'
                }
              ].map((item, index) => (
                <AnimatedSection
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="relative bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10"
                >
                  <span className="text-6xl font-bold text-white/10 absolute top-4 right-4">{item.step}</span>
                  <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                  <p className="text-gray-300">{item.description}</p>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="relative py-20 bg-slate-900/50" aria-label="testimonials">
          <div className="container mx-auto px-4">
            <AnimatedSection
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-4">What Our Users Say</h2>
              <p className="text-xl text-gray-300">Join thousands of satisfied users achieving their goals</p>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <AnimatedSection
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10"
                >
                  <div className="text-4xl mb-4">{testimonial.avatar}</div>
                  <p className="text-gray-300 mb-6">&ldquo;{testimonial.content}&rdquo;</p>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-gray-400">{testimonial.role}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-20" aria-label="call to action">
          <div className="container mx-auto px-4">
            <AnimatedSection
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl p-12 border border-white/10 text-center"
            >
              <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Your Journey?</h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Can&apos;t find what you&apos;re looking for? Our support team is here to help you succeed.
              </p>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of users who are already achieving their goals with GoalGenius.
              </p>
              <Link
                href={process.env.NEXT_PUBLIC_APP_URL + '/dashboard'}
                className="inline-flex items-center px-8 py-3 text-lg font-medium rounded-full text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200"
                aria-label="Get Started Now with GoalGenius"
              >
                Get Started Now
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </AnimatedSection>
          </div>
        </section>
      </main>
    </>
  );
}
