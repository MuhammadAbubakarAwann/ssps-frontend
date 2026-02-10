import { prisma } from './prisma';

// User management functions
export async function createUser(data: {
  email?: string
  name?: string
  role?: 'ADMIN' | 'USER' | 'MODERATOR'
}) {
  try {
    const user = await prisma.user.create({
      data: {
        email: data.email || undefined,
        name: data.name || undefined,
        role: data.role === 'ADMIN' ? data.role : undefined
      }
    });
    return { success: true, data: user };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: 'Failed to create user' };
  }
}

export async function getUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true,
        sessions: true
      }
    });
    return { success: true, data: user };
  } catch (error) {
    console.error('Error fetching user:', error);
    return { success: false, error: 'Failed to fetch user' };
  }
}

export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        accounts: true,
        sessions: true
      }
    });
    return { success: true, data: user };
  } catch (error) {
    console.error('Error fetching user:', error);
    return { success: false, error: 'Failed to fetch user' };
  }
}

export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            accounts: true,
            sessions: true
          }
        }
      }
    });
    return { success: true, data: users };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { success: false, error: 'Failed to fetch users' };
  }
}

export async function updateUser(id: string, data: {
  name?: string
  email?: string
  emailVerified?: Date
  image?: string
  role?: 'ADMIN' | 'USER' | 'MODERATOR'
}) {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...data,
        role: data.role === 'ADMIN' ? data.role : undefined
      }
    });
    return { success: true, data: user };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: 'Failed to update user' };
  }
}

export async function deleteUser(id: string) {
  try {
    const user = await prisma.user.delete({
      where: { id }
    });
    return { success: true, data: user };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: 'Failed to delete user' };
  }
}

// Session management functions
export async function createSession(data: {
  sessionToken: string
  userId: string
  expires: Date
}) {
  try {
    const session = await prisma.session.create({
      data
    });
    return { success: true, data: session };
  } catch (error) {
    console.error('Error creating session:', error);
    return { success: false, error: 'Failed to create session' };
  }
}

export async function getSessionByToken(sessionToken: string) {
  try {
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: {
        user: true
      }
    });
    return { success: true, data: session };
  } catch (error) {
    console.error('Error fetching session:', error);
    return { success: false, error: 'Failed to fetch session' };
  }
}

export async function deleteSession(sessionToken: string) {
  try {
    const session = await prisma.session.delete({
      where: { sessionToken }
    });
    return { success: true, data: session };
  } catch (error) {
    console.error('Error deleting session:', error);
    return { success: false, error: 'Failed to delete session' };
  }
}