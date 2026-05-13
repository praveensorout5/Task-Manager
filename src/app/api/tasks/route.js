import { prisma } from '@/lib/prisma';
import { getAuthUser, isAdmin, isProjectMember } from '@/lib/auth';
import { logActivity } from '@/lib/activity';
import { apiResponse, apiError } from '@/lib/apiResponse';

// GET /api/tasks — List tasks (with filters)
export async function GET(req) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return apiError('Unauthorized', 401);

    const { userId, userRole } = authUser;
    const { searchParams } = new URL(req.url);
    
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');
    const assignedToMe = searchParams.get('assignedToMe');

    // Build where clause
    let where = {};

    // Project filter
    if (projectId) {
      where.projectId = projectId;
    } else if (!isAdmin(userRole)) {
      // Non-admins only see tasks from their projects
      where.project = { members: { some: { userId } } };
    }

    // Status filter
    if (status && status !== 'ALL') {
      where.status = status;
    }

    // Priority filter
    if (priority && priority !== 'ALL') {
      where.priority = priority;
    }

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Assigned to me filter
    if (assignedToMe === 'true') {
      where.assignedToId = userId;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, title: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return apiResponse(tasks, 'Tasks fetched');
  } catch (error) {
    console.error('Fetch tasks error:', error);
    return apiError('Failed to fetch tasks');
  }
}

// POST /api/tasks — Create task
export async function POST(req) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return apiError('Unauthorized', 401);

    const { userId, userRole } = authUser;
    const { title, description, status, priority, dueDate, projectId, assignedToId } = await req.json();

    if (!title || !projectId) {
      return apiError('Title and project are required', 400);
    }

    // Check project access
    if (!isAdmin(userRole)) {
      const member = await isProjectMember(projectId, userId);
      if (!member) return apiError('Access denied', 403);
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assignedToId: assignedToId || null,
        createdById: userId,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, title: true } },
      },
    });

    await logActivity({
      type: 'TASK_CREATED',
      message: `created task "${task.title}"`,
      userId,
      projectId,
      taskId: task.id,
    });

    return apiResponse(task, 'Task created successfully', 201);
  } catch (error) {
    console.error('Create task error:', error);
    return apiError('Failed to create task');
  }
}
