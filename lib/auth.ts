import { supabaseAdmin } from './supabase';
import type { Plan } from './plans';

export async function getUserFromRequest(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const { data } = await supabaseAdmin().auth.getUser(token);
  return data.user;
}

export async function getUserPlan(userId: string): Promise<Plan> {
  const { data } = await supabaseAdmin().from('profiles').select('plan').eq('id', userId).single();
  return (data?.plan || 'free') as Plan;
}

export async function monthKey() { return new Date().toISOString().slice(0,7); }
