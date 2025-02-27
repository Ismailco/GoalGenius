'use client';

import { usePathname } from 'next/navigation';
import UserProfile from './UserProfile';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function Header() {
	const pathname = usePathname();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		let touchStart = 0;
		let touchEnd = 0;

		const handleTouchStart = (e: TouchEvent) => {
			touchStart = e.touches[0].clientX;
		};

		const handleTouchMove = (e: TouchEvent) => {
			touchEnd = e.touches[0].clientX;
		};

		const handleTouchEnd = () => {
			const distance = touchStart - touchEnd;
			const isLeftSwipe = distance > 50;
			const isRightSwipe = distance < -50;

			if (isLeftSwipe) {
				setIsMobileMenuOpen(false);
			} else if (isRightSwipe && touchStart < 50) {
				setIsMobileMenuOpen(true);
			}
		};

		document.addEventListener('touchstart', handleTouchStart);
		document.addEventListener('touchmove', handleTouchMove);
		document.addEventListener('touchend', handleTouchEnd);

		return () => {
			document.removeEventListener('touchstart', handleTouchStart);
			document.removeEventListener('touchmove', handleTouchMove);
			document.removeEventListener('touchend', handleTouchEnd);
		};
	}, []);

	// Don't show header on home page
	// if (pathname === '/' || pathname === '/sign-in' || pathname === '/sign-up' || pathname === '/docs') return null;

	const navItems = [
		{ name: 'Dashboard', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
		{ name: 'Check-ins', href: '/checkins', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
		{ name: 'Todos', href: '/todos', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
		{ name: 'Notes', href: '/notes', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
	];


	if (pathname === '/' || pathname === '/sign-in' || pathname === '/sign-up' || pathname === '/docs') {
		return (
			<>
				<header className="sm:border-b sm:border-white/10 bg-slate-900 lg:bg-transparent z-[997]">
				<div className="max-w-7xl mx-auto px-4 pt-3 pb-0 sm:py-3 sm:px-4">
					<div className="flex justify-between items-center">
						<div className="flex items-center">
							<h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">GoalGenius</h1>
						</div>
					</div>
				</div>
			</header>
		</>
	)
	} else {
		return (
			<>
				<header className="sm:border-b sm:border-white/10 bg-slate-900 lg:bg-transparent z-[997]">
					<div className="max-w-7xl mx-auto px-4 pt-3 pb-0 sm:py-3 sm:px-4">
					<div className="flex justify-between items-center">
						{/* Mobile Layout */}
						<div className="flex items-center justify-between w-full sm:hidden">
							{/* User Profile as Menu Button */}
							<div
								onClick={(e) => {
									e.stopPropagation();
									setIsMobileMenuOpen(!isMobileMenuOpen);
								}}
								className="relative z-[10]"
							>
								<UserProfile isMobile={true} isMenuButton={true} />
							</div>

							{/* Centered Logo */}
							<div className="flex items-center">
								<svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
								</svg>
							</div>

							{/* Empty div for spacing */}
							<div className="w-10"></div>
						</div>

						{/* Desktop Logo and Title */}
						<div className="hidden sm:flex items-center space-x-4">
							<div className="p-2 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20">
								<svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
								</svg>
							</div>
							<div>
								<h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">GoalGenius</h1>
								<p className="text-sm text-gray-400">Transform your aspirations into achievements</p>
							</div>
						</div>

						{/* Desktop User Profile */}
						<div className="hidden sm:block">
							<UserProfile isMobile={false} />
						</div>
					</div>
				</div>
			</header>

			{/* Mobile Menu Overlay */}
			{isMobileMenuOpen && (
				<div
					className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[998] sm:hidden"
					onClick={(e) => {
						e.stopPropagation();
						setIsMobileMenuOpen(false);
					}}
				/>
			)}

			{/* Mobile Slide-out Menu */}
			<div ref={menuRef} className={`fixed top-0 left-0 bottom-0 w-64 bg-slate-900/95 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ease-in-out z-[999] sm:hidden flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
				{/* Logo in Menu */}
				<div className="p-6 border-b border-white/10">
					<div className="flex items-center space-x-3">
						<div className="p-2 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20">
							<svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
							</svg>
						</div>
						<div>
							<h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">GoalGenius</h1>
						</div>
					</div>
				</div>

				{/* Navigation Links */}
				<nav className="flex-1 p-4 space-y-2">
					{navItems.map((item) => {
						const isActive = pathname === item.href;
						return (
							<Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
								<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
								</svg>
								<span className="font-medium">{item.name}</span>
							</Link>
						);
					})}
				</nav>

				{/* User Profile at bottom */}
				<div className="p-4 border-t border-white/10">
					<UserProfile isMobile={true} />
				</div>
			</div>
		</>
	);
}};
