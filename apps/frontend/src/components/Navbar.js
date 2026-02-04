"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logout } from '@/services/authService';

export default function Navbar() {
    const [user, setUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check for user on mount and every few seconds to stay in sync
        const checkUser = () => {
            const currentUser = getCurrentUser();
            setUser(currentUser);
        };
        checkUser();
        const interval = setInterval(checkUser, 2000);

        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (!event.target.closest('.user-menu-container')) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            clearInterval(interval);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        setUser(null);
        setMenuOpen(false);
        router.push('/login');
    };

    return (
        <nav className="glass-morphism" style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            padding: '1.2rem 0',
            borderBottom: '2px solid var(--border)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            backdropFilter: 'blur(20px)'
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Modern Logo */}
                <Link href="/" style={{
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.7rem',
                    transition: 'transform 0.2s ease'
                }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <div style={{
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
                        color: 'white',
                        padding: '0.5rem 0.8rem',
                        borderRadius: '0.7rem',
                        boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                        </svg>
                    </div>
                    <span style={{ letterSpacing: '-0.5px' }}>HealthCare</span>
                </Link>

                {/* Hamburger Menu Button - Mobile/Tablet Only */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    style={{
                        display: 'none',
                        flexDirection: 'column',
                        gap: '4px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        zIndex: 101
                    }}
                    className="hamburger-btn"
                >
                    <span style={{
                        width: '24px',
                        height: '3px',
                        backgroundColor: 'var(--primary)',
                        borderRadius: '2px',
                        transition: 'all 0.3s ease',
                        transform: menuOpen ? 'rotate(45deg) translateY(7px)' : 'none'
                    }}></span>
                    <span style={{
                        width: '24px',
                        height: '3px',
                        backgroundColor: 'var(--primary)',
                        borderRadius: '2px',
                        transition: 'all 0.3s ease',
                        opacity: menuOpen ? 0 : 1
                    }}></span>
                    <span style={{
                        width: '24px',
                        height: '3px',
                        backgroundColor: 'var(--primary)',
                        borderRadius: '2px',
                        transition: 'all 0.3s ease',
                        transform: menuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none'
                    }}></span>
                </button>

                {/* Navigation Links - Desktop */}
                <div className="nav-links-desktop" style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
                    <Link
                        href="/products"
                        style={{
                            fontWeight: 600,
                            fontSize: '1rem',
                            color: 'var(--foreground)',
                            position: 'relative',
                            transition: 'color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--foreground)'}
                    >
                        Products
                    </Link>

                    {user ? (
                        <div className="user-menu-container" style={{ position: 'relative' }}>
                            {/* User Icon Trigger */}
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--accent)',
                                    color: 'var(--primary)',
                                    border: '1px solid var(--primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                                    zIndex: 101
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--primary)';
                                    e.currentTarget.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                    if (!showDropdown) {
                                        e.currentTarget.style.backgroundColor = 'var(--accent)';
                                        e.currentTarget.style.color = 'var(--primary)';
                                    }
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {showDropdown && (
                                <div style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 12px)',
                                    right: 0,
                                    width: '200px',
                                    backgroundColor: 'white',
                                    borderRadius: '1rem',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                                    border: '1px solid var(--border)',
                                    padding: '0.8rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.5rem',
                                    animation: 'slideDown 0.2s ease forwards',
                                    zIndex: 1000
                                }}>
                                    <div style={{
                                        padding: '0.5rem 0.8rem',
                                        borderBottom: '1px solid var(--border)',
                                        marginBottom: '0.5rem'
                                    }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--foreground)' }}>
                                            {user.name || 'User'}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {user.email || ''}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleLogout}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.8rem',
                                            padding: '0.7rem 0.8rem',
                                            width: '100%',
                                            borderRadius: '0.6rem',
                                            border: 'none',
                                            backgroundColor: 'transparent',
                                            color: '#ef4444',
                                            fontWeight: 600,
                                            fontSize: '0.9rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            textAlign: 'left'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#fef2f2';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                            <polyline points="16 17 21 12 16 7"></polyline>
                                            <line x1="21" y1="12" x2="9" y2="12"></line>
                                        </svg>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="btn-primary"
                            style={{
                                padding: '0.6rem 1.5rem',
                                borderRadius: '0.8rem',
                                fontSize: '0.9rem',
                                fontWeight: 600
                            }}
                        >
                            Login
                        </Link>
                    )}
                </div>

                {/* Mobile Menu */}
                <div
                    className="nav-links-mobile"
                    style={{
                        display: 'none',
                        position: 'fixed',
                        top: '70px',
                        right: menuOpen ? '0' : '-100%',
                        width: '280px',
                        height: 'calc(100vh - 70px)',
                        backgroundColor: 'var(--background)',
                        boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
                        padding: '2rem 1.5rem',
                        flexDirection: 'column',
                        gap: '1.5rem',
                        transition: 'right 0.3s ease',
                        zIndex: 99,
                        borderLeft: '2px solid var(--border)'
                    }}
                >
                    <Link
                        href="/products"
                        onClick={() => setMenuOpen(false)}
                        style={{
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            color: 'var(--foreground)',
                            padding: '0.8rem',
                            borderRadius: '0.5rem',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--accent)';
                            e.currentTarget.style.color = 'var(--primary)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--foreground)';
                        }}
                    >
                        Products
                    </Link>

                    {user ? (
                        <>
                            {/* User Info */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.8rem',
                                padding: '1rem',
                                backgroundColor: 'var(--accent)',
                                borderRadius: '0.8rem',
                                border: '1px solid var(--primary)'
                            }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--primary)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1rem',
                                    fontWeight: 700
                                }}>
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div>
                                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--primary)' }}>
                                        {user.name || 'User'}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                        {user.email || ''}
                                    </div>
                                </div>
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                style={{
                                    padding: '0.8rem 1.5rem',
                                    borderRadius: '0.8rem',
                                    border: '2px solid var(--primary)',
                                    backgroundColor: 'var(--primary)',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    fontFamily: 'Outfit, sans-serif',
                                    width: '100%'
                                }}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            onClick={() => setMenuOpen(false)}
                            className="btn-primary"
                            style={{
                                padding: '0.8rem 1.5rem',
                                borderRadius: '0.8rem',
                                fontSize: '1rem',
                                fontWeight: 600,
                                textAlign: 'center',
                                width: '100%'
                            }}
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>

            {/* Overlay for mobile menu */}
            {menuOpen && (
                <div
                    onClick={() => setMenuOpen(false)}
                    style={{
                        display: 'none',
                        position: 'fixed',
                        top: '70px',
                        left: 0,
                        width: '100%',
                        height: 'calc(100vh - 70px)',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        zIndex: 98
                    }}
                    className="mobile-overlay"
                ></div>
            )}

            <style jsx>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @media (max-width: 768px) {
                    .hamburger-btn {
                        display: flex !important;
                    }
                    .nav-links-desktop {
                        display: none !important;
                    }
                    .nav-links-mobile {
                        display: flex !important;
                    }
                    .mobile-overlay {
                        display: block !important;
                    }
                }
            `}</style>
        </nav>
    );
}
