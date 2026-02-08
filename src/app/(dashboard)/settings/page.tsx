import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/utils/rbac';
import { SettingsClient } from './SettingsClient';

/**
 * Settings page - Server component that fetches user data
 */
export default async function SettingsPage() {
  const { user, profile, membership } = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (!profile) {
    redirect('/onboarding/profile');
  }

  return (
    <SettingsClient 
      user={{
        id: user.id,
        email: user.email || '',
        fullName: profile.full_name,
        avatarUrl: profile.avatar_url,
      }}
      role={membership?.role}
    />
  );
}
