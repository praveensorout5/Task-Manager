import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/apiResponse';

// GET /api/users?search=email — Search users by email (for adding members)
export async function GET(req) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return apiError('Unauthorized', 401);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    if (!search || search.length < 2) {
      return apiError('Search query must be at least 2 characters', 400);
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: search } },
          { name: { contains: search } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      take: 10,
    });

    return apiResponse(users, 'Users found');
  } catch (error) {
    console.error('Search users error:', error);
    return apiError('Failed to search users');
  }
}
