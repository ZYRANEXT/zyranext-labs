import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getUserFromRequest, getUserPlan } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { canUse, overlayExpiry } from '@/lib/plans';
export async function POST(req: Request){const user=await getUserFromRequest(req); if(!user) return NextResponse.json({error:'Unauthorized'},{status:401});const plan=await getUserPlan(user.id);if(!canUse(plan,'overlay')) return NextResponse.json({error:'Overlay Builder requires Pro or higher',upgrade:true},{status:402});const {html,name}=await req.json();const token=crypto.randomBytes(16).toString('hex');const days=overlayExpiry(plan);const expires_at=new Date(Date.now()+days*86400000).toISOString();await supabaseAdmin().from('overlay_urls').insert({user_id:user.id,token,name:name||'Overlay',html,plan,expires_at,active:true});return NextResponse.json({url:`${process.env.NEXT_PUBLIC_SITE_URL}/api/overlay/${token}`,expires_at});}
