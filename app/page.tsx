'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth/auth-client';

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasVisited, setHasVisited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    // If the user is already logged in, redirect them to the dashboard
    if (session) {
      router.push('/dashboard');
      return;
    }

    // Check if user has visited before
    setHasVisited(localStorage.getItem('hasVisitedNutryFit') === 'true');

    if (hasVisited) {
      // If already visited, redirect to dashboard or login
      router.push('/auth/signin');
      setIsLoading(false);
    } else {
      // Mark as visited and show onboarding
      setHasVisited(true);
      setIsLoading(false);
    }
  }, [router, session]);

  // Save that user has visited when they complete onboarding
  const completeOnboarding = () => {
    localStorage.setItem('hasVisitedNutryFit', 'true');
    router.push('/auth/signup');
  };

  // Skip onboarding and go directly to sign in
  const skipOnboarding = () => {
    localStorage.setItem('hasVisitedNutryFit', 'true');
    router.push('/auth/signin');
  };

  const onboardingSteps = [
    {
      title: "Welcome to NutryFit",
      description: "Your personalized nutrition and wellness companion.",
      image: "/images/logo_trans_white.png",
      isIntro: true
    },
    {
      title: "Personalized Nutrition Plans",
      description: "Get customized meal plans based on your health goals, preferences, and dietary requirements.",
      image: "/images/onboarding-1.svg",
    },
    {
      title: "Expert Guidance",
      description: "Connect with certified nutritionists and health practitioners for professional advice.",
      image: "/images/onboarding-2.svg",
    },
    {
      title: "Track Your Progress",
      description: "Monitor your health journey with detailed analytics and progress tracking.",
      image: "/images/onboarding-3.svg",
    }
  ];

  // If content is still loading (checking localStorage and auth)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="animate-pulse text-white text-2xl">Loading...</div>
      </div>
    );
  }

  const currentStepData = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress bar */}
      <div className="w-full bg-gray-200 h-1">
        <div
          className="bg-blue-600 h-1 transition-all duration-300"
          style={{ width: `${(currentStep / (onboardingSteps.length - 1)) * 100}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-grow flex flex-col md:flex-row">
        {/* Left panel - Image */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-500 to-purple-600 p-8 flex flex-col justify-center items-center text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/auth-bg-pattern.svg"
              alt="Background Pattern"
              fill
              priority
              className="object-cover"
            />
          </div>

          <div className="relative z-10 max-w-lg mx-auto text-center">
            {currentStepData.isIntro ? (
              <div className="mb-8">
                <div className="relative h-20 w-60 mx-auto mb-8">
                  <Image
                    src={currentStepData.image}
                    alt="NutryFit Logo"
                    width={200}
                    height={100}
                    className="w-full h-full drop-shadow-lg"
                    priority
                  />
                </div>
                <h1 className="text-4xl font-bold mb-4">{currentStepData.title}</h1>
                <p className="text-xl opacity-90">{currentStepData.description}</p>
              </div>
            ) : (
              <div className="mb-8">
                <div className="relative h-64 w-64 mx-auto mb-8">
                  <Image
                    src={currentStepData.image}
                    alt={currentStepData.title}
                    width={300}
                    height={300}
                    className="w-full h-full object-contain drop-shadow-lg"
                    priority
                  />
                </div>
                <h2 className="text-3xl font-bold mb-4">{currentStepData.title}</h2>
                <p className="text-xl opacity-90">{currentStepData.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right panel - Content and controls */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-between bg-white">
          <div className="flex justify-end">
            <button
              onClick={skipOnboarding}
              className="text-gray-500 hover:text-gray-700 font-medium"
            >
              Skip
            </button>
          </div>

          <div className="flex-grow flex items-center justify-center">
            <div className="max-w-md w-full space-y-8 py-8">
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                      <span className="text-lg">Personalized nutrition plans</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                      <span className="text-lg">Expert guidance from practitioners</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                      <span className="text-lg">Track your progress effortlessly</span>
                    </div>
                  </div>

                  <div className="space-y-3 mt-8">
                    <Link href="/auth/signup" className="block w-full">
                      <button className="w-full rounded-lg bg-blue-600 px-4 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors">
                        Create an account
                      </button>
                    </Link>
                    <Link href="/auth/signin" className="block w-full">
                      <button className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300 transition-colors">
                        Sign in
                      </button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center mt-8">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Back
            </button>

            <div className="flex space-x-2">
              {onboardingSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-2.5 h-2.5 rounded-full ${currentStep === index ? 'bg-blue-600' : 'bg-gray-300'}`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => {
                if (isLastStep) {
                  completeOnboarding();
                } else {
                  setCurrentStep(currentStep + 1);
                }
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
            >
              {isLastStep ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
