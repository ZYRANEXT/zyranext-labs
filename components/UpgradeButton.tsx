'use client';

const PAYMENT_LINKS: Record<'pro' | 'creator' | 'team', string> = {
  pro: 'https://buy.stripe.com/28EbJ2e6j7fadbG5Rl7Vm01',
  creator: 'https://buy.stripe.com/dRmbJ22nB0QMefK4Nh7Vm02',
  team: 'https://buy.stripe.com/7sYeVe6DR8je1sY5Rl7Vm03',
};

const LABELS: Record<'pro' | 'creator' | 'team', string> = {
  pro: 'Upgrade to Pro — $19 / month',
  creator: 'Upgrade to Creator — $49 / month',
  team: 'Upgrade to Team — $149 / month',
};

export default function UpgradeButton({ plan }: { plan: 'pro' | 'creator' | 'team' }) {
  return (
    <a className="btn primary" href={PAYMENT_LINKS[plan]}>
      {LABELS[plan]}
    </a>
  );
}
