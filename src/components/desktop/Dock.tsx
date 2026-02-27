'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWindowManager, AppDefinition } from './WindowManager';
import styles from './desktop.module.css';

interface DockProps {
    apps: AppDefinition[];
}

export default function Dock({ apps }: DockProps) {
    const { openApp, windows, restoreWindow } = useWindowManager();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const getScale = (index: number) => {
        if (hoveredIndex === null) return 1;
        const distance = Math.abs(index - hoveredIndex);
        if (distance === 0) return 1.35;
        if (distance === 1) return 1.15;
        if (distance === 2) return 1.05;
        return 1;
    };

    const handleClick = (app: AppDefinition) => {
        const existingWindow = windows.find(w => w.appId === app.id);
        if (existingWindow?.isMinimized) {
            restoreWindow(existingWindow.id);
        } else {
            openApp(app);
        }
    };

    return (
        <div className={styles.dockContainer}>
            <motion.div
                className={styles.dock}
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 200, delay: 0.3 }}
            >
                {apps.map((app, index) => {
                    const isOpen = windows.some(w => w.appId === app.id && w.isOpen);
                    return (
                        <motion.div
                            key={app.id}
                            className={styles.dockItem}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            onClick={() => handleClick(app)}
                            animate={{ scale: getScale(index) }}
                            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                        >
                            <div className={styles.dockIcon}>
                                <span className={styles.dockEmoji}>{app.icon}</span>
                            </div>
                            {hoveredIndex === index && (
                                <motion.div
                                    className={styles.dockTooltip}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                >
                                    {app.title}
                                </motion.div>
                            )}
                            {isOpen && <div className={styles.dockDot} />}
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
}
