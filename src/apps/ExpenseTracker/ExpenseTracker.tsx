'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMic, FiPlus, FiChevronDown, FiChevronUp, FiCalendar, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import styles from '../../components/desktop/desktop.module.css';

interface Transaction {
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
    type: 'expense' | 'income';
    mood?: 'Needed' | 'Neutral' | 'Impulse';
    aiNote?: string;
}

const DEFAULT_CATEGORIES = ['Food', 'Shopping', 'Travel', 'Healthcare', 'Rent', 'Utilities', 'Entertainment', 'Education'];

const getCatIcon = (cat: string) => {
    const cats: Record<string, string> = { Food: '🍔', Shopping: '🛍️', Travel: '✈️', Healthcare: '🏥', Rent: '🏠', Utilities: '💡', Entertainment: '🎮', Education: '📚', Salary: '💰', Uncategorized: '📦' };
    return cats[cat] || '📦';
};

const MOCK_TXN: Transaction[] = [
    { id: '1', description: 'Swiggy Order', amount: 450, category: 'Food', date: '2026-03-01', type: 'expense', mood: 'Impulse' },
    { id: '2', description: 'Amazon Purchase', amount: 2999, category: 'Shopping', date: '2026-02-28', type: 'expense', mood: 'Neutral' },
    { id: '3', description: 'Uber Ride', amount: 320, category: 'Travel', date: '2026-02-25', type: 'expense', mood: 'Needed' },
    { id: '4', description: 'Netmeds Pharmacy', amount: 800, category: 'Healthcare', date: '2026-02-15', type: 'expense', mood: 'Needed' },
    { id: '6', description: 'Salary Credit', amount: 85000, category: 'Salary', date: '2026-02-01', type: 'income' },
];

export default function ExpenseTracker() {
    const [tab, setTab] = useState<'add' | 'history'>('add');
    const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TXN);
    const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);

    // Form State
    const [category, setCategory] = useState('Food');
    const [customCatInput, setCustomCatInput] = useState('');
    const [amount, setAmount] = useState('');
    const [desc, setDesc] = useState('');

    // Smart Date State
    const [dateOption, setDateOption] = useState<'Today' | 'Yesterday' | 'Custom'>('Today');
    const [customDate, setCustomDate] = useState('');

    // Features
    const [mood, setMood] = useState<'Needed' | 'Neutral' | 'Impulse' | null>(null);
    const [aiNotesEnabled, setAiNotesEnabled] = useState(false);

    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
    const [quickAddText, setQuickAddText] = useState('');

    const [isListening, setIsListening] = useState(false);
    const [historyVoiceCmd, setHistoryVoiceCmd] = useState('');

    const placeholders = ["Dinner with client", "Uber ride to airport", "Office snacks"];
    const [phIndex, setPhIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setPhIndex(prev => (prev + 1) % placeholders.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const getDateStr = () => {
        const d = new Date();
        if (dateOption === 'Yesterday') {
            d.setDate(d.getDate() - 1);
        } else if (dateOption === 'Custom' && customDate) {
            return customDate;
        }
        return d.toISOString().split('T')[0];
    };

    const handleAdd = async () => {
        if (!amount) return;

        let finalCat = category;
        if (category === '_new' && customCatInput.trim()) {
            finalCat = customCatInput.trim();
            if (!categories.includes(finalCat)) {
                setCategories(prev => [...prev, finalCat]);
            }
        }

        setIsLoading(true);

        let finalDesc = desc;
        let finalAiNote = '';

        if (!finalDesc.trim() && aiNotesEnabled) {
            finalAiNote = `Likely ${finalCat.toLowerCase()} expense`;
        } else if (!finalDesc.trim()) {
            finalDesc = `${finalCat} Expense`;
        }

        let aiCategory = finalCat;
        if (finalDesc.trim() && category !== '_new') {
            try {
                const res = await fetch('/api/ai/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        agentType: 'expense',
                        messages: [{ role: 'user', content: `Categorize: "${finalDesc}" Amount: ₹${amount}. Return purely JSON {category: "..."}` }],
                    }),
                });
                const data = await res.json();
                try {
                    const parsed = JSON.parse(data.content);
                    if (parsed.category) aiCategory = parsed.category;
                } catch { /* Use manual */ }
            } catch { /* Use manual */ }
        }

        const newTxn: Transaction = {
            id: Date.now().toString(),
            description: finalDesc,
            amount: parseFloat(amount),
            category: category === '_new' ? finalCat : aiCategory,
            date: getDateStr(),
            type: 'expense',
            mood: mood || undefined,
            aiNote: finalAiNote || undefined
        };

        setTransactions(prev => [newTxn, ...prev]);
        resetForm();
    };

    const handleQuickAdd = () => {
        if (!quickAddText.trim()) return;
        const match = quickAddText.match(/^([^\d]*)(\d+)\s+(.+)$/);
        if (match) {
            const [, , amt, catDesc] = match;
            const catMatch = categories.find(c => catDesc.toLowerCase().includes(c.toLowerCase()));
            const newTxn: Transaction = {
                id: Date.now().toString(),
                description: `Quick Add: ${catDesc}`,
                amount: parseFloat(amt),
                category: catMatch || 'Uncategorized',
                date: new Date().toISOString().split('T')[0],
                type: 'expense',
            };
            setTransactions(prev => [newTxn, ...prev]);
        } else {
            const newTxn: Transaction = {
                id: Date.now().toString(),
                description: quickAddText,
                amount: 0,
                category: 'Uncategorized',
                date: new Date().toISOString().split('T')[0],
                type: 'expense',
            };
            setTransactions(prev => [newTxn, ...prev]);
        }
        setQuickAddText('');
        setTab('history');
    };

    const resetForm = () => {
        setDesc('');
        setAmount('');
        setCategory('Food');
        setCustomCatInput('');
        setDateOption('Today');
        setMood(null);
        setIsLoading(false);
        setTab('history');
    };

    const simulateVoiceInput = (setter: React.Dispatch<React.SetStateAction<string>>) => {
        setIsListening(true);
        setTimeout(() => {
            setter("Uber ride from airport");
            setIsListening(false);
        }, 1500);
    };

    const monthlyData = useMemo(() => {
        const groups: Record<string, { txns: Transaction[], totalExp: number, totalInc: number, topCat: string }> = {};

        transactions.forEach(t => {
            const date = new Date(t.date);
            const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            if (!groups[monthYear]) {
                groups[monthYear] = { txns: [], totalExp: 0, totalInc: 0, topCat: '' };
            }
            groups[monthYear].txns.push(t);
            if (t.type === 'expense') groups[monthYear].totalExp += t.amount;
            if (t.type === 'income') groups[monthYear].totalInc += t.amount;
        });

        Object.keys(groups).forEach(m => {
            const catCounts: Record<string, number> = {};
            groups[m].txns.filter(t => t.type === 'expense').forEach(t => {
                catCounts[t.category] = (catCounts[t.category] || 0) + t.amount;
            });
            const top = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0];
            groups[m].topCat = top ? top[0] : 'N/A';
            groups[m].txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        });

        return groups;
    }, [transactions]);

    return (
        <div className={styles.appContainer} style={{ background: 'var(--bg-layer-1)' }}>
            <div className={styles.appTabs}>
                <button className={`${styles.appTab} ${tab === 'add' ? styles.appTabActive : ''}`} onClick={() => setTab('add')}>Entry</button>
                <button className={`${styles.appTab} ${tab === 'history' ? styles.appTabActive : ''}`} onClick={() => setTab('history')}>Insights & History</button>
            </div>

            {tab === 'add' && (
                <motion.div className={styles.appBody} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

                    {/* Quick Add Mode */}
                    <div style={{ background: 'var(--bg-layer-2)', padding: '12px', borderRadius: '12px', display: 'flex', gap: '8px', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', flexShrink: 0 }}>
                        <FiPlus color="var(--accent-primary)" size={20} />
                        <input
                            className="input"
                            style={{ border: 'none', background: 'transparent', flex: 1, padding: 0 }}
                            placeholder="Quick Add: e.g. ₹250 Food"
                            value={quickAddText}
                            onChange={e => setQuickAddText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleQuickAdd()}
                        />
                    </div>

                    <div style={{ background: 'var(--bg-layer-2)', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '16px', flexShrink: 0 }}>
                        {/* 1. Category */}
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel} style={{ fontWeight: 600 }}>Category</label>
                            <select className={styles.select} style={{ padding: '12px', borderRadius: '8px' }} value={category} onChange={e => setCategory(e.target.value)}>
                                {categories.map(c => <option key={c} value={c}>{getCatIcon(c)} {c}</option>)}
                                <option value="_new">+ Add Custom Category</option>
                            </select>
                            {category === '_new' && (
                                <motion.input
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="input"
                                    placeholder="Enter new category name..."
                                    value={customCatInput}
                                    onChange={e => setCustomCatInput(e.target.value)}
                                    style={{ marginTop: '8px', padding: '12px' }}
                                />
                            )}
                        </div>

                        {/* 2. Amount */}
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel} style={{ fontWeight: 600 }}>Amount (₹)</label>
                            <input className="input" style={{ fontSize: '24px', fontWeight: 700, padding: '12px', borderRadius: '8px' }} type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} />
                        </div>

                        {/* 3. Description (Bigger with Mic) */}
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel} style={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                                Description
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 400 }}>
                                    <input type="checkbox" checked={aiNotesEnabled} onChange={e => setAiNotesEnabled(e.target.checked)} />
                                    AI Notes
                                </label>
                            </label>
                            <div style={{ position: 'relative' }}>
                                <textarea
                                    className="input"
                                    style={{ minHeight: '100px', padding: '12px', borderRadius: '8px', fontSize: '16px', resize: 'none', paddingRight: '40px' }}
                                    placeholder={placeholders[phIndex]}
                                    value={desc}
                                    onChange={e => setDesc(e.target.value)}
                                />
                                <button
                                    onClick={() => simulateVoiceInput(setDesc)}
                                    style={{ position: 'absolute', right: '12px', bottom: '12px', background: isListening ? 'var(--accent-rose)' : 'var(--bg-layer-3)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }}
                                >
                                    <FiMic color={isListening ? '#fff' : 'var(--text-primary)'} />
                                </button>
                            </div>
                        </div>

                        {/* Smart Date */}
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel} style={{ fontWeight: 600 }}>Date</label>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {['Today', 'Yesterday', 'Custom'].map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => setDateOption(opt as 'Today' | 'Yesterday' | 'Custom')}
                                        style={{ flex: 1, padding: '10px', borderRadius: '8px', border: dateOption === opt ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)', background: dateOption === opt ? 'var(--accent-primary-alpha)' : 'transparent', color: dateOption === opt ? 'var(--accent-primary)' : 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', transition: '0.2s' }}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                            {dateOption === 'Custom' && (
                                <motion.input initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="input" style={{ marginTop: '8px', padding: '12px' }} type="date" value={customDate} onChange={e => setCustomDate(e.target.value)} />
                            )}
                        </div>

                        {/* Mood Tag */}
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel} style={{ fontWeight: 600 }}>Spending Mood (Optional)</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {['Needed', 'Neutral', 'Impulse'].map(m => (
                                    <button
                                        key={m}
                                        onClick={() => setMood(mood === m ? null : m as 'Needed' | 'Neutral' | 'Impulse')}
                                        style={{ flex: 1, padding: '8px', borderRadius: '20px', border: '1px solid', borderColor: mood === m ? 'var(--accent-primary)' : 'var(--border-color)', background: mood === m ? 'var(--accent-primary)' : 'transparent', color: mood === m ? '#fff' : 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', transition: '0.2s' }}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button className="btn btn-primary" onClick={handleAdd} disabled={isLoading} style={{ width: '100%', padding: '16px', fontSize: '16px', borderRadius: '8px', marginTop: '8px', fontWeight: 600 }}>
                            {isLoading ? 'Processing...' : `Add Expense`}
                        </button>
                    </div>
                </motion.div>
            )}

            {tab === 'history' && (
                <motion.div className={styles.appBody} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

                    {/* Voice Edit Scaffolding */}
                    <div style={{ background: 'var(--bg-layer-2)', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', flexShrink: 0 }}>
                        <button style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-primary)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FiMic size={18} />
                        </button>
                        <input
                            className="input"
                            style={{ flex: 1, border: 'none', background: 'transparent', padding: 0 }}
                            placeholder='Say "Move Uber to yesterday"'
                            value={historyVoiceCmd}
                            onChange={(e) => setHistoryVoiceCmd(e.target.value)}
                        />
                    </div>

                    {Object.entries(monthlyData).map(([month, data], i) => (
                        <motion.div key={month} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} style={{ flexShrink: 0 }}>
                            {/* Month Card */}
                            <div
                                style={{ background: 'var(--bg-layer-2)', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', cursor: 'pointer', border: expandedMonth === month ? '2px solid var(--accent-primary)' : '2px solid transparent', transition: '0.2s' }}
                                onClick={() => setExpandedMonth(expandedMonth === month ? null : month)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FiCalendar /> {month}
                                    </h3>
                                    {expandedMonth === month ? <FiChevronUp /> : <FiChevronDown />}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div style={{ background: 'var(--accent-rose-alpha)', padding: '12px', borderRadius: '10px' }}>
                                        <div style={{ fontSize: '13px', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}><FiTrendingDown /> Expenses</div>
                                        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-rose)', marginTop: '4px' }}>₹{data.totalExp.toLocaleString()}</div>
                                    </div>
                                    <div style={{ background: 'var(--accent-emerald-alpha)', padding: '12px', borderRadius: '10px' }}>
                                        <div style={{ fontSize: '13px', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}><FiTrendingUp /> Income</div>
                                        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-emerald)', marginTop: '4px' }}>₹{data.totalInc.toLocaleString()}</div>
                                    </div>
                                    <div style={{ background: 'var(--bg-layer-3)', padding: '12px', borderRadius: '10px' }}>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Net Savings</div>
                                        <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '4px' }}>₹{(data.totalInc - data.totalExp).toLocaleString()}</div>
                                    </div>
                                    <div style={{ background: 'var(--bg-layer-3)', padding: '12px', borderRadius: '10px' }}>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Top Category</div>
                                        <div style={{ fontSize: '15px', fontWeight: 600, marginTop: '4px' }}>{getCatIcon(data.topCat)} {data.topCat}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Transactions List */}
                            <AnimatePresence>
                                {expandedMonth === month && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', padding: '8px 4px' }}>
                                        {data.txns.map(t => (
                                            <div key={t.id} className={styles.listItem} style={{ margin: '8px 0', background: 'var(--bg-layer-2)', borderRadius: '12px' }}>
                                                <div className={styles.listItemIcon} style={{ fontSize: '24px' }}>{getCatIcon(t.category)}</div>
                                                <div className={styles.listItemContent}>
                                                    <div className={styles.listItemTitle} style={{ fontWeight: 600 }}>{t.description}</div>
                                                    <div className={styles.listItemSub}>
                                                        {t.category} · {new Date(t.date).toLocaleDateString()}
                                                    </div>
                                                    {t.aiNote && <div style={{ fontSize: '12px', color: 'var(--accent-blue)', marginTop: '4px' }}>✨ {t.aiNote}</div>}
                                                    {t.mood && <span style={{ fontSize: '10px', background: 'var(--bg-layer-3)', padding: '2px 8px', borderRadius: '12px', marginTop: '6px', display: 'inline-block', fontWeight: 500 }}>{t.mood}</span>}
                                                </div>
                                                <div className={styles.listItemRight}>
                                                    <div className={styles.listItemAmount} style={{ color: t.type === 'income' ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                                                        {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}
