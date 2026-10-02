import { useMutation } from '@tanstack/react-query';
import { registroRespuestaSchema, type RegistroOrganizacion, type RegistroRespuesta } from '@setpoint/shared';
import { ErrorDeApi, postJson } from '../../lib/api';

async function registrarOrganizacion(datos: RegistroOrganizacion): Promise<RegistroRespuesta> {
  const respuesta = await postJson('/auth/registro', datos);
  // La respuesta también se valida: si la API cambia la forma, falla acá y no
  // tres componentes más adelante con un undefined.
  return registroRespuestaSchema.parse(respuesta);
}

// Mutación y no consulta porque crea datos: se dispara al enviar el
// formulario, no al montar la pantalla.
export function useRegistrarOrganizacion() {
  return useMutation<RegistroRespuesta, ErrorDeApi | Error, RegistroOrganizacion>({
    mutationFn: registrarOrganizacion,
  });
}
