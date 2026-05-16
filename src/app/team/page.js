'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import styles from './team.module.css';

export default function TeamPage() {
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'MEMBER'
  });

  const fetchTeam = async () => {
    try {
      // If admin, fetch full user directory, otherwise fetch via projects
      const endpoint = isAdmin ? '/api/users' : '/api/projects';
      const res = await fetch(endpoint);
      
      if (res.ok) {
        const data = await res.json();
        
        if (isAdmin) {
          // Direct user directory
          setMembers(data.data.map(u => ({
            ...u,
            projects: [] // We could fetch projects per user but keeping it simple for now
          })));
        } else {
          // Extract unique members across all projects
          const projects = data.data || [];
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
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [isAdmin]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success('User created successfully!');
        setShowModal(false);
        setFormData({ name: '', email: '', password: '', role: 'MEMBER' });
        fetchTeam();
      } else {
        toast.error(data.message || 'Failed to create user');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setCreating(false);
    }
  };

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
            {members.length} team member{members.length !== 1 ? 's' : ''} in the system
          </p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowModal(true)} 
            className="btn btn-primary"
          >
            Add Team Member
          </button>
        )}
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
            {member.projects && member.projects.length > 0 && (
              <div className={styles.cardBottom}>
                <span className={styles.projectLabel}>Projects</span>
                <div className={styles.projectTags}>
                  {member.projects.map((p, i) => (
                    <span key={i} className={styles.projectTag}>{p}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {members.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <span className="empty-state-icon">👥</span>
            <h4>No team members found</h4>
            <p>Users will appear here once they are added to the system.</p>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Team Member</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. John Doe"
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
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Initial Password</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    required 
                    minLength={6}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">System Role</label>
                  <select 
                    className="form-input"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="MEMBER">Member (Standard Access)</option>
                    <option value="ADMIN">Admin (Full Control)</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
