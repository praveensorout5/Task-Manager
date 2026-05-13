'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { 
  DndContext, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragOverlay,
  closestCorners
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import styles from './detail.module.css';

// Reusable Components
import DraggableTaskCard from '@/components/kanban/DraggableTaskCard';
import KanbanColumn from '@/components/kanban/KanbanColumn';

export default function ProjectDetailPage({ params }) {
  const { id } = use(params);
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);
  
  // Modals
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Avoid accidental drags when clicking buttons
      },
    })
  );

  const isProjectAdmin = () => {
    if (isAdmin) return true;
    const member = project?.members?.find(m => m.userId === user?.id);
    return member?.role === 'ADMIN' || project?.createdById === user?.id;
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const task = project.tasks.find(t => t.id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id;
    const overId = over.id; // This will be the column ID (TODO, IN_PROGRESS, DONE)

    // If dropped on a column (or something inside a column)
    const newStatus = ['TODO', 'IN_PROGRESS', 'DONE'].includes(overId) ? overId : over.data?.current?.status;

    if (newStatus && newStatus !== activeTask?.status) {
      // Optimistic update
      setProject(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
      }));

      try {
        const res = await fetch(`/api/tasks/${taskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
        if (!res.ok) {
          const data = await res.json();
          toast.error(data.message);
          fetchProject(); // Revert
        }
      } catch {
        toast.error('Failed to update task');
        fetchProject(); // Revert
      }
    }
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

  if (loading) return <div className="loading-text">Loading project...</div>;
  if (!project) return <div className="loading-text">Project not found.</div>;

  const columns = [
    { id: 'TODO', label: 'To Do', color: 'var(--text-secondary)' },
    { id: 'IN_PROGRESS', label: 'In Progress', color: 'var(--info)' },
    { id: 'DONE', label: 'Done', color: 'var(--success)' },
  ];

  return (
    <div className="fade-in">
      <div className={styles.projectHeader}>
        <div>
          <h3 className={styles.projectTitle}>{project.title}</h3>
          <p className={styles.projectDesc}>{project.description || 'No description'}</p>
        </div>
        <div className={styles.headerActions}>
          <button onClick={() => setShowMemberModal(true)} className="btn btn-secondary">Members ({project.members?.length})</button>
          <button onClick={() => setShowTaskModal(true)} className="btn btn-primary">Add Task</button>
        </div>
      </div>

      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className={styles.board}>
          {columns.map(col => (
            <KanbanColumn 
              key={col.id}
              id={col.id}
              title={col.label}
              color={col.color}
              tasks={project.tasks.filter(t => t.status === col.id)}
              onDeleteTask={handleDeleteTask}
              isProjectAdmin={isProjectAdmin()}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className={styles.dragOverlay}>
              <div className={styles.taskCard}>
                <span className={styles.taskTitle}>{activeTask.title}</span>
                <div className={styles.taskMeta}>
                  <span className={`badge badge-${activeTask.priority.toLowerCase()}`}>{activeTask.priority}</span>
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Task Modal (Keeping existing logic) */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Add New Task</h3></div>
            <form onSubmit={handleCreateTask}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Title</label><input type="text" className="form-input" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} required /></div>
                <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} rows={3} /></div>
                <div className="form-group">
                  <label className="form-label">Assign To</label>
                  <select className="form-input" value={newTask.assignedToId} onChange={e => setNewTask({ ...newTask, assignedToId: e.target.value })}>
                    <option value="">Unassigned</option>
                    {project.members?.map(m => <option key={m.userId} value={m.userId}>{m.user.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowTaskModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Modal (Keeping existing logic) */}
      {showMemberModal && (
        <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Project Members</h3></div>
            <div className="modal-body">
              <div className={styles.memberList}>
                {project.members?.map(m => (
                  <div key={m.id} className={styles.memberRow}>
                    <span>{m.user.name} ({m.user.email})</span>
                    <span className={`badge ${m.role === 'ADMIN' ? 'badge-admin' : 'badge-member'}`}>{m.role}</span>
                  </div>
                ))}
              </div>
              {isProjectAdmin() && (
                <form onSubmit={handleAddMember} className={styles.addMemberForm}>
                  <input type="email" className="form-input" placeholder="Invite by email" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} required />
                  <button type="submit" className="btn btn-primary btn-sm">Invite</button>
                </form>
              )}
            </div>
            <div className="modal-footer"><button onClick={() => setShowMemberModal(false)} className="btn btn-secondary">Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
