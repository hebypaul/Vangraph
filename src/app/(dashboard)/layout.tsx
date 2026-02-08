import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/utils/rbac';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { getProjects } from '@/actions/projects';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
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

  const sidebarUser = {
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
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar 
        user={sidebarUser}
        projects={projects}
      />
      <div className="flex-1 ml-(--sidebar-width) flex flex-col">
        <Header 
          user={headerUser}
          role={membership?.role}
          workspaceName="Vangraph"
          projectName="Vangraph"
          sprintName="Sprint 1"
        />
        <main className="flex-1 overflow-auto bg-vg-surface">
          <div className="bg-white/5 h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
