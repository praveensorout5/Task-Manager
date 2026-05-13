import { headers } from 'next/headers';
import { prisma } from './prisma';

/**
 * Get authenticated user info from request headers (set by proxy middleware)
 */
export async function getAuthUser() {
  const head = await headers();
  const userId = head.get('x-user-id');
  const userRole = head.get('x-user-role');
  const userEmail = head.get('x-user-email');

  if (!userId) return null;

  return { userId, userRole, userEmail };
}

/**
 * Require authentication — returns user or throws 401
 */
export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}

/**
 * Check if user is admin
 */
export function isAdmin(userRole) {
  return userRole === 'ADMIN';
}

/**
 * Check if user is a member of a project
 */
export async function isProjectMember(projectId, userId) {
  const member = await prisma.member.findUnique({
    where: {
      projectId_userId: { projectId, userId },
    },
  });
  return member;
}

/**
 * Check if user is project admin or owner
 */
export async function isProjectAdmin(projectId, userId) {
  const member = await prisma.member.findUnique({
    where: {
      projectId_userId: { projectId, userId },
    },
  });

  if (member && member.role === 'ADMIN') return true;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  return project?.createdById === userId;
}
