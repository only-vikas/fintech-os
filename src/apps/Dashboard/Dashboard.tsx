'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Area, AreaChart } from 'recharts';
import styles from '../../components/desktop/desktop.module.css';

const PIE_DATA = [
    { name: 'Food', value: 12400, color: '#10b981' },
    { name: 'Shopping', value: 8900, color: '#8b5cf6' },
    { name: 'Travel', value: 5600, color: '#3b82f6' },
    { name: 'Rent', value: 15000, color: '#f97316' },
    { name: 'Utilities', value: 4200, color: '#f59e0b' },
    { name: 'Healthcare', value: 2800, color: '#ef4444' },
    { name: 'Entertainment', value: 3200, color: '#ec4899' },
];

const BAR_DATA = [
    { month: 'Sep', expense: 38000, income: 85000 },
    { month: 'Oct', expense: 42000, income: 85000 },
    { month: 'Nov', expense: 35000, income: 92000 },
    { month: 'Dec', expense: 51000, income: 85000 },
    { month: 'Jan', expense: 44000, income: 88000 },
    { month: 'Feb', expense: 48200, income: 85000 },
];

const TREND_DATA = [
    { day: 'Mon', amount: 1200 },
    { day: 'Tue', amount: 3400 },
    { day: 'Wed', amount: 800 },
    { day: 'Thu', amount: 5200 },
    { day: 'Fri', amount: 2100 },
    { day: 'Sat', amount: 4800 },
    { day: 'Sun', amount: 1500 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: 'rgba(13,19,33,0.95)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
            <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color || 'var(--text-primary)', fontWeight: 600 }}>
                    {p.name}: ₹{p.value.toLocaleString()}
                </div>
            ))}
        </div>
    );
};

export default function Dashboard() {
    const [tab, setTab] = useState<'overview' | 'trends' | 'health'>('overview');
    const totalExpense = PIE_DATA.reduce((s, d) => s + d.value, 0);
    const healthScore = 74;

    return (
        <div className={styles.appContainer}>
            <div className={styles.appTabs}>
                <button className={`${styles.appTab} ${tab === 'overview' ? styles.appTabActive : ''}`} onClick={() => setTab('overview')}>Overview</button>
                <button className={`${styles.appTab} ${tab === 'trends' ? styles.appTabActive : ''}`} onClick={() => setTab('trends')}>Trends</button>
                <button className={`${styles.appTab} ${tab === 'health' ? styles.appTabActive : ''}`} onClick={() => setTab('health')}>Health Score</button>
            </div>

            <div className={styles.appBody}>
                {tab === 'overview' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Pie Chart */}
                        <div className={styles.card}>
                            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>Category Distribution</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                <ResponsiveContainer width="55%" height={180}>
                                    <PieChart>
                                        <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" stroke="none">
                                            {PIE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                                    {PIE_DATA.map(d => (
                                        <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                                            <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{d.name}</span>
                                            <span className="mono" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>₹{d.value.toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 6, marginTop: 4, display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700 }}>
                                        <span>Total</span>
                                        <span className="mono">₹{totalExpense.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bar Chart */}
                        <div className={styles.card}>
                            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>Monthly Comparison</div>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={BAR_DATA} barGap={4}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
                                    <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}k`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
                                    <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Expense" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                )}

                {tab === 'trends' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className={styles.card}>
                            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>Weekly Spending Trend</div>
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={TREND_DATA}>
                                    <defs>
                                        <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
                                    <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}k`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} fill="url(#blueGrad)" name="Spending" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                )}

                {tab === 'health' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className={styles.scoreGauge}>
                            <div className={styles.scoreCircle} style={{ borderColor: healthScore > 70 ? 'var(--accent-emerald)' : healthScore > 40 ? 'var(--accent-amber)' : 'var(--accent-rose)', color: healthScore > 70 ? 'var(--accent-emerald)' : healthScore > 40 ? 'var(--accent-amber)' : 'var(--accent-rose)' }}>
                                {healthScore}
                            </div>
                            <div className={styles.scoreLabel} style={{ color: 'var(--accent-emerald)' }}>Good Financial Health</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                            {[
                                { label: 'Savings Rate', value: '32%', good: true },
                                { label: 'Debt-to-Income', value: '18%', good: true },
                                { label: 'Emergency Fund', value: '4.2 months', good: true },
                                { label: 'Budget Adherence', value: '78%', good: false },
                                { label: 'Investment Diversity', value: 'Moderate', good: false },
                            ].map(item => (
                                <div key={item.label} className={styles.card} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12 }}>
                                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.label}</span>
                                    <span className="mono" style={{ fontSize: 14, fontWeight: 600, color: item.good ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
