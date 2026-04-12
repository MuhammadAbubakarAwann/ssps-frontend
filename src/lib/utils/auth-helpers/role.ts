export type AppRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

const roleHierarchy: Record<AppRole, AppRole[]> = {
  ADMIN: ['ADMIN'],
  TEACHER: ['ADMIN', 'TEACHER'],
  STUDENT: ['ADMIN', 'TEACHER', 'STUDENT']
};

export function getRoles(role: AppRole): AppRole[] {
  return roleHierarchy[role] || [];
}

export function isAppRole(role: unknown): role is AppRole {
  return role === 'ADMIN' || role === 'TEACHER' || role === 'STUDENT';
}

export function hasRoleAccess(userRole: AppRole, authorizedRoles: AppRole[]): boolean {
  return authorizedRoles.some((requiredRole) => getRoles(requiredRole).includes(userRole));
}
