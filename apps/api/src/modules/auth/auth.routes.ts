import { Router } from 'express';
import { registroOrganizacionSchema, type RegistroOrganizacion } from '@setpoint/shared';
import { validarBody } from '../../middleware/validar';
import { registrarOrganizacion } from './auth.service';

export const authRouter = Router();

// POST /api/auth/registro — alta de la organización y de su administrador.
authRouter.post('/registro', validarBody(registroOrganizacionSchema), async (req, res) => {
  // validarBody ya dejó en req.body el dato parseado por el schema.
  const datos = req.body as RegistroOrganizacion;
  const respuesta = await registrarOrganizacion(datos);
  res.status(201).json(respuesta);
});
