import { NextResponse } from 'next/server';
import { getUserFromRequest, getUserPlan } from '@/lib/auth';
import { canUse } from '@/lib/plans';
import { generateWithGemini } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized. Please log in again.' }, { status: 401 });

    const plan = await getUserPlan(user.id);
    if (!canUse(plan, 'clipAI')) {
      return NextResponse.json({ error: 'Clip AI requires Pro or higher.', upgrade: true }, { status: 402 });
    }

    const form = await req.formData();
    const memo = String(form.get('memo') || '').trim();
    if (!memo) return NextResponse.json({ error: 'Please add stream notes first.' }, { status: 400 });

    const clips = await generateWithGemini(
      `Analyze this stream memo and create 5 clip candidates. Include timestamp ideas, viral titles, captions, and why each clip is strong.\n\n${memo}`,
      0.7
    );

    return NextResponse.json({ clips });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Clip analysis failed.' }, { status: 500 });
  }
}
