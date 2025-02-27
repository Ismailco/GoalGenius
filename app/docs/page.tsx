import { Metadata } from 'next';
import Link from 'next/link';
import AnimatedSection from '../components/AnimatedSection';
import Script from 'next/script';

interface StepContent {
  subtitle: string;
  text: string;
  steps: string[];
}

interface FeatureContent {
  subtitle: string;
  text: string;
  features: string[];
}

interface TipContent {
  subtitle: string;
  text: string;
  tips: string[];
}

type ContentItem = StepContent | FeatureContent | TipContent;

interface Section {
  id: string;
  title: string;
  content: ContentItem[];
}

const hasSteps = (item: ContentItem): item is StepContent => 'steps' in item;
const hasFeatures = (item: ContentItem): item is FeatureContent => 'features' in item;
const hasTips = (item: ContentItem): item is TipContent => 'tips' in item;

const sections: Section[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    content: [
      {
        subtitle: 'Creating Your Account',
        text: 'Start your journey by creating a free account. Click the "Get Started" button and follow the simple registration process.',
        steps: [
          'Click "Get Started" on the homepage',
          'Enter your basic information',
          'Verify your email address',
          'Set up your profile preferences'
        ]
      },
      {
        subtitle: 'Setting Up Your First Goal',
        text: 'Learn how to create and structure your goals effectively.',
        steps: [
          'Navigate to the Dashboard',
          'Click "Create Goal"',
          'Choose a category and timeframe',
          'Set milestones and deadlines',
          'Add relevant notes and details'
        ]
      }
    ]
  },
  {
    id: 'features',
    title: 'Key Features',
    content: [
      {
        subtitle: 'Goal Dashboard',
        text: 'Your central hub for tracking all your goals and progress.',
        features: [
          'Visual progress tracking',
          'Category-based organization',
          'Priority management',
          'Timeline view',
          'Progress statistics'
        ]
      },
      {
        subtitle: 'Daily Check-ins',
        text: 'Maintain accountability and track your daily progress.',
        features: [
          'Mood tracking',
          'Progress updates',
          'Daily reflections',
          'Achievement logging',
          'Challenge documentation'
        ]
      },
      {
        subtitle: 'Smart Notes',
        text: 'Capture and organize your thoughts and ideas.',
        features: [
          'Rich text formatting',
          'Category tagging',
          'Search functionality',
          'Pin important notes',
          'Share with others'
        ]
      }
    ]
  },
  {
    id: 'best-practices',
    title: 'Best Practices',
    content: [
      {
        subtitle: 'Setting Effective Goals',
        text: 'Learn how to set SMART goals that drive results.',
        tips: [
          'Be specific about what you want to achieve',
          'Set measurable targets',
          'Ensure goals are achievable and realistic',
          'Define relevant goals that align with your vision',
          'Set time-bound deadlines'
        ]
      },
      {
        subtitle: 'Maintaining Consistency',
        text: 'Develop habits that lead to long-term success.',
        tips: [
          'Schedule daily check-ins',
          'Review progress weekly',
          'Adjust goals as needed',
          'Celebrate small wins',
          'Learn from setbacks'
        ]
      }
    ]
  }
];

// Add metadata for better SEO
export const metadata: Metadata = {
	title: 'Documentation - GoalGenius',
	description: 'Learn how to use GoalGenius effectively and achieve your goals faster. Comprehensive guides, best practices, and tutorials.',
	openGraph: {
		title: 'Documentation - GoalGenius',
		description: 'Learn how to use GoalGenius effectively and achieve your goals faster. Comprehensive guides, best practices, and tutorials.',
		type: 'website',
		url: 'https://goalgenius.soultware.com/docs',
		images: [
			{
				url: 'https://goalgenius.soultware.com/og-docs.jpg',
				width: 1200,
				height: 630,
				alt: 'GoalGenius Documentation',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Documentation - GoalGenius',
		description: 'Learn how to use GoalGenius effectively and achieve your goals faster. Comprehensive guides, best practices, and tutorials.',
		images: ['https://goalgenius.soultware.com/og-docs.jpg'],
	},
	alternates: {
		canonical: 'https://goalgenius.soultware.com/docs',
	},
};

export default function DocsPage() {
	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'TechArticle',
		headline: 'GoalGenius Documentation',
		description: 'Learn how to use GoalGenius effectively and achieve your goals faster. Comprehensive guides, best practices, and tutorials.',
		author: {
			'@type': 'Organization',
			name: 'GoalGenius',
		},
		publisher: {
			'@type': 'Organization',
			name: 'GoalGenius',
			logo: {
				'@type': 'ImageObject',
				url: 'https://goalgenius.soultware.com/logo.png',
			},
		},
		mainEntityOfPage: {
			'@type': 'WebPage',
			'@id': 'https://goalgenius.soultware.com/docs',
		},
		articleSection: sections.map((section) => section.title).join(', '),
	};

	return (
		<main className="min-h-screen bg-slate-900">
			<Script id="structured-data" type="application/ld+json">
				{JSON.stringify(structuredData)}
			</Script>
			<div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl"></div>

			{/* Header */}
			<section className="relative py-16" aria-label="documentation header">
				<div className="container mx-auto px-4">
					<AnimatedSection initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto">
						<h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-6">Documentation</h1>
						<p className="text-xl text-gray-300 mb-8">Learn how to use GoalGenius effectively and achieve your goals faster.</p>
					</AnimatedSection>
				</div>
			</section>

			{/* Navigation */}
			<section className="relative py-8 border-b border-white/10" aria-label="navigation">
				<div className="container mx-auto px-4">
					<nav className="flex flex-wrap gap-4 justify-center">
						{sections.map((section) => (
							<a key={section.id} href={`#${section.id}`} className="px-6 py-2 text-sm font-medium rounded-full text-white bg-white/5 hover:bg-white/10 transition-colors">
								{section.title}
							</a>
						))}
					</nav>
				</div>
			</section>

			{/* Content Sections */}
			<div className="relative py-16">
				<div className="container mx-auto px-4">
					{sections.map((section) => (
						<section key={section.id} id={section.id} className="mb-20 last:mb-0" aria-label={section.title.toLowerCase()}>
							<AnimatedSection initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
								<h2 className="text-3xl font-bold text-white mb-8">{section.title}</h2>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
									{section.content.map((item, index) => (
										<AnimatedSection key={item.subtitle} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.2 }} className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
											<h3 className="text-xl font-bold text-white mb-4">{item.subtitle}</h3>
											<p className="text-gray-300 mb-6">{item.text}</p>
											{hasSteps(item) && (
												<div className="space-y-2">
													{item.steps.map((step, stepIndex) => (
														<div key={stepIndex} className="flex items-start gap-3">
															<span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-500/20 text-blue-400 text-sm">{stepIndex + 1}</span>
															<p className="text-gray-300">{step}</p>
														</div>
													))}
												</div>
											)}
											{hasFeatures(item) && (
												<ul className="space-y-2">
													{item.features.map((feature, featureIndex) => (
														<li key={featureIndex} className="flex items-center gap-3 text-gray-300">
															<svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
															</svg>
															{feature}
														</li>
													))}
												</ul>
											)}
											{hasTips(item) && (
												<ul className="space-y-2">
													{item.tips.map((tip, tipIndex) => (
														<li key={tipIndex} className="flex items-center gap-3 text-gray-300">
															<svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
															</svg>
															{tip}
														</li>
													))}
												</ul>
											)}
										</AnimatedSection>
									))}
								</div>
							</AnimatedSection>
						</section>
					))}
				</div>
			</div>

			{/* Help CTA */}
			<section className="relative py-16" aria-label="help">
				<div className="container mx-auto px-4">
					<AnimatedSection initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl p-12 border border-white/10 text-center">
						<h2 className="text-3xl font-bold text-white mb-4">Need More Help?</h2>
						<p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">Can&apos;t find what you&apos;re looking for? Our support team is here to help you succeed.</p>
						<Link href="/contact" className="inline-flex items-center px-8 py-3 text-lg font-medium rounded-full text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200">
							Contact Support
							<svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
							</svg>
						</Link>
					</AnimatedSection>
				</div>
			</section>
		</main>
	);
}
