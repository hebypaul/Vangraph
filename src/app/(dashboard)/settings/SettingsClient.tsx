"use client";

import { useState, useTransition } from "react";
import { UserNav } from "@/components/auth/UserNav";
import { Button } from "@/components/atomic/button/Button";
import { Input } from "@/components/atomic/input/Input";
import { TextArea } from "@/components/atomic/input/TextArea";
import { Badge } from "@/components/ui/badge";
import { updateProfile } from "@/actions/profile";
import type { UserRole } from "@/utils/rbac-client";
import {
  Settings,
  User,
  Bell,
  Palette,
  Key,
  Users,
  Shield,
  Save,
  Moon,
  Sun,
  Check,
  Loader2,
} from "lucide-react";

const settingsTabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "api", label: "API Keys", icon: Key },
  { id: "team", label: "Team", icon: Users },
  { id: "security", label: "Security", icon: Shield },
];

interface SettingsClientProps {
  user: {
    id: string;
    email: string;
    fullName?: string | null;
    avatarUrl?: string | null;
  };
  role?: UserRole | null;
}

export function SettingsClient({ user, role }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const [theme, setTheme] = useState("dark");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Split full name for form
  const nameParts = (user.fullName || '').split(' ');
  const [firstName, setFirstName] = useState(nameParts[0] || '');
  const [lastName, setLastName] = useState(nameParts.slice(1).join(' ') || '');

  // Get initials for avatar
  const initials = (user.fullName || user.email)
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  async function handleProfileUpdate() {
    setMessage(null);
    const formData = new FormData();
    formData.set('fullName', `${firstName} ${lastName}`.trim());
    
    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    });
  }

  return (
    <main className="flex-1 p-8 overflow-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings className="w-6 h-6 text-vg-primary" />
            Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your account and project settings
          </p>
        </div>

        <div className="flex gap-6">
          {/* Tabs Navigation */}
          <nav className="w-48 shrink-0 space-y-1">
            {settingsTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeTab === tab.id
                    ? "bg-vg-primary/20 text-vg-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-vg-surface"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Settings Content */}
          <div className="flex-1 vg-card">
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-foreground">
                  Profile Settings
                </h2>
                
                {/* Success/Error Message */}
                {message && (
                  <div className={`p-3 rounded-lg text-sm ${
                    message.type === 'success' 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
                      : 'bg-red-500/10 text-red-400 border border-red-500/30'
                  }`}>
                    {message.text}
                  </div>
                )}

                <div className="flex items-center gap-4">
                  {user.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt={user.fullName || 'User'}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-vg-warning to-vg-danger flex items-center justify-center text-white text-xl font-bold">
                      {initials}
                    </div>
                  )}
                  <Button variant="outline" size="sm">
                    Change Avatar
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="First Name" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <Input 
                    label="Last Name" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <Input
                  label="Email"
                  type="email"
                  value={user.email}
                  disabled
                />
                <TextArea
                  label="Bio"
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
                <Button variant="primary" onClick={handleProfileUpdate} disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-foreground">
                  Notification Preferences
                </h2>
                {[
                  { label: "Email notifications", desc: "Receive email updates about your tasks" },
                  { label: "Push notifications", desc: "Get push notifications in browser" },
                  { label: "Sprint reminders", desc: "Remind me of sprint deadlines" },
                  { label: "Agent updates", desc: "Notify when AI agents complete tasks" },
                  { label: "Team mentions", desc: "Notify when someone mentions me" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {item.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                    <button className="w-12 h-6 rounded-full bg-vg-primary relative">
                      <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-foreground">
                  Appearance Settings
                </h2>
                <div>
                  <p className="text-sm font-medium text-foreground mb-3">
                    Theme
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setTheme("dark")}
                      className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                        theme === "dark"
                          ? "border-vg-primary bg-vg-primary/10"
                          : "border-border hover:border-vg-primary/50"
                      }`}
                    >
                      <Moon className="w-6 h-6 mb-2 mx-auto text-foreground" />
                      <p className="text-sm font-medium text-foreground">
                        Dark
                      </p>
                      {theme === "dark" && (
                        <Check className="w-4 h-4 text-vg-primary mx-auto mt-2" />
                      )}
                    </button>
                    <button
                      onClick={() => setTheme("light")}
                      className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                        theme === "light"
                          ? "border-vg-primary bg-vg-primary/10"
                          : "border-border hover:border-vg-primary/50"
                      }`}
                    >
                      <Sun className="w-6 h-6 mb-2 mx-auto text-foreground" />
                      <p className="text-sm font-medium text-foreground">
                        Light
                      </p>
                      {theme === "light" && (
                        <Check className="w-4 h-4 text-vg-primary mx-auto mt-2" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "api" && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-foreground">
                  API Keys
                </h2>
                <div className="bg-vg-surface rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                      Tambo API Key
                    </span>
                    <Badge variant="success">Active</Badge>
                  </div>
                  <code className="text-xs text-muted-foreground block bg-background p-2 rounded">
                    sk-tambo-••••••••••••••••
                  </code>
                </div>
                <div className="bg-vg-surface rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                      Supabase URL
                    </span>
                    <Badge variant="default">Configured</Badge>
                  </div>
                  <code className="text-xs text-muted-foreground block bg-background p-2 rounded">
                    https://••••••••.supabase.co
                  </code>
                </div>
                <Button variant="outline">
                  <Key className="w-4 h-4" />
                  Generate New API Key
                </Button>
              </div>
            )}

            {activeTab === "team" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">
                    Team Members
                  </h2>
                  <Button variant="primary" size="sm">
                    Invite Member
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Team member management coming soon. Use workspace settings to manage team.
                </p>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-foreground">
                  Security Settings
                </h2>
                <div className="space-y-4">
                  <Input
                    label="Current Password"
                    type="password"
                    placeholder="••••••••"
                  />
                  <Input
                    label="New Password"
                    type="password"
                    placeholder="••••••••"
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
                <Button variant="primary">
                  <Shield className="w-4 h-4" />
                  Update Password
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
