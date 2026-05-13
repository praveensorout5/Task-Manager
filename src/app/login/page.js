'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './auth.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password);
    if (!result.success) {
      setError(result.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <div className={styles.authLeft}>
          <div className={styles.authBrand}>
            <div className={styles.brandLogo}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <h1>TaskFlow</h1>
          </div>
          <p className={styles.authTagline}>Manage your team&apos;s work with clarity and speed.</p>
          <div className={styles.authFeatures}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>📊</span>
              <span>Real-time dashboards</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>📋</span>
              <span>Kanban task boards</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>👥</span>
              <span>Team collaboration</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>🔒</span>
              <span>Role-based access</span>
            </div>
          </div>
        </div>

        <div className={styles.authRight}>
          <div className={styles.authCard}>
            <div className={styles.authHeader}>
              <h2>Welcome back</h2>
              <p>Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.authForm}>
              <div className="form-group">
                <label className="form-label" htmlFor="login-email">Email Address</label>
                <input
                  id="login-email"
                  type="email"
                  className="form-input"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <p className="form-error">{error}</p>}

              <button type="submit" className={styles.authSubmit} disabled={loading}>
                {loading ? <span className="spinner"></span> : null}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className={styles.authFooter}>
              <p>Don&apos;t have an account? <Link href="/signup">Create one</Link></p>
            </div>

            <div className={styles.demoCredentials}>
              <p className={styles.demoTitle}>Demo Credentials</p>
              <div className={styles.demoGrid}>
                <button type="button" className={styles.demoBtn} onClick={() => { setEmail('admin@test.com'); setPassword('Admin123@'); }}>
                  <strong>Admin</strong>
                  <span>admin@test.com</span>
                </button>
                <button type="button" className={styles.demoBtn} onClick={() => { setEmail('member@test.com'); setPassword('Member123@'); }}>
                  <strong>Member</strong>
                  <span>member@test.com</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
