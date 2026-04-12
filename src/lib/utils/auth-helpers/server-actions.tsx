'use server';
import { getUserByEmail } from '@/db/server-actions';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { hasRoleAccess, isAppRole, type AppRole } from './role';

export const authHelper = async (authorizedRoles: AppRole[]) => {
  const session = await auth();

  if (!session?.user?.email) redirect('/login');

  const user = await getUserByEmail(session.user.email);

  if (user.error || !isAppRole(user.role) || !hasRoleAccess(user.role, authorizedRoles))
    redirect('/unauthorized');

  return user;
};
