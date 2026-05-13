'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import styles from '../login/auth.module.css';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'MEMBER',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const result = await signup(formData);
    if (result.success) {
      toast.success('Account created! Please sign in.');
      router.push('/login');
    } else {
      setError(result.message || 'Signup failed');
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
          <p className={styles.authTagline}>Start managing your projects like a pro.</p>
          <div className={styles.authFeatures}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>🚀</span>
              <span>Get started in seconds</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>📁</span>
              <span>Unlimited projects</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>🎯</span>
              <span>Track every task</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>📈</span>
              <span>Analytics & insights</span>
            </div>
          </div>
        </div>

        <div className={styles.authRight}>
          <div className={styles.authCard}>
            <div className={styles.authHeader}>
              <h2>Create account</h2>
              <p>Fill in your details to get started</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.authForm}>
              <div className="form-group">
                <label className="form-label" htmlFor="signup-name">Full Name</label>
                <input
                  id="signup-name"
                  name="name"
                  type="text"
                  className="form-input"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-email">Email Address</label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-password">Password</label>
                <input
                  id="signup-password"
                  name="password"
                  type="password"
                  className="form-input"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-role">Role</label>
                <select
                  id="signup-role"
                  name="role"
                  className="form-input"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              {error && <p className="form-error">{error}</p>}

              <button type="submit" className={styles.authSubmit} disabled={loading}>
                {loading ? <span className="spinner"></span> : null}
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div className={styles.authFooter}>
              <p>Already have an account? <Link href="/login">Sign in</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
