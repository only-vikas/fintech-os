'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from '../../components/desktop/desktop.module.css';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

const SUGGESTIONS = [
    '💡 How can I save more?',
    '📊 Analyze my spending',
    '🎯 Set a budget goal',
    '🔍 Decode a transaction',
    '📈 Investment advice',
    '💰 Reduce expenses',
];

const AGENTS = [
    { id: 'chat', label: '🤖 General', model: 'gemma-3-27b' },
    { id: 'mentor', label: '🧑‍🏫 Mentor', model: 'qwen-235b' },
    { id: 'expense', label: '💰 Expense', model: 'qwen-80b' },
    { id: 'investment', label: '📈 Investment', model: 'qwen-80b' },
];

export default function Chatbot() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'assistant', content: 'Welcome to Fintech OS AI! 👋 I can help with expenses, budgets, investments, and decoding transactions. How can I assist you?' },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [agent, setAgent] = useState('chat');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(() => { scrollToBottom(); }, [messages]);

    const sendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;
        const userMsg: ChatMessage = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentType: agent,
                    messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
                }),
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.content || 'Sorry, I could not process that.' }]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }]);
        }
        setIsLoading(false);
    };

    return (
        <div className={styles.chatContainer}>
            {/* Agent selector */}
            <div className={styles.chipRow} style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: 10 }}>
                {AGENTS.map(a => (
                    <button key={a.id} className={styles.chip} onClick={() => setAgent(a.id)} style={agent === a.id ? { borderColor: 'var(--accent-blue)', color: 'var(--accent-blue)', background: 'rgba(59,130,246,0.08)' } : {}}>
                        {a.label}
                    </button>
                ))}
            </div>

            {/* Messages */}
            <div className={styles.chatMessages}>
                {messages.map((m, i) => (
                    <motion.div
                        key={i}
                        className={`${styles.chatMessage} ${m.role === 'user' ? styles.chatMessageUser : styles.chatMessageAi}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {m.content}
                    </motion.div>
                ))}
                {isLoading && (
                    <div className={`${styles.chatMessage} ${styles.chatMessageAi}`}>
                        <div className={styles.loading}>
                            <div className={styles.loadingDot} />
                            <div className={styles.loadingDot} />
                            <div className={styles.loadingDot} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggestions - Tap to Act */}
            {messages.length <= 2 && (
                <div className={styles.chipRow}>
                    {SUGGESTIONS.map(s => (
                        <button key={s} className={styles.chip} onClick={() => sendMessage(s)}>{s}</button>
                    ))}
                </div>
            )}

            {/* Input */}
            <div className={styles.chatInputRow}>
                <input
                    className={`input ${styles.chatInput}`}
                    placeholder="Ask anything about your finances…"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                />
                <button className="btn btn-primary" onClick={() => sendMessage(input)} disabled={isLoading}>Send</button>
            </div>
        </div>
    );
}
