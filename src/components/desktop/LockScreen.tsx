'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLock, FiArrowRight } from 'react-icons/fi';
import styles from './desktop.module.css';

interface LockScreenProps {
    isLocked: boolean;
    onUnlock: () => void;
}

export default function LockScreen({ isLocked, onUnlock }: LockScreenProps) {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin.length >= 4) {
            setPin('');
            setError(false);
            onUnlock();
        } else {
            setError(true);
            setTimeout(() => setError(false), 1500);
        }
    };

    return (
        <AnimatePresence>
            {isLocked && (
                <motion.div
                    className={styles.lockScreen}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <motion.div
                        className={styles.lockContent}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, type: 'spring', damping: 20 }}
                    >
                        <div className={styles.lockIcon}>
                            <FiLock size={32} />
                        </div>
                        <h2 className={styles.lockTitle}>Fintech OS</h2>
                        <p className={styles.lockSubtitle}>Enter PIN to unlock</p>
                        <form onSubmit={handleSubmit} className={styles.lockForm}>
                            <input
                                type="password"
                                className={`${styles.lockInput} ${error ? styles.lockInputError : ''}`}
                                placeholder="••••"
                                value={pin}
                                onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                maxLength={6}
                                autoFocus
                            />
                            <button type="submit" className={styles.lockSubmit}>
                                <FiArrowRight size={18} />
                            </button>
                        </form>
                        <p className={styles.lockHint}>Enter any 4+ digit PIN to unlock</p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
