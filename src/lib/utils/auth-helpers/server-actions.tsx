'use server';
import { getUserByEmail } from '@/db/server-actions';
import { Role } from '@prisma/client';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const authHelper = async (authorizedRoles: Role[]) => {
  const session = await auth();

  if (!session?.user?.email) redirect('/login');

  const user = await getUserByEmail(session.user.email);

  if (user.error || !user.role || !authorizedRoles.includes(user.role))
    redirect('/unauthorized');

  return user;
};
