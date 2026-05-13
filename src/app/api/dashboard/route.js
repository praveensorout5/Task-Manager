import { prisma } from '@/lib/prisma';
import { getAuthUser, isAdmin } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/apiResponse';

// GET /api/dashboard — Aggregated dashboard statistics
export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return apiError('Unauthorized', 401);

    const { userId, userRole } = authUser;

    // Get all tasks accessible to user
    const taskWhere = isAdmin(userRole)
      ? {}
      : { project: { members: { some: { userId } } } };

    const allTasks = await prisma.task.findMany({
      where: taskWhere,
      include: {
        project: { select: { id: true, title: true } },
        assignedTo: { select: { id: true, name: true } },
      },
    });

    const now = new Date();
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.status === 'DONE').length;
    const pendingTasks = allTasks.filter(t => t.status !== 'DONE').length;
    const overdueTasks = allTasks.filter(
      t => t.status !== 'DONE' && t.dueDate && new Date(t.dueDate) < now
    ).length;
    const inProgressTasks = allTasks.filter(t => t.status === 'IN_PROGRESS').length;
    const todoTasks = allTasks.filter(t => t.status === 'TODO').length;

    // Task counts by priority
    const highPriority = allTasks.filter(t => t.priority === 'HIGH' && t.status !== 'DONE').length;
    const mediumPriority = allTasks.filter(t => t.priority === 'MEDIUM' && t.status !== 'DONE').length;
    const lowPriority = allTasks.filter(t => t.priority === 'LOW' && t.status !== 'DONE').length;

    // Projects
    const projectWhere = isAdmin(userRole)
      ? {}
      : { OR: [{ createdById: userId }, { members: { some: { userId } } }] };

    const projects = await prisma.project.findMany({
      where: projectWhere,
      include: {
        _count: { select: { tasks: true, members: true } },
        tasks: {
          select: { status: true },
        },
      },
    });

    const projectStats = projects.map(p => ({
      id: p.id,
      title: p.title,
      totalTasks: p._count.tasks,
      completedTasks: p.tasks.filter(t => t.status === 'DONE').length,
      members: p._count.members,
    }));

    // Recent tasks (last 5 updated)
    const recentTasks = allTasks
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5);

    return apiResponse({
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        inProgressTasks,
        todoTasks,
        highPriority,
        mediumPriority,
        lowPriority,
      },
      projectStats,
      recentTasks,
    }, 'Dashboard data fetched');
  } catch (error) {
    console.error('Dashboard error:', error);
    return apiError('Failed to fetch dashboard data');
  }
}
