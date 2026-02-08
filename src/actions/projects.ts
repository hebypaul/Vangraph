'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Project, ProjectStats } from '@/types';

export interface ProjectWithStats extends Project {
  stats: ProjectStats;
}

// Get projects for a workspace
export async function getProjects(workspaceId: string): Promise<Project[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('name');

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
  return data || [];
}

// Get projects with stats for a workspace
export async function getProjectsWithStats(workspaceId: string): Promise<ProjectWithStats[]> {
  const projects = await getProjects(workspaceId);
  
  // Fetch stats for all projects in parallel
  const projectsWithStats = await Promise.all(
    projects.map(async (project) => {
      const stats = await getProjectStats(project.id);
      return { ...project, stats };
    })
  );

  return projectsWithStats;
}

// Get project by key
export async function getProjectByKey(workspaceId: string, key: string): Promise<Project | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('key', key)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// Create a new project
export async function createProject(
  payload: Omit<Project, 'id' | 'created_at' | 'updated_at'>
): Promise<Project> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('projects')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath('/projects');
  return data;
}

// Get project stats
export async function getProjectStats(projectId: string): Promise<ProjectStats> {
  const supabase = await createClient();

  // Get issue counts by status
  const { data: issues, error } = await supabase
    .from('issues')
    .select('status, estimate_points')
    .eq('project_id', projectId)
    .eq('archived', false);

  if (error) throw error;

  const total = issues?.length || 0;
  const completed = issues?.filter(i => i.status === 'done').length || 0;
  const inProgress = issues?.filter(i => i.status === 'in_progress').length || 0;
  const blocked = issues?.filter(i => i.status === 'cancelled').length || 0;
  
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
    velocity = Math.round(completed / completedSprints.length);
  }

  return {
    total_issues: total,
    completed_issues: completed,
    in_progress_issues: inProgress,
    blocked_issues: blocked,
    completion_rate: total > 0 ? Math.round((completed / total) * 100) : 0,
    velocity,
    active_sprint: sprint,
  };
}
