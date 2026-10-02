import type { ErrorRequestHandler } from 'express';
import type { ErrorApi } from '@setpoint/shared';
import { ErrorHttp } from '../lib/error-http';

// Último middleware de la app. Todo error termina acá y sale con la misma
// forma ({ error, campos? }), que es la que espera el frontend.
export const manejarErrores: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ErrorHttp) {
    const cuerpo: ErrorApi = { error: err.message, campos: err.campos };
    res.status(err.status).json(cuerpo);
    return;
  }

  // Body que no es JSON válido: lo detecta express.json().
  if (err instanceof SyntaxError && 'body' in err) {
    const cuerpo: ErrorApi = { error: 'El cuerpo del pedido no es JSON válido' };
    res.status(400).json(cuerpo);
    return;
  }

  // Cualquier otra cosa es un bug nuestro: se registra completo en el
  // servidor y al cliente no se le filtra ningún detalle interno.
  console.error(err);
  const cuerpo: ErrorApi = { error: 'Algo falló de nuestro lado. Probá de nuevo en un momento' };
  res.status(500).json(cuerpo);
};
