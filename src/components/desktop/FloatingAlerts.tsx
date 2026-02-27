'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiAlertTriangle, FiInfo, FiAlertCircle } from 'react-icons/fi';
import styles from './desktop.module.css';

export interface AlertItem {
    id: string;
    title: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: Date;
}

interface FloatingAlertsProps {
    alerts: AlertItem[];
    onDismiss: (id: string) => void;
}

const severityConfig = {
    low: { icon: FiInfo, color: 'var(--accent-blue)', bg: 'rgba(59,130,246,0.1)' },
    medium: { icon: FiAlertCircle, color: 'var(--accent-amber)', bg: 'rgba(245,158,11,0.1)' },
    high: { icon: FiAlertTriangle, color: 'var(--accent-rose)', bg: 'rgba(244,63,94,0.1)' },
    critical: { icon: FiAlertTriangle, color: 'var(--accent-rose)', bg: 'rgba(244,63,94,0.15)' },
};

export default function FloatingAlerts({ alerts, onDismiss }: FloatingAlertsProps) {
    return (
        <div className={styles.floatingAlerts}>
            <AnimatePresence>
                {alerts.slice(0, 5).map((alert) => {
                    const config = severityConfig[alert.severity];
                    const Icon = config.icon;
                    return (
                        <motion.div
                            key={alert.id}
                            className={styles.floatingAlert}
                            style={{ borderLeftColor: config.color, background: config.bg }}
                            initial={{ x: 350, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 350, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        >
                            <Icon size={16} style={{ color: config.color, flexShrink: 0, marginTop: 2 }} />
                            <div className={styles.floatingAlertContent}>
                                <div className={styles.floatingAlertTitle}>{alert.title}</div>
                                <div className={styles.floatingAlertMsg}>{alert.message}</div>
                            </div>
                            <button className={styles.floatingAlertClose} onClick={() => onDismiss(alert.id)}>
                                <FiX size={14} />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}

// Auto-dismiss hook
export function useAutoAlerts() {
    const [alerts, setAlerts] = useState<AlertItem[]>([]);

    const addAlert = (alert: Omit<AlertItem, 'id' | 'timestamp'>) => {
        const newAlert: AlertItem = {
            ...alert,
            id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
        };
        setAlerts(prev => [newAlert, ...prev]);
    };

    const dismissAlert = (id: string) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setAlerts(prev => prev.filter(a => Date.now() - a.timestamp.getTime() < 10000));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return { alerts, addAlert, dismissAlert };
}
