// Issues Service - CRUD operations for issues
import { supabase } from './client';
import type { 
  Issue, 
  IssueWithKey, 
  CreateIssuePayload, 
  UpdateIssuePayload,
  IssueStatus,
  Priority
} from '@/types';

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
  const query = supabase
    .from('issues')
    .select(`
      *,
      assignee:profiles!assignee_id(id, email, full_name, avatar_url),
      reporter:profiles!reporter_id(id, email, full_name, avatar_url),
      sprint:sprints(id, name, status, start_date, end_date),
      module:modules(id, name, color, description),
      issue_labels(
        label:labels(id, name, color)
      )
    `)
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
  
  return (data || []).map(issue => {
    // Flatten labels from the many-to-many join
    const labels = (issue.issue_labels || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((row: any) => row.label)
      .filter(Boolean);

    return {
      ...(issue as any),
      labels,
      key: `${projectKey}-${String((issue as any).sequence_id).padStart(3, '0')}`
    } as IssueWithKey;
  });
}

// Get single issue by ID with all relations
export async function getIssueById(issueId: string): Promise<IssueWithKey | null> {
  // First, fetch the base issue
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .eq('id', issueId)
    .maybeSingle(); // Use maybeSingle to not error on no results

  if (error) {
    console.error('Error fetching issue:', error.message, error.code, error.details);
    throw new Error(error.message || 'Failed to fetch issue');
  }
  if (!data) return null;

  const issue = data as Issue;

  // Fetch sprint if exists
  let sprint = null;
  if (issue.sprint_id) {
    const { data: sprintData } = await supabase
      .from('sprints')
      .select('id, name, status, start_date, end_date')
      .eq('id', issue.sprint_id)
      .single();
    sprint = sprintData;
  }

  // Fetch module if exists
  let module = null;
  if (issue.module_id) {
    const { data: moduleData } = await supabase
      .from('modules')
      .select('id, name, color, description')
      .eq('id', issue.module_id)
      .single();
    module = moduleData;
  }

  // Fetch labels (many-to-many)
  const { data: labelData } = await supabase
    .from('issue_labels')
    .select('label:labels(id, name, color)')
    .eq('issue_id', issueId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const labels = (labelData || []).map((row: any) => row.label).filter(Boolean);

  // Get project key for formatting
  const { data: project } = await supabase
    .from('projects')
    .select('key')
    .eq('id', issue.project_id)
    .single();

  return {
    ...issue,
    sprint,
    module,
    labels,
    key: `${project?.key || 'VAN'}-${String(issue.sequence_id).padStart(3, '0')}`
  } as IssueWithKey;
}

// Create issue
export async function createIssue(payload: CreateIssuePayload): Promise<IssueWithKey> {
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
      .insert(label_ids.map(labelId => ({
        issue_id: issue.id,
        label_id: labelId
      })));
  }

  // Get project key
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
  const { label_ids, ...issueData } = payload;

  const { data, error } = await supabase
    .from('issues')
    .update(issueData)
    .eq('id', issueId)
    .select()
    .single();

  if (error) throw error;

  const issue = data as Issue;

  // Update labels if provided
  if (label_ids !== undefined) {
    // Remove existing labels
    await supabase
      .from('issue_labels')
      .delete()
      .eq('issue_id', issueId);

    // Add new labels
    if (label_ids.length > 0) {
      await supabase
        .from('issue_labels')
        .insert(label_ids.map(labelId => ({
          issue_id: issueId,
          label_id: labelId
        })));
    }
  }

  // Get project key
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
  
  // Sort by position for consistent ordering
  issues.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  
  issues.forEach(issue => {
    grouped[issue.status].push(issue);
  });
  
  return grouped;
}

// Update issue position using fractional indexing (O(1) single-row update)
// Falls back to status-only update if position column doesn't exist
export async function updateIssuePosition(
  issueId: string,
  newStatus: IssueStatus,
  newPosition: number // Calculated as (positionAbove + positionBelow) / 2
): Promise<IssueWithKey> {
  // Try update with position first
  let { data, error } = await supabase
    .from('issues')
    .update({ 
      status: newStatus, 
      position: newPosition,
      updated_at: new Date().toISOString()
    })
    .eq('id', issueId)
    .select()
    .single();

  // If position column doesn't exist, fall back to status-only update
  if (error && (error.message?.includes('position') || error.code === '42703')) {
    console.warn('Position column not found, updating status only');
    const result = await supabase
      .from('issues')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', issueId)
      .select()
      .single();
    
    data = result.data;
    error = result.error;
  }

  if (error) throw error;

  const issue = data as Issue;

  // Get project key for formatting
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

// Calculate new position between two items (fractional indexing)
export function calculatePosition(
  positionAbove: number | null,
  positionBelow: number | null,
  defaultGap: number = 1000
): number {
  if (positionAbove === null && positionBelow === null) {
    return defaultGap; // First item in empty column
  }
  if (positionAbove === null) {
    return (positionBelow ?? defaultGap) / 2; // Inserting at top
  }
  if (positionBelow === null) {
    return positionAbove + defaultGap; // Inserting at bottom
  }
  return (positionAbove + positionBelow) / 2; // Inserting between two items
}

// Subscribe to realtime issue updates for live sync
export function subscribeToIssues(
  projectId: string,
  onUpdate: () => void
): () => void {
  const channel = supabase
    .channel(`issues:${projectId}`)
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'issues',
        filter: `project_id=eq.${projectId}`
      },
      () => {
        // Trigger a full refresh on any change
        onUpdate();
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}
