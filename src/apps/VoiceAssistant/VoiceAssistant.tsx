'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import styles from '../../components/desktop/desktop.module.css';

export default function VoiceAssistant() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [history, setHistory] = useState<Array<{ text: string; time: string; action?: string }>>([]);
    const [response, setResponse] = useState('');
    const recognitionRef = useRef<any>(null);

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            setResponse('Speech recognition not supported in this browser.');
            return;
        }
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-IN';

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
            const text = Array.from(event.results).map((r: any) => r[0].transcript).join('');
            setTranscript(text);
        };
        recognition.onend = () => {
            setIsListening(false);
            if (transcript) processCommand(transcript);
        };
        recognition.onerror = () => setIsListening(false);

        recognitionRef.current = recognition;
        recognition.start();
    };

    const stopListening = () => {
        recognitionRef.current?.stop();
        setIsListening(false);
    };

    const processCommand = async (text: string) => {
        setHistory(prev => [{ text, time: new Date().toLocaleTimeString(), action: 'Processing…' }, ...prev]);
        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentType: 'chat',
                    messages: [{ role: 'user', content: `Voice command: "${text}". Respond concisely and suggest next action.` }],
                }),
            });
            const data = await res.json();
            setResponse(data.content);
            setHistory(prev => prev.map((h, i) => i === 0 ? { ...h, action: 'Completed' } : h));
        } catch {
            setResponse('Could not process voice command.');
        }
        setTranscript('');
    };

    return (
        <div className={styles.appContainer}>
            <div className={styles.appHeader}>
                <div className={styles.appTitle}>Voice Assistant</div>
                <div className="badge badge-blue">{isListening ? '🔴 Listening' : '⏸ Ready'}</div>
            </div>

            {/* Waveform */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                <motion.button
                    onClick={isListening ? stopListening : startListening}
                    style={{
                        width: 80, height: 80, borderRadius: '50%', border: 'none',
                        background: isListening ? 'linear-gradient(135deg, #f43f5e, #ef4444)' : 'linear-gradient(135deg, var(--accent-blue), #2563eb)',
                        color: 'white', fontSize: 28, cursor: 'pointer',
                        boxShadow: isListening ? '0 0 30px rgba(244,63,94,0.3)' : '0 0 20px rgba(59,130,246,0.2)',
                    }}
                    whileTap={{ scale: 0.95 }}
                    animate={isListening ? { scale: [1, 1.05, 1] } : {}}
                    transition={isListening ? { repeat: Infinity, duration: 1.5 } : {}}
                >
                    {isListening ? '⏹' : '🎤'}
                </motion.button>
            </div>

            {isListening && (
                <div className={styles.voiceWave}>
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className={styles.voiceBar} style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                </div>
            )}

            {transcript && (
                <div className={styles.card} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Live transcript</div>
                    <div style={{ fontSize: 14, fontStyle: 'italic' }}>{transcript}</div>
                </div>
            )}

            {response && (
                <motion.div className={styles.card} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 12, borderLeft: '3px solid var(--accent-blue)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>AI Response</div>
                    <div style={{ fontSize: 13, lineHeight: 1.6 }}>{response}</div>
                </motion.div>
            )}

            <div style={{ marginTop: 'auto' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 8 }}>Recent Commands</div>
                {history.map((h, i) => (
                    <div key={i} className={styles.listItem}>
                        <span style={{ fontSize: 16 }}>🎤</span>
                        <div className={styles.listItemContent}>
                            <div className={styles.listItemTitle}>{h.text}</div>
                            <div className={styles.listItemSub}>{h.time} · {h.action}</div>
                        </div>
                    </div>
                ))}
                {history.length === 0 && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyStateIcon}>🎙️</div>
                        <div className={styles.emptyStateText}>Tap the microphone to start</div>
                    </div>
                )}
            </div>
        </div>
    );
}
