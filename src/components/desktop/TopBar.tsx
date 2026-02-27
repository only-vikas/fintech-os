'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiShield, FiActivity, FiLock, FiZap } from 'react-icons/fi';
import styles from './desktop.module.css';

interface TopBarProps {
    onSpotlightOpen: () => void;
    onLock: () => void;
}

export default function TopBar({ onSpotlightOpen, onLock }: TopBarProps) {
    const [time, setTime] = useState('');

    useEffect(() => {
        const update = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
        };
        update();
        const i = setInterval(update, 30000);
        return () => clearInterval(i);
    }, []);

    return (
        <motion.div
            className={styles.topBar}
            initial={{ y: -36, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        >
            <div className={styles.topBarLeft}>
                <span className={styles.topBarLogo}>◆ Fintech OS</span>
            </div>
            <div className={styles.topBarCenter}>
                <button className={styles.topBarSearchBtn} onClick={onSpotlightOpen}>
                    <FiSearch size={13} />
                    <span>Quick Search</span>
                    <kbd className={styles.shortcutHint}>Ctrl+Space</kbd>
                </button>
            </div>
            <div className={styles.topBarRight}>
                <div className={styles.controlPill}>
                    <FiActivity size={12} />
                    <span className={styles.controlLabel}>Liquidity</span>
                    <span className={styles.controlValue} style={{ color: 'var(--accent-emerald)' }}>Healthy</span>
                </div>
                <div className={styles.controlPill}>
                    <FiShield size={12} />
                    <span className={styles.controlLabel}>Risk</span>
                    <span className={styles.controlValue} style={{ color: 'var(--accent-amber)' }}>Medium</span>
                </div>
                <div className={styles.controlPill}>
                    <FiZap size={12} />
                    <span className={styles.controlLabel}>Auto</span>
                    <span className={styles.controlValue}>3</span>
                </div>
                <button className={styles.lockBtn} onClick={onLock} title="Lock Session">
                    <FiLock size={13} />
                </button>
                <span className={styles.topBarTime}>{time}</span>
            </div>
        </motion.div>
    );
}
