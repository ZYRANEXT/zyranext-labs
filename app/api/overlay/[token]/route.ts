import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(_request: Request, { params }: { params: { token: string } }) {
  const { token } = params;

  const { data } = await supabaseAdmin()
    .from('overlay_urls')
    .select('*')
    .eq('token', token)
    .single();

  if (!data || !data.active || new Date(data.expires_at) < new Date()) {
    return new NextResponse(
      '<html><body style="margin:0;background:transparent;color:white;font-family:sans-serif;display:grid;place-items:center;height:100vh"><div>Overlay unavailable. Subscription expired or upgrade required.</div></body></html>',
      { headers: { 'content-type': 'text/html' } }
    );
  }

  return new NextResponse(data.html, {
    headers: { 'content-type': 'text/html' },
  });
}
