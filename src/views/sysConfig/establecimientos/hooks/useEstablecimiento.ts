import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '#/contexts/AuthContext';
import notify from '#/utils/notify';
import { getErrorMessage, getErrorStatus } from '#/utils/errorUtils';
import { EstablecimientosService } from '#/services/establecimientos/establecimientosService';
import type { Establecimiento, UpdateEstablecimientoDTO, EstablecimientoTipo } from '../types/index.ts';
import { formatDateISO, isValidDateRange, normalizePhone } from '../utils/index';

export interface FieldErrors { [key: string]: string | undefined }

export function useEstablecimiento() {
  const { user } = useAuth();
  const id = useMemo(() => {
    const raw = user?.id_establecimiento;
    return raw && typeof raw === 'string' ? raw : undefined;
  }, [user]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [establecimiento, setEstablecimiento] = useState<Establecimiento | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [tipos, setTipos] = useState<EstablecimientoTipo[]>([]);

  const fetchOne = useCallback(async () => {
    if (!id) {
      setLoading(false);
      const msg = 'No se encontró el establecimiento del usuario';
      setError(msg);
      notify.info(msg);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [data, tiposList] = await Promise.all([
        EstablecimientosService.getById(id),
        EstablecimientosService.getTipos()
      ]);
      setEstablecimiento(data);
      setTipos(Array.isArray(tiposList) ? tiposList : []);
    } catch (e) {
      const msg = getErrorMessage(e, 'No se pudo cargar el establecimiento');
      setError(msg);
      notify.error(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void fetchOne(); }, [fetchOne]);

  const handleChange = (patch: UpdateEstablecimientoDTO) => {
    setEstablecimiento((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };

      // Live validation: fecha_ini must be <= fecha_fin when both present
      const ini = next.fecha_ini ? formatDateISO(next.fecha_ini) : null;
      const fin = next.fecha_fin ? formatDateISO(next.fecha_fin) : null;
      if (ini && fin) {
        if (!isValidDateRange(ini, fin)) {
          setFieldErrors((errs) => ({
            ...errs,
            fecha_fin: 'La fecha de inicio no puede ser mayor que la fecha de fin'
          }));
        } else {
          setFieldErrors((errs) => ({
            ...errs,
            fecha_fin: undefined,
            fecha_ini: undefined
          }));
        }
      } else {
        // Clear date errors if any of dates is missing/null
        setFieldErrors((errs) => ({
          ...errs,
          fecha_fin: undefined,
          fecha_ini: undefined
        }));
      }

      // Live clearing for phone fields when they become valid
      const updatePhoneErrors = (key: 'telefono' | 'celular', minLen: number, val?: string | null) => {
        const digits = (normalizePhone(val || undefined) || '').replace(/[^0-9]/g, '');
        if (digits.length >= minLen) {
          setFieldErrors((errs) => ({ ...errs, [key]: undefined }));
        }
      };

      if ('telefono' in patch) {
        updatePhoneErrors('telefono', 7, next.telefono ?? null);
      }
      if ('celular' in patch) {
        updatePhoneErrors('celular', 10, next.celular ?? null);
      }

      return next;
    });
  };

  const save = async (): Promise<boolean> => {
    if (!establecimiento || !id) return false;
    setSaving(true);
    setFieldErrors({});
    try {
      // Build payload with nulls for empty values
      const toNullIfEmpty = (v?: string | null): string | null => {
        if (v === undefined || v === null) return null;
        const t = String(v).trim();
        return t === '' ? null : t;
      };

      const payload: UpdateEstablecimientoDTO = {
        nombre: toNullIfEmpty(establecimiento.nombre),
        direccion: toNullIfEmpty(establecimiento.direccion),
        telefono: toNullIfEmpty(normalizePhone(establecimiento.telefono || undefined)),
        celular: toNullIfEmpty(normalizePhone(establecimiento.celular || undefined)),
        nit: toNullIfEmpty(establecimiento.nit),
        resolucion: toNullIfEmpty(establecimiento.resolucion),
        desde: toNullIfEmpty(establecimiento.desde),
        hasta: toNullIfEmpty(establecimiento.hasta),
        mensaje1: toNullIfEmpty(establecimiento.mensaje1),
        mensaje2: toNullIfEmpty(establecimiento.mensaje2),
        mensaje3: toNullIfEmpty(establecimiento.mensaje3),
        mensaje4: toNullIfEmpty(establecimiento.mensaje4),
        id_tipo: establecimiento.id_tipo ?? null
      };

      // Normalize date fields to YYYY-MM-DD or null
      const iniRaw = establecimiento.fecha_ini ?? null;
      const finRaw = establecimiento.fecha_fin ?? null;
      const ini = iniRaw ? formatDateISO(iniRaw) : null;
      const fin = finRaw ? formatDateISO(finRaw) : null;
      payload.fecha_ini = toNullIfEmpty(ini || null);
      payload.fecha_fin = toNullIfEmpty(fin || null);

      // Validate date range only when both present (non-null)
      if (payload.fecha_ini && payload.fecha_fin && !isValidDateRange(payload.fecha_ini, payload.fecha_fin)) {
        setFieldErrors((prev) => ({ ...prev, fecha_fin: 'Rango de fechas inválido' }));
        notify.warning('La fecha inicial debe ser menor o igual a la final');
        setSaving(false);
        return false;
      }
      await EstablecimientosService.update(id, payload);
      notify.success('Establecimiento actualizado correctamente');
      return true;
    } catch (e) {
      const status = getErrorStatus(e);
      const msg = getErrorMessage(e, 'Error al actualizar establecimiento');
      if (status === 422) {
        // Parse detailed field errors from ApiError.details
        const details = (e as { details?: string }).details;
        const { errors: parsedErrors, combinedMessage } = extractErrorsFromDetails(details);
        const nextErrors: FieldErrors = { ...parsedErrors };
        // NIT uniqueness fallback
        if (!nextErrors.nit && (msg || '').toLowerCase().includes('nit')) {
          nextErrors.nit = 'NIT duplicado';
        }
        setFieldErrors(nextErrors);
        notify.warning(combinedMessage || msg || 'Datos inválidos');
      } else if (status === 404) {
        notify.info(msg || 'Establecimiento no encontrado');
      } else if (status === 500 || status === 503) {
        notify.error(msg || 'Error interno del servidor');
      } else {
        notify.error(msg);
      }
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { id, loading, saving, error, establecimiento, fieldErrors, tipos, handleChange, save };
}

function safeParseJson(text?: string): unknown {
  if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
}

function extractErrorsFromDetails(details?: string): { errors: FieldErrors; combinedMessage?: string } {
  const errors: FieldErrors = {};
  const parsed = details ? safeParseJson(details) : null;
  const messages: string[] = [];

  const collectFromArray = (arr: unknown[]) => {
    for (const it of arr) {
      if (it && typeof it === 'object') {
        const obj = it as { path?: unknown; message?: unknown };
        const key = Array.isArray(obj.path) && obj.path.length > 0
          ? String(obj.path[0])
          : typeof obj.path === 'string'
            ? String(obj.path)
            : 'general';
        const msg = typeof obj.message === 'string' ? obj.message : 'Datos inválidos';
        errors[key] = msg;
        messages.push(msg);
      }
    }
  };

  if (Array.isArray(parsed)) {
    collectFromArray(parsed);
  } else if (parsed && typeof parsed === 'object') {
    const obj = parsed as { message?: unknown; errors?: unknown };
    if (Array.isArray(obj.errors)) {
      collectFromArray(obj.errors as unknown[]);
    }
    if (typeof obj.message === 'string') {
      messages.push(obj.message);
    }
  }

  const combinedMessage = messages.length > 0 ? messages.join('\n') : undefined;
  return { errors, combinedMessage };
}
