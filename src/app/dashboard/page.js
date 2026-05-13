'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, actRes] = await Promise.all([
          fetch('/api/dashboard'),
          fetch('/api/activities'),
        ]);

        if (dashRes.ok) {
          const dashData = await dashRes.json();
          setData(dashData.data);
        }
        if (actRes.ok) {
          const actData = await actRes.json();
          setActivities(actData.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="fade-in">
        <div className={styles.statsGrid}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton skeleton-card" style={{ height: '120px' }}></div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          <div className="skeleton skeleton-card" style={{ height: '300px' }}></div>
          <div className="skeleton skeleton-card" style={{ height: '300px' }}></div>
        </div>
      </div>
    );
  }

  if (!data) return <div className="loading-text">Failed to load dashboard.</div>;

  const { stats, projectStats, recentTasks } = data;
  const completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  const statCards = [
    { label: 'Total Tasks', value: stats.totalTasks, icon: '📋', color: 'var(--accent-primary)' },
    { label: 'Completed', value: stats.completedTasks, icon: '✅', color: 'var(--success)' },
    { label: 'In Progress', value: stats.inProgressTasks, icon: '🔄', color: 'var(--info)' },
    { label: 'Overdue', value: stats.overdueTasks, icon: '⚠️', color: 'var(--danger)' },
  ];

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() ;
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'TASK_CREATED': return '📝';
      case 'STATUS_CHANGED': return '🔄';
      case 'MEMBER_ADDED': return '👤';
      case 'MEMBER_REMOVED': return '👤';
      case 'PROJECT_CREATED': return '📁';
      case 'TASK_UPDATED': return '✏️';
      default: return '⚡';
    }
  };

  const timeAgo = (date) => {
    const now = new Date();
    const d = new Date(date);
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="fade-in">
      {/* Greeting */}
      <div className={styles.greeting}>
        <h3>Welcome back, {user?.name?.split(' ')[0] || 'User'} 👋</h3>
        <p>Here&apos;s what&apos;s happening with your projects today.</p>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {statCards.map((stat, i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statIcon}>{stat.icon}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
            <div className={styles.statValue} style={{ color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Completion Overview & Distribution */}
      <div className={styles.mainGrid}>
        {/* Left Column */}
        <div className={styles.leftColumn}>
          {/* Completion Overview */}
          <div className="card">
            <div className={styles.chartSection}>
              <div className={styles.chartLeft}>
                <h4 className={styles.sectionTitle}>Task Distribution</h4>
                <div className={styles.donutContainer}>
                  <div 
                    className={styles.donut} 
                    style={{ 
                      '--todo-p': `${(stats.todoTasks / stats.totalTasks) * 100 || 0}%`,
                      '--ip-p': `${(stats.inProgressTasks / stats.totalTasks) * 100 || 0}%`,
                      '--done-p': `${(stats.completedTasks / stats.totalTasks) * 100 || 0}%`
                    }}
                  >
                    <div className={styles.donutInner}>
                      <span className={styles.donutVal}>{completionRate}%</span>
                      <span className={styles.donutLabel}>Done</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.chartRight}>
                <div className={styles.completionInfo}>
                  <div className={styles.completionBar}>
                    <div className={styles.progressTrack}>
                      <div className={styles.progressFill} style={{ width: `${completionRate}%` }}></div>
                    </div>
                  </div>
                  <div className={styles.chartLegend}>
                    <div className={styles.legendItem}>
                      <span className={styles.dot} style={{ background: 'var(--bg-tertiary)' }}></span>
                      <div className={styles.legendLabel}>
                        <span>Todo</span>
                        <strong>{stats.todoTasks}</strong>
                      </div>
                    </div>
                    <div className={styles.legendItem}>
                      <span className={styles.dot} style={{ background: 'var(--info)' }}></span>
                      <div className={styles.legendLabel}>
                        <span>In Progress</span>
                        <strong>{stats.inProgressTasks}</strong>
                      </div>
                    </div>
                    <div className={styles.legendItem}>
                      <span className={styles.dot} style={{ background: 'var(--success)' }}></span>
                      <div className={styles.legendLabel}>
                        <span>Completed</span>
                        <strong>{stats.completedTasks}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Project Progress */}
          <div className="card">
            <h4 className={styles.sectionTitle}>Project Progress</h4>
            <div className={styles.projectList}>
              {projectStats.map(project => {
                const pct = project.totalTasks > 0
                  ? Math.round((project.completedTasks / project.totalTasks) * 100)
                  : 0;
                return (
                  <Link href={`/projects/${project.id}`} key={project.id} className={styles.projectRow}>
                    <div className={styles.projectRowInfo}>
                      <span className={styles.projectName}>{project.title}</span>
                      <span className={styles.projectPct}>{pct}%</span>
                    </div>
                    <div className={styles.miniProgress}>
                      <div className={styles.miniProgressFill} style={{ width: `${pct}%` }}></div>
                    </div>
                    <div className={styles.projectMeta}>
                      <span>{project.completedTasks}/{project.totalTasks} tasks</span>
                      <span>{project.members} members</span>
                    </div>
                  </Link>
                );
              })}
              {projectStats.length === 0 && (
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>No projects yet.</p>
              )}
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="card">
            <div className={styles.sectionHeader}>
              <h4 className={styles.sectionTitle}>Recent Tasks</h4>
              <Link href="/tasks" className="btn btn-sm btn-secondary">View All</Link>
            </div>
            <div className="table-container">
              {recentTasks.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Task</th>
                      <th>Project</th>
                      <th>Status</th>
                      <th>Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTasks.map(task => (
                      <tr key={task.id} className={task.status !== 'DONE' && isOverdue(task.dueDate) ? 'overdue-row' : ''}>
                        <td style={{ fontWeight: 500 }}>{task.title}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{task.project?.title}</td>
                        <td><span className={`badge badge-${task.status.toLowerCase()}`}>{task.status.replace('_', ' ')}</span></td>
                        <td className={task.status !== 'DONE' && isOverdue(task.dueDate) ? 'overdue' : ''}>
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <span className="empty-state-icon">📋</span>
                  <h4>No tasks yet</h4>
                  <p>Create a project and start adding tasks!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Activity Feed + Priority */}
        <div className={styles.rightColumn}>
          {/* Priority Breakdown */}
          <div className="card">
            <h4 className={styles.sectionTitle}>Priority Breakdown</h4>
            <div className={styles.priorityList}>
              <div className={styles.priorityItem}>
                <div className={styles.priorityLabel}>
                  <span className="badge badge-high">HIGH</span>
                  <span>{stats.highPriority} tasks</span>
                </div>
                <div className={styles.miniProgress}>
                  <div className={styles.miniProgressFill} style={{ width: `${stats.pendingTasks > 0 ? (stats.highPriority / stats.pendingTasks) * 100 : 0}%`, background: 'var(--danger)' }}></div>
                </div>
              </div>
              <div className={styles.priorityItem}>
                <div className={styles.priorityLabel}>
                  <span className="badge badge-medium">MEDIUM</span>
                  <span>{stats.mediumPriority} tasks</span>
                </div>
                <div className={styles.miniProgress}>
                  <div className={styles.miniProgressFill} style={{ width: `${stats.pendingTasks > 0 ? (stats.mediumPriority / stats.pendingTasks) * 100 : 0}%`, background: 'var(--warning)' }}></div>
                </div>
              </div>
              <div className={styles.priorityItem}>
                <div className={styles.priorityLabel}>
                  <span className="badge badge-low">LOW</span>
                  <span>{stats.lowPriority} tasks</span>
                </div>
                <div className={styles.miniProgress}>
                  <div className={styles.miniProgressFill} style={{ width: `${stats.pendingTasks > 0 ? (stats.lowPriority / stats.pendingTasks) * 100 : 0}%`, background: 'var(--success)' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="card">
            <h4 className={styles.sectionTitle}>Recent Activity</h4>
            <div className={styles.activityFeed}>
              {activities.slice(0, 10).map(activity => (
                <div key={activity.id} className={styles.activityItem}>
                  <span className={styles.activityIcon}>{getActivityIcon(activity.type)}</span>
                  <div className={styles.activityContent}>
                    <p><strong>{activity.user?.name}</strong> {activity.message}</p>
                    <span className={styles.activityTime}>{timeAgo(activity.createdAt)}</span>
                  </div>
                </div>
              ))}
              {activities.length === 0 && (
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>
                  No activity yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
