import { prisma } from '@/lib/prisma';
import { getAuthUser, isAdmin } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/apiResponse';

// GET /api/activities — Recent activity feed
export async function GET(req) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return apiError('Unauthorized', 401);

    const { userId, userRole } = authUser;
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    let where = {};

    if (projectId) {
      where.projectId = projectId;
    } else if (!isAdmin(userRole)) {
      where.OR = [
        { userId },
        { project: { members: { some: { userId } } } },
      ];
    }

    const activities = await prisma.activity.findMany({
      where,
      include: {
        user: { select: { id: true, name: true } },
        project: { select: { id: true, title: true } },
        task: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    return apiResponse(activities, 'Activities fetched');
  } catch (error) {
    console.error('Fetch activities error:', error);
    return apiError('Failed to fetch activities');
  }
}
