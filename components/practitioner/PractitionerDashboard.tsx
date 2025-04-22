'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { signOut } from '@/lib/auth/auth-client';

export default function PractitionerDashboard({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState('clients');

  // Mock data for demonstration
  const clients = [
    { id: 1, name: 'Jane Cooper', email: 'jane@example.com', status: 'Active', lastActive: '2 days ago' },
    { id: 2, name: 'Robert Fox', email: 'robert@example.com', status: 'Active', lastActive: '5 hours ago' },
    { id: 3, name: 'Esther Howard', email: 'esther@example.com', status: 'Inactive', lastActive: '2 weeks ago' },
    { id: 4, name: 'Leslie Alexander', email: 'leslie@example.com', status: 'Active', lastActive: 'Yesterday' }
  ];

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
            onClick={() => setActiveTab('clients')}
            className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${activeTab === 'clients' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            Clients
          </button>

          <button
            onClick={() => setActiveTab('plans')}
            className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${activeTab === 'plans' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            Plans
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${activeTab === 'calendar' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            Calendar
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

          <div className="relative flex items-center justify-between space-x-4">
            <button className="flex items-center space-x-2 text-sm">
              <div className="relative w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || 'Practitioner'}
                    fill
                    className="rounded-full"
                  />
                ) : (
                  <span className="text-gray-700">{user?.name?.charAt(0)}</span>
                )}
              </div>
              <span className="text-gray-700 font-medium hidden md:inline-block">{user?.name}</span>
            </button>
            <button
              onClick={() => signOut()}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Sign out
            </button>
          </div>
        </header>

        {/* Main content container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {activeTab === 'clients' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Your Clients</h1>
                <button className="bg-blue-600 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-blue-700">
                  Add new client
                </button>
              </div>

              <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Active
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clients.map(client => (
                      <tr key={client.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-700">{client.name.charAt(0)}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{client.name}</div>
                              <div className="text-sm text-gray-500">{client.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            client.status === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {client.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {client.lastActive}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                          <button className="text-blue-600 hover:text-blue-900">Message</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'plans' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Nutrition Plans</h1>
                <button className="bg-blue-600 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-blue-700">
                  Create new plan
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h2 className="font-semibold text-lg mb-2">Weight Loss Plan</h2>
                  <p className="text-gray-500 text-sm mb-4">Balanced nutrition with calorie deficit</p>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Assigned to 4 clients</span>
                    <button className="text-blue-600 text-sm font-medium hover:text-blue-800">Edit</button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h2 className="font-semibold text-lg mb-2">Muscle Building</h2>
                  <p className="text-gray-500 text-sm mb-4">High protein plan for strength training</p>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Assigned to 2 clients</span>
                    <button className="text-blue-600 text-sm font-medium hover:text-blue-800">Edit</button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h2 className="font-semibold text-lg mb-2">Diabetes Management</h2>
                  <p className="text-gray-500 text-sm mb-4">Low carb plan with balanced macros</p>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Assigned to 1 client</span>
                    <button className="text-blue-600 text-sm font-medium hover:text-blue-800">Edit</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">Appointment Calendar</h1>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-center py-20">
                  <p className="text-gray-500">Calendar functionality will be implemented here</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">Client Messages</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="border-b border-gray-200 p-4">
                    <h2 className="font-medium">Recent Conversations</h2>
                  </div>
                  <div className="overflow-y-auto h-full">
                    {clients.map(client => (
                      <button
                        key={client.id}
                        className="w-full flex items-center p-4 border-b border-gray-100 hover:bg-gray-50 text-left"
                      >
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-700">{client.name.charAt(0)}</span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{client.name}</p>
                          <p className="text-xs text-gray-500">Last message: Yesterday</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
                  <div className="border-b border-gray-200 p-4">
                    <h2 className="font-medium">Jane Cooper</h2>
                  </div>
                  <div className="flex-1 p-4 bg-gray-50 overflow-y-auto">
                    <p className="text-center text-sm text-gray-500">Select a conversation to view messages</p>
                  </div>
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        disabled
                        className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button disabled className="bg-gray-300 text-white px-4 py-2 rounded-r-lg">
                        Send
                      </button>
                    </div>
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
