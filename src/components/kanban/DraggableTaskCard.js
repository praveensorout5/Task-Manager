'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from '@/app/projects/[id]/detail.module.css';

export default function DraggableTaskCard({ task, onDelete, isProjectAdmin }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: task.id,
    data: { ...task }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    cursor: 'grab',
  };

  const isOverdue = task.status !== 'DONE' && task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={`${styles.taskCard} ${isOverdue ? styles.taskOverdue : ''}`}
    >
      <div className={styles.taskTop}>
        <span className={styles.taskTitle}>{task.title}</span>
        {isProjectAdmin && (
          <button 
            onPointerDown={(e) => e.stopPropagation()} // Prevent drag when clicking delete
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }} 
            className={styles.deleteBtn}
          >
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
          <span className={`${styles.taskDue} ${isOverdue ? 'overdue' : ''}`}>
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
    </div>
  );
}
