import { prisma } from '@/lib/prisma';
import { getAuthUser, isAdmin, isProjectAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/activity';
import { apiResponse, apiError } from '@/lib/apiResponse';

// POST /api/projects/[id]/members — Add member to project
export async function POST(req, { params }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return apiError('Unauthorized', 401);

    const { id: projectId } = await params;
    const { userId, userRole } = authUser;

    // Only admin or project admin can add members
    if (!isAdmin(userRole)) {
      const projAdmin = await isProjectAdmin(projectId, userId);
      if (!projAdmin) return apiError('Only admins can add members', 403);
    }

    const { email, role } = await req.json();

    if (!email) return apiError('Member email is required', 400);

    // Find user to add
    const userToAdd = await prisma.user.findUnique({ where: { email } });
    if (!userToAdd) return apiError('User not found with this email', 404);

    // Check if already a member
    const existingMember = await prisma.member.findUnique({
      where: { projectId_userId: { projectId, userId: userToAdd.id } },
    });

    if (existingMember) {
      return apiError('User is already a member of this project', 400);
    }

    // Add member
    const newMember = await prisma.member.create({
      data: {
        projectId,
        userId: userToAdd.id,
        role: role === 'ADMIN' ? 'ADMIN' : 'MEMBER',
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    await logActivity({
      type: 'MEMBER_ADDED',
      message: `added ${userToAdd.name} to the project`,
      userId,
      projectId,
    });

    return apiResponse(newMember, 'Member added successfully', 201);
  } catch (error) {
    console.error('Add member error:', error);
    return apiError('Failed to add member');
  }
}

// DELETE /api/projects/[id]/members — Remove member (requires memberId in body)
export async function DELETE(req, { params }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return apiError('Unauthorized', 401);

    const { id: projectId } = await params;
    const { userId, userRole } = authUser;

    // Only admin or project admin can remove members
    if (!isAdmin(userRole)) {
      const projAdmin = await isProjectAdmin(projectId, userId);
      if (!projAdmin) return apiError('Only admins can remove members', 403);
    }

    const { memberId } = await req.json();
    if (!memberId) return apiError('Member ID is required', 400);

    // Find the member record
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { user: true },
    });

    if (!member || member.projectId !== projectId) {
      return apiError('Member not found in this project', 404);
    }

    // Can't remove the project owner
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (member.userId === project.createdById) {
      return apiError('Cannot remove the project owner', 400);
    }

    await prisma.member.delete({ where: { id: memberId } });

    await logActivity({
      type: 'MEMBER_REMOVED',
      message: `removed ${member.user.name} from the project`,
      userId,
      projectId,
    });

    return apiResponse(null, 'Member removed successfully');
  } catch (error) {
    console.error('Remove member error:', error);
    return apiError('Failed to remove member');
  }
}
