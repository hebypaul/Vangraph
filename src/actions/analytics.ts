'use server';

import { createClient } from '@/utils/supabase/server';
import type { Sprint } from '@/types';

export interface AnalyticsData {
  velocity_history: { name: string; points: number }[];
  issue_distribution: { name: string; value: number }[];
  recent_activity: { date: string; completed: number; created: number }[];
  total_issues: number;
  completed_total: number;
  active_sprint_name: string | null;
}

export async function getProjectAnalytics(projectId: string): Promise<AnalyticsData> {
  const supabase = await createClient();

  // 1. Velocity History (Last 5 completed sprints)
  const { data: sprints } = await supabase
    .from('sprints')
    .select('id, name, start_date, end_date')
    .eq('project_id', projectId)
    .eq('status', 'completed')
    .order('end_date', { ascending: false })
    .limit(5);

  const velocity_history = await Promise.all(
    (sprints || []).reverse().map(async (sprint) => {
      // Calculate completed points for this sprint
      const { data: issues } = await supabase
        .from('issues')
        .select('estimate_points')
        .eq('sprint_id', sprint.id)
        .eq('status', 'done');
      
      const points = issues?.reduce((sum, i) => sum + (i.estimate_points || 0), 0) || 0;
      return { name: sprint.name, points };
    })
  );

  // 2. Issue Distribution (By Status)
  const { data: statusCounts } = await supabase
    .from('issues')
    .select('status, id')
    .eq('project_id', projectId)
    .eq('archived', false);

  const distributionMap = new Map<string, number>();
  statusCounts?.forEach((i) => {
    const status = i.status || 'backlog';
    distributionMap.set(status, (distributionMap.get(status) || 0) + 1);
  });

  const issue_distribution = [
    { name: 'To Do', value: distributionMap.get('todo') || 0 },
    { name: 'In Progress', value: distributionMap.get('in_progress') || 0 },
    { name: 'Done', value: distributionMap.get('done') || 0 },
    { name: 'Cancelled', value: distributionMap.get('cancelled') || 0 }, // optional
  ].filter(i => i.value > 0);

  // 3. Recent Activity (Last 14 days)
  const today = new Date();
  const activity: { date: string; completed: number; created: number }[] = [];
  
  // This is expensive to do correctly without aggregation queries or functions
  // For now, we will just fetch recent issues and aggregate in memory
  // Or simpler: just return empty or mock structure if too complex for MVP without RPC
  // Let's try to fetch issues updated/created in last 14 days
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(today.getDate() - 14);

  const { data: recentIssues } = await supabase
    .from('issues')
    .select('created_at, updated_at, status')
    .eq('project_id', projectId)
    .gte('updated_at', twoWeeksAgo.toISOString());

  // Aggregate by day
  const activityMap = new Map<string, { created: number; completed: number }>();
  
  // Initialize last 14 days
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    activityMap.set(dateStr, { created: 0, completed: 0 });
  }

  recentIssues?.forEach(issue => {
    const createdDate = issue.created_at.split('T')[0];
    if (activityMap.has(createdDate)) {
      activityMap.get(createdDate)!.created++;
    }
    
    // Approximation: if status is done and updated recently, count as completed on update date
    // This is not perfect but okay for MVP
    if (issue.status === 'done') {
        const updatedDate = issue.updated_at.split('T')[0];
        if (activityMap.has(updatedDate)) {
            activityMap.get(updatedDate)!.completed++;
        }
    }
  });

  const recent_activity = Array.from(activityMap.entries()).map(([date, counts]) => ({
    date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    ...counts
  }));

  // Summary Stats
  const total_issues = statusCounts?.length || 0;
  const completed_total = distributionMap.get('done') || 0;

  // Get Active Sprint Name
  const { data: activeSprint } = await supabase
    .from('sprints')
    .select('name')
    .eq('project_id', projectId)
    .eq('status', 'active')
    .single();

  return {
    velocity_history,
    issue_distribution,
    recent_activity,
    total_issues,
    completed_total,
    active_sprint_name: activeSprint?.name || null,
  };
}
