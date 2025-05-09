'use client';
import Image from "next/image";
import { useSession } from "@/lib/auth/auth-client";

interface UserProfileProps {
  isMobile?: boolean;
  isMenuButton?: boolean;
}

export default function UserProfile({ isMobile = false, isMenuButton = false }: UserProfileProps) {
  const {data: session} = useSession();
  const user = session?.user;

  return (
		<div className={`flex items-center ${isMenuButton ? 'cursor-pointer' : ''}`}>
			<div className={`relative ${isMenuButton ? 'p-1' : 'p-1'}`}>
					{user?.image ? (
						<Image src={user.image} alt="User Avatar" width={32} height={32} className="rounded-full" />
					) : (
						<div className={`w-10 h-10 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 ${isMenuButton ? 'hover:bg-white/5' : ''}`}>
							<svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
							</svg>
						</div>
					)}
			</div>
			{!isMenuButton && (
				<div className="ml-3">
					<p className="text-sm font-medium text-white">{user?.name ? user.name : "Guest User"}</p>
					<p className="text-xs text-gray-400">{user?.email ? user.email : "guest@email.com"}</p>
				</div>
			)}
		</div>
	);
}
