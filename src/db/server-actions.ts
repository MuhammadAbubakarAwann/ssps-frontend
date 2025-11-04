'use server';

import bcrypt from 'bcryptjs';
import { auth } from '@/auth';
import prismaClientGenerator from '@/lib/prismaClient';
import type { Role, User } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = prismaClientGenerator;

export const register = async (values: {
  email: string
  password: string
  name: string
}) => {
  const { email, password, name } = values;

  try {
    const userFound = await prisma.user.findFirst({
      where: {
        email
      }
    });

    if (userFound)
      return {
        error: 'Email already exists!'
      };


    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER'
      }
    });

    return { success: true };
  } catch (e) {
    console.error('Registration error:', e);
    return {
      error: 'Failed to create user'
    };
  }
};

export const registerUserByAdmin = async (values: {
  email: string
  password: string
  name: string
  role: string
}) => {
  const { email, password, name, role } = values;
  const session = await auth();

  if (!session?.user.role || session?.user.role !== 'ADMIN')
    return {
      error: 'Unauthorized access!'
    };


  try {
    const userFound = await prisma.user.findFirst({
      where: {
        email
      }
    });

    if (userFound)
      return { error: 'Email already exists!' };

    const validRoles = ['USER', 'ADMIN', 'EDITOR', 'WRITER'];
    if (!validRoles.includes(role))
      return { error: 'Invalid role specified' };


    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as Role
      }
    });

    revalidatePath('/dashboard/users');
    return { success: true, userId: newUser.id };
  } catch (e) {
    console.error('Failed to create user:', e);
    return {
      error: `Failed to create user: ${e instanceof Error ? e.message : 'Unknown error'}`
    };
  }
};

export const getUsers = async () => {
  const session = await auth();
  if (!session?.user.role || session?.user.role !== 'ADMIN')
    return [] as User[];


  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return users;
  } catch (e) {
    console.error('Error fetching users:', e);
    return [] as User[];
  }
};

export const deleteUser = async (userId: string) => {
  const session = await auth();
  if (!session?.user.role || session?.user.role !== 'ADMIN')
    return {
      error: 'Unauthorized access!'
    };

  try {
    await prisma.user.delete({
      where: {
        id: userId
      }
    });

    revalidatePath('/dashboard/users');
    return { success: true };
  } catch (e) {
    console.error('Error deleting user:', e);
    return { error: 'Failed to delete user' };
  }
};

export const updateUser = async (id: string, name: string, email: string, role: Role) => {
  const session = await auth();
  if (!session?.user.role || session?.user.role !== 'ADMIN')
    return {
      error: 'Unauthorized access!'
    };


  try {
    const user = await prisma.user.findFirst({
      where: {
        id
      }
    });

    if (!user)
      return { error: 'User not found!' };


    await prisma.user.update({
      where: {
        id
      },
      data: {
        name,
        email,
        role
      }
    });

    revalidatePath('/dashboard/users');
    return { success: true };
  } catch (e) {
    console.error('Error updating user:', e);
    return { error: 'Failed to update user' };
  }
};

export const logInAsUser = async (userId: string) => {
  const session = await auth();
  if (!session?.user.role || session?.user.role !== 'ADMIN')
    return { error: 'Unauthorized access!' };


  try {
    const user = await prisma.user.findFirst({
      where: {
        id: userId
      }
    });

    if (!user)
      return { error: 'User not found!' };


    // Generate a secure impersonation token
    const impersonationToken = await bcrypt.hash(`impersonate-${user.id}-${Date.now()}`, 5);

    await prisma.user.update({
      where: { id: userId },
      data: { impersonationToken }
    });

    return {
      email: user.email,
      impersonationToken
    };
  } catch (e) {
    console.error('Error logging in as user:', e);
    return { error: 'Failed to log in as this user!' };
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email
      }
    });

    if (!user)
      return { error: 'User not found!' };


    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image
    };
  } catch (e) {
    console.error('DB Error:', e);
    return { error: 'Database error!' };
  }
};
