import { z } from 'zod';

// Lo que manda el formulario de "Ingresar".
// A la contraseña no se le exige el mínimo de 8 del registro: acá solo importa
// si coincide con la guardada, y eso lo decide la API.
export const ingresoSchema = z.object({
  email: z.string('Falta este dato').trim().toLowerCase().pipe(z.email('Revisá el email, parece incompleto')),
  password: z.string('Falta este dato').min(1, 'Escribí tu contraseña').max(72, 'Hasta 72 caracteres'),
});

export type Ingreso = z.infer<typeof ingresoSchema>;
