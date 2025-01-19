import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Sparkles, LayoutDashboard, Target, Calendar, Settings } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Goals', href: '/dashboard/goals', icon: Target },
  { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
];

export default function Navbar() {
  return (
    <nav className="bg-white border-b fixed w-full top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              <Sparkles className="w-7 h-7" />
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-transparent bg-clip-text">
                GoalGenius
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/settings"
              className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
            >
              <Settings className="w-5 h-5" />
            </Link>
            <div className="h-8 w-[1px] bg-gray-200" />
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 rounded-full"
                }
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
} 
