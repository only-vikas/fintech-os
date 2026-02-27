'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiArrowRight } from 'react-icons/fi';
import { AppDefinition, useWindowManager } from './WindowManager';
import styles from './desktop.module.css';

interface SpotlightProps {
    isOpen: boolean;
    onClose: () => void;
    apps: AppDefinition[];
}

export default function Spotlight({ isOpen, onClose, apps }: SpotlightProps) {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const { openApp } = useWindowManager();

    const results = query.trim()
        ? apps.filter(a => a.title.toLowerCase().includes(query.toLowerCase()))
        : apps;

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSelect = useCallback((app: AppDefinition) => {
        openApp(app);
        onClose();
    }, [openApp, onClose]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(i => Math.min(i + 1, results.length - 1));
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(i => Math.max(i - 1, 0));
        }
        if (e.key === 'Enter' && results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className={styles.spotlightOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className={styles.spotlight}
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                    >
                        <div className={styles.spotlightInputWrapper}>
                            <FiSearch size={18} className={styles.spotlightSearchIcon} />
                            <input
                                ref={inputRef}
                                className={styles.spotlightInput}
                                placeholder="Search apps, transactions, insights…"
                                value={query}
                                onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        <div className={styles.spotlightResults}>
                            {results.map((app, i) => (
                                <div
                                    key={app.id}
                                    className={`${styles.spotlightResult} ${i === selectedIndex ? styles.spotlightResultActive : ''}`}
                                    onClick={() => handleSelect(app)}
                                    onMouseEnter={() => setSelectedIndex(i)}
                                >
                                    <span className={styles.spotlightResultIcon}>{app.icon}</span>
                                    <span className={styles.spotlightResultTitle}>{app.title}</span>
                                    <FiArrowRight size={14} className={styles.spotlightResultArrow} />
                                </div>
                            ))}
                            {results.length === 0 && (
                                <div className={styles.spotlightEmpty}>No results found</div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
