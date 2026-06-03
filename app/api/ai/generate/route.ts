import { NextResponse } from 'next/server';
import { getUserFromRequest, getUserPlan, monthKey } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { PLAN_LIMITS } from '@/lib/plans';
import { getOpenAI } from '@/lib/openai';
export async function POST(req: Request){const user=await getUserFromRequest(req); if(!user) return NextResponse.json({error:'Unauthorized'},{status:401});const {tool,input}=await req.json();const sb=supabaseAdmin();const plan=await getUserPlan(user.id);const month=await monthKey();const {data:usage}=await sb.from('usage_limits').select('count').eq('user_id',user.id).eq('month',month).maybeSingle();const current=usage?.count||0;if(PLAN_LIMITS[plan].generations!==-1 && current>=PLAN_LIMITS[plan].generations){return NextResponse.json({error:'Free generation limit reached',upgrade:true},{status:402});}
const prompt=`You are ZYRANEXT Labs, an expert AI growth assistant for creators, streamers and VTubers. Tool: ${tool}. User input: ${input}. Produce practical, ready-to-use output in clear English unless the input language is Japanese.`;
const completion=await getOpenAI().chat.completions.create({model:'gpt-4o-mini',messages:[{role:'system',content:'Be concise, specific, creator-growth focused.'},{role:'user',content:prompt}],temperature:.8});const output=completion.choices[0]?.message?.content||'';await sb.from('ai_history').insert({user_id:user.id,tool,input,output});await sb.from('usage_limits').upsert({user_id:user.id,month,count:current+1},{onConflict:'user_id,month'});return NextResponse.json({output,usage:current+1});}
