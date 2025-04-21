'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from '@/lib/auth/auth-client';

export default function ClientDashboard({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <div className="p-4 border-b">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-semibold text-blue-600">NutryFit</span>
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${activeTab === 'overview' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            Overview
          </button>

          <button
            onClick={() => setActiveTab('nutrition')}
            className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${activeTab === 'nutrition' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            Nutrition Plans
          </button>

          <button
            onClick={() => setActiveTab('progress')}
            className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${activeTab === 'progress' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            Progress
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${activeTab === 'messages' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
            </svg>
            Messages
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <button className="md:hidden text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>

          <div className="relative">
            <button className="flex items-center space-x-2 text-sm">
              <div className="relative w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || 'User'}
                    fill
                    className="rounded-full"
                  />
                ) : (
                  <span className="text-gray-700">{user?.name?.charAt(0)}</span>
                )}
              </div>
              <span className="text-gray-700 font-medium hidden md:inline-block">{user?.name}</span>
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Sign out
              </button>
            </button>
          </div>
        </header>

        {/* Main content container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name?.split(' ')[0] || 'Client'}</h1>
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Client</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-blue-600 mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                  </div>
                  <h2 className="font-medium text-lg mb-1">Your Meal Plan</h2>
                  <p className="text-gray-500 text-sm">Balanced nutrition plan for your goals</p>
                  <button className="mt-4 text-blue-600 text-sm font-medium hover:text-blue-800">View plan →</button>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-blue-600 mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <h2 className="font-medium text-lg mb-1">Your Practitioner</h2>
                  <p className="text-gray-500 text-sm">Sarah Johnson, Nutritionist</p>
                  <button className="mt-4 text-blue-600 text-sm font-medium hover:text-blue-800">Message →</button>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-blue-600 mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <h2 className="font-medium text-lg mb-1">Your Progress</h2>
                  <p className="text-gray-500 text-sm">Track your health journey</p>
                  <button className="mt-4 text-blue-600 text-sm font-medium hover:text-blue-800">See progress →</button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="font-medium text-lg mb-4">Upcoming Sessions</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium">Weekly Check-in</h3>
                      <p className="text-sm text-gray-500">With Sarah Johnson</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Tomorrow</p>
                      <p className="text-sm text-gray-500">10:00 AM</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium">Nutrition Review</h3>
                      <p className="text-sm text-gray-500">With Sarah Johnson</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">May 15, 2023</p>
                      <p className="text-sm text-gray-500">2:30 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'nutrition' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">Your Nutrition Plan</h1>
              <p className="text-gray-500">This plan was designed specifically for your goals and preferences.</p>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="font-semibold text-xl mb-4">Today's Meals</h2>
                <div className="space-y-4">
                  {['Breakfast', 'Lunch', 'Snack', 'Dinner'].map((meal) => (
                    <div key={meal} className="flex p-4 border-b border-gray-100 last:border-0">
                      <div className="w-24 font-medium text-gray-700">{meal}</div>
                      <div className="flex-1">
                        <p className="font-medium">Balanced meal with protein and vegetables</p>
                        <p className="text-sm text-gray-500">400 calories • 30g protein • 45g carbs • 15g fat</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">Your Progress</h1>
              <p className="text-gray-500">Track your health journey and achievements.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h2 className="font-semibold text-xl mb-4">Weekly Summary</h2>
                  <div className="h-60 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-gray-400">Progress chart will appear here</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h2 className="font-semibold text-xl mb-4">Goals</h2>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Daily water intake</span>
                        <span className="text-sm font-medium text-blue-600">75%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Weekly exercise</span>
                        <span className="text-sm font-medium text-blue-600">50%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Meal plan adherence</span>
                        <span className="text-sm font-medium text-blue-600">90%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-500">Connect with your health practitioner.</p>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200 p-4">
                  <h2 className="font-medium">Sarah Johnson, Nutritionist</h2>
                </div>
                <div className="h-96 p-4 bg-gray-50 overflow-y-auto">
                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <div className="bg-blue-600 text-white p-3 rounded-lg rounded-tr-none max-w-xs">
                        <p>Hi Sarah, I have a question about my meal plan.</p>
                        <span className="text-xs text-blue-100 block mt-1">10:30 AM</span>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="bg-white border border-gray-200 p-3 rounded-lg rounded-tl-none max-w-xs">
                        <p>Hi! I'd be happy to help. What questions do you have?</p>
                        <span className="text-xs text-gray-400 block mt-1">10:32 AM</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-200">
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700">
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
