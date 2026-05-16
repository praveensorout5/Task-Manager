import { prisma } from '@/lib/prisma';
import { getAuthUser, isAdmin } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/apiResponse';
import bcrypt from 'bcryptjs';

// GET /api/users — List all users (Admin) or search users (all auth users)
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

    // List all mode (Admin only)
    if (!isAdmin(authUser.userRole)) {
      return apiError('Forbidden: Admin access required to list all users', 403);
    }

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

// POST /api/users — Manually create a user (Admin only)
export async function POST(req) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !isAdmin(authUser.userRole)) {
      return apiError('Forbidden: Admin access required', 403);
    }

    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return apiError('Name, email, and password are required', 400);
    }

    // Check existing
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return apiError('User with this email already exists', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role === 'ADMIN' ? 'ADMIN' : 'MEMBER',
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    return apiResponse(userWithoutPassword, 'User created successfully', 201);
  } catch (error) {
    console.error('Create user error:', error);
    return apiError('Failed to create user');
  }
}
