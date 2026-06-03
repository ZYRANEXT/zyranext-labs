import { NextResponse } from 'next/server';
import { getUserFromRequest, getUserPlan, monthKey } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { PLAN_LIMITS } from '@/lib/plans';
import { generateWithGemini } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized. Please log in again.' }, { status: 401 });

    const { tool, input } = await req.json();
    if (!input || String(input).trim().length < 2) {
      return NextResponse.json({ error: 'Please enter a prompt first.' }, { status: 400 });
    }

    const sb = supabaseAdmin();
    const plan = await getUserPlan(user.id);
    const month = await monthKey();
    const { data: usage } = await sb
      .from('usage_limits')
      .select('count')
      .eq('user_id', user.id)
      .eq('month', month)
      .maybeSingle();

    const current = usage?.count || 0;
    if (PLAN_LIMITS[plan].generations !== -1 && current >= PLAN_LIMITS[plan].generations) {
      return NextResponse.json({ error: 'Free generation limit reached.', upgrade: true }, { status: 402 });
    }

    const prompt = `You are ZYRANEXT Labs, an expert AI growth assistant for creators, streamers and VTubers.\n\nTool: ${tool}\nUser input: ${input}\n\nProduce practical, ready-to-use output in clear English unless the input language is Japanese.`;
    const output = await generateWithGemini(prompt, 0.8);

    await sb.from('ai_history').insert({ user_id: user.id, tool, input, output });
    await sb.from('usage_limits').upsert(
      { user_id: user.id, month, count: current + 1 },
      { onConflict: 'user_id,month' }
    );

    return NextResponse.json({ output, usage: current + 1 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'AI generation failed.' }, { status: 500 });
  }
}
