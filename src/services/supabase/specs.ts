// Specs Service - Source of truth contracts
import { supabase, isSupabaseConfigured } from './client';
import type { Spec, SpecVersion, CreateSpecPayload, ApproveSpecPayload } from '@/types';

// Mock data
const mockSpecs: Spec[] = [];

// Get spec by issue ID
export async function getSpecByIssueId(issueId: string): Promise<Spec | null> {
  if (!isSupabaseConfigured()) {
    return mockSpecs.find(s => s.issue_id === issueId) || null;
  }

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
  if (!isSupabaseConfigured()) {
    return mockSpecs
      .filter(s => s.issue_id === issueId)
      .map(s => ({
        version: s.version,
        markdown_content: s.markdown_content,
        created_at: s.created_at,
        is_approved: s.is_approved,
      }));
  }

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
  if (!isSupabaseConfigured()) {
    const existing = mockSpecs.filter(s => s.issue_id === payload.issue_id);
    const newVersion = existing.length > 0 
      ? Math.max(...existing.map(s => s.version)) + 1 
      : 1;
    
    const newSpec: Spec = {
      id: String(mockSpecs.length + 1),
      issue_id: payload.issue_id,
      markdown_content: payload.markdown_content,
      version: newVersion,
      is_approved: false,
      architect_id: payload.architect_id,
      generation_prompt: payload.generation_prompt,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockSpecs.push(newSpec);
    return newSpec;
  }

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
  if (!isSupabaseConfigured()) {
    const spec = mockSpecs.find(s => s.id === specId);
    if (!spec) throw new Error('Spec not found');
    
    spec.is_approved = true;
    spec.approved_by = payload.approved_by;
    spec.approved_at = new Date().toISOString();
    spec.updated_at = new Date().toISOString();
    return spec;
  }

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
export async function rejectSpec(specId: string, reason?: string): Promise<Spec> {
  if (!isSupabaseConfigured()) {
    const spec = mockSpecs.find(s => s.id === specId);
    if (!spec) throw new Error('Spec not found');
    
    spec.is_approved = false;
    spec.approved_by = undefined;
    spec.approved_at = undefined;
    spec.updated_at = new Date().toISOString();
    return spec;
  }

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
