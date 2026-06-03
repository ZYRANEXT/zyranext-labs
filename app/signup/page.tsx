'use client';

import Nav from '@/components/Nav';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function handleSignup() {
    setMsg('');
    if (!email || !password) {
      setMsg('Email and password are required.');
      return;
    }
    if (password.length < 6) {
      setMsg('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    const supabase = supabaseBrowser();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${location.origin}/dashboard` },
    });
    setLoading(false);

    if (error) {
      setMsg(error.message);
      return;
    }
    if (data.session) {
      location.href = '/dashboard';
      return;
    }
    setMsg('Account created. If Supabase email confirmation is ON, confirm your email or turn off Confirm sign up.');
  }

  return (
    <>
      <Nav />
      <main className="section container">
        <div className="card glass" style={{ maxWidth: 560, margin: 'auto' }}>
          <span className="badge">CREATE ACCOUNT</span>
          <h1><span className="grad">Sign up</span></h1>
          <p className="lead">Create a ZYRANEXT Labs account with email and password.</p>

          <label>Email</label>
          <input placeholder="you@example.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <br /><br />

          <label>Password</label>
          <input placeholder="At least 6 characters" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <br /><br />

          <label>Confirm password</label>
          <input placeholder="Type password again" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSignup(); }} />
          <br /><br />

          <button className="btn primary" onClick={handleSignup} disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
          <a className="btn" style={{ marginLeft: 10 }} href="/login">I already have an account</a>

          {msg && <p className="lead" style={{ marginTop: 18 }}>{msg}</p>}
        </div>
      </main>
    </>
  );
}
