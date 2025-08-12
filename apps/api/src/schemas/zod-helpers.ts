import { BadRequestException } from '@nestjs/common';
import { ZodError, ZodSchema } from 'zod';

export function parseOrBadRequest<T>(field: string, schema: ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data ?? {});
  } catch (e) {
    if (e instanceof ZodError) {
      const details = e.issues.map(i => `${field}${i.path.length ? '.'+i.path.join('.') : ''}: ${i.message}`);
      throw new BadRequestException(`Validação falhou em ${field}: ${details.join('; ')}`);
    }
    throw e;
  }
}

/** Deep merge: objetos mesclam, arrays substituem */
export function deepMerge<T>(base: T, patch: Partial<T> | undefined): T {
  if (patch === undefined || patch === null) return base as T;
  if (base === null || typeof base !== 'object') return (patch as T);
  if (Array.isArray(base) || Array.isArray(patch)) return (patch as T);
  const out: any = { ...(base as any) };
  for (const [k, v] of Object.entries(patch as any)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) out[k] = deepMerge(out[k], v);
    else out[k] = v;
  }
  return out;
}
