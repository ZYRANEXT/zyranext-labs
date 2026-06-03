import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const payload = {
    id: user.id,
    email: user.email,
    creator_name: String(body.creator_name || '').slice(0, 120),
    creator_type: String(body.creator_type || '').slice(0, 120),
    niche: String(body.niche || '').slice(0, 200),
    tone: String(body.tone || '').slice(0, 200),
    audience: String(body.audience || '').slice(0, 300),
    goals: String(body.goals || '').slice(0, 500),
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabaseAdmin().from('profiles').upsert(payload, { onConflict: 'id' });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, profile: payload });
}
