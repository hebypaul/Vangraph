// Supabase Client Singleton
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Using mock data.');
}

export const supabase = createClient(supabaseUrl || 'http://localhost:54321', supabaseAnonKey || 'mock-key');

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

// Helper to check if an ID is a mock/dev ID (not a valid UUID)
// UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
export const isMockId = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return !uuidRegex.test(id);
};

// Helper to check if we should use mock data
export const shouldUseMockData = (projectId?: string) => {
  if (!isSupabaseConfigured()) return true;
  if (projectId && isMockId(projectId)) return true;
  return false;
};

