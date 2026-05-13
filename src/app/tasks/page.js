'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import styles from './tasks.module.css';

export default function TasksPage() {
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (priorityFilter !== 'ALL') params.set('priority', priorityFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/tasks?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, [statusFilter, priorityFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchTasks();
  };

  const updateStatus = async (taskId, status) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success('Status updated');
        fetchTasks();
      } else {
        const data = await res.json();
        toast.error(data.message);
      }
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Task deleted');
        fetchTasks();
      } else {
        const data = await res.json();
        toast.error(data.message);
      }
    } catch {
      toast.error('Failed to delete');
    }
  };

  const isOverdue = (task) => task.status !== 'DONE' && task.dueDate && new Date(task.dueDate) < new Date();

  if (loading) {
    return (
      <div className="fade-in">
        <div className="card">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton skeleton-text" style={{ height: '48px', marginBottom: '0.5rem' }}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Filters */}
      <div className={styles.filterBar}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            className="form-input"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary btn-sm">Search</button>
        </form>
        <div className={styles.filters}>
          <select className="form-input" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setLoading(true); }}>
            <option value="ALL">All Status</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
          <select className="form-input" value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setLoading(true); }}>
            <option value="ALL">All Priority</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <p className={styles.resultCount}>{tasks.length} task{tasks.length !== 1 ? 's' : ''} found</p>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {tasks.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Project</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assignee</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id} className={isOverdue(task) ? 'overdue-row' : ''}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600 }}>{task.title}</div>
                        {task.description && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.125rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {task.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{task.project?.title}</td>
                    <td><span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span></td>
                    <td>
                      <select
                        className={styles.statusSelect}
                        value={task.status}
                        onChange={e => updateStatus(task.id, e.target.value)}
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                      </select>
                    </td>
                    <td>
                      {task.assignedTo ? (
                        <div className={styles.assigneeCell}>
                          <div className="avatar avatar-sm" style={{ background: 'var(--accent-gradient)', color: 'white' }}>
                            {task.assignedTo.name?.charAt(0)}
                          </div>
                          <span>{task.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-tertiary)' }}>—</span>
                      )}
                    </td>
                    <td className={isOverdue(task) ? 'overdue' : ''}>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                      {isOverdue(task) && <span style={{ fontSize: '0.6875rem', display: 'block', marginTop: '0.125rem' }}>Overdue</span>}
                    </td>
                    <td>
                      {(isAdmin || task.createdById === user?.id) && (
                        <button onClick={() => handleDelete(task.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">✅</span>
            <h4>No tasks found</h4>
            <p>Try adjusting your filters or create a new task from a project.</p>
          </div>
        )}
      </div>
    </div>
  );
}
