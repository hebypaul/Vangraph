// Projects Service
import { supabase, shouldUseMockData } from './client';
import type { Project, ProjectStats } from '@/types';

// Mock data
const mockProjects: Project[] = [
  {
    id: 'proj-1',
    workspace_id: 'ws-1',
    name: 'Vangraph',
    key: 'VAN',
    description: 'AI-powered project management platform',
    tech_stack: ['Next.js', 'TypeScript', 'Supabase', 'Tambo'],
    settings: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Get project by ID
export async function getProjectById(projectId: string): Promise<Project | null> {
  if (shouldUseMockData(projectId)) {
    return mockProjects.find(p => p.id === projectId) || null;
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) throw error;
  return data;
}

// Get project by key
export async function getProjectByKey(workspaceId: string, key: string): Promise<Project | null> {
  if (shouldUseMockData(workspaceId)) {
    return mockProjects.find(p => p.workspace_id === workspaceId && p.key === key) || null;
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('key', key)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// Get all projects in workspace
export async function getProjects(workspaceId: string): Promise<Project[]> {
  if (shouldUseMockData(workspaceId)) {
    return mockProjects.filter(p => p.workspace_id === workspaceId || workspaceId === 'ws-1');
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('name');

  if (error) throw error;
  return data || [];
}

// Create project
export async function createProject(
  payload: Omit<Project, 'id' | 'created_at' | 'updated_at'>
): Promise<Project> {
  if (shouldUseMockData(payload.workspace_id)) {
    const newProject: Project = {
      id: `proj-${mockProjects.length + 1}`,
      ...payload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockProjects.push(newProject);
    return newProject;
  }

  const { data, error } = await supabase
    .from('projects')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get project stats
export async function getProjectStats(projectId: string): Promise<ProjectStats> {
  if (shouldUseMockData(projectId)) {
    // Mock stats
    return {
      total_issues: 15,
      completed_issues: 6,
      in_progress_issues: 4,
      blocked_issues: 1,
      completion_rate: 40,
      velocity: 12,
      active_sprint: {
        id: 'sprint-1',
        project_id: projectId,
        name: 'Sprint 1',
        status: 'active',
        start_date: '2026-02-01',
        end_date: '2026-02-14',
        velocity_target: 20,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
  }

  // Get issue counts by status
  const { data: issues } = await supabase
    .from('issues')
    .select('status, estimate_points')
    .eq('project_id', projectId)
    .eq('archived', false);

  const total = issues?.length || 0;
  const completed = issues?.filter(i => i.status === 'done').length || 0;
  const inProgress = issues?.filter(i => i.status === 'in_progress').length || 0;
  
  // Get active sprint
  const { data: sprint } = await supabase
    .from('sprints')
    .select('*')
    .eq('project_id', projectId)
    .eq('status', 'active')
    .single();

  // Calculate velocity from completed sprints
  const { data: completedSprints } = await supabase
    .from('sprints')
    .select('id')
    .eq('project_id', projectId)
    .eq('status', 'completed')
    .limit(3);

  let velocity = 0;
  if (completedSprints?.length) {
    // Calculate average completed points across recent sprints
    velocity = Math.round(completed / completedSprints.length);
  }

  return {
    total_issues: total,
    completed_issues: completed,
    in_progress_issues: inProgress,
    blocked_issues: 0, // Would need to track blocked status
    completion_rate: total > 0 ? Math.round((completed / total) * 100) : 0,
    velocity,
    active_sprint: sprint,
  };
}
