import { Router } from 'express';
import {
  ingresoSchema,
  registroOrganizacionSchema,
  type Ingreso,
  type RegistroOrganizacion,
} from '@setpoint/shared';
import { autenticar } from '../../middleware/autenticar';
import { validarBody } from '../../middleware/validar';
import { cuentaActual, ingresar, registrarOrganizacion } from './auth.service';

export const authRouter = Router();

// POST /api/auth/registro — alta de la organización y de su administrador.
authRouter.post('/registro', validarBody(registroOrganizacionSchema), async (req, res) => {
  // validarBody ya dejó en req.body el dato parseado por el schema.
  const datos = req.body as RegistroOrganizacion;
  const sesion = await registrarOrganizacion(datos);
  res.status(201).json(sesion);
});

// POST /api/auth/ingreso — ingreso con email y contraseña.
authRouter.post('/ingreso', validarBody(ingresoSchema), async (req, res) => {
  const datos = req.body as Ingreso;
  const sesion = await ingresar(datos);
  res.json(sesion);
});

// GET /api/auth/yo — ruta protegida: quién soy según mi token.
authRouter.get('/yo', autenticar, async (req, res) => {
  // autenticar garantiza que los dos ids están: si no, ya habría cortado con 401.
  const cuenta = await cuentaActual(req.usuarioId!, req.organizacionId!);
  res.json(cuenta);
});
