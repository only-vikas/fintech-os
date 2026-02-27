'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import Desktop from '@/components/desktop/Desktop';
import { motion } from 'framer-motion';
import { adminSignUp } from './actions';

export default function OSPage() {
    const [user, setUser] = useState<unknown>(null);
    const [loading, setLoading] = useState(true);
    const [authMode, setAuthMode] = useState<'login' | 'signup' | 'guest'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user || null);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        setLoading(true);

        try {
            if (authMode === 'guest') {
                const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
                if (!cleanName) throw new Error('Invalid username.');

                const guestEmail = `guest_${cleanName}@fintechos.local`;
                const guestPassword = 'Guest!Password123#';

                // Try creating the guest user (bypasses rate limit and confirms email)
                const res = await adminSignUp(guestEmail, guestPassword, name);
                if (res.error && !res.error.includes('already exists')) {
                    throw new Error(res.error);
                }

                // Sign in
                const { error: signInError } = await supabase.auth.signInWithPassword({ email: guestEmail, password: guestPassword });
                if (signInError) throw new Error(signInError.message);

            } else if (authMode === 'signup') {
                // Using adminSignUp bypasses Supabase rate limits on free tier
                const res = await adminSignUp(email, password, name);
                if (res.error) {
                    if (res.error.includes('already exists')) throw new Error('Account already exists. Try signing in.');
                    throw new Error(res.error);
                }

                // Immediately sign them in
                const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                if (signInError) throw new Error(signInError.message);

            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                if (signInError) throw new Error(signInError.message);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !user) {
        return (
            <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center' }}>
                    <div className="mono" style={{ fontSize: 36, marginBottom: 12 }}>◆</div>
                    <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Loading Fintech OS…</div>
                </motion.div>
            </div>
        );
    }

    if (!user) {
        return (
            <div style={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(ellipse at 30% 50%, rgba(59,130,246,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, rgba(139,92,246,0.06) 0%, transparent 50%), linear-gradient(180deg, #060a13 0%, #0a0f1e 100%)',
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 25 }}
                    style={{
                        width: 400,
                        padding: 32,
                        background: 'rgba(13, 19, 33, 0.85)',
                        backdropFilter: 'blur(30px)',
                        border: '1px solid rgba(148,163,184,0.08)',
                        borderRadius: 20,
                        boxShadow: '0 16px 64px rgba(0,0,0,0.5)',
                    }}
                >
                    <div style={{ textAlign: 'center', marginBottom: 28 }}>
                        <div style={{ fontSize: 40, marginBottom: 8, color: 'var(--text-secondary)' }}>◆</div>
                        <h1 style={{
                            fontSize: 22,
                            fontWeight: 800,
                            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-violet))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            marginBottom: 4,
                        }}>
                            Fintech OS
                        </h1>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Your Personal Financial Workspace</p>
                    </div>

                    <div style={{ display: 'flex', marginBottom: 20, background: 'var(--bg-tertiary)', borderRadius: 10, padding: 3 }}>
                        {(['login', 'signup', 'guest'] as const).map(mode => (
                            <button
                                key={mode}
                                onClick={() => { setAuthMode(mode); setError(''); }}
                                style={{
                                    flex: 1, padding: '8px', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                                    background: authMode === mode ? 'var(--accent-blue)' : 'transparent',
                                    color: authMode === mode ? 'white' : 'var(--text-tertiary)',
                                    transition: 'all 0.2s',
                                    textTransform: 'capitalize'
                                }}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {authMode === 'guest' ? (
                            <input className="input" placeholder="Enter Guest Username" value={name} onChange={e => setName(e.target.value)} required minLength={3} />
                        ) : (
                            <>
                                {authMode === 'signup' && (
                                    <input className="input" placeholder="Display Name" value={name} onChange={e => setName(e.target.value)} required />
                                )}
                                <input className="input" type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
                                <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                            </>
                        )}

                        {error && <div style={{ fontSize: 12, color: 'var(--accent-rose)', textAlign: 'center', marginTop: 4 }}>{error}</div>}

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: 14, marginTop: 4 }}>
                            {authMode === 'login' ? 'Access Workspace' : authMode === 'signup' ? 'Create Account' : 'Continue as Guest'}
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    return <Desktop />;
}
