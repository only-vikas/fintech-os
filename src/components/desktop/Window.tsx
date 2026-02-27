'use client';

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWindowManager, WindowState } from './WindowManager';
import styles from './desktop.module.css';

interface WindowProps {
    windowState: WindowState;
    children: React.ReactNode;
}

export default function Window({ windowState, children }: WindowProps) {
    const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, updateWindowPosition } = useWindowManager();
    const dragRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0, winX: 0, winY: 0 });

    const onTitleBarMouseDown = useCallback((e: React.MouseEvent) => {
        if (windowState.isMaximized) return;
        e.preventDefault();
        focusWindow(windowState.id);
        setIsDragging(true);
        dragStart.current = { x: e.clientX, y: e.clientY, winX: windowState.x, winY: windowState.y };
    }, [windowState.id, windowState.x, windowState.y, windowState.isMaximized, focusWindow]);

    useEffect(() => {
        if (!isDragging) return;

        const onMouseMove = (e: MouseEvent) => {
            const dx = e.clientX - dragStart.current.x;
            const dy = e.clientY - dragStart.current.y;
            updateWindowPosition(windowState.id, dragStart.current.winX + dx, dragStart.current.winY + dy);
        };

        const onMouseUp = () => setIsDragging(false);

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [isDragging, windowState.id, updateWindowPosition]);

    if (windowState.isMinimized) return null;

    const wStyle: React.CSSProperties = windowState.isMaximized
        ? { left: 0, top: 36, width: '100vw', height: 'calc(100vh - 36px - 68px)', zIndex: windowState.zIndex, borderRadius: 0 }
        : { left: windowState.x, top: windowState.y, width: windowState.width, height: windowState.height, zIndex: windowState.zIndex };

    return (
        <AnimatePresence>
            {windowState.isOpen && (
                <motion.div
                    className={styles.window}
                    style={wStyle}
                    initial={{ opacity: 0, scale: 0.92, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    onMouseDown={() => focusWindow(windowState.id)}
                >
                    {/* Title Bar */}
                    <div
                        className={styles.windowTitleBar}
                        onMouseDown={onTitleBarMouseDown}
                        onDoubleClick={() => maximizeWindow(windowState.id)}
                    >
                        <div className={styles.windowControls}>
                            <button className={`${styles.windowBtn} ${styles.windowBtnClose}`} onClick={() => closeWindow(windowState.id)} title="Close" />
                            <button className={`${styles.windowBtn} ${styles.windowBtnMinimize}`} onClick={() => minimizeWindow(windowState.id)} title="Minimize" />
                            <button className={`${styles.windowBtn} ${styles.windowBtnMaximize}`} onClick={() => maximizeWindow(windowState.id)} title="Maximize" />
                        </div>
                        <div className={styles.windowTitle}>
                            <span className={styles.windowIcon}>{windowState.icon}</span>
                            {windowState.title}
                        </div>
                        <div className={styles.windowTitleSpacer} />
                    </div>

                    {/* Content */}
                    <div className={styles.windowContent}>
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
