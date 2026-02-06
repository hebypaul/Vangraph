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
  
  issues.forEach(issue => {
    grouped[issue.status].push(issue);
  });
  
  return grouped;
}
