'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Building2
} from 'lucide-react';
import { signOut } from '@/actions/auth';
import { getRoleDisplayName, getRoleBadgeColor, type UserRole } from '@/utils/rbac-client';

interface UserNavProps {
  user: {
    email: string;
    fullName?: string | null;
    avatarUrl?: string | null;
  };
  role?: UserRole | null;
  workspaceName?: string;
}

export function UserNav({ user, role, workspaceName }: UserNavProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const initials = (user.fullName || user.email)
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
  };

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-800/50 transition-colors"
      >
        {/* Avatar */}
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.fullName || 'User'}
            className="w-8 h-8 rounded-lg object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-xs font-medium text-white">{initials}</span>
          </div>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setOpen(false)} 
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
            {/* User info */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName || 'User'}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">{initials}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.fullName || 'User'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
              
              {/* Role badge */}
              {role && (
                <div className="mt-3 flex items-center gap-2">
                  {workspaceName && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Building2 className="w-3 h-3" />
                      <span className="truncate">{workspaceName}</span>
                    </div>
                  )}
                  <span className={`ml-auto px-2 py-0.5 text-xs font-medium rounded-full border ${getRoleBadgeColor(role)}`}>
                    {getRoleDisplayName(role)}
                  </span>
                </div>
              )}
            </div>

            {/* Menu items */}
            <div className="p-2">
              <button
                onClick={() => {
                  setOpen(false);
                  router.push('/settings');
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <User className="w-4 h-4" />
                Profile
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  router.push('/settings');
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>

            {/* Sign out */}
            <div className="p-2 border-t border-gray-800">
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                {signingOut ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
