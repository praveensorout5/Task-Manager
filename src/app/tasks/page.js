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
  
  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

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
    setPage(1);
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

  // Pagination Logic
  const totalPages = Math.ceil(tasks.length / itemsPerPage);
  const paginatedTasks = tasks.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  if (loading) {
    return <div className="loading-text">Loading tasks...</div>;
  }

  return (
    <div className="fade-in">
      <div className={styles.filterBar}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input type="text" className="form-input" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} />
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

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {paginatedTasks.length > 0 ? (
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
                {paginatedTasks.map(task => (
                  <tr key={task.id} className={isOverdue(task) ? 'overdue-row' : ''}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{task.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{task.project?.title}</div>
                    </td>
                    <td>{task.project?.title}</td>
                    <td><span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span></td>
                    <td>
                      <select className={styles.statusSelect} value={task.status} onChange={e => updateStatus(task.id, e.target.value)}>
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                      </select>
                    </td>
                    <td>{task.assignedTo?.name || '—'}</td>
                    <td className={isOverdue(task) ? 'overdue' : ''}>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</td>
                    <td>
                      {(isAdmin || task.createdById === user?.id) && (
                        <button onClick={() => handleDelete(task.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state"><h4>No tasks found</h4></div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="btn btn-secondary btn-sm">Prev</button>
          <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="btn btn-secondary btn-sm">Next</button>
        </div>
      )}
    </div>
  );
}
