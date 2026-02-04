"use client";
import { useState } from 'react';
import { chatWithAi } from '@/services/productService';
import { getMedicineBadge, getVibrantColor } from '@/utils/placeholderUtils';

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', content: 'Hello! I am your AI Health Assistant. Describe your symptoms (e.g., "I feel tired and weak"), and I will suggest the best products for you.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Initialiaze TTS
    const stopSpeaking = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    const speakText = (text) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel(); // Stop any current speech

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 1;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Your browser does not support speech recognition. Please try Chrome.");
            return;
        }

        const recognition = new SpeechRecognition();
        // recognition.lang = 'en-US'; // Removed to allow browser default / multilingual capture
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            // Optionally auto-send if transcript is clear
        };

        recognition.start();
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const data = await chatWithAi(input);
            setMessages(prev => [...prev, {
                role: 'bot',
                content: data.response,
                products: data.suggestedProducts || []
            }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'bot', content: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            zIndex: 1000,
            maxWidth: 'calc(100vw - 3rem)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end'
        }}>
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        fontSize: '1.4rem',
                        boxShadow: '0 10px 25px -5px rgba(13, 148, 136, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        cursor: 'pointer'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
                >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        <path d="M8 10h.01"></path>
                        <path d="M12 10h.01"></path>
                        <path d="M16 10h.01"></path>
                    </svg>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="glass-morphism" style={{
                    width: '380px',
                    maxWidth: '85vw', // Responsive width
                    height: '550px',
                    maxHeight: '70vh', // Responsive height
                    borderRadius: '1.5rem',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    border: '1px solid var(--border)',
                    backgroundColor: 'white'
                }}>
                    {/* Header */}
                    <div style={{
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        padding: '1.2rem 1.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>HealthCare Assistant</h3>
                            <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>Online | Professional Guidance</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            {isSpeaking && (
                                <button
                                    onClick={stopSpeaking}
                                    style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        border: '1px solid rgba(255,255,255,0.3)',
                                        color: 'white',
                                        padding: '0.3rem 0.6rem',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        animation: 'pulse 1.5s infinite'
                                    }}
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                        <rect x="6" y="6" width="12" height="12"></rect>
                                    </svg>
                                    Stop Voice
                                </button>
                            )}
                            <button onClick={() => { stopSpeaking(); setIsOpen(false); }} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', display: 'flex' }}>×</button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {messages.map((msg, i) => (
                            <div key={i} style={{
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem',
                                maxWidth: '85%'
                            }}>
                                <div style={{
                                    backgroundColor: msg.role === 'user' ? 'var(--primary)' : '#f1f5f9',
                                    color: msg.role === 'user' ? 'white' : 'var(--foreground)',
                                    padding: '0.8rem 1rem',
                                    borderRadius: '1rem',
                                    fontSize: '0.9rem',
                                    lineHeight: '1.4',
                                    borderBottomRightRadius: msg.role === 'user' ? '0' : '1rem',
                                    borderBottomLeftRadius: msg.role === 'bot' ? '0' : '1rem',
                                    boxShadow: msg.role === 'bot' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                                        <span>{msg.content}</span>
                                        {msg.role === 'bot' && (
                                            <button
                                                onClick={() => speakText(msg.content)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: '2px',
                                                    color: 'inherit',
                                                    opacity: 0.6,
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}
                                                title="Read aloud"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Product Suggestions as Cards */}
                                {msg.role === 'bot' && msg.products && msg.products.length > 0 && (
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.6rem',
                                        marginTop: '0.2rem',
                                        width: '100%'
                                    }}>
                                        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', margin: '0 0.2rem' }}>Recommended Products:</p>
                                        <div style={{
                                            display: 'flex',
                                            overflowX: 'auto',
                                            gap: '0.8rem',
                                            paddingBottom: '0.5rem',
                                            paddingRight: '0.5rem',
                                            scrollbarWidth: 'none'
                                        }}>
                                            {msg.products.map((product, idx) => {
                                                const badgeText = getMedicineBadge(product.title);
                                                const badgeColor = getVibrantColor(product._id || product.title);
                                                return (
                                                    <div key={idx} className="glass-morphism" style={{
                                                        minWidth: '160px',
                                                        width: '160px',
                                                        backgroundColor: 'white',
                                                        borderRadius: '0.8rem',
                                                        padding: '0.8rem',
                                                        border: '1px solid var(--border)',
                                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                                    }}>
                                                        <div style={{
                                                            height: '80px',
                                                            backgroundColor: badgeColor,
                                                            borderRadius: '0.6rem',
                                                            marginBottom: '0.6rem',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '1.4rem',
                                                            fontWeight: 800,
                                                            color: 'var(--primary)',
                                                            border: '1px solid rgba(0,0,0,0.05)'
                                                        }}>
                                                            {badgeText}
                                                        </div>
                                                        <h4 style={{ fontSize: '0.85rem', margin: '0 0 0.3rem 0', fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {product.title}
                                                        </h4>
                                                        <p style={{ fontSize: '0.8rem', margin: '0 0 0.6rem 0', fontWeight: 600 }}>${product.price}</p>
                                                        <a href={`/products?id=${product._id}`} style={{
                                                            display: 'block',
                                                            textAlign: 'center',
                                                            backgroundColor: 'var(--primary)',
                                                            color: 'white',
                                                            padding: '0.4rem',
                                                            borderRadius: '0.4rem',
                                                            fontSize: '0.75rem',
                                                            textDecoration: 'none',
                                                            fontWeight: 600
                                                        }}>
                                                            View Product
                                                        </a>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className="typing-indicator">
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem', backgroundColor: '#f8fafc', alignItems: 'center' }}>
                        <button
                            type="button"
                            onClick={startListening}
                            style={{
                                padding: '0.6rem',
                                borderRadius: '0.8rem',
                                border: '1px solid var(--border)',
                                backgroundColor: isListening ? '#fee2e2' : 'white',
                                color: isListening ? '#ef4444' : '#64748b',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                animation: isListening ? 'pulse 1.5s infinite' : 'none'
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                <line x1="12" y1="19" x2="12" y2="23"></line>
                                <line x1="8" y1="23" x2="16" y2="23"></line>
                            </svg>
                        </button>
                        <input
                            type="text"
                            className="input-field"
                            placeholder={isListening ? "Listening..." : "Type health concern..."}
                            style={{ padding: '0.6rem 1rem', fontSize: '0.9rem', flex: 1 }}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1rem', borderRadius: '0.8rem' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
                            </svg>
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
