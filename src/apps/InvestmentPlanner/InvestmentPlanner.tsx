'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import styles from '../../components/desktop/desktop.module.css';

const RISK_PORTFOLIOS = {
    low: {
        allocation: [
            { name: 'Fixed Deposits', value: 40, color: '#3b82f6' },
            { name: 'Govt Bonds', value: 30, color: '#06b6d4' },
            { name: 'Blue-chip MF', value: 20, color: '#10b981' },
            { name: 'Gold', value: 10, color: '#f59e0b' },
        ],
        returns: '8-10%',
        description: 'Conservative portfolio focused on capital preservation with stable returns.',
    },
    mid: {
        allocation: [
            { name: 'Index Funds', value: 30, color: '#3b82f6' },
            { name: 'Large Cap MF', value: 25, color: '#06b6d4' },
            { name: 'Mid Cap MF', value: 20, color: '#10b981' },
            { name: 'Corporate Bonds', value: 15, color: '#f59e0b' },
            { name: 'REITs', value: 10, color: '#8b5cf6' },
        ],
        returns: '12-15%',
        description: 'Balanced portfolio with growth potential and moderate risk.',
    },
    high: {
        allocation: [
            { name: 'Small Cap Stocks', value: 30, color: '#f43f5e' },
            { name: 'Mid Cap Stocks', value: 25, color: '#f97316' },
            { name: 'Crypto', value: 15, color: '#8b5cf6' },
            { name: 'Sector Funds', value: 15, color: '#3b82f6' },
            { name: 'International', value: 15, color: '#06b6d4' },
        ],
        returns: '18-25%+',
        description: 'Aggressive growth portfolio with higher volatility.',
    },
};

const SCREENERS = [
    { name: 'Coffee Can Investing', icon: '☕', description: 'Buy and hold quality stocks for 10+ years. Focus on companies with consistent ROE > 15%.', tags: ['Long-term', 'Low Effort'] },
    { name: 'Momentum Movement', icon: '🚀', description: 'Invest in stocks showing strong upward price momentum. Requires periodic rebalancing.', tags: ['Active', 'Technical'] },
    { name: 'Low Public Holding', icon: '🔒', description: 'Find companies where promoters hold 70%+ stake, indicating high conviction.', tags: ['Research', 'Value'] },
];

export default function InvestmentPlanner() {
    const [risk, setRisk] = useState<'low' | 'mid' | 'high'>('mid');
    const [tab, setTab] = useState<'portfolio' | 'screeners' | 'simulator'>('portfolio');
    const [simAmount, setSimAmount] = useState(10000);
    const [simYears, setSimYears] = useState(10);
    const portfolio = RISK_PORTFOLIOS[risk];

    const simResult = simAmount * Math.pow(1 + (risk === 'low' ? 0.09 : risk === 'mid' ? 0.13 : 0.20), simYears);

    return (
        <div className={styles.appContainer}>
            <div className={styles.appTabs}>
                <button className={`${styles.appTab} ${tab === 'portfolio' ? styles.appTabActive : ''}`} onClick={() => setTab('portfolio')}>Portfolio</button>
                <button className={`${styles.appTab} ${tab === 'screeners' ? styles.appTabActive : ''}`} onClick={() => setTab('screeners')}>Screeners</button>
                <button className={`${styles.appTab} ${tab === 'simulator' ? styles.appTabActive : ''}`} onClick={() => setTab('simulator')}>Simulator</button>
            </div>

            <div className={styles.appBody}>
                {tab === 'portfolio' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className={styles.riskTabs} style={{ marginBottom: 16 }}>
                            <button className={`${styles.riskTab} ${risk === 'low' ? styles.riskTabActive : ''}`} onClick={() => setRisk('low')}>🛡️ Low Risk</button>
                            <button className={`${styles.riskTab} ${risk === 'mid' ? styles.riskTabActive : ''}`} onClick={() => setRisk('mid')}>⚖️ Mid Risk</button>
                            <button className={`${styles.riskTab} ${risk === 'high' ? styles.riskTabActive : ''}`} onClick={() => setRisk('high')}>🔥 High Risk</button>
                        </div>

                        <div className={styles.card} style={{ marginBottom: 12 }}>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{portfolio.description}</p>
                            <div className="badge badge-blue">Expected Returns: {portfolio.returns}</div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <ResponsiveContainer width="50%" height={170}>
                                <PieChart>
                                    <Pie data={portfolio.allocation} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" stroke="none">
                                        {portfolio.allocation.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip formatter={(value: number | undefined) => `${value ?? 0}%`} contentStyle={{ background: 'rgba(13,19,33,0.95)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 8, fontSize: 12 }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {portfolio.allocation.map(a => (
                                    <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: 2, background: a.color }} />
                                        <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{a.name}</span>
                                        <span className="mono" style={{ fontWeight: 600 }}>{a.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {tab === 'screeners' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {SCREENERS.map(s => (
                            <div key={s.name} className={styles.card}>
                                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                    <span style={{ fontSize: 24 }}>{s.icon}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{s.name}</div>
                                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>{s.description}</p>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            {s.tags.map(t => <span key={t} className="badge badge-blue">{t}</span>)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}

                {tab === 'simulator' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className={styles.card} style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>SIP Scenario Simulator</div>
                            <div className={styles.formGroup} style={{ marginBottom: 12 }}>
                                <label className={styles.formLabel}>Monthly SIP Amount: ₹{simAmount.toLocaleString()}</label>
                                <input type="range" min={1000} max={100000} step={1000} value={simAmount} onChange={e => setSimAmount(Number(e.target.value))} style={{ width: '100%' }} />
                            </div>
                            <div className={styles.formGroup} style={{ marginBottom: 12 }}>
                                <label className={styles.formLabel}>Investment Duration: {simYears} years</label>
                                <input type="range" min={1} max={30} value={simYears} onChange={e => setSimYears(Number(e.target.value))} style={{ width: '100%' }} />
                            </div>
                            <div className={styles.riskTabs} style={{ marginBottom: 16 }}>
                                <button className={`${styles.riskTab} ${risk === 'low' ? styles.riskTabActive : ''}`} onClick={() => setRisk('low')}>Low</button>
                                <button className={`${styles.riskTab} ${risk === 'mid' ? styles.riskTabActive : ''}`} onClick={() => setRisk('mid')}>Mid</button>
                                <button className={`${styles.riskTab} ${risk === 'high' ? styles.riskTabActive : ''}`} onClick={() => setRisk('high')}>High</button>
                            </div>
                        </div>
                        <div className={styles.card} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Estimated Corpus</div>
                            <div className="mono" style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent-emerald)' }}>₹{Math.round(simResult).toLocaleString()}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Total Invested: ₹{(simAmount * simYears * 12).toLocaleString()}</div>
                            <div style={{ fontSize: 12, color: 'var(--accent-emerald)', marginTop: 2 }}>Wealth Gain: ₹{Math.round(simResult - simAmount * simYears * 12).toLocaleString()}</div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
