/**
 * Client-safe RBAC utilities
 * These functions don't require server-side imports and can be used in client components
 */

export type UserRole = 'owner' | 'admin' | 'manager' | 'member' | 'viewer';

// Role hierarchy for permission checks
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  owner: 5,
  admin: 4,
  manager: 3,
  member: 2,
  viewer: 1,
};

/**
 * Check if a role has at least the required permission level
 */
export function hasRolePermission(
  userRole: UserRole | null | undefined,
  requiredRole: UserRole
): boolean {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
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
 * Get role badge color classes
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

/**
 * Check if role can access admin features
 */
export function isAdminRole(role: UserRole | null | undefined): boolean {
  return hasRolePermission(role, 'admin');
}

/**
 * Check if role can manage team (manager+)
 */
export function canManageTeamRole(role: UserRole | null | undefined): boolean {
  return hasRolePermission(role, 'manager');
}

/**
 * Check if role has write access (member+)
 */
export function canWriteRole(role: UserRole | null | undefined): boolean {
  return hasRolePermission(role, 'member');
}
