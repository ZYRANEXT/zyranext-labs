'use client';

import Nav from '@/components/Nav';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { supabaseBrowser } from '@/lib/supabase';
import UpgradeButton from '@/components/UpgradeButton';

type HistoryItem = { id: string; tool: string; input: string; output: string; created_at: string };
type OverlayItem = { id: string; name: string; token: string; expires_at: string; active: boolean; created_at: string };
type Profile = {
  creator_name?: string;
  creator_type?: string;
  niche?: string;
  tone?: string;
  audience?: string;
  goals?: string;
};

const tools = [
  { value: 'hook', label: 'Hook Generator' },
  { value: 'title', label: 'Title Generator' },
  { value: 'script', label: 'Script Builder' },
  { value: 'post', label: 'Social Post' },
];

function authHeader(token: string) {
  return { authorization: `Bearer ${token}` };
}

export default function Dashboard() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState('free');
  const [usage, setUsage] = useState(0);
  const [profile, setProfile] = useState<Profile>({});
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [overlays, setOverlays] = useState<OverlayItem[]>([]);
  const [tool, setTool] = useState('hook');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [clipMemo, setClipMemo] = useState('');
  const [clipOutput, setClipOutput] = useState('');
  const [overlayName, setOverlayName] = useState('Cyber Creator Overlay');
  const [overlayText, setOverlayText] = useState('FOLLOW FOR MORE • ZYRANEXT Labs');
  const [overlayResult, setOverlayResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [modal, setModal] = useState(false);

  const isFree = plan === 'free';
  const isCreatorPlus = plan === 'creator' || plan === 'team';
  const usageText = isFree ? `${usage}/20` : 'Unlimited';

  useEffect(() => {
    const s = supabaseBrowser();
    s.auth.getSession().then(({ data }) => {
      if (!data.session) {
        location.href = '/login';
        return;
      }
      setSession(data.session);
      load(data.session.access_token);
    });
  }, []);

  async function load(token = session?.access_token) {
    if (!token) return;
    const r = await fetch('/api/me', { headers: authHeader(token) });
    if (!r.ok) return;
    const j = await r.json();
    setEmail(j.email || '');
    setPlan(j.plan || 'free');
    setUsage(j.usage || 0);
    setProfile(j.profile || {});
    setHistory(j.history || []);
    setOverlays(j.overlays || []);
  }

  async function logout() {
    await supabaseBrowser().auth.signOut();
    location.href = '/login';
  }

  async function saveProfile() {
    if (!session) return;
    setMessage('Saving...');
    const r = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'content-type': 'application/json', ...authHeader(session.access_token) },
      body: JSON.stringify(profile),
    });
    const j = await r.json().catch(() => ({}));
    setMessage(r.ok ? 'Creator Profile saved.' : j.error || 'Profile save failed.');
    if (r.ok) load();
  }

  async function generate() {
    if (!session) return;
    if (isFree && usage >= 20) {
      setModal(true);
      return;
    }
    setLoading(true);
    setOutput('');
    const prompt = `Creator Profile: ${JSON.stringify(profile)}\n\nRequest: ${input}`;
    try {
      const r = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...authHeader(session.access_token) },
        body: JSON.stringify({ tool, input: prompt }),
      });
      const j = await r.json().catch(() => ({}));
      setLoading(false);
      if (!r.ok) {
        setOutput(j.error || 'AI request failed. Check Render logs.');
        if (j.upgrade) setModal(true);
        return;
      }
      setOutput(j.output || 'No output returned.');
      setUsage(j.usage || usage + 1);
      load();
    } catch (error: any) {
      setLoading(false);
      setOutput(error?.message || 'Network error. Please try again.');
    }
  }

  async function analyzeClip() {
    if (!session) return;
    if (isFree) {
      setModal(true);
      return;
    }
    setLoading(true);
    setClipOutput('');
    const form = new FormData();
    form.append('memo', `${clipMemo}\n\nCreator Profile: ${JSON.stringify(profile)}`);
    try {
      const r = await fetch('/api/clip/analyze', {
        method: 'POST',
        headers: authHeader(session.access_token),
        body: form,
      });
      const j = await r.json().catch(() => ({}));
      setLoading(false);
      if (!r.ok) {
        setClipOutput(j.error || 'Clip analysis failed.');
        if (j.upgrade) setModal(true);
        return;
      }
      setClipOutput(j.clips || 'No clips returned.');
    } catch (error: any) {
      setLoading(false);
      setClipOutput(error?.message || 'Network error. Please try again.');
    }
  }

  async function createOverlay() {
    if (!session) return;
    if (isFree) {
      setModal(true);
      return;
    }
    setLoading(true);
    setOverlayResult('');
    const html = `<!doctype html><html><body style="margin:0;background:transparent;color:white;font-family:Inter,Arial,sans-serif;overflow:hidden"><div style="position:fixed;inset:24px;border:3px solid #67e8f9;border-radius:32px;box-shadow:0 0 42px #7c3aed"></div><div style="position:fixed;left:40px;top:40px;padding:14px 20px;border-radius:999px;background:linear-gradient(135deg,#7c3aed,#06b6d4);font-weight:900">${escapeHtml(overlayText)}</div><div style="position:fixed;right:40px;bottom:40px;padding:16px 22px;border-radius:22px;background:rgba(8,12,24,.72);border:1px solid rgba(255,255,255,.18)">COMMENT • CHAT • GOAL</div></body></html>`;
    const r = await fetch('/api/overlay/create', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...authHeader(session.access_token) },
      body: JSON.stringify({ name: overlayName, html }),
    });
    const j = await r.json();
    setLoading(false);
    if (!r.ok) {
      setOverlayResult(j.error || 'Overlay creation failed.');
      if (j.upgrade) setModal(true);
      return;
    }
    setOverlayResult(`Overlay URL: ${j.url}\nExpires: ${j.expires_at}`);
    load();
  }

  const overlayBase = useMemo(() => process.env.NEXT_PUBLIC_SITE_URL || '', []);

  return (
    <>
      <Nav />
      <main className="section container dash">
        <aside className="sidebar glass">
          <a className="side" href="#overview">Overview</a>
          <a className="side" href="#profile">Creator Profile</a>
          <a className="side" href="#ai">AI Generator</a>
          <a className="side" href="#clip">Clip AI</a>
          <a className="side" href="#overlay">Overlay Builder</a>
          <a className="side" href="#history">History</a>
          <a className="side" href="#analytics">Analytics</a>
          <button className="side" onClick={logout}>Logout</button>
        </aside>

        <section className="grid">
          <div id="overview" className="card glass">
            <span className="badge">SIGNED IN</span>
            <h2>Welcome back</h2>
            <p className="lead">{email}</p>
            <p className="lead">Plan: <b>{plan.toUpperCase()}</b> · Usage: <b>{usageText}</b></p>
            <div className="usagebar"><span style={{ width: `${isFree ? Math.min((usage / 20) * 100, 100) : 100}%` }} /></div>
            {isFree && <p className="lead">Free users can use 20 AI generations/month. Clip AI and Overlay Builder are locked.</p>}
          </div>

          <div id="profile" className="card">
            <h2>Creator Profile</h2>
            <p className="lead">Saved profile is added to AI prompts, so outputs feel more personalized.</p>
            <div className="grid cols2">
              <Field label="Creator name" value={profile.creator_name || ''} onChange={(v) => setProfile({ ...profile, creator_name: v })} />
              <Field label="Creator type" value={profile.creator_type || ''} onChange={(v) => setProfile({ ...profile, creator_type: v })} placeholder="VTuber, streamer, YouTuber..." />
              <Field label="Niche" value={profile.niche || ''} onChange={(v) => setProfile({ ...profile, niche: v })} placeholder="APEX, VALORANT, AI tools..." />
              <Field label="Tone" value={profile.tone || ''} onChange={(v) => setProfile({ ...profile, tone: v })} placeholder="funny, sharp, friendly..." />
            </div>
            <label>Audience</label>
            <textarea value={profile.audience || ''} onChange={(e) => setProfile({ ...profile, audience: e.target.value })} placeholder="Who watches you?" />
            <br /><br />
            <label>Goals</label>
            <textarea value={profile.goals || ''} onChange={(e) => setProfile({ ...profile, goals: e.target.value })} placeholder="Followers, retention, comments, sales..." />
            <br /><br />
            <button className="btn primary" onClick={saveProfile}>Save Profile</button>
            {message && <p className="lead">{message}</p>}
          </div>

          <div id="ai" className="card">
            <h2>AI Generator</h2>
            <select value={tool} onChange={(e) => setTool(e.target.value)}>{tools.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
            <br /><br />
            <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Describe your stream, video, or content idea..." />
            <br /><br />
            <button className="btn primary" onClick={generate} disabled={loading}>{loading ? 'Working...' : 'Generate'}</button>
            {output && <div className="card" style={{ marginTop: 16, whiteSpace: 'pre-wrap' }}>{output}</div>}
          </div>

          <FeatureCard id="clip" title="Clip AI" locked={isFree} required="Pro">
            <textarea value={clipMemo} onChange={(e) => setClipMemo(e.target.value)} placeholder="Paste stream notes, timestamps, chat moments, or VOD summary..." />
            <br /><br />
            <button className="btn primary" onClick={analyzeClip} disabled={loading}>Analyze Clip Ideas</button>
            {clipOutput && <div className="card" style={{ marginTop: 16, whiteSpace: 'pre-wrap' }}>{clipOutput}</div>}
          </FeatureCard>

          <FeatureCard id="overlay" title="Overlay Builder" locked={isFree} required="Pro">
            <Field label="Overlay name" value={overlayName} onChange={setOverlayName} />
            <Field label="Overlay headline" value={overlayText} onChange={setOverlayText} />
            <button className="btn primary" onClick={createOverlay} disabled={loading}>Create OBS Overlay URL</button>
            {overlayResult && <div className="card" style={{ marginTop: 16, whiteSpace: 'pre-wrap' }}>{overlayResult}</div>}
            {overlays.length > 0 && <ul>{overlays.map((o) => <li key={o.id}>{o.name} — {o.active ? 'Active' : 'Inactive'} — <a href={`${overlayBase}/api/overlay/${o.token}`} target="_blank">Open</a></li>)}</ul>}
          </FeatureCard>

          <div id="history" className="card">
            <h2>Generation History</h2>
            {history.length === 0 ? <p className="lead">No saved generations yet.</p> : history.map((h) => <div className="card" key={h.id} style={{ marginTop: 12 }}><b>{h.tool}</b><p style={{ color: '#a7b0d1' }}>{new Date(h.created_at).toLocaleString()}</p><p>{h.input.slice(0, 160)}</p><pre style={{ whiteSpace: 'pre-wrap' }}>{h.output}</pre></div>)}
          </div>

          <FeatureCard id="analytics" title="Analytics" locked={!isCreatorPlus} required="Creator">
            <div className="grid cols3">
              <div className="card"><b>Plan</b><p className="lead">{plan.toUpperCase()}</p></div>
              <div className="card"><b>AI Generations</b><p className="lead">{usageText}</p></div>
              <div className="card"><b>Saved Outputs</b><p className="lead">{history.length}</p></div>
            </div>
            <p className="lead">Creator analytics are ready for stream data expansion.</p>
          </FeatureCard>
        </section>
      </main>

      <div className={`modal ${modal ? 'show' : ''}`}>
        <div className="modalbox glass">
          <h2>Upgrade required</h2>
          <p className="lead">Unlock unlimited AI, Clip AI, Overlay Builder, and cloud history.</p>
          <UpgradeButton plan="pro" /> <button className="btn" onClick={() => setModal(false)}>Close</button>
        </div>
      </div>
    </>
  );
}

function Field({ label, value, onChange, placeholder = '' }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <div><label>{label}</label><input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} /></div>;
}

function FeatureCard({ id, title, locked, required, children }: { id: string; title: string; locked: boolean; required: string; children: ReactNode }) {
  return <div id={id} className="card"><h2>{title}</h2>{locked ? <><p className="lead danger">Locked. Requires {required} plan.</p><UpgradeButton plan={required === 'Creator' ? 'creator' : 'pro'} /></> : children}</div>;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char] || char));
}
