import type { User } from '#/contexts/AuthContext';

export function hasRole(user: User | null | undefined, roleId: number): boolean {
  if (!user) return false;
  if (Array.isArray((user as { roles?: unknown }).roles)) {
    return (user as { roles: unknown[] }).roles.some((r) => Number(r) === roleId);
  }
  return Number(user.id_rol) === roleId;
}

export function getRoleIds(user: User | null | undefined): number[] {
  if (!user) return [];
  if (Array.isArray((user as { roles?: unknown }).roles)) {
    return (user as { roles: unknown[] }).roles
      .map((r) => Number(r))
      .filter((n) => Number.isFinite(n));
  }
  return Number.isFinite(Number(user.id_rol)) ? [Number(user.id_rol)] : [];
}
