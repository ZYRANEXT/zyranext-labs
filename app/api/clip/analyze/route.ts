import { NextResponse } from 'next/server';
import { getUserFromRequest, getUserPlan } from '@/lib/auth';
import { canUse } from '@/lib/plans';
import { getOpenAI } from '@/lib/openai';
export async function POST(req: Request){const user=await getUserFromRequest(req); if(!user) return NextResponse.json({error:'Unauthorized'},{status:401});const plan=await getUserPlan(user.id);if(!canUse(plan,'clipAI')) return NextResponse.json({error:'Clip AI requires Pro or higher',upgrade:true},{status:402});const form=await req.formData();const memo=String(form.get('memo')||'');const completion=await getOpenAI().chat.completions.create({model:'gpt-4o-mini',messages:[{role:'user',content:`Analyze this stream memo and create clip candidates with timestamps, titles and captions: ${memo}`}],temperature:.7});return NextResponse.json({clips:completion.choices[0]?.message?.content||''});}
