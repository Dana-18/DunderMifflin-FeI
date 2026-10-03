import { z } from 'zod';

// Las instancias que dan puntos, en el orden en que se muestran.
// Coinciden con el enum Instancia de Prisma.
export const INSTANCIAS_CON_PUNTOS = [
  'CAMPEON',
  'FINALISTA',
  'SEMIFINALISTA',
  'CUARTOS',
  'OCTAVOS',
  'PARTICIPACION',
] as const;

export type InstanciaConPuntos = (typeof INSTANCIAS_CON_PUNTOS)[number];

// Tabla con la que arranca una organización nueva. Es la del reglamento de
// POLENTA (02-dominio.md §7.4); cada circuito la puede cambiar.
export const PUNTOS_POR_DEFECTO: Record<InstanciaConPuntos, number> = {
  CAMPEON: 100,
  FINALISTA: 75,
  SEMIFINALISTA: 50,
  CUARTOS: 25,
  OCTAVOS: 15,
  PARTICIPACION: 10,
};

const puntos = z
  .number('Tiene que ser un número')
  .int('Sin decimales')
  .min(0, 'No puede ser negativo')
  .max(9999, 'Hasta 9999');

// Lista de nombres (categorías o etapas). El orden del array es el orden en
// que se muestran. No puede haber dos iguales, sin distinguir mayúsculas.
function listaDeNombres(maximo: number) {
  return z
    .array(
      z.string('Falta este dato').trim().min(1, 'El nombre no puede quedar vacío').max(40, 'Hasta 40 caracteres'),
      'Falta este dato',
    )
    .max(maximo, `Hasta ${maximo}`)
    .refine(
      (nombres) => new Set(nombres.map((n) => n.toLowerCase())).size === nombres.length,
      'Hay nombres repetidos',
    );
}

// Lo que edita la pantalla "Tu circuito" y manda el PUT. Siempre viaja
// completa: el guardado reemplaza la configuración entera, no un pedazo.
export const configuracionCircuitoSchema = z.object({
  nombre: z
    .string('Falta este dato')
    .trim()
    .min(3, 'Poné un nombre de al menos 3 letras')
    .max(80, 'El nombre puede tener hasta 80 caracteres'),
  contacto: z.string('Falta este dato').trim().max(200, 'Hasta 200 caracteres'),
  usaRanking: z.boolean('Falta este dato'),
  categorias: listaDeNombres(20),
  etapas: listaDeNombres(12),
  puntajes: z.object(
    {
      CAMPEON: puntos,
      FINALISTA: puntos,
      SEMIFINALISTA: puntos,
      CUARTOS: puntos,
      OCTAVOS: puntos,
      PARTICIPACION: puntos,
    },
    'Falta este dato',
  ),
});

export type ConfiguracionCircuito = z.infer<typeof configuracionCircuitoSchema>;

// Lo que devuelve la API: la configuración más lo que no se edita desde acá.
export const circuitoSchema = configuracionCircuitoSchema.extend({
  slug: z.string(),
  jugadores: z.number().int(),
});

export type Circuito = z.infer<typeof circuitoSchema>;
