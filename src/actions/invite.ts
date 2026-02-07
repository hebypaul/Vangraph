'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

// Generate a short, URL-safe invite code
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Schema for creating an invite
const createInviteSchema = z.object({
  workspaceId: z.string().uuid(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'manager', 'member', 'viewer']).default('member'),
});

export type WorkspaceInvite = {
  id: string;
  workspace_id: string;
  email: string | null;
  role: 'owner' | 'admin' | 'manager' | 'member' | 'viewer';
  code: string;
  created_by: string | null;
  expires_at: string;
  accepted_at: string | null;
  accepted_by: string | null;
  created_at: string;
  workspace?: {
    id: string;
    name: string;
    slug: string;
  };
};

/**
 * Create a workspace invite
 */
export async function createInvite(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const rawData = {
    workspaceId: formData.get('workspaceId'),
    email: formData.get('email') || undefined,
    role: formData.get('role') || 'member',
  };

  const result = createInviteSchema.safeParse(rawData);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { workspaceId, email, role } = result.data;

  // Generate unique code
  const code = generateInviteCode();

  const { data, error } = await supabase
    .from('workspace_invites')
    .insert({
      workspace_id: workspaceId,
      email: email || null,
      role,
      code,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Create invite error:', error);
    return { error: 'Failed to create invite' };
  }

  revalidatePath('/settings');
  
  return { 
    success: true, 
    invite: data,
    inviteLink: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/invite/${code}`
  };
}

/**
 * Get invite by code
 */
export async function getInviteByCode(code: string): Promise<{ invite?: WorkspaceInvite; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('workspace_invites')
    .select(`
      *,
      workspace:workspaces(id, name, slug)
    `)
    .eq('code', code)
    .single();

  if (error || !data) {
    return { error: 'Invite not found' };
  }

  // Check if expired
  if (new Date(data.expires_at) < new Date()) {
    return { error: 'This invite has expired' };
  }

  // Check if already accepted
  if (data.accepted_at) {
    return { error: 'This invite has already been used' };
  }

  return { invite: data as WorkspaceInvite };
}

/**
 * Accept an invite and join the workspace
 */
export async function acceptInvite(code: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Get the invite
  const { invite, error: inviteError } = await getInviteByCode(code);
  if (inviteError || !invite) {
    return { error: inviteError || 'Invite not found' };
  }

  // Check if user is already a member
  const { data: existingMember } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('workspace_id', invite.workspace_id)
    .eq('user_id', user.id)
    .single();

  if (existingMember) {
    return { error: 'You are already a member of this workspace', workspaceId: invite.workspace_id };
  }

  // Add user to workspace
  const { error: memberError } = await supabase
    .from('workspace_members')
    .insert({
      workspace_id: invite.workspace_id,
      user_id: user.id,
      role: invite.role,
    });

  if (memberError) {
    console.error('Join workspace error:', memberError);
    return { error: 'Failed to join workspace' };
  }

  // Mark invite as accepted
  await supabase
    .from('workspace_invites')
    .update({
      accepted_at: new Date().toISOString(),
      accepted_by: user.id,
    })
    .eq('id', invite.id);

  // Mark onboarding as complete if not already
  await supabase
    .from('profiles')
    .update({ onboarding_complete: true })
    .eq('id', user.id);

  revalidatePath('/');
  
  return { 
    success: true, 
    workspaceId: invite.workspace_id,
    workspaceName: invite.workspace?.name 
  };
}

/**
 * Get all invites for a workspace
 */
export async function getWorkspaceInvites(workspaceId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const { data, error } = await supabase
    .from('workspace_invites')
    .select('*')
    .eq('workspace_id', workspaceId)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    return { error: 'Failed to fetch invites' };
  }

  return { invites: data as WorkspaceInvite[] };
}

/**
 * Delete an invite
 */
export async function deleteInvite(inviteId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('workspace_invites')
    .delete()
    .eq('id', inviteId);

  if (error) {
    return { error: 'Failed to delete invite' };
  }

  revalidatePath('/settings');
  return { success: true };
}
