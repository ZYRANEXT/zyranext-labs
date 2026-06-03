import { NextResponse } from 'next/server';
export async function POST(req: Request){const {plan}=await req.json();const links:any={pro:process.env.STRIPE_PRO_PAYMENT_LINK,creator:process.env.STRIPE_CREATOR_PAYMENT_LINK,team:process.env.STRIPE_TEAM_PAYMENT_LINK};const url=links[plan];if(!url)return NextResponse.json({error:'Invalid plan'},{status:400});return NextResponse.json({url});}
