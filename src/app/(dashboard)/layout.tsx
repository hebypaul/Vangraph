import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/utils/rbac';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

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

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar 
        user={{
          fullName: profile.full_name,
          email: user.email,
          avatarUrl: profile.avatar_url
        }} 
      />
      <div className="flex-1 ml-[var(--sidebar-width)] flex flex-col">
        <Header 
          projectName="Vangraph" 
          sprintName="Sprint 1"
          user={{
            id: user.id,
            email: user.email,
            fullName: profile.full_name,
            avatarUrl: profile.avatar_url,
          }}
          role={membership?.role}
          workspaceName="Vangraph"
        />
        {children}
      </div>
    </div>
  );
}
