import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Prisma, type Organizacion, type Usuario } from '@prisma/client';
import {
  generarSlug,
  type Cuenta,
  type Ingreso,
  type RegistroOrganizacion,
  type Sesion,
} from '@setpoint/shared';
import { env } from '../../config/env';
import { ErrorHttp } from '../../lib/error-http';
import { prisma } from '../../lib/prisma';

// Costo de bcrypt: cada punto duplica el tiempo de cálculo. 10 es el valor
// habitual; hace lento probar contraseñas en masa sin que el registro se note.
const RONDAS_BCRYPT = 10;

const DURACION_TOKEN = '7d';

const emailEnUso = () =>
  new ErrorHttp(409, 'Ya hay una cuenta con ese email', {
    email: 'Ya hay una cuenta con ese email',
  });

// Busca un slug libre: "polenta", y si está tomado "polenta-2", "polenta-3"...
// Recibe el cliente de la transacción para leer dentro de ella.
async function slugDisponible(tx: Prisma.TransactionClient, nombre: string): Promise<string> {
  const base = generarSlug(nombre);
  const tomados = await tx.organizacion.findMany({
    where: { slug: { startsWith: base } },
    select: { slug: true },
  });
  const usados = new Set(tomados.map((o) => o.slug));

  if (!usados.has(base)) return base;

  let sufijo = 2;
  while (usados.has(`${base}-${sufijo}`)) sufijo++;
  return `${base}-${sufijo}`;
}

function firmarToken(usuarioId: number, organizacionId: number): string {
  // El id del usuario va en "sub", el campo estándar de JWT para el dueño
  // del token. organizacionId viaja también porque es la clave de
  // aislamiento: cada request autenticado va a filtrar por ella.
  return jwt.sign({ organizacionId }, env.JWT_SECRET, {
    subject: String(usuarioId),
    expiresIn: DURACION_TOKEN,
  });
}

// Elige qué datos salen de la API. Se arma campo por campo a propósito: así
// el passwordHash no puede colarse en una respuesta por descuido.
function armarCuenta(usuario: Usuario, organizacion: Organizacion): Cuenta {
  return {
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
    },
    organizacion: {
      id: organizacion.id,
      nombre: organizacion.nombre,
      slug: organizacion.slug,
    },
  };
}

function armarSesion(usuario: Usuario, organizacion: Organizacion): Sesion {
  return { ...armarCuenta(usuario, organizacion), token: firmarToken(usuario.id, organizacion.id) };
}

// Ingreso al panel de la organización.
export async function ingresar(datos: Ingreso): Promise<Sesion> {
  const usuario = await prisma.usuario.findUnique({
    where: { email: datos.email },
    include: {
      // Hoy cada usuario administra una sola organización. Si administrara
      // varias, entra a la primera; el selector queda para cuando haga falta.
      administra: { include: { organizacion: true }, orderBy: { creadoEn: 'asc' }, take: 1 },
    },
  });

  const passwordCorrecta = usuario !== null && (await bcrypt.compare(datos.password, usuario.passwordHash));

  // Un solo mensaje para "no existe el email" y "contraseña incorrecta":
  // distinguirlos le diría a cualquiera qué emails tienen cuenta.
  if (!usuario || !passwordCorrecta) {
    throw new ErrorHttp(401, 'El email o la contraseña no coinciden');
  }

  const [admin] = usuario.administra;
  if (!admin) {
    // Un Usuario sin organización es un jugador: su lugar es la app móvil.
    throw new ErrorHttp(403, 'Esta cuenta no administra ninguna organización');
  }

  return armarSesion(usuario, admin.organizacion);
}

// Datos de quien está detrás de un token ya verificado. Vuelve a consultar la
// base porque el token puede seguir siendo válido aunque la cuenta ya no
// exista o haya dejado de administrar la organización.
export async function cuentaActual(usuarioId: number, organizacionId: number): Promise<Cuenta> {
  const admin = await prisma.adminOrganizacion.findUnique({
    where: { usuarioId_organizacionId: { usuarioId, organizacionId } },
    include: { usuario: true, organizacion: true },
  });

  if (!admin) throw new ErrorHttp(401, 'Tu sesión ya no es válida. Ingresá de nuevo');

  return armarCuenta(admin.usuario, admin.organizacion);
}

// F01 — Alta de la organización. Crea la cuenta de quien la administra, la
// organización y el vínculo entre ambos. O se crean los tres o no se crea nada.
export async function registrarOrganizacion(datos: RegistroOrganizacion): Promise<Sesion> {
  // El hash va fuera de la transacción: tarda a propósito y no tiene sentido
  // mantener una conexión de la base abierta mientras tanto.
  const passwordHash = await bcrypt.hash(datos.password, RONDAS_BCRYPT);

  try {
    const { usuario, organizacion } = await prisma.$transaction(async (tx) => {
      const existente = await tx.usuario.findUnique({ where: { email: datos.email } });
      if (existente) throw emailEnUso();

      const slug = await slugDisponible(tx, datos.nombreOrganizacion);

      const usuario = await tx.usuario.create({
        data: {
          email: datos.email,
          passwordHash,
          nombre: datos.nombre,
          apellido: datos.apellido,
        },
      });

      // usaRanking y el resto de la configuración quedan con los valores por
      // defecto del schema: se eligen después, en "Tu circuito".
      const organizacion = await tx.organizacion.create({
        data: {
          nombre: datos.nombreOrganizacion,
          slug,
          admins: { create: { usuarioId: usuario.id } },
        },
      });

      return { usuario, organizacion };
    });

    return armarSesion(usuario, organizacion);
  } catch (err) {
    // Dos registros simultáneos pueden pasar los dos la verificación de
    // arriba. El UNIQUE de la base frena al segundo y Prisma avisa con P2002.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      const columnas = String(err.meta?.target ?? '');
      if (columnas.includes('email')) throw emailEnUso();
      throw new ErrorHttp(409, 'Justo se registró otra organización con ese nombre. Probá de nuevo');
    }
    throw err;
  }
}
