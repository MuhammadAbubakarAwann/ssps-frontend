import { Role } from '@prisma/client';

const roleHierarchy: Record<Role, Role[]> = {
  ADMIN: ['ADMIN']
};

export function getRoles(role: Role): Role[] {
  return roleHierarchy[role] || [];
}
