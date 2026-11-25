export type UserRole = 'Employee' | 'Manager' | 'Finance' | 'Admin';

export const USER_ROLES: readonly UserRole[] = [
  'Employee',
  'Manager',
  'Finance',
  'Admin',
] as const;

export function isUserRole(value: string): value is UserRole {
  return (USER_ROLES as readonly string[]).includes(value);
}
