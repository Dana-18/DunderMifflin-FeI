import { useMutation, useQuery } from '@tanstack/react-query';
import { cuentaSchema, sesionSchema, type Cuenta, type Ingreso, type Sesion } from '@setpoint/shared';
import { ErrorDeApi, getJson, postJson } from '../../lib/api';

async function ingresar(datos: Ingreso): Promise<Sesion> {
  const respuesta = await postJson('/auth/ingreso', datos);
  return sesionSchema.parse(respuesta);
}

export function useIngresar() {
  return useMutation<Sesion, ErrorDeApi | Error, Ingreso>({
    mutationFn: ingresar,
  });
}

async function cuentaActual(): Promise<Cuenta> {
  const respuesta = await getJson('/auth/yo');
  return cuentaSchema.parse(respuesta);
}

// Le pregunta a la API si la sesión guardada sigue valiendo. Si no vale, el
// 401 lo atrapa useSesionRechazada; acá no hay que hacer nada más.
export function useCuentaActual(activa: boolean) {
  return useQuery({
    queryKey: ['auth', 'yo'],
    queryFn: cuentaActual,
    enabled: activa,
    // Reintentar un token vencido no lo arregla.
    retry: false,
  });
}
