'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './login/auth.module.css';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className={styles.authPage} style={{ background: 'var(--bg-primary)' }}>
      <div className={styles.authContainer} style={{ maxWidth: '1100px', border: 'none', boxShadow: 'none', background: 'transparent' }}>
        <div className={styles.authLeft} style={{ borderRadius: 'var(--radius-2xl)', marginRight: '2rem' }}>
          <div className={styles.authBrand}>
            <div className={styles.brandLogo}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <h1>TaskFlow</h1>
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: '1.2', marginBottom: '1.5rem' }}>
            The smartest way to manage your team tasks.
          </h2>
          <p className={styles.authTagline} style={{ fontSize: '1.25rem', marginBottom: '3rem' }}>
            Streamline your workflow, collaborate in real-time, and ship faster with our intuitive Kanban-powered platform.
          </p>
          
          <div className={styles.authFeatures} style={{ marginBottom: '3rem' }}>
            <div className={styles.feature}><span className={styles.featureIcon}>✅</span><span>Simple & Intuitive Kanban Boards</span></div>
            <div className={styles.feature}><span className={styles.featureIcon}>👥</span><span>Role-based Team Management</span></div>
            <div className={styles.feature}><span className={styles.featureIcon}>📈</span><span>Real-time Activity Logs</span></div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/signup" className="btn btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem', background: 'white', color: 'var(--primary)', border: 'none' }}>
              Get Started for Free
            </Link>
            <Link href="/login" className="btn btn-secondary" style={{ padding: '0.875rem 2rem', fontSize: '1rem', borderColor: 'rgba(255,255,255,0.4)', color: 'white' }}>
              Sign In
            </Link>
          </div>
        </div>

        <div className={styles.authRight} style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-2xl)', border: '1px solid var(--border-color)', padding: '0' }}>
          <div style={{ width: '100%', height: '100%', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent-light)', position: 'relative', overflow: 'hidden' }}>
             {/* Abstract UI representation */}
             <div style={{ width: '80%', height: '70%', background: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', padding: '1.5rem', transform: 'rotate(-2deg)' }}>
                <div style={{ height: '20px', width: '40%', background: 'var(--border-color)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}></div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{ flex: 1, height: '150px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '0.75rem' }}>
                       <div style={{ height: '12px', width: '60%', background: 'var(--border-color)', borderRadius: 'var(--radius-xs)', marginBottom: '1rem' }}></div>
                       <div style={{ height: '40px', width: '100%', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem' }}></div>
                       <div style={{ height: '40px', width: '100%', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}></div>
                    </div>
                  ))}
                </div>
             </div>
             {/* Decorative dots */}
             <div style={{ position: 'absolute', top: '10%', right: '10%', width: '100px', height: '100px', background: 'radial-gradient(circle, var(--primary) 2px, transparent 0)', backgroundSize: '15px 15px', opacity: '0.2' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
