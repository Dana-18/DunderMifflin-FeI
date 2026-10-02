import { errorApiSchema } from '@setpoint/shared';

// Error de una llamada a la API, con lo que el formulario necesita para
// mostrarlo: el código HTTP y, si los hay, los mensajes por campo.
export class ErrorDeApi extends Error {
  readonly status: number;
  readonly campos: Record<string, string>;

  constructor(status: number, mensaje: string, campos: Record<string, string> = {}) {
    super(mensaje);
    this.name = 'ErrorDeApi';
    this.status = status;
    this.campos = campos;
  }
}

const SIN_CONEXION = 'No pudimos conectar con el servidor. Revisá tu conexión y probá de nuevo';

// POST con JSON a la API. Devuelve el cuerpo de la respuesta sin validar:
// quien llama lo pasa por su schema de Zod.
export async function postJson(ruta: string, cuerpo: unknown): Promise<unknown> {
  let respuesta: Response;
  try {
    respuesta = await fetch(`/api${ruta}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo),
    });
  } catch {
    throw new ErrorDeApi(0, SIN_CONEXION);
  }

  // Si la API está caída, el proxy responde algo que no es JSON.
  const datos: unknown = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    const error = errorApiSchema.safeParse(datos);
    if (error.success) {
      throw new ErrorDeApi(respuesta.status, error.data.error, error.data.campos);
    }
    throw new ErrorDeApi(respuesta.status, SIN_CONEXION);
  }

  return datos;
}
