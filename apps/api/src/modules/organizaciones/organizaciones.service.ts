import type { Prisma } from '@prisma/client';
import {
  INSTANCIAS_CON_PUNTOS,
  PUNTOS_POR_DEFECTO,
  type Circuito,
  type ConfiguracionCircuito,
} from '@setpoint/shared';
import { ErrorHttp } from '../../lib/error-http';
import { prisma } from '../../lib/prisma';

// Devuelve la organización solo si existe y el usuario la administra.
// Es el control de permisos de todo el módulo: el token dice quién es el
// usuario, pero no alcanza para saber si puede tocar ESTA organización.
async function organizacionAdministrada(slug: string, usuarioId: number) {
  const organizacion = await prisma.organizacion.findUnique({
    where: { slug },
    include: { admins: { where: { usuarioId } } },
  });

  if (!organizacion) throw new ErrorHttp(404, 'No existe una organización con esa dirección');
  if (organizacion.admins.length === 0) throw new ErrorHttp(403, 'No administrás esta organización');

  return organizacion;
}

// Arma la respuesta leyendo el estado actual de la base. Recibe el cliente
// para poder usarse tanto suelto como adentro de una transacción.
async function leerCircuito(db: Prisma.TransactionClient, organizacionId: number): Promise<Circuito> {
  const organizacion = await db.organizacion.findUniqueOrThrow({
    where: { id: organizacionId },
    include: {
      // Solo las activas: las desactivadas siguen en la base para los
      // torneos que las referencian, pero no se ofrecen más.
      categorias: { where: { activa: true }, orderBy: { orden: 'asc' } },
      etapas: { where: { activa: true }, orderBy: { orden: 'asc' } },
      puntajes: true,
      _count: { select: { jugadores: { where: { activo: true } } } },
    },
  });

  // Una organización recién creada todavía no guardó su tabla: se le
  // muestra la tabla por defecto.
  const puntajes = { ...PUNTOS_POR_DEFECTO };
  for (const instancia of INSTANCIAS_CON_PUNTOS) {
    const guardado = organizacion.puntajes.find((p) => p.instancia === instancia);
    if (guardado) puntajes[instancia] = guardado.puntos;
  }

  return {
    nombre: organizacion.nombre,
    slug: organizacion.slug,
    contacto: organizacion.contacto ?? '',
    usaRanking: organizacion.usaRanking,
    categorias: organizacion.categorias.map((c) => c.nombre),
    etapas: organizacion.etapas.map((e) => e.nombre),
    puntajes,
    jugadores: organizacion._count.jugadores,
  };
}

// Lo mínimo que hace falta para sincronizar una lista, sea de categorías o
// de etapas: las dos tablas tienen la misma forma (nombre, orden, activa).
type Repositorio = {
  existentes(): Promise<{ id: number; nombre: string }[]>;
  crear(nombre: string, orden: number): Promise<unknown>;
  actualizar(id: number, nombre: string, orden: number): Promise<unknown>;
  desactivar(ids: number[]): Promise<unknown>;
};

// Deja la tabla igual a la lista que llegó, identificando cada fila por su
// nombre (sin distinguir mayúsculas):
//   - si ya existe, se actualiza su orden y se reactiva si estaba desactivada
//   - si no existe, se crea
//   - las que no vinieron se DESACTIVAN, no se borran: puede haber torneos,
//     jugadores o puntos de ranking que las referencian
async function sincronizarLista(nombres: string[], repo: Repositorio) {
  const existentes = await repo.existentes();
  const porNombre = new Map(existentes.map((fila) => [fila.nombre.toLowerCase(), fila]));
  const vigentes = new Set<number>();

  for (const [indice, nombre] of nombres.entries()) {
    const orden = indice + 1;
    const fila = porNombre.get(nombre.toLowerCase());
    if (fila) {
      await repo.actualizar(fila.id, nombre, orden);
      vigentes.add(fila.id);
    } else {
      await repo.crear(nombre, orden);
    }
  }

  const quitadas = existentes.filter((fila) => !vigentes.has(fila.id)).map((fila) => fila.id);
  if (quitadas.length > 0) await repo.desactivar(quitadas);
}

export async function obtenerCircuito(slug: string, usuarioId: number): Promise<Circuito> {
  const organizacion = await organizacionAdministrada(slug, usuarioId);
  return leerCircuito(prisma, organizacion.id);
}

// Guarda la configuración completa. Todo en una transacción: si falla un
// paso, no queda el nombre cambiado con las categorías a medio actualizar.
export async function guardarCircuito(
  slug: string,
  usuarioId: number,
  datos: ConfiguracionCircuito,
): Promise<Circuito> {
  const { id: organizacionId } = await organizacionAdministrada(slug, usuarioId);

  return prisma.$transaction(async (tx) => {
    // El slug no cambia aunque cambie el nombre: es el link público que la
    // organización ya compartió.
    await tx.organizacion.update({
      where: { id: organizacionId },
      data: {
        nombre: datos.nombre,
        contacto: datos.contacto || null,
        usaRanking: datos.usaRanking,
      },
    });

    await sincronizarLista(datos.categorias, {
      existentes: () => tx.categoria.findMany({ where: { organizacionId } }),
      crear: (nombre, orden) => tx.categoria.create({ data: { organizacionId, nombre, orden } }),
      actualizar: (id, nombre, orden) =>
        tx.categoria.update({ where: { id }, data: { nombre, orden, activa: true } }),
      desactivar: (ids) => tx.categoria.updateMany({ where: { id: { in: ids } }, data: { activa: false } }),
    });

    await sincronizarLista(datos.etapas, {
      existentes: () => tx.etapa.findMany({ where: { organizacionId } }),
      crear: (nombre, orden) => tx.etapa.create({ data: { organizacionId, nombre, orden } }),
      actualizar: (id, nombre, orden) => tx.etapa.update({ where: { id }, data: { nombre, orden, activa: true } }),
      desactivar: (ids) => tx.etapa.updateMany({ where: { id: { in: ids } }, data: { activa: false } }),
    });

    for (const instancia of INSTANCIAS_CON_PUNTOS) {
      const puntos = datos.puntajes[instancia];
      await tx.puntajeInstancia.upsert({
        where: { organizacionId_instancia: { organizacionId, instancia } },
        create: { organizacionId, instancia, puntos },
        update: { puntos },
      });
    }

    // Se devuelve lo que quedó guardado, leído dentro de la misma transacción.
    return leerCircuito(tx, organizacionId);
  });
}
