import { Router } from 'express';
import { configuracionCircuitoSchema, type ConfiguracionCircuito } from '@setpoint/shared';
import { autenticar } from '../../middleware/autenticar';
import { validarBody } from '../../middleware/validar';
import { guardarCircuito, obtenerCircuito } from './organizaciones.service';

type Parametros = { slug: string };

export const organizacionesRouter = Router();

// Todo el módulo es del panel: ninguna ruta se atiende sin token.
organizacionesRouter.use(autenticar);

// GET /api/organizaciones/:slug/circuito — la configuración para "Tu circuito".
organizacionesRouter.get<Parametros>('/:slug/circuito', async (req, res) => {
  const circuito = await obtenerCircuito(req.params.slug, req.usuarioId!);
  res.json(circuito);
});

// PUT /api/organizaciones/:slug/circuito — reemplaza la configuración completa.
// Es PUT y no PATCH porque siempre se manda todo, no solo lo que cambió.
organizacionesRouter.put<Parametros>('/:slug/circuito', validarBody(configuracionCircuitoSchema), async (req, res) => {
  const datos = req.body as ConfiguracionCircuito;
  const circuito = await guardarCircuito(req.params.slug, req.usuarioId!, datos);
  res.json(circuito);
});
