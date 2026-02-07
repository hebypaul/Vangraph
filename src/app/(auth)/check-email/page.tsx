'use client';

import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function CheckEmailPage() {
  return (
    <div className="text-center">
      <div className="inline-flex p-4 rounded-2xl bg-emerald-500/10 mb-6">
        <Mail className="w-12 h-12 text-emerald-400" />
      </div>
      
      <h1 className="text-2xl font-bold text-white mb-3">Check your email</h1>
      
      <p className="text-gray-400 mb-6">
        We've sent you a confirmation link. Click the link in your email to verify your account and continue.
      </p>

      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3 text-left">
          <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
          <div className="text-sm text-gray-300">
            <p className="font-medium mb-1">What happens next?</p>
            <ul className="text-gray-400 space-y-1">
              <li>1. Open the email from Vangraph</li>
              <li>2. Click the confirmation link</li>
              <li>3. You'll be signed in automatically</li>
            </ul>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Didn't receive an email? Check your spam folder or{' '}
        <Link href="/signup" className="text-indigo-400 hover:underline">
          try signing up again
        </Link>
      </p>

      <Link 
        href="/login"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to login
      </Link>
    </div>
  );
}
