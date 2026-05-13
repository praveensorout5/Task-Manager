import { prisma } from './prisma';

/**
 * Log an activity event
 */
export async function logActivity({ type, message, userId, projectId, taskId }) {
  try {
    await prisma.activity.create({
      data: {
        type,
        message,
        userId,
        projectId: projectId || null,
        taskId: taskId || null,
      },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}
