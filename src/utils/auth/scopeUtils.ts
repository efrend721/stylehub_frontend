import type { User } from '#/contexts/AuthContext';

type UserWithScopes = User & {
  // Compatibilidad con posibles nombres del backend
  scopes?: unknown;
  permisos?: unknown;
  permissions?: unknown;
};

function normalizeScopeList(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return (v as unknown[])
    .map((x) => (typeof x === 'string' ? x.trim() : ''))
    .filter((s) => s !== '');
}

export function getUserScopes(user: User | null | undefined): string[] {
  if (!user) return [];
  const u = user as UserWithScopes;
  const list = [
    ...normalizeScopeList(u.scopes),
    ...normalizeScopeList(u.permisos),
    ...normalizeScopeList(u.permissions)
  ];
  // De-dup
  return Array.from(new Set(list));
}

function includesWildcard(scopes: Set<string>, scope: string): boolean {
  if (scopes.has('*')) return true;
  const idx = scope.indexOf(':');
  if (idx === -1) return false;
  const resource = scope.slice(0, idx);
  return scopes.has(`${resource}:*`);
}

export function hasScope(user: User | null | undefined, scope: string): boolean {
  const raw = getUserScopes(user);
  // Si el backend aún no envía scopes, no rompemos UX: permitir por defecto.
  if (raw.length === 0) return true;

  const scopes = new Set(raw);
  return scopes.has(scope) || includesWildcard(scopes, scope);
}

export function hasAnyScope(user: User | null | undefined, scopes: string[]): boolean {
  if (scopes.length === 0) return true;
  return scopes.some((s) => hasScope(user, s));
}

export function hasResourceActionScope(
  user: User | null | undefined,
  resources: string[],
  action: string
): boolean {
  const candidates = resources.map((r) => `${r}:${action}`);
  return hasAnyScope(user, candidates);
}
