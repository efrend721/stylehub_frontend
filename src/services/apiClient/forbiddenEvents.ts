type ForbiddenHandler = (reason?: { status?: number; message?: string; source?: 'menus' | 'routes' | 'unknown' }) => void;

let handler: ForbiddenHandler | null = null;
let lastFiredAt = 0;

const DEFAULT_COOLDOWN_MS = 1500;

export function setForbiddenHandler(next: ForbiddenHandler | null): void {
  handler = next;
}

export function notifyForbidden(
  reason?: { status?: number; message?: string; source?: 'menus' | 'routes' | 'unknown' },
  cooldownMs = DEFAULT_COOLDOWN_MS
): void {
  const now = Date.now();
  if (now - lastFiredAt < cooldownMs) return;
  lastFiredAt = now;

  try {
    handler?.(reason);
  } catch {
    // no-op
  }
}
