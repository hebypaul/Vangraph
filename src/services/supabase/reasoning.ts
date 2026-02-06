// Reasoning Logs Service - Agent thought audit trail
import { supabase, isSupabaseConfigured } from './client';
import type { ReasoningLog, ThoughtStep } from '@/types';

// Mock data
const mockLogs: ReasoningLog[] = [];

// Create reasoning log
export async function createReasoningLog(payload: {
  issue_id?: string;
  thread_id?: string;
  task_id?: string;
  thought_chain: ThoughtStep[];
  model_id: string;
  token_usage?: number;
  cost_usd?: number;
}): Promise<ReasoningLog> {
  if (!isSupabaseConfigured()) {
    const newLog: ReasoningLog = {
      id: String(mockLogs.length + 1),
      ...payload,
      started_at: new Date().toISOString(),
    };
    mockLogs.push(newLog);
    return newLog;
  }

  const { data, error } = await supabase
    .from('reasoning_logs')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get reasoning logs for issue
export async function getReasoningLogsByIssue(issueId: string): Promise<ReasoningLog[]> {
  if (!isSupabaseConfigured()) {
    return mockLogs.filter(l => l.issue_id === issueId);
  }

  const { data, error } = await supabase
    .from('reasoning_logs')
    .select('*')
    .eq('issue_id', issueId)
    .order('started_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Get recent reasoning logs for thread
export async function getRecentReasoningTrace(
  threadId: string, 
  limit: number = 3
): Promise<ThoughtStep[]> {
  if (!isSupabaseConfigured()) {
    const logs = mockLogs
      .filter(l => l.thread_id === threadId)
      .slice(0, limit);
    
    return logs.flatMap(l => l.thought_chain).slice(0, limit * 3);
  }

  const { data, error } = await supabase
    .from('reasoning_logs')
    .select('thought_chain')
    .eq('thread_id', threadId)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  
  return (data || []).flatMap(l => l.thought_chain as ThoughtStep[]).slice(0, limit * 3);
}

// Complete reasoning log with timing
export async function completeReasoningLog(
  logId: string,
  additionalSteps?: ThoughtStep[]
): Promise<ReasoningLog> {
  if (!isSupabaseConfigured()) {
    const log = mockLogs.find(l => l.id === logId);
    if (!log) throw new Error('Log not found');
    
    log.completed_at = new Date().toISOString();
    log.duration_ms = new Date(log.completed_at).getTime() - new Date(log.started_at).getTime();
    
    if (additionalSteps) {
      log.thought_chain = [...log.thought_chain, ...additionalSteps];
    }
    
    return log;
  }

  const startedAt = await supabase
    .from('reasoning_logs')
    .select('started_at, thought_chain')
    .eq('id', logId)
    .single();

  const completedAt = new Date();
  const durationMs = completedAt.getTime() - new Date(startedAt.data?.started_at).getTime();

  const updatePayload: Record<string, unknown> = {
    completed_at: completedAt.toISOString(),
    duration_ms: durationMs,
  };

  if (additionalSteps && startedAt.data?.thought_chain) {
    updatePayload.thought_chain = [...(startedAt.data.thought_chain as ThoughtStep[]), ...additionalSteps];
  }

  const { data, error } = await supabase
    .from('reasoning_logs')
    .update(updatePayload)
    .eq('id', logId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get token usage stats
export async function getTokenUsageStats(projectId: string): Promise<{
  total_tokens: number;
  total_cost_usd: number;
  logs_count: number;
}> {
  if (!isSupabaseConfigured()) {
    return {
      total_tokens: mockLogs.reduce((acc, l) => acc + (l.token_usage || 0), 0),
      total_cost_usd: mockLogs.reduce((acc, l) => acc + (l.cost_usd || 0), 0),
      logs_count: mockLogs.length,
    };
  }

  const { data, error } = await supabase
    .from('reasoning_logs')
    .select('token_usage, cost_usd')
    .eq('issue_id', projectId);

  if (error) throw error;

  return {
    total_tokens: (data || []).reduce((acc, l) => acc + (l.token_usage || 0), 0),
    total_cost_usd: (data || []).reduce((acc, l) => acc + (l.cost_usd || 0), 0),
    logs_count: data?.length || 0,
  };
}
