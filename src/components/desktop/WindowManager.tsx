'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface WindowState {
    id: string;
    appId: string;
    title: string;
    icon: string;
    x: number;
    y: number;
    width: number;
    height: number;
    minWidth: number;
    minHeight: number;
    isMinimized: boolean;
    isMaximized: boolean;
    zIndex: number;
    isOpen: boolean;
}

export interface AppDefinition {
    id: string;
    title: string;
    icon: string;
    defaultWidth: number;
    defaultHeight: number;
    minWidth: number;
    minHeight: number;
    component: React.ComponentType<{ windowId: string }>;
}

interface WindowManagerContextType {
    windows: WindowState[];
    activeWindowId: string | null;
    openApp: (app: AppDefinition) => void;
    closeWindow: (id: string) => void;
    minimizeWindow: (id: string) => void;
    maximizeWindow: (id: string) => void;
    restoreWindow: (id: string) => void;
    focusWindow: (id: string) => void;
    updateWindowPosition: (id: string, x: number, y: number) => void;
    updateWindowSize: (id: string, width: number, height: number) => void;
    isAppOpen: (appId: string) => boolean;
    getWindowByAppId: (appId: string) => WindowState | undefined;
}

const WindowManagerContext = createContext<WindowManagerContextType | null>(null);

let zCounter = 100;
let windowCounter = 0;

export function WindowManagerProvider({ children }: { children: ReactNode }) {
    const [windows, setWindows] = useState<WindowState[]>([]);
    const [activeWindowId, setActiveWindowId] = useState<string | null>(null);

    const openApp = useCallback((app: AppDefinition) => {
        setWindows(prev => {
            const existing = prev.find(w => w.appId === app.id);
            if (existing) {
                if (existing.isMinimized) {
                    return prev.map(w => w.id === existing.id ? { ...w, isMinimized: false, zIndex: ++zCounter } : w);
                }
                return prev.map(w => w.id === existing.id ? { ...w, zIndex: ++zCounter } : w);
            }

            windowCounter++;
            const offset = (windowCounter % 8) * 30;
            const newWindow: WindowState = {
                id: `window-${Date.now()}-${windowCounter}`,
                appId: app.id,
                title: app.title,
                icon: app.icon,
                x: 120 + offset,
                y: 60 + offset,
                width: app.defaultWidth,
                height: app.defaultHeight,
                minWidth: app.minWidth,
                minHeight: app.minHeight,
                isMinimized: false,
                isMaximized: false,
                zIndex: ++zCounter,
                isOpen: true,
            };
            return [...prev, newWindow];
        });
    }, []);

    const closeWindow = useCallback((id: string) => {
        setWindows(prev => prev.filter(w => w.id !== id));
        setActiveWindowId(prev => prev === id ? null : prev);
    }, []);

    const minimizeWindow = useCallback((id: string) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
        setActiveWindowId(prev => prev === id ? null : prev);
    }, []);

    const maximizeWindow = useCallback((id: string) => {
        setWindows(prev => prev.map(w => {
            if (w.id !== id) return w;
            if (w.isMaximized) {
                return { ...w, isMaximized: false };
            }
            return { ...w, isMaximized: true, zIndex: ++zCounter };
        }));
    }, []);

    const restoreWindow = useCallback((id: string) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: false, zIndex: ++zCounter } : w));
        setActiveWindowId(id);
    }, []);

    const focusWindow = useCallback((id: string) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: ++zCounter } : w));
        setActiveWindowId(id);
    }, []);

    const updateWindowPosition = useCallback((id: string, x: number, y: number) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, x, y } : w));
    }, []);

    const updateWindowSize = useCallback((id: string, width: number, height: number) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, width: Math.max(w.minWidth, width), height: Math.max(w.minHeight, height) } : w));
    }, []);

    const isAppOpen = useCallback((appId: string) => {
        return windows.some(w => w.appId === appId && w.isOpen);
    }, [windows]);

    const getWindowByAppId = useCallback((appId: string) => {
        return windows.find(w => w.appId === appId);
    }, [windows]);

    return (
        <WindowManagerContext.Provider value={{
            windows, activeWindowId, openApp, closeWindow, minimizeWindow,
            maximizeWindow, restoreWindow, focusWindow, updateWindowPosition,
            updateWindowSize, isAppOpen, getWindowByAppId,
        }}>
            {children}
        </WindowManagerContext.Provider>
    );
}

export function useWindowManager() {
    const ctx = useContext(WindowManagerContext);
    if (!ctx) throw new Error('useWindowManager must be used within WindowManagerProvider');
    return ctx;
}
