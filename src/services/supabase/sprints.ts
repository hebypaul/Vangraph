// Sprints Service
import { supabase, isSupabaseConfigured } from './client';
import type { Sprint, SprintStatus, SprintProgress, BurndownPoint } from '@/types';

// Mock data
const mockSprints: Sprint[] = [
  {
    id: 'sprint-1',
    project_id: 'proj-1',
    name: 'Sprint 1',
    description: 'Initial development sprint',
    start_date: '2026-02-01',
    end_date: '2026-02-14',
    velocity_target: 20,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Get active sprint for project
export async function getActiveSprint(projectId: string): Promise<Sprint | null> {
  if (!isSupabaseConfigured()) {
    return mockSprints.find(s => s.project_id === projectId && s.status === 'active') || null;
  }

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
  if (!isSupabaseConfigured()) {
    return mockSprints.filter(s => s.project_id === projectId);
  }

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
  if (!isSupabaseConfigured()) {
    const newSprint: Sprint = {
      id: `sprint-${mockSprints.length + 1}`,
      ...payload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockSprints.push(newSprint);
    return newSprint;
  }

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
  if (!isSupabaseConfigured()) {
    const index = mockSprints.findIndex(s => s.id === sprintId);
    if (index === -1) throw new Error('Sprint not found');
    
    mockSprints[index] = {
      ...mockSprints[index],
      ...payload,
      updated_at: new Date().toISOString(),
    };
    return mockSprints[index];
  }

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
  const sprint = mockSprints.find(s => s.id === sprintId) || mockSprints[0];
  
  // Mock burndown data
  const totalPoints = 20;
  const completedPoints = 8;
  const remainingPoints = totalPoints - completedPoints;
  
  // Generate mock burndown
  const burndown: BurndownPoint[] = [
    { date: '2026-02-01', remaining: 20 },
    { date: '2026-02-03', remaining: 18 },
    { date: '2026-02-05', remaining: 15 },
    { date: '2026-02-07', remaining: 12 },
  ];
  
  // Ideal burndown
  const ideal: BurndownPoint[] = [
    { date: '2026-02-01', remaining: 20 },
    { date: '2026-02-05', remaining: 13 },
    { date: '2026-02-10', remaining: 7 },
    { date: '2026-02-14', remaining: 0 },
  ];
  
  return {
    sprint,
    total_points: totalPoints,
    completed_points: completedPoints,
    remaining_points: remainingPoints,
    burndown,
    ideal_burndown: ideal,
  };
}
