type UnauthorizedHandler = (reason?: { status?: number; message?: string }) => void;

let handler: UnauthorizedHandler | null = null;
let lastFiredAt = 0;

// Evita spam si múltiples requests fallan al mismo tiempo
const DEFAULT_COOLDOWN_MS = 1500;

export function setUnauthorizedHandler(next: UnauthorizedHandler | null): void {
  handler = next;
}

export function notifyUnauthorized(reason?: { status?: number; message?: string }, cooldownMs = DEFAULT_COOLDOWN_MS): void {
  const now = Date.now();
  if (now - lastFiredAt < cooldownMs) return;
  lastFiredAt = now;

  try {
    handler?.(reason);
  } catch {
    // no-op: no romper el flujo de error handling
  }
}
