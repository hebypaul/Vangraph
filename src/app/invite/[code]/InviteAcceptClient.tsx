'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, CheckCircle, Loader2 } from 'lucide-react';
import { acceptInvite, type WorkspaceInvite } from '@/actions/invite';

interface InviteAcceptClientProps {
  invite: WorkspaceInvite;
  code: string;
}

const roleLabels: Record<string, string> = {
  owner: 'Owner',
  admin: 'Administrator',
  manager: 'Manager',
  member: 'Member',
  viewer: 'Viewer',
};

export default function InviteAcceptClient({ invite, code }: InviteAcceptClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleAccept() {
    setLoading(true);
    setError(null);
    
    const result = await acceptInvite(code);
    
    if (result.error) {
      setError(result.error);
      setLoading(false);
      
      // If already a member, redirect to dashboard
      if (result.workspaceId) {
        setTimeout(() => router.push('/'), 2000);
      }
      return;
    }
    
    setSuccess(true);
    setTimeout(() => router.push('/'), 1500);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800/50 border border-gray-700 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Welcome to the team!</h1>
          <p className="text-gray-400">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
        {/* Workspace icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Users className="w-8 h-8 text-white" />
        </div>
        
        {/* Invite details */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-white mb-2">
            You&apos;ve been invited to join
          </h1>
          <p className="text-2xl font-bold text-indigo-400 mb-2">
            {invite.workspace?.name || 'a workspace'}
          </p>
          <p className="text-gray-400">
            as a <span className="text-white font-medium">{roleLabels[invite.role] || invite.role}</span>
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 mb-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleAccept}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Joining...
              </>
            ) : (
              'Accept Invitation'
            )}
          </button>
          
          <button
            onClick={() => router.push('/')}
            disabled={loading}
            className="w-full py-3 px-4 text-gray-400 hover:text-white font-medium transition-colors"
          >
            Decline
          </button>
        </div>

        {/* Expiry notice */}
        <p className="mt-6 text-xs text-gray-500 text-center">
          This invite expires on {new Date(invite.expires_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
