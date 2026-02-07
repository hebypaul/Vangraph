import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getInviteByCode } from '@/actions/invite';
import InviteAcceptClient from './InviteAcceptClient';

interface InvitePageProps {
  params: Promise<{ code: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { code } = await params;
  const supabase = await createClient();
  
  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get invite details
  const { invite, error } = await getInviteByCode(code);
  
  if (error || !invite) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800/50 border border-gray-700 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Invalid Invite</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <a 
            href="/login"
            className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }
  
  // If not logged in, redirect to login with return URL
  if (!user) {
    redirect(`/login?redirectTo=/invite/${code}`);
  }
  
  return <InviteAcceptClient invite={invite} code={code} />;
}
