import { createClient } from '@/utils/supabase/server';
import type { Profile } from '@/actions/profile';
import type { WorkspaceMember } from '@/actions/workspace';

export type UserRole = 'owner' | 'admin' | 'manager' | 'member' | 'viewer';

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

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    owner: 'Owner',
    admin: 'Admin',
    manager: 'Manager',
    member: 'Member',
    viewer: 'Viewer',
  };
  return names[role];
}

/**
 * Get role badge color
 */
export function getRoleBadgeColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    owner: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    admin: 'bg-red-500/20 text-red-400 border-red-500/30',
    manager: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    member: 'bg-green-500/20 text-green-400 border-green-500/30',
    viewer: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };
  return colors[role];
}
