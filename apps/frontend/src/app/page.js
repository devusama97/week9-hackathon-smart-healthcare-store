"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/services/authService';
import styles from './home.module.css';

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  return (
    <div className={`container ${styles.homeContainer}`} style={{ padding: '6rem 1rem', textAlign: 'center' }}>
      <div className={`glass-morphism slide-up ${styles.heroSection}`} style={{
        padding: '3rem 2rem 5rem 2rem',
        borderRadius: '2rem',
        boxShadow: 'var(--card-shadow)',
        marginBottom: '4rem',
        background: 'linear-gradient(135deg, white 0%, var(--accent) 100%)'
      }}>
        <h1 className={styles.heroTitle} style={{ fontSize: '2.8rem', fontWeight: 900, marginBottom: '1.5rem', lineHeight: 1.2 }}>
          Your Health, Supported by <br />
          <span style={{ color: 'var(--primary)' }}>Artificial Intelligence</span>
        </h1>
        <p className={styles.heroDescription} style={{ fontSize: '1.1rem', color: '#475569', maxWidth: '700px', margin: '0 auto 3rem auto' }}>
          Discover professional healthcare products tailored to your needs. Use our AI-powered search to find exactly what helps your symptoms.
        </p>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
          <Link href="/products" className="btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}>
            Browse Products
          </Link>
          {!user && (
            <Link href="/signup" style={{
              padding: '1rem 2.5rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--primary)',
              color: 'var(--primary)',
              fontWeight: 600
            }}>
              Create Account
            </Link>
          )}
        </div>
      </div>

      <div className={styles.featureGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', textAlign: 'left' }}>
        {[
          {
            icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>,
            title: 'Smart Search',
            desc: 'Find products by describing your needs, not just names.'
          },
          {
            icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>,
            title: 'Expert Advice',
            desc: 'Our AI assistant provides professional product guidance 24/7.'
          },
          {
            icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>,
            title: 'Fast Delivery',
            desc: 'Get your healthcare essentials delivered to your doorstep quickly.'
          }
        ].map((feature, i) => (
          <div key={i} className="glass-morphism" style={{ padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
            <div style={{ marginBottom: '1rem' }}>{feature.icon}</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>{feature.title}</h3>
            <p style={{ color: '#64748b' }}>{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
