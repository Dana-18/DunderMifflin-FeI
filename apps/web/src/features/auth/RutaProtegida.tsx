import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { leerSesion } from '../../lib/sesion';
import { useCuentaActual } from './ingreso.api';

// Envuelve las pantallas del panel. Sin sesión guardada, manda a ingresar.
// Con sesión, muestra la pantalla y en paralelo la verifica contra la API:
// el token puede haber vencido desde la última visita.
//
// Es una comodidad de navegación, no la seguridad: la que decide qué datos
// se entregan es la API, con el middleware autenticar.
export function RutaProtegida({ children }: { children: ReactNode }) {
  const sesion = leerSesion();
  useCuentaActual(sesion !== null);

  if (!sesion) return <Navigate to="/ingresar" replace />;

  return children;
}
