'use client';

import React from 'react';
import { motion } from 'framer-motion';
import styles from '../desktop/desktop.module.css';

const widgets = [
    { title: 'Net Worth', icon: '💎', value: '₹12,45,800', change: '+2.4%', up: true, sub: 'Updated today' },
    { title: 'Cash Balance', icon: '💰', value: '₹3,28,500', change: '-₹12,400', up: false, sub: '3 accounts' },
    { title: 'Burn Rate', icon: '🔥', value: '₹48,200/mo', change: '+5.1%', up: false, sub: 'vs last month' },
    { title: 'Investments', icon: '📈', value: '₹8,92,300', change: '+₹24,100', up: true, sub: '4 active SIPs' },
    { title: 'Market', icon: '📊', value: 'NIFTY 22,480', change: '+0.8%', up: true, sub: 'Live' },
    { title: 'Upcoming Bills', icon: '📅', value: '₹15,800', change: '3 due', up: false, sub: 'Next 7 days' },
];

export default function DesktopWidgets() {
    return (
        <div className={styles.widgetGrid}>
            {widgets.map((w, i) => (
                <motion.div
                    key={w.title}
                    className={styles.widget}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.06, type: 'spring', damping: 20 }}
                >
                    <div className={styles.widgetHeader}>
                        <span className={styles.widgetTitle}>{w.title}</span>
                        <span className={styles.widgetIcon}>{w.icon}</span>
                    </div>
                    <div className={styles.widgetValue}>{w.value}</div>
                    <div className={`${styles.widgetChange} ${w.up ? styles.widgetChangeUp : styles.widgetChangeDown}`}>
                        {w.up ? '↑' : '↓'} {w.change}
                    </div>
                    <div className={styles.widgetSub}>{w.sub}</div>
                </motion.div>
            ))}
        </div>
    );
}
