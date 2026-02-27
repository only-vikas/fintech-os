'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from '../../components/desktop/desktop.module.css';

const MOCK_ACCOUNTS = [
    { id: '1', name: 'HDFC Savings', type: 'Savings', provider: 'HDFC Bank', status: 'active' as const, lastSync: '2 min ago', balance: '₹1,24,500' },
    { id: '2', name: 'SBI Salary', type: 'Salary', provider: 'SBI', status: 'active' as const, lastSync: '1 hour ago', balance: '₹2,85,000' },
    { id: '3', name: 'ICICI Credit Card', type: 'Credit Card', provider: 'ICICI Bank', status: 'pending' as const, lastSync: 'Not synced', balance: '₹-12,400' },
];

const BANK_ICONS: Record<string, string> = { 'HDFC Bank': '🏦', 'SBI': '🏛️', 'ICICI Bank': '💳', default: '🔗' };

export default function Accounts() {
    const [accounts, setAccounts] = useState(MOCK_ACCOUNTS);
    const [showConnect, setShowConnect] = useState(false);
    const [consents, setConsents] = useState<Record<string, boolean>>({ transactions: true, balance: true, profile: false });

    return (
        <div className={styles.appContainer}>
            <div className={styles.appHeader}>
                <div className={styles.appTitle}>Linked Accounts</div>
                <button className="btn btn-primary" onClick={() => setShowConnect(!showConnect)} style={{ fontSize: 12 }}>
                    {showConnect ? '✕ Cancel' : '+ Link Account'}
                </button>
            </div>

            {showConnect && (
                <motion.div className={styles.card} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Connect via Setu Account Aggregator</div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
                        Securely link your bank accounts using RBI-regulated Account Aggregator framework. Your data is encrypted and consent-based.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Data Sharing Permissions</div>
                        {Object.entries(consents).map(([key, val]) => (
                            <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 13, textTransform: 'capitalize' }}>{key} Data</span>
                                <button className={`${styles.toggle} ${val ? styles.toggleActive : ''}`} onClick={() => setConsents(p => ({ ...p, [key]: !p[key] }))}>
                                    <div className={styles.toggleKnob} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%' }}>🔐 Initiate Consent Flow</button>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>Powered by Setu AA · RBI Regulated</p>
                </motion.div>
            )}

            <div className={styles.appBody}>
                {accounts.map((acc, i) => (
                    <motion.div key={acc.id} className={styles.accountCard} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} style={{ marginBottom: 10 }}>
                        <div className={styles.accountIcon}>{BANK_ICONS[acc.provider] || BANK_ICONS.default}</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 14, fontWeight: 600 }}>{acc.name}</span>
                                <div className={`${styles.statusDot} ${acc.status === 'active' ? styles.statusActive : styles.statusPending}`} />
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{acc.provider} · {acc.type} · Sync: {acc.lastSync}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div className="mono" style={{ fontSize: 15, fontWeight: 700, color: acc.balance.startsWith('-') ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>{acc.balance}</div>
                            <button className="btn btn-ghost" style={{ fontSize: 11, padding: '3px 8px', marginTop: 4 }}>Sync</button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
