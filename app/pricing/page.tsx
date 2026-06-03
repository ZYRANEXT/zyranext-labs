import Nav from '@/components/Nav';
import UpgradeButton from '@/components/UpgradeButton';

const plans = [
  { name: 'Free', price: '$0', plan: null, items: ['20 AI generations / month','Basic title, hook and post AI','Creator Profile','No Clip AI','No Overlay Builder'] },
  { name: 'Pro', price: '$19/mo', plan: 'pro' as const, items: ['Unlimited generations','Creator Memory','Cloud History','Clip AI','Basic Overlay Builder','30-day overlay URL'] },
  { name: 'Creator', price: '$49/mo', plan: 'creator' as const, items: ['Everything in Pro','Advanced Clip AI','Analytics','Growth Dashboard','Full Overlay Builder','90-day overlay URL'] },
  { name: 'Team', price: '$149/mo', plan: 'team' as const, items: ['Everything in Creator','Multi-user workspace','Shared creator profiles','Client management','Priority support'] },
];

export default function Pricing(){return <><Nav/><main className="section container"><span className="badge">FOUNDER DEAL · LOCKED PRICING</span><h1><span className="grad">Simple pricing</span><br/>for creators.</h1><p className="lead">Paid plans use Stripe Checkout Sessions, so successful purchases automatically upgrade the user plan in Supabase.</p><div className="grid cols4" style={{marginTop:30}}>{plans.map((p)=><div className="card price" key={p.name}><span className="founder">First 100</span><h3>{p.name}</h3><strong>{p.price}</strong><ul>{p.items.map((x)=><li key={x}>{x}</li>)}</ul>{p.plan ? <UpgradeButton plan={p.plan}/> : <a className="btn primary" href="/signup">Start Free</a>}</div>)}</div></main></>}
