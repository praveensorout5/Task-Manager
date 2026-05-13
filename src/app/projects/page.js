'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import styles from './projects.module.css';

export default function ProjectsPage() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Project created!');
        setShowModal(false);
        setNewProject({ title: '', description: '' });
        fetchProjects();
      } else {
        toast.error(data.message || 'Failed to create project');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setCreating(false);
    }
  };

  const filtered = projects.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="fade-in">
        <div className={styles.grid}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton skeleton-card" style={{ height: '180px' }}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className={styles.header}>
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className={styles.headerActions}>
          <input
            type="text"
            className="form-input"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '220px' }}
          />
          {isAdmin && (
            <button onClick={() => setShowModal(true)} className="btn btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New Project
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {filtered.map(project => {
          const totalTasks = project._count?.tasks || 0;
          const memberCount = project.members?.length || 0;

          return (
            <Link key={project.id} href={`/projects/${project.id}`} className={`${styles.projectCard} card-hover`}>
              <div className={styles.cardBody}>
                <div className={styles.cardTop}>
                  <div className={styles.projectIcon}>
                    {project.title.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className={styles.projectTitle}>{project.title}</h4>
                    <p className={styles.projectDesc}>{project.description || 'No description'}</p>
                  </div>
                </div>
              </div>
              <div className={styles.cardFooter}>
                <span className={styles.footerItem}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                  {totalTasks} tasks
                </span>
                <span className={styles.footerItem}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  {memberCount} members
                </span>
              </div>
            </Link>
          );
        })}

        {filtered.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <span className="empty-state-icon">📁</span>
            <h4>{search ? 'No projects match your search' : 'No projects yet'}</h4>
            <p>{isAdmin ? 'Create your first project to get started!' : 'Ask an admin to add you to a project.'}</p>
            {isAdmin && !search && (
              <button onClick={() => setShowModal(true)} className="btn btn-primary">Create Project</button>
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Project</h3>
              <p>Set up a new project for your team</p>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Project Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Website Redesign"
                    value={newProject.title}
                    onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description (optional)</label>
                  <textarea
                    className="form-input"
                    placeholder="What is this project about?"
                    value={newProject.description}
                    onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? <><span className="spinner"></span> Creating...</> : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
