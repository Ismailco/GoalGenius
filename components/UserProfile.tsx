'use client';
import Image from "next/image";
import { useSession, signOut } from "@/lib/auth/auth-client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Settings, LogOut, User } from "lucide-react";

interface UserProfileProps {
  isMobile?: boolean;
  isMenuButton?: boolean;
}

export default function UserProfile({ isMobile = false, isMenuButton = false }: UserProfileProps) {
  const {data: session} = useSession();
  const user = session?.user;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* Dropdown Menu */}
      {!isMenuButton && isMenuOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-56 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-[9999] translate-x-[20%]">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <div className="px-4 py-2 border-b border-gray-700">
              <p className="text-sm font-medium text-white">{user?.name || "Guest User"}</p>
              <p className="text-xs text-gray-400">{user?.email || "guest@email.com"}</p>
            </div>
            <Link
              href="/settings"
              className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors cursor-pointer"
              role="menuitem"
              onClick={() => setIsMenuOpen(false)}
            >
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors cursor-pointer"
              role="menuitem"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign out
            </button>
          </div>
        </div>
      )}

      <div
        className={`flex items-center ${!isMenuButton ? 'cursor-pointer' : ''}`}
        onClick={!isMenuButton ? toggleMenu : undefined}
      >
        <div className={`relative ${isMenuButton ? 'p-1' : 'p-1'}`}>
          {user?.image ? (
            <Image src={user.image} alt="User Avatar" width={32} height={32} className="rounded-full" />
          ) : (
            <div className={`w-10 h-10 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 ${isMenuButton ? 'hover:bg-white/5' : ''}`}>
              <User className="w-6 h-6 text-blue-400" />
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
    </div>
  );
}
