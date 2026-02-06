// Specs Service - Source of truth contracts
import { supabase } from './client';
import type { Spec, SpecVersion, CreateSpecPayload, ApproveSpecPayload } from '@/types';

// Get spec by issue ID
export async function getSpecByIssueId(issueId: string): Promise<Spec | null> {
  const { data, error } = await supabase
    .from('specs')
    .select('*')
    .eq('issue_id', issueId)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// Get all versions of a spec
export async function getSpecVersionHistory(issueId: string): Promise<SpecVersion[]> {
  const { data, error } = await supabase
    .from('specs')
    .select('version, markdown_content, created_at, is_approved')
    .eq('issue_id', issueId)
    .order('version', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Create or update spec (creates new version)
export async function createSpec(payload: CreateSpecPayload): Promise<Spec> {
  // Get current max version
  const { data: existing } = await supabase
    .from('specs')
    .select('version')
    .eq('issue_id', payload.issue_id)
    .order('version', { ascending: false })
    .limit(1);

  const newVersion = existing?.length ? existing[0].version + 1 : 1;

  const { data, error } = await supabase
    .from('specs')
    .insert({
      ...payload,
      version: newVersion,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Approve spec
export async function approveSpec(
  specId: string, 
  payload: ApproveSpecPayload
): Promise<Spec> {
  const { data, error } = await supabase
    .from('specs')
    .update({
      is_approved: true,
      approved_by: payload.approved_by,
      approved_at: new Date().toISOString(),
    })
    .eq('id', specId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Reject/unapprove spec
export async function rejectSpec(specId: string, _reason?: string): Promise<Spec> {
  const { data, error } = await supabase
    .from('specs')
    .update({
      is_approved: false,
      approved_by: null,
      approved_at: null,
    })
    .eq('id', specId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Check if issue has approved spec (governance check)
export async function hasApprovedSpec(issueId: string): Promise<boolean> {
  const spec = await getSpecByIssueId(issueId);
  return spec?.is_approved ?? false;
}
