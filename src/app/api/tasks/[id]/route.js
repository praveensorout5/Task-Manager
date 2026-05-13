import { prisma } from '@/lib/prisma';
import { getAuthUser, isAdmin, isProjectMember, isProjectAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/activity';
import { apiResponse, apiError } from '@/lib/apiResponse';

// GET /api/tasks/[id] — Get single task
export async function GET(req, { params }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return apiError('Unauthorized', 401);

    const { id } = await params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, title: true } },
      },
    });

    if (!task) return apiError('Task not found', 404);

    return apiResponse(task, 'Task fetched');
  } catch (error) {
    console.error('Fetch task error:', error);
    return apiError('Failed to fetch task');
  }
}

// PUT /api/tasks/[id] — Update task
export async function PUT(req, { params }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return apiError('Unauthorized', 401);

    const { id } = await params;
    const { userId, userRole } = authUser;

    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: { include: { members: true } } },
    });

    if (!task) return apiError('Task not found', 404);

    const data = await req.json();

    // RBAC: Members can only update status on their own assigned tasks
    if (!isAdmin(userRole)) {
      const member = task.project.members.find(m => m.userId === userId);
      if (!member) return apiError('Access denied', 403);

      // If member (not project admin), only allow status changes on own tasks
      if (member.role !== 'ADMIN') {
        if (task.assignedToId !== userId) {
          return apiError('You can only update tasks assigned to you', 403);
        }
        // Only allow status updates for non-admin members
        const allowedFields = ['status'];
        const updateData = {};
        for (const field of allowedFields) {
          if (data[field] !== undefined) updateData[field] = data[field];
        }

        const updatedTask = await prisma.task.update({
          where: { id },
          data: updateData,
          include: {
            assignedTo: { select: { id: true, name: true, email: true } },
            createdBy: { select: { id: true, name: true, email: true } },
            project: { select: { id: true, title: true } },
          },
        });

        if (data.status && data.status !== task.status) {
          await logActivity({
            type: 'STATUS_CHANGED',
            message: `moved "${task.title}" to ${data.status.replace('_', ' ')}`,
            userId,
            projectId: task.projectId,
            taskId: task.id,
          });
        }

        return apiResponse(updatedTask, 'Task updated successfully');
      }
    }

    // Admin or project admin — full update
    const updateData = {};
    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.description !== undefined) updateData.description = data.description?.trim() || null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId || null;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, title: true } },
      },
    });

    if (data.status && data.status !== task.status) {
      await logActivity({
        type: 'STATUS_CHANGED',
        message: `moved "${task.title}" to ${data.status.replace('_', ' ')}`,
        userId,
        projectId: task.projectId,
        taskId: task.id,
      });
    } else {
      await logActivity({
        type: 'TASK_UPDATED',
        message: `updated task "${task.title}"`,
        userId,
        projectId: task.projectId,
        taskId: task.id,
      });
    }

    return apiResponse(updatedTask, 'Task updated successfully');
  } catch (error) {
    console.error('Update task error:', error);
    return apiError('Failed to update task');
  }
}

// DELETE /api/tasks/[id] — Delete task
export async function DELETE(req, { params }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return apiError('Unauthorized', 401);

    const { id } = await params;
    const { userId, userRole } = authUser;

    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!task) return apiError('Task not found', 404);

    // Only admin, project owner, or task creator can delete
    const canDelete =
      isAdmin(userRole) ||
      task.project.createdById === userId ||
      task.createdById === userId;

    if (!canDelete) {
      const projAdmin = await isProjectAdmin(task.projectId, userId);
      if (!projAdmin) return apiError('Access denied', 403);
    }

    await prisma.task.delete({ where: { id } });

    return apiResponse(null, 'Task deleted successfully');
  } catch (error) {
    console.error('Delete task error:', error);
    return apiError('Failed to delete task');
  }
}
