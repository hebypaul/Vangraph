import { redirect } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { getCurrentUser } from '@/utils/rbac';

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is authenticated
  const { user, profile } = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  // If onboarding is complete, redirect to board
  if (profile?.onboarding_complete) {
    redirect('/board');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 shadow-lg shadow-emerald-500/25">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Vangraph
          </span>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mb-8">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <div className="w-2 h-2 rounded-full bg-gray-700" />
        </div>

        {/* Card */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
