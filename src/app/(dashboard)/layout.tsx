import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/utils/rbac';
import { getProjects } from '@/actions/projects';
import { DashboardProviderWrapper } from '@/components/providers/dashboard-provider-wrapper';

export default async function DashboardLayout({
  children,
  sidebarUser, // This prop seems unused in the signature below, but included in logic
}: {
  children: React.ReactNode;
  sidebarUser?: any; // Fix type definition to match actual usage if needed
}) {
  const { user, profile, membership } = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // If user has no profile, redirect to onboarding
  if (!profile) {
    redirect('/onboarding/profile');
  }

  // Fetch projects for the sidebar
  // Safety check for legacy "dummy" data during transition
  const workspaceId = membership?.workspace_id;
  const projects = (workspaceId && workspaceId !== 'dummy') 
    ? await getProjects(workspaceId) 
    : [];

  const sidebarUserData = {
    fullName: profile?.full_name,
    email: user.email,
    avatarUrl: profile?.avatar_url
  };

  const headerUser = {
    id: user.id,
    email: user.email,
    fullName: profile?.full_name,
    avatarUrl: profile?.avatar_url
  };
  
  return (
      <DashboardProviderWrapper 
        sidebarUser={sidebarUserData}
        headerUser={headerUser}
        projects={projects}
        membership={membership}
      >
        {children}
      </DashboardProviderWrapper>
  );
}
