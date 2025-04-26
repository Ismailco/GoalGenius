'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function NotFound() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Handle mouse movement for the interactive lightning effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-hidden">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 relative">
        {/* Interactive background effect */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(96, 165, 250, 0.2) 0%, transparent 50%)`
          }}
        />

        <div className="max-w-3xl mx-auto text-center relative">
          {/* Desktop version */}
          <div className="hidden sm:block space-y-8">
            <div className="relative group">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className={`w-96 h-96 text-blue-400/10 transform transition-transform duration-300 ${isHovering ? 'scale-110' : 'scale-100'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>

              <div className="relative z-10 py-20">
                <h1
                  className="text-9xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  404
                </h1>
                <p className="mt-6 text-2xl font-semibold text-blue-400">Oops! This page has vanished like lightning</p>
                <p className="mt-4 text-gray-400 text-lg">The page you&apos;re looking for seems to have struck elsewhere.</p>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Link
                href="/"
                className="transform hover:scale-105 transition-transform duration-200 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Return Home
              </Link>
              <button
                onClick={() => window.history.back()}
                className="transform hover:scale-105 transition-transform duration-200 inline-flex items-center px-6 py-3 border border-blue-400 text-base font-medium rounded-md text-blue-400 hover:bg-blue-400/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go Back
              </button>
            </div>
          </div>

          {/* Mobile version */}
          <div className="sm:hidden space-y-6">
            <svg className="w-24 h-24 mx-auto text-blue-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>

            <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              404
            </h1>
            <p className="text-lg font-medium text-blue-400">Page Not Found</p>
            <p className="text-sm text-gray-400">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>

            <div className="space-y-3">
              <Link
                href="/"
                className="block w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Return Home
              </Link>
              <button
                onClick={() => window.history.back()}
                className="block w-full px-4 py-2 text-sm font-medium text-blue-400 border border-blue-400 rounded-md hover:bg-blue-400/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go Back
              </button>
            </div>
          </div>

          {/* Easter egg - random 404 facts */}
          <div className="mt-12 text-sm text-gray-500 animate-fade-in">
            <p className="italic">
              Fun fact: The term &quot;404&quot; is believed to have originated from room 404 at CERN,
              where the World Wide Web was developed. When the room&apos;s computer was down,
              you&apos;d get a &quot;404 error.&quot;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
