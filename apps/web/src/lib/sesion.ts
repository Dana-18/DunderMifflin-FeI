// Dónde vive el token de sesión en el navegador. Es el único archivo que
// conoce la clave de localStorage: el resto de la web usa estas funciones.
const CLAVE = 'setpoint.token';

export function guardarToken(token: string) {
  localStorage.setItem(CLAVE, token);
}

export function leerToken(): string | null {
  return localStorage.getItem(CLAVE);
}

export function borrarToken() {
  localStorage.removeItem(CLAVE);
}
