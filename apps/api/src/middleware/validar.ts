import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { ErrorHttp } from '../lib/error-http';

// Valida el body contra un schema de Zod antes de que llegue al handler.
// Si pasa, reemplaza req.body por el dato ya parseado (con trim, minúsculas,
// etc.), así el handler trabaja siempre con datos limpios.
export function validarBody(schema: ZodType): RequestHandler {
  return (req, _res, next) => {
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
      // Un mensaje por campo: el primero que falló.
      const campos: Record<string, string> = {};
      for (const problema of resultado.error.issues) {
        const campo = String(problema.path[0] ?? '');
        if (campo && !campos[campo]) campos[campo] = problema.message;
      }
      throw new ErrorHttp(400, 'Hay datos para revisar', campos);
    }

    req.body = resultado.data;
    next();
  };
}
