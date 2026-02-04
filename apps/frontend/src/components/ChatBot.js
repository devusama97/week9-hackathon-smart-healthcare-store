"use client";
import { useState } from 'react';
import { chatWithAi } from '@/services/productService';
import { getMedicineBadge, getVibrantColor } from '@/utils/placeholderUtils';

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', content: 'Hello! I am your HealthCare assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

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
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000 }}>
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        fontSize: '1.5rem',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.2s',
                        cursor: 'pointer'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    💬
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="glass-morphism" style={{
                    width: '380px',
                    height: '550px',
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
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
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
                                    {msg.content}
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
                    <form onSubmit={handleSend} style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem', backgroundColor: '#f8fafc' }}>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Type health concern..."
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
