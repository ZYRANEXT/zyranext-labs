import Nav from '@/components/Nav';
import UpgradeButton from '@/components/UpgradeButton';

const rows = [
  ['Monthly AI generations','20','Unlimited','Unlimited','Unlimited'],
  ['Creator Memory','Basic','Yes','Yes','Yes'],
  ['Cloud history','Local/light','Yes','Yes','Yes'],
  ['Clip AI','—','Basic','Advanced','Advanced'],
  ['Overlay Builder','—','Basic','Full','Team'],
  ['Overlay URL expiry','—','30 days','90 days','Long-term'],
  ['Analytics','—','—','Yes','Shared'],
  ['Team workspace','—','—','—','Yes'],
];

export default function Pricing(){return <><Nav/><main className="section container"><span className="badge">FOUNDER PRICING</span><h1><span className="grad">Simple monthly plans</span><br/>for creators.</h1><p className="lead">Free lets creators test the product. Pro unlocks the daily workflow. Creator unlocks growth tools. Team is built for agencies and creator teams.</p><div className="grid cols4"><Plan name="Free" price="$0" lines={["20 generations / month","Basic AI tools","Creator Profile","No Clip AI","No Overlay"]}/><Paid name="Pro" price="$19 / month" plan="pro" lines={["Unlimited AI","Cloud save","Clip AI","Basic Overlay","30-day Overlay URLs"]}/><Paid name="Creator" price="$49 / month" plan="creator" lines={["Everything in Pro","Analytics","Full Overlay Builder","Stream tracking","90-day Overlay URLs"]}/><Paid name="Team" price="$149 / month" plan="team" lines={["Everything in Creator","Team workspace","Shared dashboard","Client management","Priority support"]}/></div><section className="section"><h2>Compare plans</h2><table className="compare"><thead><tr><th>Feature</th><th>Free</th><th>Pro</th><th>Creator</th><th>Team</th></tr></thead><tbody>{rows.map(r=><tr key={r[0]}>{r.map(c=><td key={c}>{c}</td>)}</tr>)}</tbody></table></section></main></>}
function Plan({name,price,lines}:{name:string;price:string;lines:string[]}){return <div className="card price"><span className="founder">Founder</span><h3>{name}</h3><strong>{price}</strong><ul className="checklist">{lines.map(l=><li key={l}>{l}</li>)}</ul><a className="btn primary" href="/signup">Start Free</a></div>}
function Paid({name,price,plan,lines}:{name:string;price:string;plan:'pro'|'creator'|'team';lines:string[]}){return <div className="card price"><span className="founder">Founder</span><h3>{name}</h3><strong>{price}</strong><ul className="checklist">{lines.map(l=><li key={l}>{l}</li>)}</ul><UpgradeButton plan={plan}/></div>}
