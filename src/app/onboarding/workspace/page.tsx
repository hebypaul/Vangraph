'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Loader2, Rocket, Link as LinkIcon, ArrowRight, Users, Clock } from 'lucide-react';
import { createWorkspace } from '@/actions/workspace';
import { acceptInvite } from '@/actions/invite';

type OnboardingStep = 'choose' | 'create' | 'join';

export default function WorkspaceOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>('choose');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Create workspace state
  const [name, setName] = useState('');
  
  // Join workspace state
  const [inviteCode, setInviteCode] = useState('');

  // Auto-generate slug from name
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 30);

  async function handleCreateWorkspace(formData: FormData) {
    setLoading(true);
    setError(null);
    
    const result = await createWorkspace(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // If successful, the server action will redirect to dashboard
  }

  async function handleJoinWorkspace() {
    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const result = await acceptInvite(inviteCode.trim());
    
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    
    // Success - redirect to dashboard
    router.push('/');
  }

  async function handleSkip() {
    // Just redirect to dashboard - user will see empty state
    router.push('/');
  }

  // Choose step - show options
  if (step === 'choose') {
    return (
      <div>
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 mb-4">
            <Users className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Join or create a workspace</h1>
          <p className="text-gray-400">
            How would you like to get started?
          </p>
        </div>

        <div className="space-y-3">
          {/* Create workspace option */}
          <button
            onClick={() => setStep('create')}
            className="w-full p-4 bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-800 hover:border-gray-600 transition-all text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
                  Create a new workspace
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-sm text-gray-400">
                  Set up a new workspace for your team. You&apos;ll become the owner.
                </p>
              </div>
            </div>
          </button>

          {/* Join workspace option */}
          <button
            onClick={() => setStep('join')}
            className="w-full p-4 bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-800 hover:border-gray-600 transition-all text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <LinkIcon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
                  Join with invite code
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-sm text-gray-400">
                  Enter an invite code from your team admin to join an existing workspace.
                </p>
              </div>
            </div>
          </button>

          {/* Skip option */}
          <button
            onClick={handleSkip}
            className="w-full p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl hover:bg-gray-800/50 transition-all text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-gray-500/10 text-gray-400">
                <Clock className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-300 mb-1">
                  Skip for now
                </h3>
                <p className="text-sm text-gray-500">
                  Wait for an invite from your team. You can always create or join later.
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Create workspace step
  if (step === 'create') {
    return (
      <div>
        <button
          onClick={() => { setStep('choose'); setError(null); }}
          className="text-gray-400 hover:text-white text-sm mb-4 flex items-center gap-1"
        >
          ← Back to options
        </button>
        
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 mb-4">
            <Building2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Create your workspace</h1>
          <p className="text-gray-400">
            A workspace is where your team collaborates on projects
          </p>
        </div>

        <form action={handleCreateWorkspace} className="space-y-4">
          {/* Workspace Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1.5">
              Workspace Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Inc."
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Slug (auto-generated) */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-300 mb-1.5">
              Workspace URL
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">vangraph.io/</span>
              <input
                id="slug"
                name="slug"
                type="text"
                required
                value={slug}
                readOnly
                className="flex-1 px-4 py-3 bg-gray-800/30 border border-gray-700 rounded-xl text-gray-400 focus:outline-none cursor-not-allowed"
              />
            </div>
            <p className="mt-1.5 text-xs text-gray-500">
              Auto-generated from workspace name
            </p>
          </div>

          {/* Role info */}
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <p className="text-sm text-emerald-400">
              ✓ You will be the <strong>Owner</strong> of this workspace
            </p>
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
            disabled={loading || !name.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-linear-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating workspace...
              </>
            ) : (
              <>
                <Rocket className="w-5 h-5" />
                Create Workspace
              </>
            )}
          </button>
        </form>
      </div>
    );
  }

  // Join workspace step
  return (
    <div>
      <button
        onClick={() => { setStep('choose'); setError(null); }}
        className="text-gray-400 hover:text-white text-sm mb-4 flex items-center gap-1"
      >
        ← Back to options
      </button>
      
      <div className="text-center mb-6">
        <div className="inline-flex p-3 rounded-2xl bg-blue-500/10 mb-4">
          <LinkIcon className="w-8 h-8 text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Join a workspace</h1>
        <p className="text-gray-400">
          Enter the invite code from your team admin
        </p>
      </div>

      <div className="space-y-4">
        {/* Invite Code Input */}
        <div>
          <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-300 mb-1.5">
            Invite Code
          </label>
          <input
            id="inviteCode"
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="e.g. abc123xy"
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-center text-lg tracking-wide"
          />
          <p className="mt-1.5 text-xs text-gray-500 text-center">
            Ask your team admin for the invite code or link
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Submit button */}
        <button
          type="button"
          onClick={handleJoinWorkspace}
          disabled={loading || !inviteCode.trim()}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Joining...
            </>
          ) : (
            <>
              <ArrowRight className="w-5 h-5" />
              Join Workspace
            </>
          )}
        </button>
      </div>
    </div>
  );
}
