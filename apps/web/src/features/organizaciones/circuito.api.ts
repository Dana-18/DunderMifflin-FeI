import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { circuitoSchema, type Circuito, type ConfiguracionCircuito } from '@setpoint/shared';
import { getJson, putJson } from '../../lib/api';

const clave = (slug: string) => ['organizaciones', slug, 'circuito'];

async function obtenerCircuito(slug: string): Promise<Circuito> {
  const respuesta = await getJson(`/organizaciones/${slug}/circuito`);
  return circuitoSchema.parse(respuesta);
}

export function useCircuito(slug: string) {
  return useQuery({
    queryKey: clave(slug),
    queryFn: () => obtenerCircuito(slug),
  });
}

async function guardarCircuito(slug: string, datos: ConfiguracionCircuito): Promise<Circuito> {
  const respuesta = await putJson(`/organizaciones/${slug}/circuito`, datos);
  return circuitoSchema.parse(respuesta);
}

export function useGuardarCircuito(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (datos: ConfiguracionCircuito) => guardarCircuito(slug, datos),
    // La respuesta del PUT es el circuito ya guardado: se deja en la caché
    // para no tener que volver a pedirlo con un GET.
    onSuccess: (circuito) => queryClient.setQueryData(clave(slug), circuito),
  });
}
