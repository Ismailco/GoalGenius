'use client';

interface UserProfileProps {
  isMobile?: boolean;
  isMenuButton?: boolean;
}

export default function UserProfile({ isMobile = false, isMenuButton = false }: UserProfileProps) {
  return (
    <div className={`flex items-center ${isMenuButton ? 'cursor-pointer' : ''}`}>
      <div className={`relative ${isMenuButton ? 'p-1' : ''}`}>
        <div className={`w-10 h-10 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 ${isMenuButton ? 'hover:bg-white/5' : ''}`}>
          <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        {!isMobile && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-900 rounded-full"></div>
        )}
      </div>
      {!isMenuButton && (
        <div className="ml-3">
          <p className="text-sm font-medium text-white">Guest User</p>
          <p className="text-xs text-gray-400">guest@goalgenius.soultware.com</p>
        </div>
      )}
    </div>
  );
}
