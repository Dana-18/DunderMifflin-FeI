import { z } from 'zod';

// Quién está usando el panel: la persona y la organización que administra.
// Es lo que devuelve GET /api/auth/yo.
export const cuentaSchema = z.object({
  usuario: z.object({
    id: z.number().int(),
    nombre: z.string(),
    apellido: z.string(),
    email: z.string(),
  }),
  organizacion: z.object({
    id: z.number().int(),
    nombre: z.string(),
    slug: z.string(),
  }),
});

export type Cuenta = z.infer<typeof cuentaSchema>;

// La cuenta más el token JWT. Es lo que devuelven el registro y el ingreso,
// y lo que la web guarda en localStorage.
export const sesionSchema = cuentaSchema.extend({
  token: z.string(),
});

export type Sesion = z.infer<typeof sesionSchema>;
