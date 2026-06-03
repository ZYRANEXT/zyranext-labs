'use client';

import Nav from '@/components/Nav';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function handleLogin() {
    setMsg('');
    if (!email || !password) {
      setMsg('Email and password are required.');
      return;
    }
    setLoading(true);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    location.href = '/dashboard';
  }

  return (
    <>
      <Nav />
      <main className="section container">
        <div className="card glass" style={{ maxWidth: 560, margin: 'auto' }}>
          <span className="badge">PASSWORD LOGIN</span>
          <h1><span className="grad">Login</span></h1>
          <p className="lead">Login with your email and password. This does not use magic-link email.</p>

          <label>Email</label>
          <input placeholder="you@example.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <br /><br />

          <label>Password</label>
          <input placeholder="Your password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }} />
          <br /><br />

          <button className="btn primary" onClick={handleLogin} disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
          <a className="btn" style={{ marginLeft: 10 }} href="/signup">Create account</a>

          {msg && <p className="lead danger" style={{ marginTop: 18 }}>{msg}</p>}
        </div>
      </main>
    </>
  );
}
