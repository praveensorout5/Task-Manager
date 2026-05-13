'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import styles from './team.module.css';

export default function TeamPage() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch('/api/projects');
        if (res.ok) {
          const data = await res.json();
          const projects = data.data || [];
          
          // Extract unique members across all projects
          const memberMap = new Map();
          projects.forEach(p => {
            p.members?.forEach(m => {
              if (!memberMap.has(m.userId)) {
                memberMap.set(m.userId, {
                  ...m.user,
                  role: m.role,
                  projects: [p.title],
                });
              } else {
                const existing = memberMap.get(m.userId);
                if (!existing.projects.includes(p.title)) {
                  existing.projects.push(p.title);
                }
              }
            });
          });
          setMembers(Array.from(memberMap.values()));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
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

  // Generate consistent colors for avatars
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
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          {members.length} team member{members.length !== 1 ? 's' : ''} across your projects
        </p>
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
              <span className={`badge ${member.role === 'ADMIN' ? 'badge-admin' : 'badge-member'}`}>
                {member.role}
              </span>
            </div>
            <div className={styles.cardBottom}>
              <span className={styles.projectLabel}>Projects</span>
              <div className={styles.projectTags}>
                {member.projects.map((p, i) => (
                  <span key={i} className={styles.projectTag}>{p}</span>
                ))}
              </div>
            </div>
          </div>
        ))}

        {members.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <span className="empty-state-icon">👥</span>
            <h4>No team members found</h4>
            <p>Join or create a project to see your team here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
