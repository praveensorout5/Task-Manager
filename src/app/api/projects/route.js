import { prisma } from '@/lib/prisma';
import { getAuthUser, isAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/activity';
import { apiResponse, apiError } from '@/lib/apiResponse';

// GET /api/projects — List user's projects
export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return apiError('Unauthorized', 401);

    const { userId, userRole } = authUser;

    // Admin sees all projects, members see only their own
    const where = isAdmin(userRole)
      ? {}
      : {
          OR: [
            { createdById: userId },
            { members: { some: { userId } } },
          ],
        };

    const projects = await prisma.project.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return apiResponse(projects, 'Projects fetched');
  } catch (error) {
    console.error('Fetch projects error:', error);
    return apiError('Failed to fetch projects');
  }
}

// POST /api/projects — Create project
export async function POST(req) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return apiError('Unauthorized', 401);

    const { userId, userRole } = authUser;

    // Only admins can create projects
    if (!isAdmin(userRole)) {
      return apiError('Only admins can create projects', 403);
    }

    const { title, description } = await req.json();

    if (!title || title.trim().length === 0) {
      return apiError('Project title is required', 400);
    }

    const project = await prisma.project.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        createdById: userId,
        members: {
          create: {
            userId,
            role: 'ADMIN',
          },
        },
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        _count: { select: { tasks: true } },
      },
    });

    await logActivity({
      type: 'PROJECT_CREATED',
      message: `created project "${project.title}"`,
      userId,
      projectId: project.id,
    });

    return apiResponse(project, 'Project created successfully', 201);
  } catch (error) {
    console.error('Create project error:', error);
    return apiError('Failed to create project');
  }
}
