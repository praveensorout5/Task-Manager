import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/apiResponse';

// GET /api/users — List all system users or search users
export async function GET(req) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return apiError('Unauthorized', 401);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    // Search mode (for project invitation)
    if (search) {
      if (search.length < 2) {
        return apiError('Search query must be at least 2 characters', 400);
      }
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { email: { contains: search } },
            { name: { contains: search } },
          ],
        },
        select: { id: true, name: true, email: true, role: true },
        take: 10,
      });
      return apiResponse(users, 'Users found');
    }

    // List all mode (Public directory for authenticated users)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return apiResponse(users, 'User directory fetched');
  } catch (error) {
    console.error('List users error:', error);
    return apiError('Failed to fetch users');
  }
}

