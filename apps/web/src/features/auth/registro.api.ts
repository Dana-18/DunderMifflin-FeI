import { useMutation } from '@tanstack/react-query';
import { sesionSchema, type RegistroOrganizacion, type Sesion } from '@setpoint/shared';
import { ErrorDeApi, postJson } from '../../lib/api';

async function registrarOrganizacion(datos: RegistroOrganizacion): Promise<Sesion> {
  const respuesta = await postJson('/auth/registro', datos);
  // La respuesta también se valida: si la API cambia la forma, falla acá y no
  // tres componentes más adelante con un undefined.
  return sesionSchema.parse(respuesta);
}

// Mutación y no consulta porque crea datos: se dispara al enviar el
// formulario, no al montar la pantalla.
export function useRegistrarOrganizacion() {
  return useMutation<Sesion, ErrorDeApi | Error, RegistroOrganizacion>({
    mutationFn: registrarOrganizacion,
  });
}
