"use client";
import { useState, useEffect } from 'react';
import { fetchProducts, aiSearch } from '@/services/productService';
import { getCurrentUser } from '@/services/authService';
import { useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import styles from './products.module.css';

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [isAiMode, setIsAiMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [aiMessage, setAiMessage] = useState('');
    const router = useRouter();

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (search !== undefined) {
                // For AI mode, only auto-search if user has typed at least 5 words
                // For simple search, always auto-search
                const wordCount = search.trim().split(/\s+/).filter(word => word.length > 0).length;

                if (isAiMode) {
                    // AI mode: require at least 5 words before auto-triggering
                    if (wordCount >= 5) {
                        performSearch();
                    }
                } else {
                    // Simple search: always trigger
                    performSearch();
                }
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [search, isAiMode]);

    const [matchType, setMatchType] = useState('all');

    const performSearch = async () => {
        // Auth Check
        const currentUser = getCurrentUser();
        if (!currentUser) {
            router.push('/login');
            return;
        }

        setLoading(true);
        setAiMessage('');
        setMatchType('none');
        try {
            if (isAiMode && search.trim()) {
                const agentResponse = await aiSearch(search);
                if (agentResponse.response) {
                    setAiMessage(agentResponse.response);
                    setProducts(agentResponse.suggestedProducts || []);
                    setMatchType('semantic');
                } else if (Array.isArray(agentResponse)) {
                    setProducts(agentResponse);
                    setMatchType('related');
                } else {
                    const allData = await fetchProducts(undefined, isAiMode);
                    setProducts(allData);
                    setMatchType('all');
                }
            } else {
                // Pass isAiMode to fetchProducts
                const data = await fetchProducts(search, isAiMode);
                // The new backend response structure: { products, matchType, aiResponse }
                if (data && typeof data === 'object' && !Array.isArray(data)) {
                    setProducts(data.products || []);
                    setMatchType(data.matchType || 'none');
                    if (data.aiResponse) {
                        setAiMessage(data.aiResponse);
                    }
                } else {
                    setProducts(Array.isArray(data) ? data : []);
                    setMatchType('all');
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        performSearch();
    };

    return (
        <div className={`container ${styles.container}`} style={{ padding: '3rem 1rem' }}>
            <div className={styles.headerSection} style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 className={styles.pageTitle} style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
                    Premium <span style={{ color: 'var(--primary)' }}>Healthcare</span> Products
                </h1>
                <p className={styles.pageSubtitle} style={{ color: '#64748b', fontSize: '1.1rem' }}>Browse our curated collection or use AI to find exactly what you need.</p>
            </div>

            {/* Modern Search Bar Container */}
            <div className={styles.searchContainer} style={{ maxWidth: '800px', margin: '0 auto 4rem auto' }}>
                <form onSubmit={handleSearch} className={styles.searchForm} style={{
                    display: 'flex',
                    alignItems: 'stretch',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                    borderRadius: '1.2rem',
                    border: '2px solid var(--border)',
                    backgroundColor: 'white',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                }}>
                    {/* Search Icon */}
                    <div className={styles.searchIcon} style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 1.2rem',
                        color: 'var(--primary)',
                        backgroundColor: '#f8fafc'
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                    </div>

                    {/* Input Field */}
                    <input
                        type="text"
                        className={styles.searchInput}
                        style={{
                            flex: 1,
                            border: 'none',
                            outline: 'none',
                            padding: '1rem 1.2rem',
                            fontSize: '1rem',
                            fontFamily: 'Outfit, sans-serif',
                            backgroundColor: 'transparent'
                        }}
                        placeholder={isAiMode ? "🤖 Describe your symptoms or health needs..." : "Search for products..."}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    {/* AI Mode Toggle - Modern Pill */}
                    <div className={styles.searchControls} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.8rem',
                        padding: '0 1rem',
                        borderLeft: '1px solid var(--border)',
                        backgroundColor: '#f8fafc'
                    }}>
                        <button
                            type="button"
                            onClick={() => setIsAiMode(!isAiMode)}
                            className={styles.aiModeButton}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                borderRadius: '2rem',
                                border: isAiMode ? '2px solid var(--primary)' : '2px solid #e2e8f0',
                                backgroundColor: isAiMode ? 'var(--primary)' : 'white',
                                color: isAiMode ? 'white' : '#64748b',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"></path>
                            </svg>
                            AI Mode
                        </button>

                        {/* Search Button */}
                        <button
                            type="submit"
                            className={`btn-primary ${styles.searchButton}`}
                            style={{
                                padding: '0.7rem 1.5rem',
                                borderRadius: '0.8rem',
                                fontSize: '0.9rem',
                                fontWeight: 600
                            }}
                        >
                            Search
                        </button>
                    </div>
                </form>
            </div>

            {/* AI Message - Stabilized with fixed area if active */}
            <div style={{ minHeight: aiMessage ? '100px' : '0', transition: 'min-height 0.3s ease' }}>
                {aiMessage && (
                    <div className={`fade-in ${styles.aiMessageContainer}`} style={{ maxWidth: '800px', margin: '0 auto 2rem auto', padding: '1.5rem', backgroundColor: 'var(--accent)', borderRadius: '1rem', border: '1px solid var(--primary)' }}>
                        <p style={{ margin: 0, color: 'var(--foreground)' }}><strong>AI Assistant:</strong> {aiMessage}</p>
                    </div>
                )}
            </div>

            <div style={{ minHeight: '500px' }}> {/* Container to prevent layout collapse */}
                {loading ? (
                    <div className={styles.loadingContainer} style={{ textAlign: 'center', padding: '4rem' }}>
                        <div className="typing-indicator" style={{ justifyContent: 'center' }}>
                            <div className="typing-dot"></div>
                            <div className="typing-dot"></div>
                            <div className="typing-dot"></div>
                        </div>
                        <p style={{ marginTop: '1rem', color: '#64748b' }}>Searching catalog...</p>
                    </div>
                ) : (
                    <div className="fade-in">
                        {/* Result Type Label */}
                        {search && products.length > 0 && (
                            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <span style={{
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    backgroundColor: matchType === 'exact' ? '#dcfce7' : matchType === 'related' ? '#f1f5f9' : '#f0fdfa',
                                    color: matchType === 'exact' ? '#166534' : matchType === 'related' ? '#475569' : '#0d9488',
                                    border: `1px solid ${matchType === 'exact' ? '#bbf7d0' : matchType === 'related' ? '#e2e8f0' : '#b9f6f2'}`
                                }}>
                                    {matchType === 'exact' ? 'Exact Match' : matchType === 'related' ? 'Related Products' : 'AI Recommendation'}
                                </span>
                                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                    Found {products.length} {products.length === 1 ? 'product' : 'products'}
                                </span>
                            </div>
                        )}

                        <div className={styles.productGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                            {products.map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                        {products.length === 0 && search && (
                            <div className={styles.noProductsMessage} style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔎</div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '0.5rem' }}>No products found</h3>
                                <p>We couldn't find any products matching your query. Try describing your symptoms or using different keywords.</p>
                            </div>
                        )}
                        {products.length === 0 && !search && (
                            <div className={styles.noProductsMessage} style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                                Start searching to find products.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Remaining page content */}
        </div>
    );
}
