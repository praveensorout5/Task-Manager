import { prisma } from '@/lib/prisma';
import { apiResponse, apiError } from '@/lib/apiResponse';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { name, email, password, role } = await req.json();

    // Validation
    if (!name || !email || !password) {
      return apiError('Name, email, and password are required', 400);
    }

    if (password.length < 6) {
      return apiError('Password must be at least 6 characters', 400);
    }

    // Check existing user
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return apiError('An account with this email already exists', 400);
    }

    // Hash password and create user
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
    return apiResponse(userWithoutPassword, 'Account created successfully', 201);
  } catch (error) {
    console.error('Signup error:', error);
    return apiError('Failed to create account');
  }
}
