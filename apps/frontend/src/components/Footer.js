"use client";
import Link from 'next/link';

export default function Footer() {
    return (
        <footer style={{
            backgroundColor: '#0f172a',
            color: '#94a3b8',
            padding: '2rem 0',
            marginTop: 'auto',
            width: '100%',
            overflow: 'hidden'
        }}>
            <div className="container" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem'
            }}>
                {/* Minimal Links */}
                <div style={{
                    display: 'flex',
                    gap: '2rem',
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                }}>
                    <Link href="/" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.9rem' }}>Home</Link>
                    <Link href="/products" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.9rem' }}>Products</Link>
                    <Link href="/login" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.9rem' }}>Login</Link>
                    <span style={{ color: '#cbd5e1', fontSize: '0.9rem', cursor: 'pointer' }}>Privacy</span>
                    <span style={{ color: '#cbd5e1', fontSize: '0.9rem', cursor: 'pointer' }}>Terms</span>
                </div>

                {/* Compact Bottom Bar */}
                <div style={{
                    paddingTop: '1.5rem',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    width: '100%',
                    textAlign: 'center',
                    fontSize: '0.85rem'
                }}>
                    <p>© {new Date().getFullYear()} HealthCare Portal. Built by Usama Naseem. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
