import { prisma } from '@/lib/prisma';
import { getAuthUser, isAdmin, isProjectMember, isProjectAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/activity';
import { apiResponse, apiError } from '@/lib/apiResponse';

// GET /api/projects/[id] — Get single project with details
export async function GET(req, { params }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return apiError('Unauthorized', 401);

    const { id } = await params;
    const { userId, userRole } = authUser;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        tasks: {
          include: {
            assignedTo: { select: { id: true, name: true, email: true } },
            createdBy: { select: { id: true, name: true, email: true } },
          },
          orderBy: { updatedAt: 'desc' },
        },
        _count: { select: { tasks: true } },
      },
    });

    if (!project) return apiError('Project not found', 404);

    // Check access
    if (!isAdmin(userRole)) {
      const member = await isProjectMember(id, userId);
      if (!member) return apiError('Access denied', 403);
    }

    return apiResponse(project, 'Project fetched');
  } catch (error) {
    console.error('Fetch project error:', error);
    return apiError('Failed to fetch project');
  }
}

// PUT /api/projects/[id] — Update project
export async function PUT(req, { params }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return apiError('Unauthorized', 401);

    const { id } = await params;
    const { userId, userRole } = authUser;

    // Only admin or project admin can update
    if (!isAdmin(userRole)) {
      const projAdmin = await isProjectAdmin(id, userId);
      if (!projAdmin) return apiError('Only admins can update projects', 403);
    }

    const { title, description } = await req.json();

    if (!title || title.trim().length === 0) {
      return apiError('Project title is required', 400);
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description?.trim() || null,
      },
    });

    return apiResponse(project, 'Project updated successfully');
  } catch (error) {
    console.error('Update project error:', error);
    return apiError('Failed to update project');
  }
}

// DELETE /api/projects/[id] — Delete project
export async function DELETE(req, { params }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return apiError('Unauthorized', 401);

    const { id } = await params;
    const { userId, userRole } = authUser;

    // Only admin or project owner can delete
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return apiError('Project not found', 404);

    if (!isAdmin(userRole) && project.createdById !== userId) {
      return apiError('Only admins can delete projects', 403);
    }

    await prisma.project.delete({ where: { id } });

    return apiResponse(null, 'Project deleted successfully');
  } catch (error) {
    console.error('Delete project error:', error);
    return apiError('Failed to delete project');
  }
}
