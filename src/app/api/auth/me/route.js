import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/apiResponse';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return apiError('Not authenticated', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return apiError('User not found', 404);
    }

    return apiResponse(user, 'User profile fetched');
  } catch (error) {
    console.error('Get me error:', error);
    return apiError('Failed to fetch profile');
  }
}

export async function PUT(req) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return apiError('Unauthorized', 401);

    const { name, email, currentPassword, newPassword } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
    });

    if (!user) return apiError('User not found', 404);

    const updateData = {};

    // Update name
    if (name) updateData.name = name.trim();

    // Update email (if changed)
    if (email && email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return apiError('Email already in use', 400);
      updateData.email = email;
    }

    // Update password
    if (newPassword) {
      if (!currentPassword) return apiError('Current password is required to change password', 400);
      
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) return apiError('Invalid current password', 401);

      if (newPassword.length < 6) return apiError('New password must be at least 6 characters', 400);
      
      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    if (Object.keys(updateData).length === 0) {
      return apiError('No changes provided', 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id: authUser.userId },
      data: updateData,
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    return apiResponse(userWithoutPassword, 'Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    return apiError('Failed to update profile');
  }
}
