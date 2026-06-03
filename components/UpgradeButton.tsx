'use client';

import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase';

const FALLBACK_LINKS: Record<'pro' | 'creator' | 'team', string> = {
  pro: 'https://buy.stripe.com/9B68wQbYb5729Zu5Rl7Vm04',
  creator: 'https://buy.stripe.com/dRmbJ22nB0QMefK4Nh7Vm02',
  team: 'https://buy.stripe.com/7sYeVe6DR8je1sY5Rl7Vm03',
};

const LABELS: Record<'pro' | 'creator' | 'team', string> = {
  pro: 'Upgrade to Pro — $19 / month',
  creator: 'Upgrade to Creator — $49 / month',
  team: 'Upgrade to Team — $149 / month',
};

export default function UpgradeButton({ plan }: { plan: 'pro' | 'creator' | 'team' }) {
  const [loading, setLoading] = useState(false);
  async function checkout() {
    setLoading(true);
    try {
      const supabase = supabaseBrowser();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        location.href = FALLBACK_LINKS[plan];
        return;
      }
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan }),
      });
      const json = await res.json().catch(() => ({}));
      location.href = json.url || FALLBACK_LINKS[plan];
    } catch {
      location.href = FALLBACK_LINKS[plan];
    } finally {
      setLoading(false);
    }
  }
  return <button className="btn primary" onClick={checkout} disabled={loading}>{loading ? 'Opening Stripe...' : LABELS[plan]}</button>;
}
