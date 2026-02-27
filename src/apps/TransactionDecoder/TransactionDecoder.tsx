'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from '../../components/desktop/desktop.module.css';

interface DecodedResult {
    raw: string;
    decoded: string;
    merchant: string;
    method: string;
    category: string;
    confidence: number;
}

const EXAMPLES = [
    'VNRBANK/UPI/VIKAS/45/55',
    'SBIUPI/AMAZON/4587',
    'HDFCNEFT/SAL/JAN2026',
    'ICICIUPI/SWIGGY/ORD123',
    'PAYTMUPI/PHONEPE/RECHARGE',
];

export default function TransactionDecoder() {
    const [input, setInput] = useState('');
    const [results, setResults] = useState<DecodedResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const decode = async (text: string) => {
        if (!text.trim()) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentType: 'decode',
                    messages: [{
                        role: 'user',
                        content: `Decode this bank transaction description: "${text}". Return JSON with: decoded (human readable), merchant, method (UPI/NEFT/etc), category, confidence (0-1).`,
                    }],
                }),
            });
            const data = await res.json();
            let parsed: Partial<DecodedResult> = {};
            try {
                const cleaned = data.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                parsed = JSON.parse(cleaned);
            } catch {
                parsed = { decoded: data.content, merchant: 'Unknown', method: 'Unknown', category: 'Uncategorized', confidence: 0.5 };
            }
            setResults(prev => [{
                raw: text,
                decoded: parsed.decoded || text,
                merchant: parsed.merchant || 'Unknown',
                method: parsed.method || 'Unknown',
                category: parsed.category || 'Uncategorized',
                confidence: parsed.confidence || 0.5,
            }, ...prev]);
        } catch {
            setResults(prev => [{ raw: text, decoded: 'Decode failed – try again', merchant: 'Error', method: '-', category: '-', confidence: 0 }, ...prev]);
        }
        setIsLoading(false);
    };

    const handleBulk = () => {
        const lines = input.split('\n').filter(l => l.trim());
        lines.forEach((line, i) => setTimeout(() => decode(line), i * 500));
        setInput('');
    };

    return (
        <div className={styles.appContainer}>
            <div className={styles.appHeader}>
                <div className={styles.appTitle}>Transaction Decoder</div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.formLabel}>Paste transaction description(s)</label>
                <textarea
                    className="input"
                    placeholder="VNRBANK/UPI/VIKAS/45/55&#10;SBIUPI/AMAZON/4587"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    rows={3}
                    style={{ resize: 'vertical', fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}
                />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" onClick={() => decode(input)} disabled={isLoading}>
                    {isLoading ? 'Decoding…' : '🔍 Tap to Decode'}
                </button>
                <button className="btn btn-ghost" onClick={handleBulk} disabled={isLoading}>Bulk Decode</button>
            </div>

            <div className={styles.chipRow}>
                {EXAMPLES.map(ex => (
                    <button key={ex} className={styles.chip} onClick={() => { setInput(ex); decode(ex); }}>{ex.slice(0, 20)}…</button>
                ))}
            </div>

            <div className={styles.appBody}>
                {results.map((r, i) => (
                    <motion.div key={i} className={styles.decodeResult} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>{r.raw}</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{r.decoded}</div>
                        <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                            <div className={styles.decodeRow} style={{ flex: 1 }}>
                                <span className={styles.decodeKey}>Merchant</span>
                                <span className={styles.decodeValue}>{r.merchant}</span>
                            </div>
                            <div className={styles.decodeRow} style={{ flex: 1 }}>
                                <span className={styles.decodeKey}>Method</span>
                                <span className={styles.decodeValue}>{r.method}</span>
                            </div>
                            <div className={styles.decodeRow} style={{ flex: 1 }}>
                                <span className={styles.decodeKey}>Category</span>
                                <span className={styles.decodeValue}>{r.category}</span>
                            </div>
                        </div>
                        <div style={{ marginTop: 4 }}>
                            <div style={{ height: 3, borderRadius: 2, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${r.confidence * 100}%`, background: r.confidence > 0.7 ? 'var(--accent-emerald)' : 'var(--accent-amber)', borderRadius: 2 }} />
                            </div>
                            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Confidence: {Math.round(r.confidence * 100)}%</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
