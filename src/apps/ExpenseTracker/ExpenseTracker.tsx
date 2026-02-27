'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from '../../components/desktop/desktop.module.css';

interface Transaction {
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
    type: 'expense' | 'income';
}

const CATEGORIES = ['Food', 'Shopping', 'Travel', 'Healthcare', 'Rent', 'Utilities', 'Entertainment', 'Education'];
const CAT_ICONS: Record<string, string> = { Food: '🍔', Shopping: '🛍️', Travel: '✈️', Healthcare: '🏥', Rent: '🏠', Utilities: '💡', Entertainment: '🎮', Education: '📚', Uncategorized: '📦' };

const MOCK_TXN: Transaction[] = [
    { id: '1', description: 'Swiggy Order', amount: 450, category: 'Food', date: '2026-02-27', type: 'expense' },
    { id: '2', description: 'Amazon Purchase', amount: 2999, category: 'Shopping', date: '2026-02-26', type: 'expense' },
    { id: '3', description: 'Uber Ride', amount: 320, category: 'Travel', date: '2026-02-25', type: 'expense' },
    { id: '4', description: 'Netflix Subscription', amount: 649, category: 'Entertainment', date: '2026-02-25', type: 'expense' },
    { id: '5', description: 'Electricity Bill', amount: 1800, category: 'Utilities', date: '2026-02-24', type: 'expense' },
    { id: '6', description: 'Salary Credit', amount: 85000, category: 'Salary', date: '2026-02-01', type: 'income' },
];

export default function ExpenseTracker() {
    const [tab, setTab] = useState<'add' | 'history'>('add');
    const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TXN);
    const [desc, setDesc] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Food');
    const [isLoading, setIsLoading] = useState(false);

    const handleAdd = async () => {
        if (!desc.trim() || !amount) return;
        setIsLoading(true);

        // Try AI categorization
        let aiCategory = category;
        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentType: 'expense',
                    messages: [{ role: 'user', content: `Categorize this expense: "${desc}" Amount: ₹${amount}. Return ONLY a JSON with category field from: Healthcare, Rent, Shopping, Food, Travel, Utilities, Entertainment, Education.` }],
                }),
            });
            const data = await res.json();
            try {
                const parsed = JSON.parse(data.content);
                if (parsed.category) aiCategory = parsed.category;
            } catch { /* Use manual category */ }
        } catch { /* Use manual category */ }

        const newTxn: Transaction = {
            id: Date.now().toString(),
            description: desc,
            amount: parseFloat(amount),
            category: aiCategory,
            date: new Date().toISOString().split('T')[0],
            type: 'expense',
        };

        setTransactions(prev => [newTxn, ...prev]);
        setDesc('');
        setAmount('');
        setIsLoading(false);
        setTab('history');
    };

    return (
        <div className={styles.appContainer}>
            <div className={styles.appTabs}>
                <button className={`${styles.appTab} ${tab === 'add' ? styles.appTabActive : ''}`} onClick={() => setTab('add')}>Add Expense</button>
                <button className={`${styles.appTab} ${tab === 'history' ? styles.appTabActive : ''}`} onClick={() => setTab('history')}>History</button>
            </div>

            {tab === 'add' && (
                <motion.div className={styles.appBody} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Description</label>
                            <input className="input" placeholder="e.g., Lunch at Café" value={desc} onChange={e => setDesc(e.target.value)} />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Amount (₹)</label>
                            <input className="input" type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Category (AI will auto-detect)</label>
                            <select className={styles.select} value={category} onChange={e => setCategory(e.target.value)}>
                                {CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
                            </select>
                        </div>
                        <button className="btn btn-primary" onClick={handleAdd} disabled={isLoading} style={{ width: '100%', marginTop: 4 }}>
                            {isLoading ? 'AI Categorizing…' : '+ Add Expense'}
                        </button>
                    </div>
                </motion.div>
            )}

            {tab === 'history' && (
                <motion.div className={styles.appBody} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {transactions.map((t, i) => (
                        <motion.div key={t.id} className={styles.listItem} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                            <div className={styles.listItemIcon}>{CAT_ICONS[t.category] || '📦'}</div>
                            <div className={styles.listItemContent}>
                                <div className={styles.listItemTitle}>{t.description}</div>
                                <div className={styles.listItemSub}>{t.category} · {t.date}</div>
                            </div>
                            <div className={styles.listItemRight}>
                                <div className={styles.listItemAmount} style={{ color: t.type === 'income' ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                                    {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}
