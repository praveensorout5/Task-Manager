'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import DraggableTaskCard from './DraggableTaskCard';
import styles from '@/app/projects/[id]/detail.module.css';

export default function KanbanColumn({ id, title, color, tasks, onDeleteTask, isProjectAdmin }) {
  const { setNodeRef } = useDroppable({
    id: id,
    data: { status: id }
  });

  return (
    <div className={styles.column}>
      <div className={styles.columnHeader}>
        <div className={styles.columnTitle}>
          <span className={styles.columnDot} style={{ background: color }}></span>
          <h4>{title}</h4>
        </div>
        <span className={styles.columnCount}>{tasks.length}</span>
      </div>
      
      <div ref={setNodeRef} className={styles.taskList}>
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <DraggableTaskCard 
              key={task.id} 
              task={task} 
              onDelete={onDeleteTask}
              isProjectAdmin={isProjectAdmin}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className={styles.emptyColumn}>Drop tasks here</div>
        )}
      </div>
    </div>
  );
}
