import { errorApiSchema } from '@setpoint/shared';
import { leerSesion } from './sesion';

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

// Evento que se emite cuando la API rechaza la sesión guardada. Lo escucha
// el hook useSesionRechazada, que es el que sabe qué hacer.
export const SESION_RECHAZADA = 'setpoint:sesion-rechazada';

const SIN_CONEXION = 'No pudimos conectar con el servidor. Revisá tu conexión y probá de nuevo';

// Todos los pedidos a la API pasan por acá. Devuelve el cuerpo de la
// respuesta sin validar: quien llama lo pasa por su schema de Zod.
async function pedir(metodo: 'GET' | 'POST', ruta: string, cuerpo?: unknown): Promise<unknown> {
  const sesion = leerSesion();

  const headers: Record<string, string> = {};
  if (cuerpo !== undefined) headers['Content-Type'] = 'application/json';
  // Si hay sesión, el token va en cada pedido.
  if (sesion) headers.Authorization = `Bearer ${sesion.token}`;

  let respuesta: Response;
  try {
    respuesta = await fetch(`/api${ruta}`, {
      method: metodo,
      headers,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
  } catch {
    throw new ErrorDeApi(0, SIN_CONEXION);
  }

  // Si la API está caída, el proxy responde algo que no es JSON.
  const datos: unknown = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    // 401: el token venció o no es válido. 403: no tiene permiso.
    // Solo cuenta como sesión rechazada si el pedido llevaba token: un 401
    // al ingresar con la contraseña mal no es una sesión vencida.
    if (sesion && (respuesta.status === 401 || respuesta.status === 403)) {
      window.dispatchEvent(new Event(SESION_RECHAZADA));
    }

    const error = errorApiSchema.safeParse(datos);
    if (error.success) {
      throw new ErrorDeApi(respuesta.status, error.data.error, error.data.campos);
    }
    throw new ErrorDeApi(respuesta.status, SIN_CONEXION);
  }

  return datos;
}

export function getJson(ruta: string): Promise<unknown> {
  return pedir('GET', ruta);
}

export function postJson(ruta: string, cuerpo: unknown): Promise<unknown> {
  return pedir('POST', ruta, cuerpo);
}
