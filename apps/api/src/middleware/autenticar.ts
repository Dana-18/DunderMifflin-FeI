import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env';
import { ErrorHttp } from '../lib/error-http';

// Le avisa a TypeScript que el request lleva estos dos datos una vez que pasó
// por autenticar. Son opcionales porque en las rutas públicas no están.
declare global {
  namespace Express {
    interface Request {
      usuarioId?: number;
      organizacionId?: number;
    }
  }
}

// Lo que firmarToken puso adentro del token. Se valida igual que cualquier
// otro dato que viene de afuera.
const contenidoTokenSchema = z.object({
  sub: z.coerce.number().int(),
  organizacionId: z.number().int(),
});

// Protege una ruta: exige el encabezado "Authorization: Bearer <token>",
// verifica la firma y el vencimiento, y deja en el request quién es.
// No guarda nada en el servidor: todo lo necesario viaja en el token.
export const autenticar: RequestHandler = (req, _res, next) => {
  const [esquema, token] = (req.headers.authorization ?? '').split(' ');

  if (esquema !== 'Bearer' || !token) {
    throw new ErrorHttp(401, 'Ingresá para continuar');
  }

  let contenido: unknown;
  try {
    // verify falla si la firma no coincide con JWT_SECRET o si el token venció.
    contenido = jwt.verify(token, env.JWT_SECRET);
  } catch {
    throw new ErrorHttp(401, 'Tu sesión venció. Ingresá de nuevo');
  }

  const resultado = contenidoTokenSchema.safeParse(contenido);
  if (!resultado.success) {
    throw new ErrorHttp(401, 'Tu sesión venció. Ingresá de nuevo');
  }

  req.usuarioId = resultado.data.sub;
  req.organizacionId = resultado.data.organizacionId;
  next();
};
