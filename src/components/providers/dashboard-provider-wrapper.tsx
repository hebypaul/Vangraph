"use client";

import { useMemo } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { TamboProvider } from "@tambo-ai/react";
import { components, createTools } from "@/lib/tambo";
import { createContextHelpers } from "@/lib/tambo/context";
import { useMcpServers } from "@/components/tambo/mcp-config-modal";
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export function DashboardProviderWrapper({
  children,
  sidebarUser,
  headerUser,
  projects,
  membership
}: {
  children: React.ReactNode;
  sidebarUser: any;
  headerUser: any;
  projects: any[];
  membership: any;
}) {
  const mcpServers = useMcpServers();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const projectId = searchParams.get("projectId") || projects[0]?.id;
  
  // Find the active project object to pass its name/details to context
  const activeProject = projects.find(p => p.id === projectId) || projects[0] || null;

  // Create tools with the active project ID context
  const dynamicTools = useMemo(() => {
    return createTools(projectId);
  }, [projectId]);
  
  // Create dynamic context helpers
  const dynamicContextHelpers = useMemo(() => {
    return createContextHelpers(activeProject, pathname);
  }, [activeProject, pathname]);

  const isBoard = pathname?.includes('/board');

  return (
    <TamboProvider
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
      components={components}
      tools={dynamicTools}
      tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL}
      mcpServers={mcpServers}
      contextHelpers={dynamicContextHelpers}
    >
      <div className={`flex bg-background text-foreground ${isBoard ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
        <Sidebar 
          user={sidebarUser}
          projects={projects}
        />
        <div className="flex-1 ml-(--sidebar-width) flex flex-col min-w-0">
          <Header 
            user={headerUser}
            role={membership?.role}
            workspaceName="Vangraph"
            projectName="Vangraph"
            sprintName="Sprint 1"
          />
          <main className={`flex-1 bg-vg-surface ${isBoard ? 'overflow-hidden' : 'overflow-auto'} min-w-0`}>
            <div className="bg-white/5 h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </TamboProvider>
  );
}
