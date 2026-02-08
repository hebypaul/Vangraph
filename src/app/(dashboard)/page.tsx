import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/utils/rbac';
import { DashboardClient } from '@/components/dashboard/DashboardClient';

/**
 * Dashboard page - Server component that fetches user data
 * Protected by middleware, this page should only be accessible to authenticated users
 */
export default async function Dashboard() {
  const { user, profile, membership } = await getCurrentUser();

  // Fail-safe: If middleware failed, redirect to login
  if (!user) {
    redirect('/login');
  }

  // If user has no profile, redirect to onboarding
  if (!profile) {
    redirect('/onboarding/profile');
  }

  // If onboarding not complete, redirect to workspace creation
  if (!profile.onboarding_complete) {
    redirect('/onboarding/workspace');
  }

  return (
    <DashboardClient 
      user={{
        id: user.id,
        email: user.email,
        fullName: profile.full_name,
        avatarUrl: profile.avatar_url,
      }}
      role={membership?.role}
      workspaceId={membership?.workspace_id}
    />
  );
}
