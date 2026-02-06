// Issues Service - CRUD operations for issues
import { supabase, shouldUseMockData } from './client';
import type { 
  Issue, 
  IssueWithKey, 
  CreateIssuePayload, 
  UpdateIssuePayload,
  IssueStatus,
  Priority
} from '@/types';

// Mock data for development
const mockIssues: Issue[] = [
  {
    id: '1',
    project_id: 'proj-1',
    sequence_id: 1,
    title: 'Implement Auth Flow',
    description: 'Set up authentication with Supabase Auth',
    status: 'in_progress',
    priority: 'high',
    assignee_id: 'user-1',
    archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    project_id: 'proj-1',
    sequence_id: 2,
    title: 'Create Dashboard Components',
    description: 'Build the main dashboard UI components',
    status: 'todo',
    priority: 'medium',
    archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    project_id: 'proj-1',
    sequence_id: 3,
    title: 'Set up CI/CD Pipeline',
    description: 'Configure GitHub Actions for automated deployment',
    status: 'backlog',
    priority: 'low',
    archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export interface IssueFilters {
  status?: IssueStatus[];
  priority?: Priority[];
  assignee_id?: string;
  sprint_id?: string;
  module_id?: string;
  search?: string;
  archived?: boolean;
}

// Get issues with filters
export async function getIssues(
  projectId: string, 
  filters: IssueFilters = {}
): Promise<IssueWithKey[]> {
  if (shouldUseMockData(projectId)) {
    // Return mock data with keys
    let filtered = mockIssues.filter(i => i.project_id === projectId || projectId === 'proj-1');
    
    if (filters.status?.length) {
      filtered = filtered.filter(i => filters.status!.includes(i.status));
    }
    if (filters.priority?.length) {
      filtered = filtered.filter(i => filters.priority!.includes(i.priority));
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(i => 
        i.title.toLowerCase().includes(search) ||
        i.description?.toLowerCase().includes(search)
      );
    }
    
    return filtered.map(i => ({
      ...i,
      key: `VAN-${String(i.sequence_id).padStart(3, '0')}`
    }));
  }

  // Simplified query - joins with profiles instead of auth.users
  const query = supabase
    .from('issues')
    .select('*')
    .eq('project_id', projectId)
    .eq('archived', filters.archived ?? false)
    .order('created_at', { ascending: false });

  if (filters.status?.length) {
    query.in('status', filters.status);
  }
  if (filters.priority?.length) {
    query.in('priority', filters.priority);
  }
  if (filters.assignee_id) {
    query.eq('assignee_id', filters.assignee_id);
  }
  if (filters.sprint_id) {
    query.eq('sprint_id', filters.sprint_id);
  }
  if (filters.module_id) {
    query.eq('module_id', filters.module_id);
  }
  if (filters.search) {
    query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  
  // Get project key for formatting
  const { data: project } = await supabase
    .from('projects')
    .select('key')
    .eq('id', projectId)
    .single();
  
  const projectKey = project?.key || 'VAN';
  
  return (data || []).map(issue => ({
    ...(issue as Issue),
    key: `${projectKey}-${String((issue as Issue).sequence_id).padStart(3, '0')}`
  }));
}

// Get single issue by ID
export async function getIssueById(issueId: string): Promise<IssueWithKey | null> {
  if (shouldUseMockData()) {
    const issue = mockIssues.find(i => i.id === issueId);
    if (!issue) return null;
    return {
      ...issue,
      key: `VAN-${String(issue.sequence_id).padStart(3, '0')}`
    };
  }

  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .eq('id', issueId)
    .single();

  if (error) throw error;
  if (!data) return null;

  const issue = data as Issue;

  const { data: project } = await supabase
    .from('projects')
    .select('key')
    .eq('id', issue.project_id)
    .single();

  return {
    ...issue,
    key: `${project?.key || 'VAN'}-${String(issue.sequence_id).padStart(3, '0')}`
  };
}

// Create issue
export async function createIssue(payload: CreateIssuePayload): Promise<IssueWithKey> {
  if (shouldUseMockData(payload.project_id)) {
    const newIssue: Issue = {
      id: String(mockIssues.length + 1),
      project_id: payload.project_id,
      sequence_id: mockIssues.length + 1,
      title: payload.title,
      description: payload.description,
      status: payload.status || 'backlog',
      priority: payload.priority || 'medium',
      assignee_id: payload.assignee_id,
      sprint_id: payload.sprint_id,
      module_id: payload.module_id,
      parent_id: payload.parent_id,
      estimate_points: payload.estimate_points,
      due_date: payload.due_date,
      archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockIssues.push(newIssue);
    return {
      ...newIssue,
      key: `VAN-${String(newIssue.sequence_id).padStart(3, '0')}`
    };
  }

  const { label_ids, ...issueData } = payload;

  const { data, error } = await supabase
    .from('issues')
    .insert(issueData)
    .select()
    .single();

  if (error) throw error;

  const issue = data as Issue;

  // Add labels if provided
  if (label_ids?.length) {
    await supabase
      .from('issue_labels')
      .insert(label_ids.map(label_id => ({
        issue_id: issue.id,
        label_id
      })));
  }

  const { data: project } = await supabase
    .from('projects')
    .select('key')
    .eq('id', issue.project_id)
    .single();

  return {
    ...issue,
    key: `${project?.key || 'VAN'}-${String(issue.sequence_id).padStart(3, '0')}`
  };
}

// Update issue
export async function updateIssue(
  issueId: string, 
  payload: UpdateIssuePayload
): Promise<IssueWithKey> {
  if (shouldUseMockData()) {
    const index = mockIssues.findIndex(i => i.id === issueId);
    if (index === -1) throw new Error('Issue not found');
    
    // Convert null values to undefined for mock
    const cleanPayload: Partial<Issue> = {};
    for (const [key, value] of Object.entries(payload)) {
      if (value !== null) {
        (cleanPayload as Record<string, unknown>)[key] = value;
      }
    }
    
    mockIssues[index] = {
      ...mockIssues[index],
      ...cleanPayload,
      updated_at: new Date().toISOString(),
    };
    
    return {
      ...mockIssues[index],
      key: `VAN-${String(mockIssues[index].sequence_id).padStart(3, '0')}`
    };
  }

  const { data, error } = await supabase
    .from('issues')
    .update(payload)
    .eq('id', issueId)
    .select()
    .single();

  if (error) throw error;

  const issue = data as Issue;

  const { data: project } = await supabase
    .from('projects')
    .select('key')
    .eq('id', issue.project_id)
    .single();

  return {
    ...issue,
    key: `${project?.key || 'VAN'}-${String(issue.sequence_id).padStart(3, '0')}`
  };
}

// Delete issue (soft delete)
export async function deleteIssue(issueId: string): Promise<void> {
  if (shouldUseMockData()) {
    const index = mockIssues.findIndex(i => i.id === issueId);
    if (index !== -1) {
      mockIssues[index].archived = true;
    }
    return;
  }

  await supabase
    .from('issues')
    .update({ archived: true })
    .eq('id', issueId);
}

// Get issues by status (for Kanban)
export async function getIssuesByStatus(
  projectId: string
): Promise<Record<IssueStatus, IssueWithKey[]>> {
  const issues = await getIssues(projectId);
  
  const grouped: Record<IssueStatus, IssueWithKey[]> = {
    backlog: [],
    todo: [],
    in_progress: [],
    in_review: [],
    done: [],
    cancelled: [],
  };
  
  issues.forEach(issue => {
    grouped[issue.status].push(issue);
  });
  
  return grouped;
}
