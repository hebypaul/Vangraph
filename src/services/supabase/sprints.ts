// Sprints Service
import { supabase } from './client';
import type { Sprint, SprintProgress, BurndownPoint } from '@/types';

// Get active sprint for project
export async function getActiveSprint(projectId: string): Promise<Sprint | null> {
  const { data, error } = await supabase
    .from('sprints')
    .select('*')
    .eq('project_id', projectId)
    .eq('status', 'active')
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// Get all sprints for project
export async function getSprints(projectId: string): Promise<Sprint[]> {
  const { data, error } = await supabase
    .from('sprints')
    .select('*')
    .eq('project_id', projectId)
    .order('start_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Create sprint
export async function createSprint(payload: Omit<Sprint, 'id' | 'created_at' | 'updated_at'>): Promise<Sprint> {
  const { data, error } = await supabase
    .from('sprints')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update sprint
export async function updateSprint(
  sprintId: string, 
  payload: Partial<Sprint>
): Promise<Sprint> {
  const { data, error } = await supabase
    .from('sprints')
    .update(payload)
    .eq('id', sprintId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Start sprint
export async function startSprint(sprintId: string): Promise<Sprint> {
  return updateSprint(sprintId, { 
    status: 'active',
    start_date: new Date().toISOString().split('T')[0]
  });
}

// Complete sprint
export async function completeSprint(sprintId: string): Promise<Sprint> {
  return updateSprint(sprintId, { 
    status: 'completed',
    end_date: new Date().toISOString().split('T')[0]
  });
}

// Get sprint progress (burndown)
export async function getSprintProgress(sprintId: string): Promise<SprintProgress> {
  // Get sprint
  const { data: sprint, error } = await supabase
    .from('sprints')
    .select('*')
    .eq('id', sprintId)
    .single();

  if (error) throw error;

  // Get issues for this sprint
  const { data: issues } = await supabase
    .from('issues')
    .select('status, estimate_points')
    .eq('sprint_id', sprintId)
    .eq('archived', false);

  const totalPoints = issues?.reduce((sum, i) => sum + (i.estimate_points || 0), 0) || 0;
  const completedPoints = issues?.filter(i => i.status === 'done')
    .reduce((sum, i) => sum + (i.estimate_points || 0), 0) || 0;
  const remainingPoints = totalPoints - completedPoints;
  
  // For now, simple burndown (can be enhanced with daily tracking later)
  const startDate = new Date(sprint.start_date);
  const endDate = new Date(sprint.end_date);
  const today = new Date();
  
  const burndown: BurndownPoint[] = [
    { date: sprint.start_date, remaining: totalPoints },
    { date: today.toISOString().split('T')[0], remaining: remainingPoints },
  ];
  
  // Ideal burndown
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const pointsPerDay = totalPoints / totalDays;
  
  const ideal: BurndownPoint[] = [];
  for (let i = 0; i <= totalDays; i += Math.ceil(totalDays / 4)) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    ideal.push({
      date: date.toISOString().split('T')[0],
      remaining: Math.max(0, Math.round(totalPoints - (pointsPerDay * i)))
    });
  }
  
  return {
    sprint,
    total_points: totalPoints,
    completed_points: completedPoints,
    remaining_points: remainingPoints,
    burndown,
    ideal_burndown: ideal,
  };
}
