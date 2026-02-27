'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiInfo, FiAlertTriangle, FiAlertCircle, FiCheck, FiFilter } from 'react-icons/fi';
import styles from '../../components/desktop/desktop.module.css';

interface Alert {
    id: string;
    title: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    type: string;
    read: boolean;
    time: string;
}

const MOCK_ALERTS: Alert[] = [
    { id: '1', title: 'Budget Warning', message: 'Shopping spend is at 82% of monthly limit', severity: 'high', type: 'budget', read: false, time: '5 min ago' },
    { id: '2', title: 'Bill Due Tomorrow', message: 'Electricity bill ₹1,800 due on Mar 1', severity: 'medium', type: 'bill', read: false, time: '1 hour ago' },
    { id: '3', title: 'Market Update', message: 'NIFTY crossed 22,500 — up 0.8% today', severity: 'low', type: 'market', read: false, time: '2 hours ago' },
    { id: '4', title: 'SIP Executed', message: 'Monthly SIP of ₹5,000 debited successfully', severity: 'low', type: 'investment', read: true, time: 'Yesterday' },
    { id: '5', title: 'Unusual Spending', message: 'Travel expenses 3x higher than usual this week', severity: 'high', type: 'spending', read: true, time: '2 days ago' },
    { id: '6', title: 'Account Synced', message: 'HDFC Savings account synced successfully', severity: 'low', type: 'system', read: true, time: '3 days ago' },
];

const SEVERITY_ICONS = {
    low: FiInfo,
    medium: FiAlertCircle,
    high: FiAlertTriangle,
    critical: FiAlertTriangle,
};

const SEVERITY_COLORS = {
    low: 'var(--accent-blue)',
    medium: 'var(--accent-amber)',
    high: 'var(--accent-rose)',
    critical: 'var(--accent-rose)',
};

export default function AlertsCenter() {
    const [alerts, setAlerts] = useState(MOCK_ALERTS);
    const [filter, setFilter] = useState<string>('all');

    const markRead = (id: string) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
    };

    const markAllRead = () => {
        setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    };

    const filtered = filter === 'all' ? alerts : filter === 'unread' ? alerts.filter(a => !a.read) : alerts.filter(a => a.type === filter);

    return (
        <div className={styles.appContainer}>
            <div className={styles.appHeader}>
                <div className={styles.appTitle}>Notifications</div>
                <button className="btn btn-ghost" onClick={markAllRead} style={{ fontSize: 12 }}>
                    <FiCheck size={13} /> Mark all read
                </button>
            </div>

            <div className={styles.chipRow}>
                {['all', 'unread', 'budget', 'bill', 'market', 'spending'].map(f => (
                    <button key={f} className={styles.chip} onClick={() => setFilter(f)} style={filter === f ? { borderColor: 'var(--accent-blue)', color: 'var(--accent-blue)' } : {}}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            <div className={styles.appBody}>
                {filtered.map((alert, i) => {
                    const Icon = SEVERITY_ICONS[alert.severity];
                    const color = SEVERITY_COLORS[alert.severity];
                    return (
                        <motion.div
                            key={alert.id}
                            className={styles.alertItem}
                            style={{ borderLeftColor: color, opacity: alert.read ? 0.6 : 1 }}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: alert.read ? 0.6 : 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            onClick={() => markRead(alert.id)}
                        >
                            <Icon size={16} style={{ color, marginTop: 2, flexShrink: 0 }} />
                            <div className={styles.alertItemContent}>
                                <div className={styles.alertItemTitle}>{alert.title}</div>
                                <div className={styles.alertItemMsg}>{alert.message}</div>
                                <div className={styles.alertItemTime}>{alert.time}</div>
                            </div>
                            {!alert.read && <div className={styles.statusDot} style={{ background: color, boxShadow: `0 0 6px ${color}` }} />}
                        </motion.div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyStateIcon}>🔔</div>
                        <div className={styles.emptyStateText}>No notifications</div>
                    </div>
                )}
            </div>
        </div>
    );
}
