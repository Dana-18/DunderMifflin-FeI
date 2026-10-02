import { sesionSchema, type Sesion } from '@setpoint/shared';

// Dónde vive la sesión en el navegador: el token JWT junto con los datos del
// usuario y de la organización. Es el único archivo que conoce la clave de
// localStorage: el resto de la web usa estas funciones.
const CLAVE = 'setpoint.sesion';

export function guardarSesion(sesion: Sesion) {
  localStorage.setItem(CLAVE, JSON.stringify(sesion));
}

export function leerSesion(): Sesion | null {
  const guardado = localStorage.getItem(CLAVE);
  if (!guardado) return null;

  // localStorage lo puede editar cualquiera desde el navegador: si lo que hay
  // no tiene la forma esperada, se trata como si no hubiera sesión.
  try {
    const resultado = sesionSchema.safeParse(JSON.parse(guardado));
    return resultado.success ? resultado.data : null;
  } catch {
    return null;
  }
}

export function borrarSesion() {
  localStorage.removeItem(CLAVE);
}
