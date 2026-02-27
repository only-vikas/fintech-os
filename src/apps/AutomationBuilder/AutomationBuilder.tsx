'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from '../../components/desktop/desktop.module.css';

interface Automation {
    id: string;
    name: string;
    trigger: { type: string; condition: string; value: string };
    action: { type: string; detail: string };
    enabled: boolean;
    lastRun?: string;
}

const MOCK_AUTOMATIONS: Automation[] = [
    { id: '1', name: 'Auto-save to FD', trigger: { type: 'balance', condition: 'exceeds', value: '₹50,000' }, action: { type: 'transfer', detail: 'Move ₹10,000 to Fixed Deposit' }, enabled: true, lastRun: '2 days ago' },
    { id: '2', name: 'Budget Alert', trigger: { type: 'spending', condition: 'exceeds', value: '80% of budget' }, action: { type: 'alert', detail: 'Send budget warning notification' }, enabled: true, lastRun: '5 hours ago' },
    { id: '3', name: 'SIP Reminder', trigger: { type: 'date', condition: 'equals', value: '1st of month' }, action: { type: 'remind', detail: 'SIP payment due reminder' }, enabled: false },
];

const TRIGGER_TYPES = ['Balance exceeds', 'Spending exceeds', 'Date equals', 'Income received', 'Category spend exceeds'];
const ACTION_TYPES = ['Send alert', 'Transfer funds', 'Create reminder', 'Start SIP', 'Suggest investment'];

export default function AutomationBuilder() {
    const [automations, setAutomations] = useState(MOCK_AUTOMATIONS);
    const [showBuilder, setShowBuilder] = useState(false);
    const [newName, setNewName] = useState('');
    const [triggerType, setTriggerType] = useState(TRIGGER_TYPES[0]);
    const [triggerValue, setTriggerValue] = useState('');
    const [actionType, setActionType] = useState(ACTION_TYPES[0]);
    const [actionDetail, setActionDetail] = useState('');

    const toggleAutomation = (id: string) => {
        setAutomations(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
    };

    const createAutomation = () => {
        if (!newName.trim()) return;
        const newAuto: Automation = {
            id: Date.now().toString(),
            name: newName,
            trigger: { type: triggerType.split(' ')[0].toLowerCase(), condition: triggerType.split(' ').slice(1).join(' '), value: triggerValue },
            action: { type: actionType.split(' ')[1]?.toLowerCase() || 'alert', detail: actionDetail || actionType },
            enabled: true,
        };
        setAutomations(prev => [newAuto, ...prev]);
        setShowBuilder(false);
        setNewName('');
        setTriggerValue('');
        setActionDetail('');
    };

    return (
        <div className={styles.appContainer}>
            <div className={styles.appHeader}>
                <div className={styles.appTitle}>Automations</div>
                <button className="btn btn-primary" onClick={() => setShowBuilder(!showBuilder)} style={{ fontSize: 12 }}>
                    {showBuilder ? '✕ Cancel' : '+ New Rule'}
                </button>
            </div>

            {showBuilder && (
                <motion.div className={styles.card} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Rule Name</label>
                        <input className="input" placeholder="e.g., Auto-invest surplus" value={newName} onChange={e => setNewName(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div className={styles.formGroup} style={{ flex: 1 }}>
                            <label className={styles.formLabel}>IF (Trigger)</label>
                            <select className={styles.select} value={triggerType} onChange={e => setTriggerType(e.target.value)}>
                                {TRIGGER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <span style={{ fontSize: 20, color: 'var(--accent-blue)', marginTop: 16 }}>→</span>
                        <div className={styles.formGroup} style={{ flex: 1 }}>
                            <label className={styles.formLabel}>THEN (Action)</label>
                            <select className={styles.select} value={actionType} onChange={e => setActionType(e.target.value)}>
                                {ACTION_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <div className={styles.formGroup} style={{ flex: 1 }}>
                            <label className={styles.formLabel}>Trigger Value</label>
                            <input className="input" placeholder="e.g., ₹50,000" value={triggerValue} onChange={e => setTriggerValue(e.target.value)} />
                        </div>
                        <div className={styles.formGroup} style={{ flex: 1 }}>
                            <label className={styles.formLabel}>Action Detail</label>
                            <input className="input" placeholder="e.g., Move to savings" value={actionDetail} onChange={e => setActionDetail(e.target.value)} />
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={createAutomation} style={{ alignSelf: 'flex-end' }}>Create Rule</button>
                </motion.div>
            )}

            <div className={styles.appBody}>
                {automations.map((a, i) => (
                    <motion.div key={a.id} className={styles.ruleCard} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} style={{ marginBottom: 10 }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: 14, fontWeight: 600 }}>{a.name}</span>
                                <span className={`badge ${a.enabled ? 'badge-emerald' : 'badge-rose'}`}>{a.enabled ? 'Active' : 'Paused'}</span>
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                IF <span style={{ color: 'var(--accent-blue)', fontWeight: 500 }}>{a.trigger.type} {a.trigger.condition} {a.trigger.value}</span>
                                <span className={styles.ruleArrow}> → </span>
                                THEN <span style={{ color: 'var(--accent-emerald)', fontWeight: 500 }}>{a.action.detail}</span>
                            </div>
                            {a.lastRun && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Last run: {a.lastRun}</div>}
                        </div>
                        <button className={`${styles.toggle} ${a.enabled ? styles.toggleActive : ''}`} onClick={() => toggleAutomation(a.id)}>
                            <div className={styles.toggleKnob} />
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
