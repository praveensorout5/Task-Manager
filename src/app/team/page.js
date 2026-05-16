'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import styles from './team.module.css';

export default function TeamPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTeam = async () => {
    try {
      // Fetch full system user directory
      const res = await fetch('/api/users');
      
      if (res.ok) {
        const data = await res.json();
        setMembers(data.data || []);
      } else {
        toast.error('Failed to load team members');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while loading the team');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  if (loading) {
    return (
      <div className="fade-in">
        <div className={styles.grid}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton skeleton-card" style={{ height: '200px' }}></div>
          ))}
        </div>
      </div>
    );
  }

  const colors = [
    'linear-gradient(135deg, #6366f1, #8b5cf6)',
    'linear-gradient(135deg, #3b82f6, #06b6d4)',
    'linear-gradient(135deg, #10b981, #059669)',
    'linear-gradient(135deg, #f59e0b, #d97706)',
    'linear-gradient(135deg, #ef4444, #dc2626)',
    'linear-gradient(135deg, #ec4899, #db2777)',
  ];

  return (
    <div className="fade-in">
      <div className={styles.headerSection}>
        <div>
          <h2 className="section-title">Team Directory</h2>
          <p className={styles.headerSubtitle}>
            {members.length} team member{members.length !== 1 ? 's' : ''} currently in TaskFlow
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        {members.map((member, idx) => (
          <div key={member.id} className={`card ${styles.memberCard}`}>
            <div className={styles.cardTop}>
              <div
                className={`avatar avatar-xl ${styles.memberAvatar}`}
                style={{ background: colors[idx % colors.length] }}
              >
                {member.name?.charAt(0) || 'U'}
              </div>
              <h4 className={styles.memberName}>{member.name}</h4>
              <p className={styles.memberEmail}>{member.email}</p>
              <div className={styles.roleWrapper}>
                <span className={`badge ${member.role === 'ADMIN' ? 'badge-admin' : 'badge-member'}`}>
                  {member.role}
                </span>
                {member.id === user?.id && <span className={styles.meTag}> (You)</span>}
              </div>
            </div>
            
            {/* Project info could be added back later if needed via a separate API call */}
            <div className={styles.cardBottom}>
              <p className={styles.memberSince}>
                Member since {new Date(member.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}

        {members.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <span className="empty-state-icon">👥</span>
            <h4>No users found</h4>
            <p>New members will appear here as soon as they create an account.</p>
          </div>
        )}
      </div>
    </div>
  );
}
