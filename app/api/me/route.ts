import { NextResponse } from 'next/server';
import { getUserFromRequest, monthKey } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sb = supabaseAdmin();
  await sb.from('profiles').upsert({ id: user.id, email: user.email, plan: 'free' }, { onConflict: 'id', ignoreDuplicates: true } as any);

  const { data: profile } = await sb
    .from('profiles')
    .select('plan,subscription_status,creator_name,creator_type,niche,tone,audience,goals')
    .eq('id', user.id)
    .single();

  const month = await monthKey();
  const { data: usage } = await sb.from('usage_limits').select('count').eq('user_id', user.id).eq('month', month).maybeSingle();
  const { data: history } = await sb
    .from('ai_history')
    .select('id,tool,input,output,created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);
  const { data: overlays } = await sb
    .from('overlay_urls')
    .select('id,name,token,expires_at,active,created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  return NextResponse.json({
    email: user.email,
    plan: profile?.plan || 'free',
    subscriptionStatus: profile?.subscription_status || 'free',
    usage: usage?.count || 0,
    profile: profile || {},
    history: history || [],
    overlays: overlays || [],
  });
}
