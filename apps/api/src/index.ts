import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { manejarErrores } from './middleware/errores';
import { authRouter } from './modules/auth/auth.routes';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/salud', (_req, res) => {
  res.json({ ok: true, servicio: 'setpoint-api' });
});

app.use('/api/auth', authRouter);

// Siempre al final: recibe los errores de todo lo de arriba.
app.use(manejarErrores);

app.listen(env.PORT, () => {
  console.log(`API escuchando en http://localhost:${env.PORT}`);
});
