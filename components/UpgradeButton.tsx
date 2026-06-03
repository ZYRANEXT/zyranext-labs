'use client';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase';

export default function UpgradeButton({ plan }: { plan: 'pro' | 'creator' | 'team' }) {
  const [loading, setLoading] = useState(false);
  async function upgrade() {
    setLoading(true);
    const supabase = supabaseBrowser();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      const next = encodeURIComponent(`/pricing?upgrade=${plan}`);
      location.href = `/login?next=${next}`;
      return;
    }
    const res = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ plan }),
    });
    const json = await res.json();
    if (!res.ok) {
      alert(json.error || 'Could not start checkout. Check Stripe Price IDs.');
      setLoading(false);
      return;
    }
    location.href = json.url;
  }
  return <button className="btn primary" onClick={upgrade} disabled={loading}>{loading ? 'Opening Stripe...' : 'Upgrade with Stripe'}</button>;
}
