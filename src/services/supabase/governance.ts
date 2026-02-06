// Governance Service - Human-in-the-loop checkpoints
import { supabase } from './client';
import type { GovernanceGate, EntityType } from '@/types';

// Create governance gate
export async function createGovernanceGate(payload: {
  entity_type: EntityType;
  entity_id: string;
  step_type: string;
  required_role?: string;
}): Promise<GovernanceGate> {
  const { data, error } = await supabase
    .from('governance_gates')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get pending gates for entity
export async function getPendingGates(
  entityType: EntityType, 
  entityId: string
): Promise<GovernanceGate[]> {
  const { data, error } = await supabase
    .from('governance_gates')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .eq('status', 'pending');

  if (error) throw error;
  return data || [];
}

// Approve gate
export async function approveGate(
  gateId: string, 
  approverId: string
): Promise<GovernanceGate> {
  const { data, error } = await supabase
    .from('governance_gates')
    .update({
      status: 'approved',
      approver_id: approverId,
      completed_at: new Date().toISOString(),
    })
    .eq('id', gateId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Reject gate
export async function rejectGate(
  gateId: string, 
  approverId: string,
  reason?: string
): Promise<GovernanceGate> {
  const { data, error } = await supabase
    .from('governance_gates')
    .update({
      status: 'rejected',
      approver_id: approverId,
      rejection_reason: reason,
      completed_at: new Date().toISOString(),
    })
    .eq('id', gateId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Check if entity can proceed (all gates approved)
export async function canProceed(
  entityType: EntityType, 
  entityId: string
): Promise<{ allowed: boolean; pending_gates: GovernanceGate[] }> {
  const pendingGates = await getPendingGates(entityType, entityId);
  
  return {
    allowed: pendingGates.length === 0,
    pending_gates: pendingGates,
  };
}

// Get governance status for entity
export async function getGovernanceStatus(
  entityType: EntityType, 
  entityId: string
): Promise<{
  total_gates: number;
  approved: number;
  rejected: number;
  pending: number;
  can_proceed: boolean;
}> {
  const { data, error } = await supabase
    .from('governance_gates')
    .select('status')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId);

  if (error) throw error;

  const gates = data || [];
  
  return {
    total_gates: gates.length,
    approved: gates.filter(g => g.status === 'approved').length,
    rejected: gates.filter(g => g.status === 'rejected').length,
    pending: gates.filter(g => g.status === 'pending').length,
    can_proceed: gates.length > 0 && gates.every(g => g.status === 'approved'),
  };
}
