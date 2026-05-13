'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import styles from './profile.module.css';

export default function ProfilePage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  if (authLoading || !user) {
    return <div className="loading-text">Loading profile...</div>;
  }

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Profile updated successfully');
        setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
        refreshUser();
      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setUpdating(false);
    }
  };

  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fade-in">
      <div className={styles.profileContainer}>
        {/* Profile Card */}
        <div className={`card ${styles.profileCard}`}>
          <div className={styles.profileHeader}>
            <div
              className={`avatar ${styles.profileAvatar}`}
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              {user.name?.charAt(0) || 'U'}
            </div>
            <div className={styles.profileInfo}>
              <h3>{user.name}</h3>
              <p className={styles.profileEmail}>{user.email}</p>
              <span className={`badge ${user.role === 'ADMIN' ? 'badge-admin' : 'badge-member'}`}>
                {user.role}
              </span>
            </div>
          </div>

          <form onSubmit={handleUpdate} className={styles.profileForm}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <hr className={styles.separator} />
            <h4 className={styles.subHeading}>Change Password</h4>
            <p className={styles.subText}>Leave blank to keep current password</p>

            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Required for password change"
                value={formData.currentPassword}
                onChange={e => setFormData({ ...formData, currentPassword: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Min 6 characters"
                value={formData.newPassword}
                onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
              />
            </div>

            <div className={styles.formFooter}>
              <button type="submit" className="btn btn-primary" disabled={updating}>
                {updating ? <><span className="spinner"></span> Saving...</> : 'Save Changes'}
              </button>
            </div>
          </form>

          <div className={styles.profileMeta}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Member Since</span>
              <span className={styles.detailValue}>{joinDate}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>User ID</span>
              <span className={styles.detailValue} style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{user.id}</span>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className={`card ${styles.infoCard}`}>
          <h4>About TaskFlow</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem', lineHeight: 1.6 }}>
            TaskFlow is a premium team task management application built with Next.js, Prisma, and SQLite. 
            Optimized for performance and premium aesthetics.
          </p>
          <div className={styles.techStack}>
            <span className={styles.techBadge}>Next.js 15</span>
            <span className={styles.techBadge}>Prisma</span>
            <span className={styles.techBadge}>SQLite</span>
            <span className={styles.techBadge}>JWT Auth</span>
          </div>
        </div>
      </div>
    </div>
  );
}
