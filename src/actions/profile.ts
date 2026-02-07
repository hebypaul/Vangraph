'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Validation schemas
const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

export type ProfileActionResult = {
  error?: string;
  success?: boolean;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
};

/**
 * Get current user's profile
 */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

/**
 * Update user profile
 */
export async function updateProfile(formData: FormData): Promise<ProfileActionResult> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const rawData = {
    fullName: formData.get('fullName') as string | undefined,
    avatarUrl: formData.get('avatarUrl') as string | null,
  };

  const parsed = updateProfileSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (parsed.data.fullName) {
    updateData.full_name = parsed.data.fullName;
  }
  if (parsed.data.avatarUrl !== undefined) {
    updateData.avatar_url = parsed.data.avatarUrl;
  }

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/settings');
  return { success: true };
}

/**
 * Complete onboarding (mark profile as complete)
 */
export async function completeOnboarding(): Promise<ProfileActionResult> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ 
      onboarding_complete: true,
      updated_at: new Date().toISOString() 
    })
    .eq('id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

/**
 * Create profile manually (fail-safe for ghost profiles)
 */
export async function createProfileManually(
  fullName: string
): Promise<ProfileActionResult> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const { error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      email: user.email!,
      full_name: fullName,
      onboarding_complete: false,
    });

  if (error) {
    // Profile might already exist
    if (error.code === '23505') {
      return { success: true };
    }
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}
