'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
});

export type AuthActionResult = {
  error?: string;
  success?: boolean;
  emailConfirmation?: boolean;
};

/**
 * Login with email and password
 */
export async function login(formData: FormData): Promise<AuthActionResult> {
  const supabase = await createClient();

  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // Handle specific error cases
    if (error.message.includes('Email not confirmed')) {
      return { error: 'Please check your email and confirm your account before logging in.' };
    }
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  
  // Check for redirect parameter
  const redirectTo = formData.get('redirectTo') as string;
  redirect(redirectTo || '/');
}

/**
 * Sign up with email, password, and full name
 */
export async function signup(formData: FormData): Promise<AuthActionResult> {
  const supabase = await createClient();

  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    fullName: formData.get('fullName') as string,
  };

  const parsed = signupSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      data: {
        full_name: parsed.data.fullName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Check if email confirmation is required
  // If user.identities is empty, email confirmation is enabled
  if (data.user && data.user.identities?.length === 0) {
    return { emailConfirmation: true, success: true };
  }

  // If session exists, user is confirmed - redirect to onboarding
  if (data.session) {
    revalidatePath('/', 'layout');
    redirect('/onboarding/workspace');
  }

  // Email confirmation required
  return { emailConfirmation: true, success: true };
}

/**
 * Sign out and redirect to login
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

/**
 * Get current authenticated user (for server components)
 */
export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
