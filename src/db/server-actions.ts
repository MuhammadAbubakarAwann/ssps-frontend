'use server';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import prismaClientGenerator from '@/lib/prismaClient';
import type { Role, User } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = prismaClientGenerator();

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
        role: 'ADMIN'
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
  const cookieStore = cookies();
  const userData = cookieStore.get('user_data')?.value;
  const user = userData ? JSON.parse(userData) : null;

  if (!user?.role || user?.role !== 'ADMIN')
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

    const validRoles = ['STUDENT', 'TEACHER', 'ADMIN'];
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
  const cookieStore = cookies();
  const userData = cookieStore.get('user_data')?.value;
  const user = userData ? JSON.parse(userData) : null;
  
  if (!user?.role || user?.role !== 'ADMIN')
    return [] as User[];


  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true
      },
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
  const cookieStore = cookies();
  const userData = cookieStore.get('user_data')?.value;
  const user = userData ? JSON.parse(userData) : null;
  
  if (!user?.role || user?.role !== 'ADMIN')
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
  const cookieStore = cookies();
  const userData = cookieStore.get('user_data')?.value;
  const user = userData ? JSON.parse(userData) : null;
  
  if (!user?.role || user?.role !== 'ADMIN')
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
