'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Loader2, ArrowRight } from 'lucide-react';
import { createProfileManually } from '@/actions/profile';

/**
 * Profile creation page for ghost profile recovery
 * This is a fail-safe for when the auto-create trigger fails
 */
export default function ProfileOnboardingPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const result = await createProfileManually(fullName);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      // Redirect to workspace creation
      router.push('/onboarding/workspace');
    }
  }

  return (
    <div>
      <div className="text-center mb-6">
        <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 mb-4">
          <User className="w-8 h-8 text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Complete your profile</h1>
        <p className="text-gray-400">
          Just a few more details to get you started
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1.5">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading || !fullName.trim()}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
