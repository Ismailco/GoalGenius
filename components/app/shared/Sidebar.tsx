'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import UserProfile from '@/components/UserProfile';

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);

	useEffect(() => {
		const saved = localStorage.getItem('sidebar-collapsed');
		if (saved !== null) {
			setIsCollapsed(saved === 'true');
		}
	}, []);


	const toggleSidebar = () => {
		const newValue = !isCollapsed;
		setIsCollapsed(newValue);
		localStorage.setItem('sidebar-collapsed', newValue.toString());
	};


  // Don't show sidebar on these pages
  if (pathname === '/' || pathname === '/auth/signin' || pathname === '/auth/signup') return null;

  const sidebarItems = [
		{
			name: 'Dashboard',
			href: '/dashboard',
			icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
			activeIcon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
		},
		{
			name: 'Check-ins',
			href: '/checkins',
			icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
			activeIcon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
		},
		{
			name: 'Todos',
			href: '/todos',
			icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
			activeIcon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
		},
		{
			name: 'Notes',
			href: '/notes',
			icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
			activeIcon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
		},
		{
			name: 'Goals',
			href: '/goals',
			icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
			activeIcon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
		},
    {
      name: 'Milestones',
      href: '/milestones',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
      activeIcon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    },
    {
      name: 'Calendar',
      href: '/calendar',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      activeIcon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    },
		{
			name: 'Analytics',
			href: '/analytics',
			icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
			activeIcon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
		},
		{
			name: 'Journal',
			href: '/journal',
			icon: 'M12 4v16m8-8H4',
			activeIcon: 'M12 4v16m8-8H4',
		},
	];

  return (
		<aside className={`sticky h-screen top-0 bottom-0 bg-slate-900/90 backdrop-blur-lg border-r border-white/10 transition-all duration-300 z-40 hidden md:block ${isCollapsed ? 'w-16' : 'w-64'}`}>
			<div className="flex flex-col h-full">
				{/* Logo/Header */}
				<div className={`h-16 flex items-center border-b border-white/10 ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
					{!isCollapsed && <h1 className="text-xl font-bold text-white truncate">GoalGenius</h1>}
					<button onClick={toggleSidebar} className={`w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-colors ${isCollapsed ? 'pr-1' : 'pl-1'} cursor-pointer`}>
						<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isCollapsed ? 'M13 5l7 7-7 7' : 'M11 19l-7-7 7-7'} />
						</svg>
					</button>
				</div>
				{/* Navigation Items */}
				<nav className="flex-1 py-4">
					<div className={`space-y-1 ${isCollapsed ? 'px-3' : 'px-4'}`}>
						{sidebarItems.map((item) => {
							const isActive = pathname === item.href;
							return (
								<Link key={item.name} href={item.href} className={`flex items-center ${isCollapsed ? 'justify-center h-10' : ''} rounded-lg transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'} ${!isCollapsed ? 'px-3 py-2' : 'p-2'}`}>
									<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
									</svg>
									{!isCollapsed && <span className="ml-3 font-medium">{item.name}</span>}
								</Link>
							);
						})}
					</div>
				</nav>
				{/* User Profile Section */}

				<div className="p-2 border-t border-white/10">
					<UserProfile isMenuButton={isCollapsed} />
				</div>
			</div>
		</aside>
	);
}
