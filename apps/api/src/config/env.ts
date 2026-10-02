import 'dotenv/config';
import { z } from 'zod';

// Las variables de entorno también son un borde: se validan al arrancar.
// Si falta alguna, la API no levanta y dice cuál, en vez de fallar más tarde
// en el primer request que la necesite.
const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET tiene que tener al menos 16 caracteres'),
  PORT: z.coerce.number().int().positive().default(3000),
});

const resultado = envSchema.safeParse(process.env);

if (!resultado.success) {
  console.error('Faltan variables de entorno o son inválidas. Revisá apps/api/.env');
  for (const problema of resultado.error.issues) {
    console.error(`  ${problema.path.join('.')}: ${problema.message}`);
  }
  process.exit(1);
}

export const env = resultado.data;
