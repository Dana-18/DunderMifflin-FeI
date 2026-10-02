import { z } from 'zod';
import { generarSlug } from '../slug';

// Lo que manda el formulario de "Registrar tu organización" (F01).
// Es el mismo schema en los dos lados: la web lo usa antes de enviar y la API
// lo vuelve a aplicar al recibir, porque el cliente nunca es de confianza.
export const registroOrganizacionSchema = z.object({
  nombreOrganizacion: z
    .string('Falta este dato')
    .trim()
    .min(3, 'Poné un nombre de al menos 3 letras')
    .max(80, 'El nombre puede tener hasta 80 caracteres')
    // Un nombre hecho solo de símbolos daría un link vacío.
    .refine((nombre) => generarSlug(nombre).length > 0, 'El nombre tiene que tener letras o números'),
  nombre: z.string('Falta este dato').trim().min(1, 'Decinos tu nombre').max(60, 'Hasta 60 caracteres'),
  apellido: z.string('Falta este dato').trim().min(1, 'Decinos tu apellido').max(60, 'Hasta 60 caracteres'),
  email: z.string('Falta este dato').trim().toLowerCase().pipe(z.email('Revisá el email, parece incompleto')),
  // 72 es el máximo que bcrypt tiene en cuenta: lo que sigue se ignora.
  password: z
    .string('Falta este dato')
    .min(8, 'Usá al menos 8 caracteres')
    .max(72, 'La contraseña puede tener hasta 72 caracteres'),
});

export type RegistroOrganizacion = z.infer<typeof registroOrganizacionSchema>;

// Lo que responde la API cuando el registro sale bien es una Sesion: ver sesion.ts.

// Forma de todos los errores de la API. `campos` viene cuando el error se
// puede atribuir a un campo del formulario (clave = nombre del campo).
export const errorApiSchema = z.object({
  error: z.string(),
  campos: z.record(z.string(), z.string()).optional(),
});

export type ErrorApi = z.infer<typeof errorApiSchema>;
