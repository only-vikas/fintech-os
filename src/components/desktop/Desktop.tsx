'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { WindowManagerProvider, useWindowManager, AppDefinition } from './WindowManager';
import Window from './Window';
import Dock from './Dock';
import TopBar from './TopBar';
import Spotlight from './Spotlight';
import FloatingAlerts, { useAutoAlerts } from './FloatingAlerts';
import LockScreen from './LockScreen';
import DesktopWidgets from '../widgets/DesktopWidgets';
import styles from './desktop.module.css';

// App imports
import ExpenseTracker from '../../apps/ExpenseTracker/ExpenseTracker';
import TransactionDecoder from '../../apps/TransactionDecoder/TransactionDecoder';
import Dashboard from '../../apps/Dashboard/Dashboard';
import Chatbot from '../../apps/Chatbot/Chatbot';
import InvestmentPlanner from '../../apps/InvestmentPlanner/InvestmentPlanner';
import VoiceAssistant from '../../apps/VoiceAssistant/VoiceAssistant';
import AutomationBuilder from '../../apps/AutomationBuilder/AutomationBuilder';
import Accounts from '../../apps/Accounts/Accounts';
import AlertsCenter from '../../apps/AlertsCenter/AlertsCenter';

// Define apps
export const APPS: AppDefinition[] = [
    { id: 'wallet', title: 'Wallet', icon: '👛', defaultWidth: 420, defaultHeight: 500, minWidth: 350, minHeight: 400, component: () => <ExpenseTracker /> },
    { id: 'expenses', title: 'Expenses', icon: '💸', defaultWidth: 480, defaultHeight: 560, minWidth: 380, minHeight: 400, component: () => <ExpenseTracker /> },
    { id: 'investments', title: 'Investments', icon: '📈', defaultWidth: 520, defaultHeight: 580, minWidth: 400, minHeight: 450, component: () => <InvestmentPlanner /> },
    { id: 'analytics', title: 'Analytics', icon: '📊', defaultWidth: 600, defaultHeight: 600, minWidth: 450, minHeight: 450, component: () => <Dashboard /> },
    { id: 'accounts', title: 'Accounts', icon: '🏦', defaultWidth: 460, defaultHeight: 500, minWidth: 380, minHeight: 400, component: () => <Accounts /> },
    { id: 'ai-advisor', title: 'AI Advisor', icon: '🤖', defaultWidth: 440, defaultHeight: 560, minWidth: 360, minHeight: 400, component: () => <Chatbot /> },
    { id: 'decoder', title: 'Decoder', icon: '🔍', defaultWidth: 480, defaultHeight: 520, minWidth: 380, minHeight: 400, component: () => <TransactionDecoder /> },
    { id: 'automation', title: 'Automation', icon: '⚡', defaultWidth: 500, defaultHeight: 520, minWidth: 400, minHeight: 400, component: () => <AutomationBuilder /> },
    { id: 'voice', title: 'Voice', icon: '🎤', defaultWidth: 400, defaultHeight: 500, minWidth: 340, minHeight: 380, component: () => <VoiceAssistant /> },
    { id: 'alerts', title: 'Notifications', icon: '🔔', defaultWidth: 400, defaultHeight: 500, minWidth: 340, minHeight: 380, component: () => <AlertsCenter /> },
    { id: 'bills', title: 'Bills', icon: '📅', defaultWidth: 420, defaultHeight: 480, minWidth: 340, minHeight: 360, component: () => <AlertsCenter /> },
];

function DesktopInner() {
    const { windows } = useWindowManager();
    const [spotlightOpen, setSpotlightOpen] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const { alerts, addAlert, dismissAlert } = useAutoAlerts();

    // Keyboard shortcut for Spotlight
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
                e.preventDefault();
                setSpotlightOpen(prev => !prev);
            }
            if (e.key === 'Escape') setSpotlightOpen(false);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    // Demo alert on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            addAlert({ title: 'Welcome to Fintech OS', message: 'Your financial workspace is ready. Explore apps from the dock below.', severity: 'low' });
        }, 2000);
        return () => clearTimeout(timer);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className={styles.desktop}>
            {/* Wallpaper */}
            <div className={styles.desktopWallpaper} />

            {/* Top Bar */}
            <TopBar onSpotlightOpen={() => setSpotlightOpen(true)} onLock={() => setIsLocked(true)} />

            {/* Desktop Content (widgets) */}
            <div className={styles.desktopContent}>
                <DesktopWidgets />
            </div>

            {/* Windows */}
            {windows.map(win => {
                const appDef = APPS.find(a => a.id === win.appId);
                if (!appDef) return null;
                const AppComponent = appDef.component;
                return (
                    <Window key={win.id} windowState={win}>
                        <AppComponent windowId={win.id} />
                    </Window>
                );
            })}

            {/* Dock */}
            <Dock apps={APPS} />

            {/* Spotlight */}
            <Spotlight isOpen={spotlightOpen} onClose={() => setSpotlightOpen(false)} apps={APPS} />

            {/* Floating Alerts */}
            <FloatingAlerts alerts={alerts} onDismiss={dismissAlert} />

            {/* Lock Screen */}
            <LockScreen isLocked={isLocked} onUnlock={() => setIsLocked(false)} />
        </div>
    );
}

export default function Desktop() {
    return (
        <WindowManagerProvider>
            <DesktopInner />
        </WindowManagerProvider>
    );
}
