'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import styles from './detail.module.css';

export default function ProjectDetailPage({ params }) {
  const { id } = use(params);
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', dueDate: '', assignedToId: '' });
  const [memberEmail, setMemberEmail] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data.data);
      } else {
        toast.error('Project not found');
        router.push('/projects');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProject(); }, [id]);

  const isProjectAdmin = () => {
    if (isAdmin) return true;
    const member = project?.members?.find(m => m.userId === user?.id);
    return member?.role === 'ADMIN' || project?.createdById === user?.id;
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTask, projectId: id }),
      });
      if (res.ok) {
        toast.success('Task created!');
        setShowTaskModal(false);
        setNewTask({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', dueDate: '', assignedToId: '' });
        fetchProject();
      } else {
        const data = await res.json();
        toast.error(data.message);
      }
    } catch {
      toast.error('Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/projects/${id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: memberEmail, role: 'MEMBER' }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Member added!');
        setMemberEmail('');
        fetchProject();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Failed to add member');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Remove this member?')) return;
    try {
      const res = await fetch(`/api/projects/${id}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      });
      if (res.ok) {
        toast.success('Member removed');
        fetchProject();
      } else {
        const data = await res.json();
        toast.error(data.message);
      }
    } catch {
      toast.error('Failed to remove member');
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchProject();
      } else {
        const data = await res.json();
        toast.error(data.message);
      }
    } catch {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Task deleted');
        fetchProject();
      } else {
        const data = await res.json();
        toast.error(data.message);
      }
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('Delete this entire project? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Project deleted');
        router.push('/projects');
      } else {
        const data = await res.json();
        toast.error(data.message);
      }
    } catch {
      toast.error('Failed to delete project');
    }
  };

  if (loading) {
    return (
      <div className="fade-in">
        <div className="skeleton skeleton-heading" style={{ width: '200px' }}></div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton skeleton-card" style={{ flex: 1, height: '400px' }}></div>
          ))}
        </div>
      </div>
    );
  }

  if (!project) return <div className="loading-text">Project not found.</div>;

  const columns = [
    { key: 'TODO', label: 'To Do', color: 'var(--text-secondary)' },
    { key: 'IN_PROGRESS', label: 'In Progress', color: 'var(--info)' },
    { key: 'DONE', label: 'Done', color: 'var(--success)' },
  ];

  const isOverdue = (task) => {
    return task.status !== 'DONE' && task.dueDate && new Date(task.dueDate) < new Date();
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className={styles.projectHeader}>
        <div>
          <h3 className={styles.projectTitle}>{project.title}</h3>
          {project.description && (
            <p className={styles.projectDesc}>{project.description}</p>
          )}
        </div>
        <div className={styles.headerActions}>
          <button onClick={() => setShowMemberModal(true)} className="btn btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            Members ({project.members?.length})
          </button>
          <button onClick={() => setShowTaskModal(true)} className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Task
          </button>
          {isProjectAdmin() && (
            <button onClick={handleDeleteProject} className="btn btn-danger btn-sm">Delete</button>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className={styles.board}>
        {columns.map(column => {
          const tasks = project.tasks?.filter(t => t.status === column.key) || [];
          return (
            <div key={column.key} className={styles.column}>
              <div className={styles.columnHeader}>
                <div className={styles.columnTitle}>
                  <span className={styles.columnDot} style={{ background: column.color }}></span>
                  <h4>{column.label}</h4>
                </div>
                <span className={styles.columnCount}>{tasks.length}</span>
              </div>
              <div className={styles.taskList}>
                {tasks.map(task => (
                  <div key={task.id} className={`${styles.taskCard} ${isOverdue(task) ? styles.taskOverdue : ''}`}>
                    <div className={styles.taskTop}>
                      <span className={styles.taskTitle}>{task.title}</span>
                      {isProjectAdmin() && (
                        <button onClick={() => handleDeleteTask(task.id)} className={styles.deleteBtn} title="Delete">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      )}
                    </div>
                    {task.description && (
                      <p className={styles.taskDesc}>{task.description}</p>
                    )}
                    <div className={styles.taskMeta}>
                      <span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span>
                      {task.dueDate && (
                        <span className={`${styles.taskDue} ${isOverdue(task) ? 'overdue' : ''}`}>
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {task.assignedTo && (
                      <div className={styles.taskAssignee}>
                        <div className={`avatar avatar-sm ${styles.assigneeAvatar}`}>
                          {task.assignedTo.name?.charAt(0)}
                        </div>
                        <span>{task.assignedTo.name}</span>
                      </div>
                    )}
                    <div className={styles.taskActions}>
                      {column.key !== 'TODO' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, column.key === 'DONE' ? 'IN_PROGRESS' : 'TODO')}
                          className={styles.moveBtn}
                          title="Move left"
                        >
                          ←
                        </button>
                      )}
                      {column.key !== 'DONE' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, column.key === 'TODO' ? 'IN_PROGRESS' : 'DONE')}
                          className={styles.moveBtn}
                          title="Move right"
                        >
                          →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <div className={styles.emptyColumn}>No tasks</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Task</h3>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input type="text" className="form-input" placeholder="Task title" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} required autoFocus />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" placeholder="Task description" value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} rows={3} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-input" value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-input" value={newTask.status} onChange={e => setNewTask({ ...newTask, status: e.target.value })}>
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input type="date" className="form-input" value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Assign To</label>
                  <select className="form-input" value={newTask.assignedToId} onChange={e => setNewTask({ ...newTask, assignedToId: e.target.value })}>
                    <option value="">Unassigned</option>
                    {project.members?.map(m => (
                      <option key={m.userId} value={m.userId}>{m.user.name} ({m.user.email})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowTaskModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? <><span className="spinner"></span> Creating...</> : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Project Members</h3>
              <p>Manage who has access to this project</p>
            </div>
            <div className="modal-body">
              {/* Member list */}
              <div className={styles.memberList}>
                {project.members?.map(m => (
                  <div key={m.id} className={styles.memberRow}>
                    <div className={styles.memberInfo}>
                      <div className={`avatar avatar-md ${styles.assigneeAvatar}`}>
                        {m.user.name?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{m.user.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{m.user.email}</div>
                      </div>
                    </div>
                    <div className={styles.memberActions}>
                      <span className={`badge ${m.role === 'ADMIN' ? 'badge-admin' : 'badge-member'}`}>{m.role}</span>
                      {isProjectAdmin() && m.userId !== project.createdById && (
                        <button onClick={() => handleRemoveMember(m.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add member form */}
              {isProjectAdmin() && (
                <form onSubmit={handleAddMember} className={styles.addMemberForm}>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="Enter email to invite..."
                    value={memberEmail}
                    onChange={e => setMemberEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary btn-sm">Add</button>
                </form>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowMemberModal(false)} className="btn btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
