"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/atomic/button/Button";
import { Input } from "@/components/atomic/input/Input";
import { TextArea } from "@/components/atomic/input/TextArea";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

const settingsTabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "api", label: "API Keys", icon: Key },
  { id: "team", label: "Team", icon: Users },
  { id: "security", label: "Security", icon: Shield },
];

const teamMembers = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", avatar: "JD" },
  { id: 2, name: "Alice Roberts", email: "alice@example.com", role: "Developer", avatar: "AR" },
  { id: 3, name: "Bob Smith", email: "bob@example.com", role: "Developer", avatar: "BS" },
  { id: 4, name: "Carol Myers", email: "carol@example.com", role: "QA", avatar: "CM" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [theme, setTheme] = useState("dark");

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-[var(--sidebar-width)] flex flex-col">
        <Header projectName="Vangraph" sprintName="Sprint 1" />

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
              <nav className="w-48 flex-shrink-0 space-y-1">
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
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-vg-warning to-vg-danger flex items-center justify-center text-white text-xl font-bold">
                        JD
                      </div>
                      <Button variant="outline" size="sm">
                        Change Avatar
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="First Name" defaultValue="John" />
                      <Input label="Last Name" defaultValue="Doe" />
                    </div>
                    <Input
                      label="Email"
                      type="email"
                      defaultValue="john@example.com"
                    />
                    <TextArea
                      label="Bio"
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                    <Button variant="primary">
                      <Save className="w-4 h-4" />
                      Save Changes
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
                    <div className="space-y-3">
                      {teamMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 p-3 bg-vg-surface rounded-lg"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-vg-primary to-vg-purple flex items-center justify-center text-white text-sm font-bold">
                            {member.avatar}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">
                              {member.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {member.email}
                            </p>
                          </div>
                          <Badge
                            variant={
                              member.role === "Admin" ? "primary" : "default"
                            }
                          >
                            {member.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
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
      </div>
    </div>
  );
}
