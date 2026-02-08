import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Profile, WorkspaceMember } from '@/types';

export type UserRole = 'owner' | 'admin' | 'manager' | 'member' | 'viewer';

// Local createClient to avoid circular dependency
export async function createClient() {
  const cookieStore = await cookies();
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    console.error('RBAC: MISSING ENV VARS', { url: !!url, key: !!key });
  }

  return createServerClient(
    url!,
    key!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

// Role hierarchy for permission checks
const ROLE_HIERARCHY: Record<UserRole, number> = {
  owner: 5,
  admin: 4,
  manager: 3,
  member: 2,
  viewer: 1,
};

/**
 * Get current authenticated user with profile and active workspace membership
 */
export async function getCurrentUser(): Promise<{
  user: { id: string; email: string } | null;
  profile: Profile | null;
  membership: WorkspaceMember | null;
}> {
  // const { createClient } = await import('@/utils/supabase/server');
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { user: null, profile: null, membership: null };
  }

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Get first workspace membership (for now, use first workspace)
  // In a full app, you'd track active workspace in session/cookies
  const { data: memberships } = await supabase
    .from('workspace_members')
    .select('*')
    .eq('user_id', user.id)
    .limit(1);

  const membership = memberships?.[0] ?? null;

  return {
    user: { id: user.id, email: user.email! },
    profile,
    membership,
  };
}

/**
 * Get user's role in a specific workspace
 */
export async function getUserRole(workspaceId: string): Promise<UserRole | null> {
  // const { createClient } = await import('@/utils/supabase/server');
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single();

  return data?.role as UserRole | null;
}

/**
 * Check if user has at least the required role level
 */
export async function hasPermission(
  workspaceId: string,
  requiredRole: UserRole
): Promise<boolean> {
  const userRole = await getUserRole(workspaceId);
  if (!userRole) return false;

  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if user can perform admin actions
 */
export async function isAdmin(workspaceId: string): Promise<boolean> {
  return hasPermission(workspaceId, 'admin');
}

/**
 * Check if user can manage team (manager+)
 */
export async function canManageTeam(workspaceId: string): Promise<boolean> {
  return hasPermission(workspaceId, 'manager');
}

/**
 * Check if user has write access (member+)
 */
export async function canWrite(workspaceId: string): Promise<boolean> {
  return hasPermission(workspaceId, 'member');
}

import { 
  getRoleDisplayName as getRoleDisplayNameClient, 
  getRoleBadgeColor as getRoleBadgeColorClient 
} from './rbac-client';

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  return getRoleDisplayNameClient(role);
}

/**
 * Get role badge color
 */
export function getRoleBadgeColor(role: UserRole): string {
  return getRoleBadgeColorClient(role);
}
